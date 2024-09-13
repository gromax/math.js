import { Function } from "../number/function";
import { Add, Minus } from "../number/add";
import { Mult, Div } from '../number/mult';

function removeMinusAndDiv(node){
    if (node instanceof Minus) {
        let left  = removeMinusAndDiv(node.left);
        let right = removeMinusAndDiv(node.right);
        return new Add(left, Function("(-)", right));
    }

    if (node instanceof Div) {
        let left  = removeMinusAndDiv(node.left);
        let right = removeMinusAndDiv(node.right);
        return new Mult(left, Function("inverse", right));
    }

    if (node.left) { // Add, Mult, Power
        let left  = removeMinusAndDiv(node.left);
        let right = removeMinusAndDiv(node.right);
        return ((left == node.left) && (right == node.right))? node : new node.constructor(left, right);
    }

    if (node instanceof Function){
        let child = removeMinusAndDiv(node.child);
        return (child == node.child)? node : new Function(node.name, child);
    }
    return node;
}



export { removeMinusAndDiv }