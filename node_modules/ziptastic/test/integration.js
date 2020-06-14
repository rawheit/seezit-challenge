'use strict';

var ziptastic = require('../'),
    expect    = require('chai').expect;

describe('Ziptastic — Integration Tests', function() {

	it('fetches a ZIP code', function() {
		return expect(ziptastic(10009))
			.to.eventually.deep.equal({
				city: 'New York City',
				country: 'US',
				county: 'New York',
				state: 'New York',
				state_short: 'NY',
				postal_code: '10009'
			});
	});

	it('handles server errors', function() {
		return expect(ziptastic(100))
			.to.eventually.be.rejectedWith(/Request/);
	});

});
