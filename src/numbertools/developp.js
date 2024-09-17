import _, { multiply } from "lodash";

import { Base } from "../number/base";
import { Function } from "../number/function";
import { Add, Minus } from "../number//add";
import { Mult, Div } from '../number//mult';
import { Power } from '../number/power';
import { Scalar } from "../number/scalar";



/**
 * regroupe les élements d'une somme ayant la même base
 * @param {Array} scalars liste de scalairs à additionner
 * @param {Base} base noeud de base factorisé
 * @returns {Base} résultat de la contraction
 */
function contractAddGroup(scalars, base){
    if (scalars.length == 0) {
        return Scalar.ZERO;
    }
    let somme = Scalar.ZERO;
    for (let s of scalars){
        somme = somme.add(s);
    }
    if (somme.isZero()) {
        return Scalar.ZERO;
    } else if ((base instanceof Scalar) && baseNode.isOne()) {
        return somme;
    } else if (somme.isOne()) {
        return base;
    } else {
        return new Mult(somme, base);
    }
}

/**
 * renvoie les items de la liste retroupé par signature
 * @param {Array} items liste des éléments listés dans l'addition
 * @returns {object} dictionnaire {signature:[Base]}
 */
function makeAddGroup(items){
    let output = {};
    for (let item of items) {
        let s = item.noScalarString();
        if (typeof output[s] == "undefined") {
            output[s] = {
                base:item.noScalar(),
                scalars:[item.scalar()]};
            continue;
        }
        output[s].scalars.push(item.scalar());
    }
    return output;
}

/**
 * regroupe les élements d'une somme ayant la même base
 * @param {Array} items 
 * @returns {Base}
 */
function simplifyAdd(items){
    let groups = makeAddGroup(items);
    let out = [];
    for (const s in groups) {
        let group = groups[s];
        out.push(contractAddGroup(group.scalars, group.base));
    }
    return Add.fromList(out);
}


function developp(node) {
    if (node instanceof Add) {
        let left = developp(node.left);
        let right = developp(node.right);
        let out = ((left == node.left) && (right == node.right)) ? node : new Add(left, right);
        return simplifyAdd(out.items);
    }
    if (node instanceof Minus) {
        return developp(new Add(
            node.left,
            new Function("(-)", node.right)
        ));
    }
    if (node instanceof Mult) {
        let left = developp(node.left);
        let right = developp(node.right);

        if ((left instanceof Function) && (left.name == "(-)")) {
            return developp(new Function("(-)", new Mult(left.child, right)));
        }
        if ((right instanceof Function) && (right.name == "(-)")) {
            return developp(new Function("(-)", new Mult(left, right.child)));
        }
        if (left instanceof Mult) {
            return developp(new Mult(left.left, new Mult(left.right, right)));
        }
        if (left instanceof Add) {
            return developp(new Add(new Mult(left.left, right), new Mult(left.right, right)));
        }
        if (right instanceof Add) {
            return developp(new Add(new Mult(left, right.left), new Mult(left, right.right)));
        }
        let out = left == node.left && right == node.right ? node : new Mult(left, right);
        return out.calcScalars();
    }
    if (node instanceof Div){
        return developp(new Mult(
            node.left,
            new Power(node.right, Scalar.MINUS_ONE)
        ));
    }

    if (node instanceof Power) {
        let left = developp(node.left);
        let right = developp(node.right);
        if (left instanceof Mult) {
            return developp(new Mult(
                new Power(left.left, right),
                new Power(left.right, right)
            ));
        }
        if (left instanceof Power){
            return developp(new Power(
                left.left,
                new multiply(left.right, right)
            ));
        }
        let expo = (right instanceof Scalar) && (right.isInteger())? right.floatValue : null;
        if (expo == 1) {
            return left;
        }
        if (expo == 0) {
            return Scalar.ONE;
        }
        if ((expo != null) && (Math.abs(expo)>1) && ((left instanceof Add) || (left instanceof Scalar))) {
            let p = Math.abs(right.floatValue);
            let n = left;
            while (p>1) {
                n = new Mult(left, n);
                p -= 1;
            }
            if (expo<0) {
                n = new Power(n, Scalar.MINUS_ONE);
            }
            return developp(n);
        }
        return left == node.left && right == node.right ? node : new Power(left, right);
    }

    if (node instanceof Function) {
        let child = developp(node.child);
        if (node.name == "(+)") {
            return child;
        }
        if (node.name == "inverse") {
            if ((child instanceof Function) && (child.name == "inverse")) {
                return child.child;
            }
            if (child instanceof Mult) {
                return new Mult(
                    developp(new Function("inverse", child.left)),
                    developp(new Function("inverse", child.right))
                );
            }
            if (child instanceof Div) {
                return developp(new Mult(new Function("inverse", child.left), child.right));
            }
            if (child instanceof Scalar) {
                return child.inverse();
            }
        }

        if (node.name == "(-)") {
            if ((child instanceof Function) && (child.name == "-")) {
                return child.child;
            }
            if (child instanceof Add) {
                return new Add(
                    developp(new Mult(new Scalar(-1), child.left)),
                    developp(new Mult(new Scalar(-1), child.right))
                );
            }
            if (child instanceof Minus) {
                return new Add(
                    developp(new Mult(new Scalar(-1), child.left)),
                    child.right
                );
            }
            if (child instanceof Mult) {
                return developp(new Mult(
                    new Scalar(-1),
                    child
                ))
            }
            if (child instanceof Div) {
                return developp(new Mult(
                    new Mult(new Scalar(-1), child.left),
                    new Function("inverse", child.right)
                ))
            }
            if (child instanceof Scalar) {
                return child.opposite();
            }
        }
        return child==node.child ? node : new Function(node.name, child);
    }

    return node;
}

export {developp};