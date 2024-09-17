import { Base } from "./base";


class Power extends Base {
    /** @type {Base} */
    #left;
    /** @type {Base} */
    #right;
    /** @type {string|null} */
    #string = null; 

    /**
     * constructeur
     * @param {Base} base 
     * @param {Base} exposant 
     */
    constructor(base, exposant) {
        super();
        if (!(base instanceof Base)) {
            throw new Error("base invalide");
        }
        if (!(exposant instanceof Base)) {
            throw new Error("exposant invalide");
        }
        this.#left = base;
        this.#right = exposant;
    }

    /**
     * transtypage -> string
     * @returns {string}
     */
    toString() {
        if (this.#string != null) {
            return this.#string;
        }
        let base = this.#left.priority <= this.priority? `(${String(this.#left)})`:String(this.#left);
        let exposant = this.#right.priority <= this.priority? `(${String(this.#right)})`:String(this.#right);
        this.#string = `${base} ^ ${exposant}`;
        return this.#string;
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
}

export { Power }