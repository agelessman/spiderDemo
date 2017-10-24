/**
 * Created by M.C on 2017/10/24.
 */
/// Generator with `thunkify` and `co` modules

const thunkify = require("thunkify");
const co = require("co");
const path = require("path");
const utilities = require("./utilities");

const request = thunkify(require("request"));
const fs = require("fs");
const mkdirp = thunkify(require("mkdirp"));
const readFile = thunkify(fs.readFile);
const writeFile = thunkify(fs.writeFile);
const nextTick = thunkify(process.nextTick);

function* download(url, filename) {
    console.log(`Downloading ${url}`);

    const response = yield request(url);
    console.log(response);

    const body = response[1];
    yield mkdirp(path.dirname(filename));

    yield writeFile(filename, body);

    console.log(`Downloaded and saved ${url}`);
    return body;
}

function* spider(url, nesting) {
    const filename = utilities.urlToFilename(url);

    let body;

    try {
        body = yield readFile(filename, "utf8");
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
        body = yield download(url, filename);
    }

    yield  spiderLinks(url, body, nesting);
}

function* spiderLinks(currentUrl, body, nesting) {
    if (nesting === 0) {
        return nextTick();
    }

    const links = utilities.getPageLinks(currentUrl, body);

    for (let i = 0; i < links.length; i++) {
        yield spider(links[i], nesting - 1);
    }
}

/// 通过co就自动处理了回调函数，直接返回了回调函数中的参数，把这些参数放到一个数组中，但是去掉了err信息
co(function* () {
    try {
        yield spider(process.argv[2], 1);
        console.log('Download complete');
    } catch (err) {
        console.log(err);
    }
});