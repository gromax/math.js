import { Base } from "./base";
import { Scalar } from "./scalar";
import { Power } from "./power";
import { Constant} from "./constant";

class Function extends Base {
    /** @type {Base} */
    #child;
    /** @type {string} */
    #name;
    /** @type {string|null} représentation texte */
    #string = null;
    /** @type {Scalar|null} scalaire factorisable */
    #scalar = null;
    /** @type {Base|null} nœud sans ses scalaires factorisables */
    #noScalar = null;

    static NAMES = ['sqrt', '(-)', '(+)', 'cos', 'sin', 'ln', 'exp', 'inverse'];
    constructor(name, child) {
        super();
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

    /**
     * transtypage -> string
     * @returns {string}
     */
    toString() {
        if (this.#string != null) {
            return this.#string;
        }
        if (this.#name == '(+)') {
            this.#string = String(this.#child);
        } else {
            let child = this.#child.priority <= this.priority? `(${String(this.#child)})`:` ${String(this.#child)}`;
            this.#string = `${this.#name}${child}`;
        }
        return this.#string;
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
     * scalaire pouvant être factorisé
     * @returns {Scalar}
     */
    scalar(){
        if (this.#scalar != null) {
            return this.#scalar;
        }
        this.#scalar = this.#name == "(+)" ? this.#child.scalar()
                     : this.#name == "(-)" ? Scalar.MINUS_ONE.multiply(this.#child.scalar())
                     : this.#name == "inverse" ? Scalar.ONE.divide(this.#child.scalar())
                     : Scalar.ONE;
        return this.#scalar;
    }
    
    /**
     * renvoie la partie du noeud sans les scalaires pouvant être factorisés
     * @returns {Base}
     */
    noScalar() {
        if (this.#noScalar != null) {
            return this.#noScalar;
        }
        this.#noScalar = ((this.#name == "(-)") || (this.#name == "(+)")) ? this.#child.noScalar()
                       : (this.#name == "inverse") ? new Power(this.#child.noScalar(), Scalar.MINUS_ONE)
                       : (this.#name == "exp") ? new Power(Constant.E, this.#child)
                       : this;
        return this.#noScalar;
    }

}

export { Function };