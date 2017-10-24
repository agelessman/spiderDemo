/**
 * Created by M.C on 2017/10/19.
 */
const request = require("request");
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const utilities = require("./utilities");
const queue = require("async/queue");
const downloadQueue = queue((taskData, callback) => {
    "use strict";
    spider(taskData.link, taskData.nesting - 1, callback);
});

function saveFile(filename, contents, callback) {
    mkdirp(path.dirname(filename), err => {
        if (err) {
            return callback(err);
        }
        fs.writeFile(filename, contents, callback);
    });
}

function download(url, filename, callback) {
    console.log(`Downloading ${url}`);

    request(url, (err, response, body) => {
        if (err) {
            return callback(err);
        }
        saveFile(filename, body, err => {
            if (err) {
                return callback(err);
            }
            console.log(`Downloaded and saved: ${url}`);
            callback(null, body);
        });
    })
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

    let completed = 0, hasErrors = false;

    links.forEach(link => {
        const taskData = {
            link: link,
            nesting: nesting
        };

        downloadQueue.push(taskData, err => {
            "use strict";
            /// 这里表示，只要发生错误，队列就会退出
            if (err) {
                hasErrors = true;
                return callback(err);
            }
            if (++completed === links.length && !hasErrors) {
                callback();
            }
        });
    });
}

const spidering = new Map();

function spider(url, nesting, callback) {
    if (spidering.has(url)) {
        return process.nextTick(callback);
    }

    spidering.set(url, true);

    const filename = utilities.urlToFilename(url);

    /// In this pattern, there will be some issues.
    /// Possible problems to download the same url again and again。
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
        console.log(`error: ${err}`);
    } else if (downloaded) {
        console.log(`Completed the download of ${filename}`);
    } else {
        console.log(`${filename} was already downloaded`);
    }
});