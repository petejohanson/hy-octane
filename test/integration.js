'use strict';

var chai = require('chai');
chai.use(require('chai-hy-res'));
var expect = chai.expect;

var HyRes = require('hy-res');
var Axios = require('axios');
var Extension = require('../dist/index.js');

describe('fetching the GitHub API root', () => {
    var root;

    beforeEach(() => {
        root = new HyRes.Root('https://api.github.com', Axios, [new Extension()]).follow();

        return root.$promise;
    });

    it('resolves', () => expect(root).to.be.a.resolved.resource);
    it('contains the current_user link relation', () => expect(root.$link('current_user')).to.exist);

    describe('following a the code_search templated link', () => {
        var results;
        beforeEach(() => {
            results = root.$followOne('code_search', {data: {query: 'repo:petejohanson/hy-res WebLink'}});

            return results.$promise;
        });

        it('resolves', () => expect(results).to.be.a.resolved.resource);
        it('includes the expected "total_count" property', () => expect(results).to.have.property('total_count').gt(0));
    });
});