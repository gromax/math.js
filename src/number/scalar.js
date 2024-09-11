class Scalar {
    static REGEX = new RegExp('\\d+[.,]?\\d*(E-?\\d+)?%?', 'i');
    
    #chaine = ""; /** @type{string} */
    #float = false; /** @type{boolean} */
    #floatValue; /** @type{number} */
    #intValue = 0; /** @type{number} */
    #exposant = 0; /** @type{number} */
    /**
     * tente la fabrication d'un Scalar à partir d'une chaine
     * @param {string} chaine 
     * @return {null, Scalar}
     */
    static fromString(chaine) {
        if (!Scalar.REGEX.test(chaine)) {
            return null;
        }
        return new Scalar(chaine);
    }
    
    /**
     * constructeur
     * @param {string, number} entree 
     */
    constructor(entree) {
        if (typeof entree == 'string') {
            this.#makeFromString(entree);
        } else if (typeof entree == 'number') {
            this.#makeFromNumber(entree);
        } else {
            throw new Error(`entree = ${entree} invalide pour un Scalar`);
        }
    }

    /**
     * teste si la chaîne est bien d'un symbole
     * @param {string} chaine 
     * @returns {boolean}
     */
    static isScalar(chaine) {
        return Scalar.REGEX.test(chaine);
    }   

    /**
     * auxiliaire constructureur pour une chaine
     * @param {string} chaine 
     */
    #makeFromString(chaine) {
        if (!Scalar.isScalar(chaine)) {
            throw new Error(`entree = ${entree} invalide pour un Scalar`);
        }
        chaine = chaine.trim();
        let percent = false;
        this.#chaine = chaine;
        chaine = chaine.replace(',', '.');
        let i = chaine.indexOf('%');
        if (i >= 0) {
            percent = true;
            chaine = chaine.substring(0,i).trim();
        }
        this.#floatValue = Number(chaine);
        if (percent) {
            this.#floatValue = this.#floatValue/100;
        }
        if (chaine.indexOf('E') >= 0) {
            this.#float = true;
            return;
        }
        let iDot = chaine.indexOf('.');
        let a = iDot >=0? chaine.substring(0,iDot) : chaine;
        let b = iDot >=0? chaine.substring(iDot+1) : "";
        this.#exposant = -b.length
        if (percent) {
            this.#exposant -= 2;
        }
        this.#intValue = Number(a+b);
        while ((this.#intValue %10 ==0) && (this.#exposant < 0)) {
            this.#intValue = Math.floor(this.#intValue / 10);
            this.#exposant += 1;
        }
    }

    /**
     * auxiliaire constructeur pour un Number
     * @param {number} n 
     */
    #makeFromNumber(n) {
        this.#chaine = String(n);
        this.#floatValue = n;
        if (Math.floor(n) == n) {
            this.#intValue = n;
            return;
        }
        this.#float = true;
    }

    /**
     * trantypage
     * @return{string}
     */
    toString() {
        return this.#chaine;
    }

    get priority() {
        return 10;
    }

    isInteger() {
        return (!this.#float) && (this.#exposant == 0);
    }

    get floatValue() {
        return this.#floatValue;
    }
}

export { Scalar };