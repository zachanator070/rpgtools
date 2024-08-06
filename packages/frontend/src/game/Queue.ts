
export default class Queue<T> {
    private _data: T[] = [];
    private callbacks: ((item: T) => void)[] = [];

    public enqueue(item: T) {
        this._data.push(item);
        this.callbacks.forEach((cb) => cb(item));
    }

    public addCallback(cb: (item: T) => void) {
        this.callbacks.push(cb);
    }

    [Symbol.iterator]() {
        let index = -1;
        let data = this._data;

        return {
            next: () => ({value: data[++index], done: !(index in data)})
        };
    };

}
