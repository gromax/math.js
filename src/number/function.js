class Function {
    #child;
    #name;
    static NAMES = ['sqrt', '(-)', '(+)', 'cos', 'sin', 'ln', 'exp', 'inverse'];
    constructor(name, child) {
        if (!Function.isFunction(name)) {
            throw new Error(`${name} n'est pas une fonction reconnue.`);
        }
        this.#name = name;
        this.#child = child;
    }

    /**
     * tente la fabrication d'un Function à partir d'une chaine
     * @param {string} chaine 
     * @return {null, Function}
     */
    static fromString(chaine) {
        if (!Function.isFunction(chaine)) {
            return null;
        }
        return new Function(chaine);
    }

    /**
     * Teste si la chaîne est bien d'une fonction
     * @param {string} chaine 
     * @returns {boolean}
     */
    static isFunction(chaine) {
        return (Function.NAMES.indexOf(chaine)>=0);
    }

    toString() {
        if (this.#name == '(+)') {
            return String(this.#child);
        }
        let child = this.#child.priority <= this.priority? `(${String(this.#child)})`:` ${String(this.#child)}`;
        return `${this.#name}${child}`;
    }

    get name() {
        return this.#name;
    }

    get priority() {
        return 4;
    }

    get child() {
        return this.#child;
    }

    /**
    * renvoie un text donnant une représentation de l'objet sans le facteur numérique en vue de regroupement
    * @return {string}
    */
    signature() {
        if ((this.#name == "(-)") || (this.#name=="(+)")) {
            return this.#child.signature();
        }
        if ((this.#name == "inverse") && (this.#child.signature() == "")) {
            return "";
        }
        return String(this);
    }

}

export { Function };