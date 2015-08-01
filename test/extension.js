'use strict';

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;
var Extension = require('../dist/index.js');
var Resource = require('hy-res').Resource;

describe('GitHubV3Extensions', () => {
  var ext;
  beforeEach(() => ext = new Extension());

  describe('applies', () => {
    it('applies with a content-type of application/vnd.github.v3+json', () => {
      expect(ext.applies({}, { 'content-type': 'application/vnd.github.v3+json'})).to.be.true;
    });

    it('applies with a content-type of application/json and X-GitHub-Media-Type: "github.v3; format=json', () => {
      expect(ext.applies({}, { 'content-type': 'application/json', 'x-github-media-type': 'github.v3; format=json'})).to.be.true;
    });
  });

  describe('mediaTypes', () => {
    it('contains application/vnd.github.v3+json', () => {
      expect(ext.mediaTypes).to.contain('application/vnd.github.v3+json');
    });
  });

  describe('dataParser', () => {
    it('parses basic properties', () => {
      expect(ext.dataParser({
        name: 'bug',
        color: 'f29513'
      })).to.deep.include.members([
        {name: 'name', value: 'bug'},
        {name: 'color', value: 'f29513'}
      ]);
    });

    it('ignores the "url" property', () => {
      expect(ext.dataParser({
        url: 'https://api.github.com/repos/octocat/Hello-World/labels/bug',
        name: 'bug',
        color: 'f29513'
      })).to.not.deep.include.members([
        { name: 'url', value: 'https://api.github.com/repos/octocat/Hello-World/labels/bug' }
      ]);
    });

    it('ignores properties ending in "_url"', () => {
      expect(ext.dataParser({
        "id": 1,
        "url": "https://api.github.com/repos/octocat/Hello-World/issues/comments/1",
        "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1",
        "body": "Me too",
        "user": {
          "login": "octocat",
          "id": 1,
          "avatar_url": "https://github.com/images/error/octocat_happy.gif",
          "gravatar_id": "",
          "url": "https://api.github.com/users/octocat",
          "html_url": "https://github.com/octocat",
          "followers_url": "https://api.github.com/users/octocat/followers",
          "following_url": "https://api.github.com/users/octocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
          "organizations_url": "https://api.github.com/users/octocat/orgs",
          "repos_url": "https://api.github.com/users/octocat/repos",
          "events_url": "https://api.github.com/users/octocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/octocat/received_events",
          "type": "User",
          "site_admin": false
        },
        "created_at": "2011-04-14T16:00:49Z",
        "updated_at": "2011-04-14T16:00:49Z"
      })).to.not.deep.include.members([
        { name: 'html_url', value: 'https://github.com/octocat/Hello-World/issues/1347#issuecomment-1' }
      ]);
    });

    it('ignores object properties', () => {
      expect(ext.dataParser({
        "id": 1,
        "url": "https://api.githu.com/repos/octocat/Hello-World/issues/comments/1",
        "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1",
        "body": "Me too",
        "user": {
          "login": "octocat",
          "id": 1,
          "avatar_url": "https://github.com/images/error/octocat_happy.gif",
          "gravatar_id": "",
          "url": "https://api.github.com/users/octocat",
          "html_url": "https://github.com/octocat",
          "followers_url": "https://api.github.com/users/octocat/followers",
          "following_url": "https://api.github.com/users/octocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
          "organizations_url": "https://api.github.com/users/octocat/orgs",
          "repos_url": "https://api.github.com/users/octocat/repos",
          "events_url": "https://api.github.com/users/octocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/octocat/received_events",
          "type": "User",
          "site_admin": false
        },
        "created_at": "2011-04-14T16:00:49Z",
        "updated_at": "2011-04-14T16:00:49Z"
      })).to.not.have.key('user');
    });
  });

  describe('linkParser', () => {
    it('returns the "url" property with a "self" link relation', () => {
      expect(ext.linkParser({
        url: 'https://api.github.com/repos/octocat/Hello-World/labels/bug',
        name: 'bug',
        color: 'f29513'

      })).to.have.a.deep.property('self[0].href').that.eql('https://api.github.com/repos/octocat/Hello-World/labels/bug');
    });

    it('includes _url properties as links', () => {
      expect(ext.linkParser({
        "id": 1,
        "url": "https://api.githu.com/repos/octocat/Hello-World/issues/comments/1",
        "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1",
        "body": "Me too",
        "user": {
          "login": "octocat",
          "id": 1,
          "avatar_url": "https://github.com/images/error/octocat_happy.gif",
          "gravatar_id": "",
          "url": "https://api.github.com/users/octocat",
          "html_url": "https://github.com/octocat",
          "followers_url": "https://api.github.com/users/octocat/followers",
          "following_url": "https://api.github.com/users/octocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
          "organizations_url": "https://api.github.com/users/octocat/orgs",
          "repos_url": "https://api.github.com/users/octocat/repos",
          "events_url": "https://api.github.com/users/octocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/octocat/received_events",
          "type": "User",
          "site_admin": false
        },
        "created_at": "2011-04-14T16:00:49Z",
        "updated_at": "2011-04-14T16:00:49Z"
      })).to.have.deep.property('html[0].href').eql('https://github.com/octocat/Hello-World/issues/1347#issuecomment-1');
    });
  });

  describe('embeddedParser', () => {
    it('returns object properties', () => {
      var embeddedItems = ext.embeddedParser({
        "id": 1,
        "url": "https://api.githu.com/repos/octocat/Hello-World/issues/comments/1",
        "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1",
        "body": "Me too",
        "user": {
          "login": "octocat",
          "id": 1,
          "avatar_url": "https://github.com/images/error/octocat_happy.gif",
          "gravatar_id": "",
          "url": "https://api.github.com/users/octocat",
          "html_url": "https://github.com/octocat",
          "followers_url": "https://api.github.com/users/octocat/followers",
          "following_url": "https://api.github.com/users/octocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
          "organizations_url": "https://api.github.com/users/octocat/orgs",
          "repos_url": "https://api.github.com/users/octocat/repos",
          "events_url": "https://api.github.com/users/octocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/octocat/received_events",
          "type": "User",
          "site_admin": false
          },
        "created_at": "2011-04-14T16:00:49Z",
        "updated_at": "2011-04-14T16:00:49Z"
      }, { 'content-type': 'application/vnd.github.v3+json' }, {extensions: [ext]});

      expect(embeddedItems).to.have.deep.property('user[0]').to.be.instanceof(Resource);

      var user = embeddedItems.user[0];

      expect(user.$link('followers')).to.have.property('href', 'https://api.github.com/users/octocat/followers');
    });

    it('parses arrays into embedded resources with "item" link relation', () => {
      var embeddedItems = ext.embeddedParser([
        {
          url: 'https://api.github.com/repos/octocat/Hello-World/labels/bug',
          name: 'bug',
          color: 'f29513'
        }
      ], {'content-type': 'application/vnd.github.v3+json'}, {extensions: [ext]});

      expect(embeddedItems).to.have.deep.property('item[0].name').eql('bug');
    });
  });
});
