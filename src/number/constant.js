class Constant{
    static NAMES = ['e', 'i', 'pi', '∞', 'infini', 'π']
    #name; /** @type{string} */
    constructor(name) {
        if (!Constant.isConstant(name)) {
            throw new Error(`${name} n'est pas une constante valide.`)
        }
        switch(name) {
            case 'infini': this.#name = '∞'; break;
            case 'pi': this.#name = 'π'; break;
            default: this.#name = name;
        }
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

    toString() {
        return this.#name;
    }

    get priority() {
        return 10;
    }


}

export { Constant };