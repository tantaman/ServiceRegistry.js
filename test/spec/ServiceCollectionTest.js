define([
	'ServiceCollection',
	'ServiceRegistry'
],
function(ServiceCollection, ServiceRegistry) {
	'use strict';

	describe('ServiceCollection maintains a list of active services for a given filter', 
	function() {
		it('Knows when new services that match the filter are registered',
		function() {
			var registry = new ServiceRegistry();
			var collection = new ServiceCollection(registry, 'a.bards.tale');

			expect(collection.length).to.equal(0);

			var service = {};
			registry.register('a.bards.tale', service);

			expect(collection.length).to.equal(1);

			expect(collection[0]).to.equal(service);

			registry.register('a.bards.song', {});

			expect(collection.length).to.equal(1);
		});

		it('Is an array of the currently active services that match the filter',
		function () {
			var registry = new ServiceRegistry();

			var services = [];
			var temp = {};
			services.push(temp);
			registry.register('IButtonProvider', temp);
			temp = {};
			services.push(temp);
			registry.register('IButtonProvider', temp);

			var collection = new ServiceCollection(registry, 'IButtonProvider');

			expect(collection.length).to.equal(services.length);

			collection.forEach(function(srvc) {
				expect(srvc).to.equal(services.shift());
			});
		});

		it('Allows conversion of the service before storing it',
		function() {
			var registry = new ServiceRegistry();

			var service = {
				settings: {

				}
			};
			registry.register('IMode', service);

			var collection = new ServiceCollection(registry, 'IMode', function(entry) {
				return entry.service().settings;
			});

			collection.forEach(function(srvc) {
				expect(srvc).to.equal(service.settings);
			});
		});

		it('Knows when services that match the filter are de-reigstered',
		function() {
			var registry = new ServiceRegistry();
			var temp = {};
			var entry = registry.register('StorageProvider', temp);
			var collection = new ServiceCollection(registry, 'StorageProvider');

			expect(collection.length).to.equal(1);

			registry.deregister('StorageProvider');

			expect(collection.length).to.equal(0);

			entry = registry.register('StorageProvider', temp);

			expect(collection.length).to.equal(1);

			registry.deregister(entry);

			expect(collection.length).to.equal(0);
		});

		it('Fires remove events',
		function () {

		});

		it('Fires add events',
		function() {

		});
	});

	describe('ServiceCollection does all of this for complex filters as well', function() {

	});
})