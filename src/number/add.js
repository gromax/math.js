class Add {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        return `(${String(this.#left)} + ${String(this.#right)})`;
    }
}


class Minus {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        return `(${String(this.#left)} - ${String(this.#right)})`;
    }
}

export { Add, Minus};