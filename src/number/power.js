import { Base } from "./base";


class Power extends Base {
    /** @type {Base} */
    #base;
    /** @type {Base} */
    #exposant;
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
        this.#base = base;
        this.#exposant = exposant;
    }

    /**
     * transtypage -> string
     * @returns {string}
     */
    toString() {
        if (this.#string != null) {
            return this.#string;
        }
        let base = this.#base.priority <= this.priority? `(${String(this.#base)})`:String(this.#base);
        let exposant = this.#exposant.priority <= this.priority? `(${String(this.#exposant)})`:String(this.#exposant);
        this.#string = `${base} ^ ${exposant}`;
        return this.#string;
    }

    get priority() {
        return 3;
    }

    get base() {
        return this.#base;
    }

    get exposant() {
        return this.#exposant;
    }
}

export { Power }