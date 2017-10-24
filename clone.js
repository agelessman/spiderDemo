/**
 * Created by M.C on 2017/10/23.
 */

const fs = require('fs');
const path = require("path");

/// 这个函数的目的就是对generator函数的处理
/**
 * @param generatorFunction
 * generatorFunction函数中存储着要处理的业务，这些业务是异步的，用yield断开
 * 当某一个业务完成后，就会触发callback方法，在这个方法中恢复generator
 */
function asyncFlow(generatorFunction) {
    function callback(err) {
        if (err) {
            generator.throw(err);
        }

        const results = [].slice.call(arguments);
        generator.next(results.length > 1 ? results : results[0]);
    }
    const generator = generatorFunction(callback);
    generator.next();
}
/**
 * @param callback
 * 这个函数应该只关心自己的业务，不同业务间用yield断开
 */
function* cloneSelf(callback) {
    const filename = path.basename(__filename);

    /// 通过next()传递过来的参数可以采用这种方式获取
    const mySelf = yield fs.readFile(filename, "utf8", callback);

    yield fs.writeFile(`clone_of_${filename}`, mySelf, callback);

    console.log(`Clone complete`);
}

asyncFlow(cloneSelf);