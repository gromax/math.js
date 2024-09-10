import $ from 'jquery';
import { Parser } from '../parser/parser';

$('#form').on('submit',
    function(e) {
        e.preventDefault();
        let saisie = document.getElementById('saisie').value;
        let p = new Parser(saisie);
        console.log(p.rpn);
        console.log(p.messages);
    }
)