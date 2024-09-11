class Add {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        return `${String(this.#left)} + ${String(this.#right)}`;
    }

    get priority() {
        return 1;
    }

    get left() {
        return this.#left;
    }

    get right() {
        return this.#right;
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
        let left = String(this.#left);
        let right = this.#right.priority <= this.priority? `(${String(this.#right)})`:String(this.#right);
        return `${left} - ${right}`;
    }

    get priority() {
        return 1;
    }

    get left() {
        return this.#left;
    }

    get right() {
        return this.#right;
    }
}

export { Add, Minus};