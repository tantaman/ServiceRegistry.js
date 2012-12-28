define([
	'ServiceCollection',
	'ServiceRegistry'
],
function(ServiceCollection, ServiceRegistry) {
	'use strict';

	function newCollection(filter) {
		var registry = new ServiceRegistry();
		return new ServiceCollection(registry, filter);
	}

	describe('ServiceCollection maintains a list of active services for a given filter', 
	function() {
		it('Knows when new services that match the filter are registered',
		function() {
			var collection = newCollection('a.bards.tale');

		});

		it('Is an array of the currently active services that match the filter',
		function () {

		});

		it('Allows conversion of the service before storing it',
		function() {

		});

		it('Knows when services that match the filter are de-reigstered',
		function() {

		});

		it('Allows use of the matching services',
		function () {

		});
	});

	describe('ServiceCollection does all of this for complex filters as well', function() {

	});
})