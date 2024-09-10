import _ from 'lodash';

import { TNumber } from './tokens/number';
import { TFunction } from './tokens/function';
import { TOperator } from './tokens/operator';
import { TParenthesis } from './tokens/parenthesis';
import { TSymbol } from './tokens/symbol';


const TOKENS = [TNumber, TFunction, TOperator, TParenthesis, TSymbol];
_.map()
class Parser {
    /** @type{string} */
    #saisie;

    /** @type{Array} */
    #messages;

    /** @type{Array} */
    #rpn;

    static REGEX = new RegExp ( _.map(TOKENS, function(tok){ return `(${tok.sREGEX})`; } ).join("|"), "gi");

    /**
     * constructeur
     * @param {string} saitie 
     */
    constructor(saisie) {
        this.#saisie = saisie || "";
        this.#messages = [];
        this.#rpn = [];
        this.#parse();
    }

    get rpn() {
        return [...this.#rpn];
    }

    get messages() {
        return [...this.#messages];
    }


    #createToken(tokenString) {
        /**
         * construit un token
         */
        for (let oToken of TOKENS) {
            let regex = oToken.REGEX;
            if (regex.test(tokenString)) {
                return new oToken(tokenString)
            }
        }
        this.#messages.push(`${tokenString} n'est pas valide.`);
        return null;
    }

    #correctBinaireToUnaire(tokensList) {
        /**
         * modifie les opérateurs + ou - qui n'ont pas une opérande sur leur gauche
         */
        for (let i=0; i<tokensList.length; i++) {
            /** @type{TNumber|TFunction|TOperator|TParenthesis|TSymbol} */
            let oToken = tokensList[i];
            let leftIsNotOperand = ((i==0) || !tokensList[i-1].acceptOperOnRight());
            if ((oToken instanceof TOperator) && (oToken.operateOnLeft()) && leftIsNotOperand && !oToken.changeToArityOne()){
                this.#messages.push(`${oToken} devrait avoir potentiellement une opérande sur sa gauche`);
                return false;
            }
        }
        return true;
    }

    #parenthesesAreGood(tokens){
        /**
         * vérifie le bon équilibrage des parenthèses
         */
        let ouvrants = [];
        for (let tok of tokens) {
            if (tok instanceof TParenthesis) {
                if (tok.ouvrant) {
                    ouvrants.push(tok.symbol);
                    continue;
                }
                if (ouvrants.length == 0) {
                    this.#messages.push(`${tok.symbol} n'a pas d'ouvrant.`);
                    return false;
                }
                let ouvrant = ouvrants.pop();
                if (ouvrant != tok.jumeau) {
                    this.#messages.push(`${ouvrant} fermé par ${tok.jumeau}.`);
                    return false;
                }
            }
        }
        if (ouvrants.length != 0) {
            this.#messages.push(`${ouvrants.pop()} n'a pas de fermant.`);
            return false;
        }
        return true;
    }

    #correctFrac(tokens) {
        /**
         * transforme les frac A B en A / B
         */
        let i = 0;
        while (i < tokens.length) {
            let token = tokens[i];
            if (String(token) != "frac") {
                i += 1;
                continue;
            }
            // recherche du point ou déplacer frac
            if (i == tokens.length) {
                this.#messages.push('frac en dernière position.');
                return false;
            }
            let j = i+1;
            let ouvrants = 0;
            if ((tokens[j] instanceof TParenthesis) && tokens[j].ouvrant) {
                ouvrants = 1;
            }
            while ((ouvrants > 0) && (j<tokens.length-1)) {
                j+=1
                if (!(tokens[j] instanceof TParenthesis)) {
                    continue;
                }
                if (tokens[j].ouvrant) {
                    j += 1;
                } else {
                    j -= 1;
                }
            }
            if (ouvrants <0) {
                this.#messages.push('frac: parenthèses mal équilibrées.');
                return false;
            }
            // j est le point d'insertion de '/'
            tokens.splice(i,1);
            tokens.splice(j, 0, new TOperator('/'));
            i = j+1;
        }
        return true;
    }

    #verifyOperators(tokens) {
        /**
         * Vérifie que les opérateurs agissent comme il se doit à gauche et à droite
         */
        for (let i=0; i<tokens.length; i++) {
            let tok = tokens[i];
            if (tok.operateOnLeft()) {
                if (i==0) {
                    this.#messages.push(`${tok} en début d'expression.`);
                    return false;
                }
                if (!tokens[i-1].acceptOperOnRight()) {
                    this.#messages.push(`${tokens[i-1]} à gauche de ${tok}.`);
                    return false;
                }
            }
            if (tok.operateOnRight()) {
                if (i==tokens.length-1) {
                    this.#messages.push(`${tok} en fin d'expression.`);
                    return false;
                }
                if (!tokens[i+1].acceptOperOnLeft()) {
                    this.#messages.push(`${tok} à gauche de ${tokens[i+1]}.`);
                    return false;
                }
            } 
        }
        return true;
    }

    #buildRPN(tokens) {
        /**
         * renvoie la liste en notation polonaise inversée
         */
        let rpn = [];
        let stack = [];
        for(let token of tokens) {
            if ((token instanceof TParenthesis) && token.ouvrant) {
                stack.push(token);
                continue;
            }
            if (token instanceof TParenthesis) {
                while (stack.length>0) {
                    let depile = stack.pop();
                    if (depile instanceof TParenthesis) {
                        break;
                    }
                    rpn.push(depile);
                }
                continue;
            }
            if (token.priority == 0) {
                rpn.push(token);
                continue;
            }
            while (stack.length > 0) {
                let depile = stack[stack.length - 1];
                if ((depile instanceof TParenthesis) || depile.priority < token.priority) {
                    break;
                }
                rpn.push(stack.pop());
            }
            stack.push(token);
        }            
        while (stack.length > 0) {
            let depile = stack.pop();
            if (!(depile instanceof TParenthesis)) {
                rpn.push(depile);
            }
        }
        return rpn;
    }

    #insertMissingMults(tokens){
        let i = 0;
        while (i<tokens.length-1) {
            if (tokens[i].acceptOperOnRight() && tokens[i+1].acceptOperOnLeft()) {
                tokens.splice(i+1,0,new TOperator('*'));
            }
            i++;
        }
    }

    #parse() {
        /** @type{string} */
        let expression = this.#saisie;
        // correction des  \left et \right qui serait présent dans un champs de saisie latex
        expression = expression.replace(/\\\\/g, " ");
        expression = expression.replace(/left/g, " ");
        expression = expression.replace(/right/g, " ");
        // Les élèves utilisent la touche ²
        expression = expression.replace(/²/g, "^2 ");
        // Dans certains cas, le - est remplacé par un autre caractère plus long
        expression = expression.replace(/−/g, "-");
      
        let matchList = expression.match(Parser.REGEX);
        if (!matchList) {
          this.#messages.push("Aucun token valide reconnu !");
          return false;
        }
        
        let tokensList = [];
        for (let strToken of matchList) {
            let token = this.#createToken(strToken);
            if (token === null) {
                return false;
            }
            tokensList.push(token);
        }

        if (!this.#correctBinaireToUnaire(tokensList)) {
            return false;
        }

        if (!this.#parenthesesAreGood(tokensList)) {
            return false;
        }

        if (!this.#correctFrac(tokensList)) {
            return false;
        }

        this.#insertMissingMults(tokensList);

        if (!this.#verifyOperators(tokensList)) {
            return false;
        }

        let rpn = this.#buildRPN(tokensList);
        this.#rpn = _.map(rpn, function(item){ return String(item);});
    }
}

export { Parser }