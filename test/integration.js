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
        var defaults = {};
        if (process.env.HY_OCTANE_GITHUB_TOKEN) {
            defaults.protocol = {headers: {'Authorization': 'bearer ' + process.env.HY_OCTANE_GITHUB_TOKEN }};
        }
        root = new HyRes.Root('https://api.github.com', Axios, [new Extension()], defaults).follow();

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

    describe('fetching the current user', () => {
        var user;
        beforeEach(() => {
            user = root.$followOne('current_user');

            return user.$promise;
        });

        it('resolves', () => expect(user).to.be.a.resolved.resource);
        it('has the user login', () => expect(user).to.have.property('login'));

        describe('and fetching their repositories', () => {
            var repos;
            beforeEach(() => {
                repos = user.$followOne('repos');
                return repos.$promise;
            });

            it('has the array of repositories under the "item" link relation', () => expect(repos.$subs('item')).to.exist);
        });
    });
});