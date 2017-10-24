/**
 * Created by M.C on 2017/10/23.
 */

function* fruitGenerator() {
    yield "apple";
    yield "orange";
    return "watermelon";
}

const fruitG = fruitGenerator();

console.log(fruitG.next());
console.log(fruitG.next());
console.log(fruitG.next());

function* iteratorGenerator(arr) {
    for (let i = 0; i < arr.length; i++) {
        yield arr[i];
    }
}

const iterator = iteratorGenerator(["apple", "orange", "watermelon"]);
let currentItem = iterator.next();
while (!currentItem.done) {
    console.log(currentItem.value);
    currentItem = iterator.next();
}

function* twoWayGenerator() {
    const what = yield null;
    console.log(`Hello ${what}`);
}

const twoWG = twoWayGenerator();
twoWG.next();
twoWG.next("world");

const twoWG1 = twoWayGenerator();
twoWG1.next();
twoWG.throw(new Error());