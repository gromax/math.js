class Mult {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        return `(${String(this.#left)} * ${String(this.#right)})`;
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
        return `(${String(this.#left)} / ${String(this.#right)})`;
    }
}

export { Mult, Div};