'use strict';

var _ = require('lodash');
var HyRes = require('hy-res');
var WebLink = HyRes.WebLink;
var Resource = HyRes.Resource;
var LinkCollection = HyRes.LinkCollection;
var FieldUtils = HyRes.FieldUtils;

/**
 * @external HyRes
 * @see http://petejohanson.github.io/hy-res/
 */

/**
 * External interface that defines a media type extension
 * @class Extension
 * @memberof external:HyRes
 * @see http://petejohanson.github.io/hy-res/Extension.html
 */
/**
 *
 * @classdesc
 * @implements {Extension}
 *
 * Extension for processing GitHub V3 API responses.
 *
 * Any property named `url` will be included as a link using the IANA standard `self` link relation.
 * Any properties with a suffix of `_url` will have the trailing `_url` removed and the remainder
 * used as the link relation.
 *
 * For responses that include an array of objects, those objects are treated as embedded resources
 * found using the IANA standard `item` link relation.
 *
 * Properties that contain an object that includes a `url` property are treated as embedded resources,
 * and can be found using the propety name as the link relation.
 *
 * @example <caption>Resource processing with links and an embedded resource</caption>
 * {
 *  "id": 1,
 *  "url": "https://api.github.com/repos/octocat/Hello-World/issues/comments/1",
 *  "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1",
 *  "body": "Me too",
 *  "user": {
 *    "login": "octocat",
 *    "id": 1,
 *    "avatar_url": "https://github.com/images/error/octocat_happy.gif",
 *    "gravatar_id": "",
 *    "url": "https://api.github.com/users/octocat",
 *    "html_url": "https://github.com/octocat",
 *    "followers_url": "https://api.github.com/users/octocat/followers",
 *    "following_url": "https://api.github.com/users/octocat/following{/other_user}",
 *    "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
 *    "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
 *    "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
 *    "organizations_url": "https://api.github.com/users/octocat/orgs",
 *    "repos_url": "https://api.github.com/users/octocat/repos",
 *    "events_url": "https://api.github.com/users/octocat/events{/privacy}",
 *    "received_events_url": "https://api.github.com/users/octocat/received_events",
 *    "type": "User",
 *    "site_admin": false
 *  },
 *  "created_at": "2011-04-14T16:00:49Z",
 *  "updated_at": "2011-04-14T16:00:49Z"
 * }
 * => commentResource.$link('self') => WebLink { href: "https://api.github.com/repos/octocat/Hello-World/issues/comments/1" }
 * => commentResource.$link('html') => WebLink { href: "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1" }
 * => commentResource.$sub('user') => Resource
 *
 * @example <caption>Array handling via 'self' link relation</caption>
 * [
 *  {
 *   "url": "https://api.github.com/repos/octocat/Hello-World/labels/bug",
 *   "name": "bug",
 *   "color": "f29513"
 *  }
 * ]
 * => labelCollectionResource.$subs('item') => [ Resource ]
 */

class GitHubV3Extension {
    /**
     * Create a new instance of the GitHub V3 Extensions
     */
    constructor() {
        this.mediaTypes = ['application/vnd.github.v3+json'];
    }

    applies(data, headers) {
        var ct = headers['content-type'].split(';')[0];
        var ghMediaType = headers['x-github-media-type'];
        if (ghMediaType)
            ghMediaType = ghMediaType.split(';')[0];

        return ct === 'application/vnd.github.v3+json' ||
            (ct === 'application/json' && ghMediaType === 'github.v3');
    }

    dataParser(data) {
        return FieldUtils.extractFields(_.omit(data, (val, key) => _.isObject(val) || key === 'url' || _.endsWith(key, '_url')));
    }

    linkParser(data, headers, context) {
        var ret = {};
        if (data.url) {
            ret.self = LinkCollection.fromArray([new WebLink({href: data.url, templated: (data.url.indexOf('{') > -1)}, context)]);
        }

        var o = _.mapKeys(_.pick(data, (val, key) => val && _.endsWith(key, '_url')), (val, key) => key.substring(0, key.length - 4));

        _.assign(ret, _.mapValues(o, (val) => LinkCollection.fromArray([new WebLink({href: val, templated: (val.indexOf('{') > -1) }, context)])));

        return ret;
    }

    embeddedParser(data, headers, context) {
        if (_.isArray(data)) {
            return { item: Resource.embeddedCollection(data, headers, context) };
        }

        return _.mapValues(_.pick(data, _.isObject), (val) => Resource.embeddedCollection([val], headers, context));
    }
}

module.exports = GitHubV3Extension;
