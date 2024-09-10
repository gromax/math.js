import { Parser } from "./parser/parser";
import { build as rpnbuilder } from "./number/rpnbuilder" ;

class NumberManager {
    #messages;
    #child = null;
    constructor(entree) {
        this.#messages = [];
        if (typeof entree == 'string') {
            try {
                p = new Parser(entree);
                this.#buildFromRPN(p.rpn);
                for (let m of p.messages) {
                    this.#messages.push(m);
                }
            } catch(error) {
                this.#messages.push(String(error));
            }
        } else if (typeof entree == 'Array') {
            this.#buildFromRPN(entree);
        } else {
            throw new Error(`L'entrée ${entree} est invalide.`);
        }
    }

    toString() {
        return String(this.#child);
    }

    #buildFromRPN(rpn) {
        this.#child = rpnbuilder(rpn);
    }
}