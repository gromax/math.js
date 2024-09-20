import katex from "katex";
import { Parser } from '../parser/parser';
import { build } from '../numbertools/rpnbuilder';

let div = document.getElementById('tests');
let atester = [
    "x",
    "2 + 3",
    "2 + 3*5",
    "5*(3+2)",
    "45+8(19-5x)/4+ y",
    "45+8*(19-5x)/4+ 2x",
    "45+8 *-(19-5x)/4+y",
    "exp(x+1) - exp(2x+1) / exp(x)"
];

for (let item of atester){
    let parser = new Parser(item);
    let node = build(parser.rpn);
    let domNode = document.createElement('div');
    div.appendChild(domNode);
    console.log(node.tex());
    katex.render(node.tex(), domNode, {
        throwOnError: false
    });

}


