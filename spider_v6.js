/**
 * Created by M.C on 2017/10/19.
 */
const request = require("request");
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const utilities = require("./utilities");
const series = require("async/series");
const eachSeries = require("async/eachSeries");

function download(url, filename, callback) {
    console.log(`Downloading ${url}`);

    let body;

    series([
        callback => {
            request(url, (err, response, resBody) => {
                if (err) {
                    return callback(err);
                }
                body = resBody;
                callback();
            });
        },
        mkdirp.bind(null, path.dirname(filename)),
        callback => {
            fs.writeFile(filename, body, callback);
        }
    ], err => {
        if (err) {
            return callback(err);
        }
        console.log(`Downloaded and saved: ${url}`);
        callback(null, body);
    });
}

/// 最大的启发是实现了如何异步循环遍历数组
function spiderLinks(currentUrl, body, nesting, callback) {
    if (nesting === 0) {
        return process.nextTick(callback);
    }

    const links = utilities.getPageLinks(currentUrl, body);
    if (links.length === 0) {
        return process.nextTick(callback);
    }

    eachSeries(links, (link, cb) => {
        "use strict";
        spider(link, nesting - 1, cb);
    }, callback);
}

const spidering = new Map();

function spider(url, nesting, callback) {
    if (spidering.has(url)) {
        return process.nextTick(callback);
    }

    spidering.set(url, true);

    const filename = utilities.urlToFilename(url);

    fs.readFile(filename, "utf8", (err, body) => {
        if (err) {
            if (err.code !== 'ENOENT') {
                return callback(err);
            }
            return download(url, filename, (err, body) => {
                if (err) {
                    return callback(err);
                }
                spiderLinks(url, body, nesting, callback);
            });
        }

        spiderLinks(url, body, nesting, callback);
    });
}

spider(process.argv[2], 1, (err, filename, downloaded) => {
    if (err) {
        console.log(err);
    } else if (downloaded) {
        console.log(`Completed the download of ${filename}`);
    } else {
        console.log(`${filename} was already downloaded`);
    }
});