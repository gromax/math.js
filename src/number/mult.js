import _ from "lodash";
import { Scalar } from "./scalar";

class Mult {
    #left;
    #right;
    #numerator;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
        let numerator = [];
        if (left instanceof Mult) {
            numerator.push(...left.numerator());
        } else {
            numerator.push(left);
        }
        if (right instanceof Mult) {
            numerator.push(...right.numerator());
        } else {
            numerator.push(right);
        }
        this.#numerator = _.sortBy(numerator, function(item){ return item.signature(); });
    }

    /**
     * 
     * @param {Array} operandes 
     * @returns {Mult, Scalar}
     */
    static fromList(operandes) {
        if (operandes.length == 0){
            return new Scalar(1);
        }
        if (operandes.length == 1) {
            return operandes[0];
        }
        let n = operandes.length;
        let node = new Mult(operandes[n-2], operandes[n-1]);
        for (let i=n-3; i>=0; i--) {
            node = new Mult(operandes[i], node);
        }
        return node;
    }

    numerator() {
        return [...this.#numerator];
    }

    toString() {
        let left = this.#left.priority < this.priority? `(${String(this.#left)})`:String(this.#left);
        let right = this.#right.priority < this.priority? `(${String(this.#right)})`:String(this.#right);
        return `${left} * ${right}`;
    }

    get priority() {
        return 2;
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
        let numerator = _.compact(
            _.map(
                this.numerator(),
                function(item) { return item.signature(); }
            ));
        let denominator = _.compact(
            _.map(
                this.denominator(),
                function(item) { return item.signature(); }
            ));
        return `(${numerator.join(')(')})/(${denominator.join(')(')})`;
    }
}


class Div {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        let left = String(this.#left);
        let right = this.#right.priority <= this.priority? `(${String(this.#right)})`:String(this.#right);
        return `${left} / ${right}`;
    }

    get priority() {
        return 2;
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
        let denoSignature = this.#right.signature();
        if (denoSignature == "") {
            return this.#left.signature();
        }
        if (this.#right.priority <= this.priority) {
            return `(${this.#left.signature()})/(${denoSignature})`;    
        }
        return `(${this.#left.signature()})/${denoSignature}`;
    }
}

export { Mult, Div};