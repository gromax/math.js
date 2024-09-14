import { Function } from "../number/function";
import { Add, Minus } from "../number//add";
import { Mult, Div } from '../number//mult';
import { Power } from '../number/power';
import { Scalar } from "../number/scalar";

function developp(node) {
    if (node instanceof Add) {
        let left = developp(node.left);
        let right = developp(node.right);
        let out = ((left == node.left) && (right == node.right)) ? node : new Add(left, right);
        return out.groupeSameSignatures();
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
            new Function('inverse', node.right)
        ));
    }

    if (node instanceof Power) {
        let left = developp(node.left);
        let right = developp(node.right);
        if ((right instanceof Scalar) && (right.isInteger())) {
            let p = Math.abs(right.floatValue);
            if (p==0){
                return new Scalar(1);
            }
            let n = right.floatValue>0? left : new Function("inverse", left);
            while (p>0) {
                n = new Mult(left, n);
                p -= 1;
            }
            n = developp(n);
            return n;
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
                return developp(new Mult(child.right, new Function("inverse", child.left)));
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