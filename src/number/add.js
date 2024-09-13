import _ from "lodash";
import { Scalar } from "./scalar";


class Add {
    #left;
    #right;
    #items;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
        let items = [];
        if (left instanceof Add) {
            items.push(...left.items);
        } else {
            items.push(left);
        }
        if (right instanceof Add) {
            items.push(...right.items);
        } else {
            items.push(right);
        }
        this.#items = _.sortBy(items, function(item){return item.signature()});
    }

    /**
     * 
     * @param {Array} operandes 
     * @returns {Add, Scalar}
     */
    static fromList(operandes) {
        if (operandes.length == 0){
            return new Scalar(0);
        }
        if (operandes.length == 1) {
            return operandes[0];
        }
        let n = operandes.length;
        let node = new Add(operandes[n-2], operandes[n-1]);
        for (let i=n-3; i>=0; i--) {
            node = new Add(operandes[i], node);
        }
        return node;
    }

    get items() {
        return [...this.#items];
    }

    toString() {
        return `${String(this.#left)} + ${String(this.#right)}`;
    }

    get priority() {
        return 1;
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
        return String(this);
    }
}


class Minus {
    #left;
    #right;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    toString() {
        let left = String(this.#left);
        let right = this.#right.priority <= this.priority? `(${String(this.#right)})`:String(this.#right);
        return `${left} - ${right}`;
    }

    get priority() {
        return 1;
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
        return String(this);
    }
}

export { Add, Minus};