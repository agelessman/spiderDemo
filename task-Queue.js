/**
 * Created by M.C on 2017/10/17.
 */
/**
 * The interesting property of the `TaskQueue` class is that
 * it allows us to dynamically add new items to the queue.
 */

class TaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    pushTask(task) {
        this.queue.push(task);
        this.next();
    }

    next() {
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            task(() => {
                this.running--;
                this.next();
            });
            this.running++;
        }
    }
}

module.exports = TaskQueue;