/**
 * Created by M.C on 2017/10/23.
 */

function asyncDivision(dividend, divisor, cb) {
    return new Promise((resolve, reject) => {
        "use strict";
        process.nextTick(() => {
            const result = dividend / divisor;
            if (isNaN(result) || !Number.isFinite(result)) {
                const error = new Error("Invalid operands");
                if (cb) {
                    cb(error);
                }
                return reject(error);
            }

            if (cb) {
                cb(null, result);
            }
            resolve(result);
        });
    });
}

asyncDivision(10, 2, (err, result) => {
    "use strict";
    if (err) {
        return console.log(err);
    }
    console.log(result);
});

asyncDivision(22, 11)
    .then((result) => console.log(result))
    .catch((err) => console.log(err));