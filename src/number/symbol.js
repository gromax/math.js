import { Base } from "./base";

class Symbol extends Base {
    #name; /** @type{string} */
    static REGEX = new RegExp("[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*", 'i');
    
    constructor(name) {
        super();
        if (!Symbol.isSymbol(name)) {
            throw new Error(`${name} n'est pas un nom de symbole valide.`);
        }
        this.#name = name;
    }

    /**
     * tente la fabrication d'un Scalar à partir d'une chaine
     * @param {string} chaine 
     * @return {null, Symbol}
     */
    static fromString(chaine) {
        if (!Symbol.isSymbol(chaine)) {
            return null;
        }
        return new Symbol(chaine);
    }

    /**
     * teste si la chaîne est bien d'un symbole
     * @param {string} chaine 
     * @returns {boolean}
     */
    static isSymbol(chaine) {
        return Symbol.REGEX.test(chaine);
    }    

    toString() {
        return this.#name;
    }

    get priority() {
        return 10;
    }

}

export { Symbol };