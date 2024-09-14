import _ from "lodash";
import { Scalar } from "./scalar";
import { Mult } from "./mult";


class Add {
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

    /**
     * Regroupe les termes de même signature
     * @returns { Add }
     */
    groupeSameSignatures(){
        let items = this.#items; /** @type {Array} */
        console.log(_.map(items, function(item){return item.signature();}).join(';'));
        let out = [];
        while (items.length >0) {
            let current = items.shift();
            let currentGroup = [current];
            let signature = current.signature();
            console.log(`lecture de ${signature}`);
            let j = 0;
            while (j<items.length) {
                let item = items[j];
                if (item.signature() == signature) {
                    currentGroup.push(item);
                    items.splice(j,1);
                } else {
                    j += 1;
                }
            }
            if (currentGroup.length == 1){
                console.log("rien trouvé")
                out.push(current);
                continue;
            }
            let scalars = [];
            let baseNode = currentGroup[0] instanceof Scalar ? new Scalar(1)
                         : currentGroup[0] instanceof Mult ? Mult.fromList(currentGroup[0].getNotScalars())
                         : currentGroup[0];
            for (let item of currentGroup) {
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
                out.push(s);
            } else if (baseNode instanceof Scalar) {
                out.push(s);
            } else if (s.isOne()) {
                out.push(baseNode);
            } else {
                out.push(new Mult(s, baseNode));
            }
        }
        return Add.fromList(out);
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