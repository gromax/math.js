import { Base } from "./base";

class Constant extends Base {
    static NAMES = ['e', 'i', 'pi', '∞', 'infini', 'π']
    static #nodes = {};
    #name; /** @type{string} */
    constructor(name) {
        super();
        if (!Constant.isConstant(name)) {
            throw new Error(`${name} n'est pas une constante valide.`)
        }
        switch(name) {
            case 'infini': this.#name = '∞'; break;
            case 'pi': this.#name = 'π'; break;
            default: this.#name = name;
        }
    }

    static get E() {
        if (typeof Constant.#nodes.E == "undefined") {
            this.#nodes.E = new Constant('e');
        }
        return this.#nodes.E;
    }

    /**
     * tente la fabrication d'un Constant à partir d'une chaine
     * @param {string} chaine 
     * @return {null, Constant}
     */
    static fromString(chaine) {
        if (!Constant.isConstant(chaine)) {
            return null;
        }
        if (chaine == "e") {
            return this.E;
        }
        return new Constant(chaine);
    }

    /**
     * teste si la chaîne est bien d'une constante
     * @param {string} chaine 
     * @returns {boolean}
     */
    static isConstant(chaine) {
        return (Constant.NAMES.indexOf(chaine)>=0);
    }

    /**
     * transtypage -> string
     * @returns {string}
     */
    toString() {
        return this.#name;
    }

    get priority() {
        return 10;
    }
}

export { Constant };