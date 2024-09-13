class Power {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        let left = this.#left.priority <= this.priority? `(${String(this.#left)})`:String(this.#left);
        let right = this.#right.priority <= this.priority? `(${String(this.#right)})`:String(this.#right);
        return `${left} ^ ${right}`;
    }

    get priority() {
        return 3;
    }

    get left() {
        return this.#left;
    }

    get right() {
        return this.#right;
    }

    /**
    * renvoie un text donnant une représentation de l'objet sans le facteur numérique en vue de regroupement
    * @return {string}
    */
    signature() {
        return String(this);
    }
}

export { Power }