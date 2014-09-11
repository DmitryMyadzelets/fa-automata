// JSLint options:
/*global jA*/

console.log('test');

//TODO: make 2 containers and 1 with no container graphs

var view1 = jA.editor.view(document.getElementById('svg_container1'));
var view2 = jA.editor.view(document.getElementById('svg_container2'));

view1.graph({
    nodes : [{}, {}, {}],
    edges : []
});

view2.graph({
    nodes : [{}, {}],
    edges : [{source : 0, target : 1}]
});
