"use strict";

const urlParse = require('url').parse;
const urlResolve = require('url').resolve;
const slug = require('slug');
const path = require('path');
const cheerio = require('cheerio');

module.exports.urlToFilename = function urlToFilename(url) {
    const parsedUrl = urlParse(url);
    const urlPath = parsedUrl.path.split('/')
        .filter(function(component) {
            return component !== '';
        })
        .map(function(component) {
            return slug(component);
        })
        .join('/');
    let filename = path.join(parsedUrl.hostname, urlPath);
    if(!path.extname(filename).match(/htm/)) {
        filename += '.html';
    }
    return filename;
};

module.exports.getLinkUrl = function getLinkUrl(currentUrl, element) {
    const link = urlResolve(currentUrl, element.attribs.href || "");
    const parsedLink = urlParse(link);
    const currentParsedUrl = urlParse(currentUrl);
    if(parsedLink.hostname !== currentParsedUrl.hostname
        || !parsedLink.pathname) {
        return null;
    }
    return link;
};

module.exports.getPageLinks = function getPageLinks(currentUrl, body) {
    return [].slice.call(cheerio.load(body)('a'))
        .map(function(element) {
            return module.exports.getLinkUrl(currentUrl, element);
        })
        .filter(function(element) {
            return !!element;
        });
};

module.exports.promisify = function (callbackBaseApi) {
    return function promisified() {
        const args = [].slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push((err, result) => {
                if (err) {
                    return reject(err);
                }
                if (arguments.length <= 2) {
                    resolve(result);
                } else {
                    resolve([].slice.call(arguments, 1));
                }
            });
            callbackBaseApi.apply(null, args);
        });
    }
};