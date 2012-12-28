define(['./EventEmitter', './MultiMap'],
function(EventEmitter, MultiMap) {
	'use strict';
	var identifier = 0;

	function Normalize(opts) {
		var parms = {};
		if (opts instanceof ServiceEntry) {
			return opts.toParms();
		}

		if (typeof opts === 'string') {
			parms.interfaces = [opts];
		} else if (Array.isArray(opts)) {
			parms.interfaces = opts;
		} else {
			parms = opts || parms;
			if (!Array.isArray(parms.interfaces))
				parms.interfaces = [parms.interfaces];
		}

		return parms;
	};

	function ServiceRegistry() {
		this._services = new MultiMap();
	}

	var proto = ServiceRegistry.prototype = Object.create(EventEmitter.prototype);

	proto.register = function(opts, service) {
		if (service.__registryIdentifier == null)
			service.__registryIdentifier = ++identifier;

		var interfaces;
		if (Array.isArray(opts)) {
			interfaces = opts;
			opts = {};
		} else if (typeof opts === 'string') {
			interfaces = [opts];
			opts = {};
		} else {
			interfaces = Array.isArray(opts.interfaces) ? opts.interfaces : [opts.interfaces];			
		}

		var entry = new ServiceEntry(interfaces, opts.meta, service);

		interfaces.forEach(function(iface) {
			this._services.put(iface, entry);
			// this.emit('registered:' + iface, entry);
		}, this);
		this.emit('registered', entry);

		return entry;
	};

	function serviceComparator(lhs, rhs) {

	}

	proto.deregister = function(opts) {
		opts = Normalize(opts);
		this._deregister(opts);
	};

	proto._deregister = function(opts) {
		var removed = [];
		opts.interfaces.forEach(function(iface) {
			var entries = this._services.get(iface);
			entries.forEach(function (entry, idx) {
				if (entry._matches(opts)) {
					this._services.remove(iface, entry);
					removed.push(entry);
				}
			}, this);
		}, this);

		removed.forEach(function(entry) {
			this.emit('deregistered', entry);
		}, this);
	};

	proto.getBest = function(opts) {
		var entry = this.getBestEntry(opts);
		if (entry != null)
			return entry.service();
		return null;
	};

	proto.getBestEntry = function(opts) {
		return this.get(opts)[0];
	};

	proto.normalize = Normalize;

	proto.get = function(opts) {
		var parms = this.normalize(opts);

		var seen;
		var prevSeen = {};
		// For each interface
		parms.interfaces.some(function(iface, idx) {
			seen = {};
			// Get the services with that interface
			this._services.get(iface).forEach(function(entry) {
				// see if they match the query options
				if (entry.metaMatches(opts.meta)) {
					// If this is the first interface through or the service
					// has all the previous requested interfaces, add it
					// to 'seen'
					if (idx == 0 || prevSeen[entry.serviceIdentifier()] != null) {
						seen[entry.serviceIdentifier()] = entry;
					}
				}
			});
			// move the set of services matching all interfaces forward
			prevSeen = seen;
			// break the loop if no service matched the requested interface(s)
			return Object.keys(seen).length == 0;
		}, this);

		var result = [];

		for (var k in seen) {
			result.push(seen[k]);
		}

		return result;
	};

	proto.getInvoke = function(srvcOpts, methName, args) {
		var services = this.get(srvcOpts);

		var items = {};
		services.forEach(function(entry) {
			var srvc = entry.service();
			var item = srvc[methName].apply(srvc, args);
			items[item.id] = item;
		}, this);

		return items;
	};

	var entryId = 0;
	function ServiceEntry(interfaces, meta, service) {
		this._interfaces = interfaces;
		this._meta = meta || {};
		this._service = service;
		this._id = ++entryId;
	}

	ServiceEntry.prototype = {
		equals: function(other) {
			return other._id === this._id;
		},

		toParms: function() {
			return {
				service: this._service,
				interfaces: this._interfaces,
				meta: this._meta,
				id: this._id
			};
		},

		service: function() {
			return this._service;
		},

		interfaces: function() {
			return this._interfaces;
		},

		meta: function() {
			return this._meta;
		},

		matches: function(opts) {
			opts = Normalize(opts);
			return this._matches(opts);
		},

		_matches: function(opts) {
			if (opts.id != null) {
				return opts.id === this._id;
			}

			var ifSet = {};

			opts.interfaces.forEach(function(iface) {
				ifSet[iface] = true;
			});

			return this._interfaces.every(function(iface) {
				return ifSet[iface];
			});
		},

		// TODO: this should be a deep comparison
		metaMatches: function(meta) {
			if (meta == null) return true;

			for (var key in meta) {
				if (meta[key] != this._meta[key])
					return false;
			}

			return true;
		},

		serviceIdentifier: function() {
			return this._service.__registryIdentifier;
		}
	};

	return ServiceRegistry;
});