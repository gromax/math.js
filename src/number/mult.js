import _ from "lodash";
import { Scalar } from "./scalar";

class Mult {
    #left;
    #right;
    #items;
    constructor(left, right) {
        if (typeof left == "undefined") {
            throw new Error("left undefined");
        }
        if (typeof right == "undefined") {
            throw new Error("right undefined");
        }

        this.#left = left;
        this.#right = right;
        let items = [];
        if (left instanceof Mult) {
            items.push(...left.items());
        } else {
            items.push(left);
        }
        if (right instanceof Mult) {
            items.push(...right.items());
        } else {
            items.push(right);
        }
        this.#items = _.sortBy(items, function(item){ return item.signature(); });
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

    items() {
        return [...this.#items];
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
        let items = _.compact(
            _.map(
                this.items(),
                function(item) { return item.signature(); }
            ));
        if (items.length == 1) {
            return items[0];
        }
        return `(${items.join(')*(')})`;
    }

    calcScalars() {
        let notscalars = this.getNotScalars();
        if (notscalars.length == this.#items.length) {
            return this;
        }
        let scalar = this.getScalar();
        if (!scalar.isOne()) {
            notscalars.unshift(scalar);
        }
        return Mult.fromList(notscalars);
    }

    /**
     * calcule le poduit des scalaires
     * @returns {Scalar}
     */
    getScalar() {
        let scalars = _.filter(this.#items, function(item){ return item instanceof Scalar; });
        if (scalars.length == 0) {
            return new Scalar(1);
        }
        let s = scalars.pop();
        for (let item of scalars) {
            s = s.multiply(item);
        }
        return s;
    }

    /**
     * renvoie la liste des non scalaires
     * @returns {Array}
     */
    getNotScalars() {
        return  _.filter(this.#items, function(item){ return !(item instanceof Scalar); });
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