define(['./EventEmitter'],
function (EventEmitter) {
	'use strict';

	var serviceExtractor = function(p) {return p.service();};

	function ServiceCollection(registry, lookup, converter) {
		var temp = new EventEmitter();
		for (var key in temp) {
			this[key] = temp[key];
		}

		this._lookup = registry.normalize(lookup);
		this._converter = converter || serviceExtractor;
		this._registry = registry;

		this._register();
		this._populateItems();
	}

	var proto = ServiceCollection.prototype = Object.create(Array.prototype);

	proto._register = function() {
		this._registry.on('registered', this._serviceRegistered, this);
		this._registry.on('deregistered', this._serviceDeregistered, this);
	};

	proto._serviceRegistered = function(entry) {
		if (entry.matches(this._lookup)) {
			var item = this._converter(entry);
			this.push(item);
		}
	};

	proto._serviceDeregistered = function(entry) {
		console.log('Got de-reg event');
		if (entry.matches(this._lookup)) {
			var item = this._converter(entry);
			var idx = this.indexOf(item);
			if (idx >= 0)
				this.splice(idx, 1);
		}
	};

	proto._populateItems = function() {
		var entries = this._registry.get(this._lookup);
		entries.forEach(function(entry) {
			var item = this._converter(entry);
			this.push(item);
		}, this)
	};

	return ServiceCollection;
});