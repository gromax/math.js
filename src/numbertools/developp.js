import _ from "lodash";

import { Base } from "../number/base";
import { Function } from "../number/function";
import { Add, Minus } from "../number//add";
import { Mult, Div } from '../number//mult';
import { Power } from '../number/power';
import { Scalar } from "../number/scalar";
import { Constant } from "../number/constant";


/**
 * regroupe les élements d'une somme ayant la même base
 * @param {Array} scalars liste de scalairs à additionner
 * @param {Base} base noeud de base factorisé
 * @returns {Base} résultat de la contraction
 */
function contractAddGroup(scalars, base){
    let somme = Scalar.somme(scalars);
    if (somme.isZero()) {
        return Scalar.ZERO;
    } else if ((base instanceof Scalar) && base.isOne()) {
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
function makeAddGroups(items){
    let groups = {};
    for (let item of items) {
        let s = item.noScalarString();
        if (typeof groups[s] == "undefined") {
            groups[s] = {
                base:item.noScalar(),
                scalars:[item.scalar()]};
            continue;
        }
        groups[s].scalars.push(item.scalar());
    }
    return groups;
}

/**
 * regroupe les élements d'une somme ayant la même base
 * @param {Add} add 
 * @returns {Base}
 */
function simplifyAdd(add){
    let items = add.items;
    let groups = makeAddGroups(items);
    let out = [];
    for (const s in groups) {
        let group = groups[s];
        out.push(contractAddGroup(group.scalars, group.base));
    }
    return Add.fromList(out);
}

/**
 * renvoie les items de la liste sous forme a^b avec a commun
 * Le booléen indique si une modification a été faite
 * @param {Array} items liste des éléments listés dans l'addition
 * @returns {Scalar, Object, boolean} dictionnaire {signature:[Base]}
 */
function makeMultGroups(items){
    let actionDone = false;
    let scalars = []
    let groups = {};
    for (let item of items) {
        if (item instanceof Scalar) {
            scalars.push(item);
            continue;
        }
        let base = item instanceof Power? item.left : item;
        let exposant = item instanceof Power? item.right : Scalar.ONE;
        let s = String(base);
        if (typeof groups[s] == "undefined") {
            groups[s] = {
                base:base,
                exposants:[exposant]
            };
            continue;
        }
        actionDone = true;
        groups[s].exposants.push(exposant);
    }
    if ((scalars.length>1) || (scalars.length==1 && scalars[0].isOne())) {
        actionDone = true;
    }
    return [Scalar.produit(scalars), groups, actionDone];
}

/**
 * regroupe les élements d'un produit
 * @param {Mult} mult 
 * @returns {Base}
 */
function simplifyMult(mult){
    let items = mult.items();
    let [scalaire, groups, actionDone] = makeMultGroups(items);
    if (scalaire.isZero()) {
        return Scalar.ZERO;
    }
    if (!actionDone) {
        return mult;
    }
    let operandes = scalaire.isOne()? [] : [scalaire];
    for (const s in groups) {
        let base = groups[s].base;
        let exposants = groups[s].exposants;
        let exposant = exposants.length > 1 ? developp(Add.fromList(exposants)) : exposants[0];
        if (exposant instanceof Scalar) {
            if (exposant.isZero()) {
                continue;
            }
            if (exposant.isOne()) {
                operandes.push(base);
                continue;
            }
            if (base instanceof Scalar){
                operandes.push(base.power(other));
            }
        }
        operandes.push(new Power(base, exposant));
    }
    return Mult.fromList(operandes);
}



/**
 * donne une forme standard à certains nœuds
 * @param {Base} node
 * @returns {Base}
 */
function normalize(node) {
    if (node instanceof Function) {
        if (node.name == 'exp') {
            return new Power(Constant.E, node.child);
        }
        if (node.name == 'inverse') {
            return new Power(node.child, Scalar.MINUS_ONE);
        }
        if (node.name == "(+)") {
            return node.child;
        }
        if (node.name == "(-)") {
            return new Mult(Scalar.MINUS_ONE, node.child);
        }
    }
    if (node instanceof Minus) {
        return new Add(
            node.left,
            new Mult(Scalar.MINUS_ONE, node.right)
        );
    }
    if (node instanceof Div) {
        return new Mult(
            node.left,
            new Power(node.right, Scalar.MINUS_ONE)
        );
    }
    return node;
}

/**
 * développe et simplifie le nœud
 * @param {Base} node 
 * @returns {Base}
 */
function developp(node) {
    node = normalize(node);
    if (node instanceof Add) {
        let left = developp(node.left);
        let right = developp(node.right);
        let out = ((left == node.left) && (right == node.right)) ? node : new Add(left, right);
        return simplifyAdd(out);
    }
    if (node instanceof Mult) {
        let left = developp(node.left);
        let right = developp(node.right);

        if (left instanceof Add) {
            return developp(new Add(new Mult(left.left, right), new Mult(left.right, right)));
        }
        if (right instanceof Add) {
            return developp(new Add(new Mult(left, right.left), new Mult(left, right.right)));
        }
        let out = left == node.left && right == node.right ? node : new Mult(left, right);
        return simplifyMult(out);
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
                new Mult(left.right, right)
            ));
        }
        let expo = (right instanceof Scalar) && (right.isInteger())? right.floatValue : null;
        if (expo && (left instanceof Scalar)) {
            return left.power(right);
        }
        if (expo == 1) {
            return left;
        }
        if (expo == 0) {
            return Scalar.ONE;
        }
        if ((expo != null) && (Math.abs(expo)>1) && (left instanceof Add)) {
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
        return child==node.child ? node : new Function(node.name, child);
    }
    return node;
}

export {developp};