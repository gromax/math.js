import $ from 'jquery';
import { Parser } from '../parser/parser';
import { build } from '../numbertools/rpnbuilder' ;
import { developp } from '../numbertools/developp';

function add(texte, node) {
    let txtNode = document.createTextNode(texte);
    let pNode = document.createElement('p');
    pNode.appendChild(txtNode);
    node.appendChild(pNode);
}


$('#form').on('submit',
    function(e) {
        e.preventDefault();
        let saisie = document.getElementById('saisie').value;
        let p = new Parser(saisie);
        let rpn = document.getElementById('rpn');
        let messages = document.getElementById('messages');
        let arbre = document.getElementById('arbre');
        add(p.rpn.join(' ; '), rpn);
        for (let m of p.messages) {
            add(m, messages);
        }
        let node = build(p.rpn);
        add(String(node), arbre);
        add(String(developp(node)), arbre);
    }
)

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
let parent = document.getElementById("tests");
for (let item of atester){
    parent.innerHTML += "<h4>" + item + "</h4>";
    console.log("Traitement de "+item);
    let p = new Parser(item);
    parent.innerHTML += `<p><b>rpn :</b> ${p.rpn.join(' ; ')}</p>`;
    for (let m of p.messages) {
        parent.innerHTML += `<p><i>message :</b> ${m}</p>`;
    }
    let node = build(p.rpn);
    parent.innerHTML += `<p><b>arbre :</b> ${String(node)}</p>`;
    parent.innerHTML += `<p><b>développé :</b> ${String(developp(node))}</p>`;
}