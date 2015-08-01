'use strict';

var _ = require('lodash');
var HyRes = require('hy-res');
var WebLink = HyRes.WebLink;
var Resource = HyRes.Resource;
var LinkCollection = HyRes.LinkCollection;
var FieldUtils = HyRes.FieldUtils;

class GitHubV3Extension {
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
            //ret.self = LinkCollection.fromArray([new WebLink({href: data.url}, context)]);
            ret.self = [new WebLink({href: data.url}, context)];
        }

        var o = _.mapKeys(_.pick(data, (val, key) => _.endsWith(key, '_url')), (val, key) => key.substring(0, key.length - 4));

        _.assign(ret, _.mapValues(o, (val) => [new WebLink({href: val }, context)]));

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
