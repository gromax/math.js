import _ from "lodash";
import { Base } from "./base";
import { Scalar } from "./scalar";
import { Mult } from "./mult";


class Add extends Base {
    #left;
    #right;
    #items;
    #str;

    /**
     * 
     * @param {Base} left 
     * @param {Base} right 
     */
    constructor(left, right) {
        if (! left instanceof Base) {
            throw new Error("left invalide");
        }
        if (! right instanceof Base) {
            throw new Error("right invalide");
        }

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
        this.#str = `${String(this.#left)} + ${String(this.#right)}`;
    }

    /**
     * 
     * @param {Array} operandes 
     * @returns {Base}
     */
    static fromList(operandes) {
        operandes = _.filter(operandes, function(item){return (!(item instanceof Scalar) || !item.isZero())})
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

    /**
     * transtypage -> string
     * @returns {string}
     */
    toString() {
        return this.#str;
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

    /**
     * Calcule les scalaires
     * @returns {Add|Scalar}
     */
    calcScalars() {
        let scalars = _.filter(this.#items, function(item){ return item instanceof Scalar; });
        if (scalars.length <= 1) {
            return this;
        }
        let notscalars = _.filter(this.#items, function(item){ return !(item instanceof Scalar); });
        let s = scalars.pop();
        for (let item of scalars) {
            s = s.add(item);
        }
        notscalars.unshift(s);
        return Add.fromList(notscalars);
    }

    #makeGroup(items){
        let current = items[0];
        let currentGroup = [current];
        let notTaken = []
        let signature = current.signature();
        for (let j=1; j<items.length; j++) {
            let item = items[j];
            if (item.signature() == signature) {
                currentGroup.push(item);
            } else {
                notTaken.push(item);
            }
        }
        return (currentGroup, notTaken);
    }
    /**
     * regroupe les élements d'une somme ayant la même base
     * @param {Array} items 
     * @returns {Mult, Scalar}
     */
    #contractGroup(items){
        if (items.length == 0) {
            return new Scalar(0);
        }
        if (items.length == 1) {
            return items[0];
        }
        let scalars = [];
        let baseNode = items[0] instanceof Scalar ? new Scalar(1)
                        : items[0] instanceof Mult ? Mult.fromList(items[0].getNotScalars())
                        : items[0];
        for (let item of items) {
            if (item instanceof Scalar) {
                scalars.push(item);
                continue;
            }
            if (item instanceof Mult) {
                scalars.push(item.getScalar());
                continue;
            }
            scalars.push(new Scalar(1));
        }
        let s = scalars.pop();
        for (let item of scalars){
            s = s.add(item);
        }
        if (s.isZero()) {
            return s;
        } else if (baseNode instanceof Scalar) {
            return s;
        } else if (s.isOne()) {
            return baseNode;
        } else {
            return new Mult(s, baseNode);
        }
    }

    /**
     * Regroupe les termes de même signature
     * @returns { Add }
     */
    groupeSameSignatures(){
        let items = this.#items; /** @type {Array} */
        console.log(_.map(items, function(item){return item.signature();}).join(';'));
        let out = [];
        while (items.length >0) {
            let group;
            [group, items] = this.#makeGroup(items);
            out.push(this.#contractGroup(group));
        }
        return Add.fromList(out);
    }
}


class Minus extends Base {
    #left;
    #right;
    #str;
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
        let strLeft = String(this.#left);
        let strRight = this.#right.priority <= this.priority? `(${String(this.#right)})`:String(this.#right);
        this.#str = `${strLeft} - ${strRight}`;
    }

    /**
     * transtypage -> string
     * @returns {string}
     */
    toString() {
        return this.#str;
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