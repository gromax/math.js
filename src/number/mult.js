class Mult {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        let left = this.#left.priority < this.priority? `(${String(this.#left)})`:String(this.#left);
        let right = this.#right.priority < this.priority? `(${String(this.#right)})`:String(this.#right);
        return `${left} * ${right}`;
    }

    get priority() {
        return 2;
    }

    get left() {
        return this.#left;
    }

    get right() {
        return this.#right;
    }
}


class Div {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        let left = String(this.#left);
        let right = this.#right.priority <= this.priority? `(${String(this.#right)})`:String(this.#right);
        return `${left} / ${right}`;
    }

    get priority() {
        return 2;
    }

    get left() {
        return this.#left;
    }

    get right() {
        return this.#right;
    }

    inverse() {
        return new Div(this.#right, this.#left);
    }
}

export { Mult, Div};