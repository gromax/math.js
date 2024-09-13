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