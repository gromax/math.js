class Base {
    constructor(){   
    }

    /**
     * transtypage vers string
     * @returns {string}
     */
    toString() {
        return "(?)";
    }

    get priority() {
        return 0;
    }

    /**
     * renvoie l'élément sans ses facteurs scalaires
     * @returns {Base}
     */
    withNoScalars() {
        return this;
    }

    /**
     * scalaire pouvant être factorisé
     */
    scalar(){
        throw new Error("Base.scalars Pas implémentée !");
    }

    /**
     * renvoie la partie du noeud sans les scalaires pouvant être factorisés
     * @returns {Base}
     */
    noscalar() {
        return this;
    }

}

export { Base };