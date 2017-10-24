/**
 * Created by M.C on 2017/10/20.
 */
const myFirstPromise = new Promise((resove, reject) => {
    "use strict";
    setTimeout(() => {
        resove("Good");
    }, 250);
});

myFirstPromise.then((msg) => {
    "use strict";
    console.log(`msg: ${msg}`);
});