import { Function } from "./function";
import { Add, Minus } from "./add";
import { Mult, Div } from './mult';
import { Power } from './power';
import { Constant } from "./constant";
import { Symbol } from "./symbol";
import { Scalar } from "./scalar";

function build(rpn) {
    let stack = [];
    for (let item of rpn) {
        if (Function.isFunction(item)) {
            if (stack.length == 0) {
                throw new Error(`La fonction ${item} n'a pas d'opérande à dépiler.`);
            }
            let child = stack.pop();
            stack.push(new Function(item, child));
            continue;
        }
        if (item == "+") {
            if (stack.length <2) {
                throw new Error(`L'addition n'a pas assez d'opérandes à dépiler.`);
            }
            let right = stack.pop();
            let left = stack.pop();
            stack.push(new Add(left, right));
            continue;
        }
        if (item == "-") {
            if (stack.length <2) {
                throw new Error(`La soustraction n'a pas assez d'opérandes à dépiler.`);
            }
            let right = stack.pop();
            let left = stack.pop();
            stack.push(new Minus(left, right));
            continue;
        }
        if (item == "*") {
            if (stack.length <2) {
                throw new Error(`La multiplication n'a pas assez d'opérandes à dépiler.`);
            }
            let right = stack.pop();
            let left = stack.pop();
            stack.push(new Mult(left, right));
            continue;
        }
        if (item == "/") {
            if (stack.length <2) {
                throw new Error(`La division n'a pas assez d'opérandes à dépiler.`);
            }
            let right = stack.pop();
            let left = stack.pop();
            stack.push(new Div(left, right));
            continue;
        }
        if (item == "^") {
            if (stack.length <2) {
                throw new Error(`L'exponentiation n'a pas assez d'opérandes à dépiler.`);
            }
            let right = stack.pop();
            let left = stack.pop();
            stack.push(new Power(left, right));
            continue;
        }
        if (Constant.isConstant(item)) {
            stack.push(new Constant(item));
            continue;
        }
        if (Symbol.isSymbol(item)) {
            stack.push(new Symbol(item));
            continue;
        }
        if (Scalar.isScalar(item)) {
            stack.push(new Scalar(item));
            continue;
        }
        throw new Error(`token ${item} n'a pas été reconnu.`);
    }
    if (stack.length != 1) {
        throw new Error(`La pile devrait contenir un seul item à la fin et pas ${stack.length}.`);
    }
    return stack.pop();
}

export { build };