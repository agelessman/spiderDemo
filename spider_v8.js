/**
 * Created by M.C on 2017/10/20.
 */
const utilities = require("./utilities");
const request = utilities.promisify(require("request"));
const fs = require("fs");
const readFile = utilities.promisify(fs.readFile);
const writeFile = utilities.promisify(fs.writeFile);
const mkdirp = utilities.promisify(require("mkdirp"));
const path = require("path");


function saveFile(filename, contents, callback) {
    mkdirp(path.dirname(filename), err => {
        if (err) {
            return callback(err);
        }
        fs.writeFile(filename, contents, callback);
    });
}

function download(url, filename) {
    console.log(`Downloading ${url}`);

    let body;

    return request(url)
        .then(response => {
            "use strict";
            body = response.body;
            return mkdirp(path.dirname(filename));
        })
        .then(() => writeFile(filename, body))
        .then(() => {
            "use strict";
            console.log(`Downloaded adn saved: ${url}`);
            return body;
        });
}

/// promise编程的本质就是为了解决在函数中设置回调函数的问题
/// 通过中间层promise来实现异步函数同步化
function spiderLinks(currentUrl, body, nesting) {
    let promise = Promise.resolve();
    if (nesting === 0) {
        return promise;
    }

    const links = utilities.getPageLinks(currentUrl, body);

    links.forEach(link => {
        "use strict";
        promise = promise.then(() => spider(link, nesting - 1));
    });

    return promise;
}

function spider(url, nesting) {
    const filename = utilities.urlToFilename(url);

    return readFile(filename, "utf8")
        .then(
            body => spiderLinks(url, body, nesting),
            err => {
                "use strict";
                if (err.code !== 'ENOENT') {
                    /// 抛出错误，这个方便与在整个异步链的最后通过呢catch来捕获这个链中的错误
                    throw err;
                }
                return download(url, filename)
                    .then(body => spiderLinks(url, body, nesting));
            }
        );
}

spider(process.argv[2], 1)
    .then(() => {
        "use strict";
        console.log('Download complete');
    })
    .catch(err => {
        "use strict";
        console.log(err);
    });
