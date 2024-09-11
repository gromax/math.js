import { Function } from "./function";
import { Add, Minus } from "./add";
import { Mult, Div } from './mult';
import { Power } from './power';
import { Constant } from "./constant";
import { Symbol } from "./symbol";
import { Scalar } from "./scalar";

function developp(node) {
    if (node instanceof Add) {
        let left = developp(node.left);
        let right = developp(node.right);
        if ((left instanceof Function) && (left.name == "(-)")) {
            return new Minus(right, left.child);
        }
        if ((right instanceof Function) && (right.name == "(-)")) {
            return new Minus(left, right.child);
        }
        return left == node.left && right == node.right ? node : new Add(left, right);
    }
    if (node instanceof Minus) {
        let left = developp(node.left);
        let right = developp(node.right);
        if ((right instanceof Function) && (right.name == "(-)")) {
            return new Add(left, right.child);
        }
        if (right instanceof Add) {
            return developp(new Minus(new Minus(left, right.left), right.right));
        }
        if (right instanceof Minus) {
            return developp(new Minus(new Add(left, right.right), right.left));
        }
        return left == node.left && right == node.right ? node : new Minus(left, right);
    }
    if (node instanceof Mult) {
        let left = developp(node.left);
        let right = developp(node.right);
        if ((left instanceof Scalar) && (left.floatValue == 1)) {
            return right;
        }
        if ((right instanceof Scalar) && (right.floatValue == 1)) {
            return left;
        }
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
        if (left instanceof Minus) {
            return developp(new Minus(new Mult(left.left, right), new Mult(left.right, right)));
        }

        if (left instanceof Div) {
            return developp(new Div(new Mult(left.left, right)), left.right)
        }
        if (right instanceof Add) {
            return developp(new Add(new Mult(left, right.left), new Mult(left, right.right)));
        }
        if (right instanceof Minus) {
            return developp(new Minus(new Mult(left, right.left), new Mult(left, right.right)));
        }
        if (right instanceof Div) {
            return developp(new Div(new Mult(left, right.left)), right.right)
        }
        return left == node.left && right == node.right ? node : new Mult(left, right);
    }
    if (node instanceof Div){
        let left = developp(node.left);
        let right = developp(node.right);
        
        if ((left instanceof Function) && (left.name == "(-)")) {
            return developp(new Function("(-)", new Div(left.child, right)));
        }
        if ((right instanceof Function) && (right.name == "(-)")) {
            return developp(new Function("(-)", new Div(left, right.child)));
        }
        if (left instanceof Add) {
            return developp(new Add(new Div(left.left, right), new Div(left.right, right)));
        }
        if (left instanceof Minus) {
            return developp(new Minus(new Div(left.left, right), new Div(left.right, right)));
        }
        if (left instanceof Div) {
            return developp(new Div(left.left, new Mult(left.right, right)));
        }

        if ((right instanceof Scalar) && (right.floatValue == 1)) {
            return left;
        }
        if (right instanceof Div) {
            return developp(new Mult(left, right.inverse()))
        }
        return left == node.left && right == node.right ? node : new Div(left, right);
    }

    if (node instanceof Power) {
        let left = developp(node.left);
        let right = developp(node.right);
        if ((right instanceof Scalar) && (right.isInteger())) {
            let p = Math.abs(right.floatValue);
            if (p==0){
                return new Scalar(1);
            }
            let n = left;
            while (p>0) {
                n = new Mult(left, n);
                p -= 1;
            }
            n = developp(n);
            if (right.floatValue<0) {
                return new Div(new Scalar(1), n);
            }
            return n;
        }
        return left == node.left && right == node.right ? node : new Power(left, right);
    }

    if (node instanceof Function) {
        let child = developp(node.child);
        if (node.name == "(+)") {
            return child;
        }
        if (node.name != "(-)") {
            return child==node.child ? node : new Function(node.name, child);
        }
        if ((child instanceof Function) && (child.name == "-")) {
            return child.child;
        }
        if (child instanceof Add) {
            return developp(new Add(new Function("(-)", child.left), new Function("(-)", child.right)));
        }
        if (child instanceof Minus) {
            return developp(new Add(new Function("(-)", child.left), child.right));
        }
        return child==node.child ? node : new Function("(-)", child);
    }

    return node;
}

export {developp};