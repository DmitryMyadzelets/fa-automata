// JSLint options:
/*global jA*/

console.log('test');

//TODO: make 2 containers and 1 with no container graphs

var view1 = jA.editor.view(document.getElementById('svg_container1'));
var view2 = jA.editor.view(document.getElementById('svg_container2'));
var view3 = jA.editor.view();

view1.graph({
    nodes : [{}, {}, {}],
    edges : [{source : 1, target : 2}, {source : 2, target : 1}, {source : 2, target : 2}]
});

view2.graph({
    nodes : [{}, {}, {}],
    // edges : [{source : 0, target : 1}]
    edges : [{source : 0, target : 1}, {source : 0, target : 2}]
});

view3.graph({
    nodes : [{}, {}],
    edges : [{source : 0, target : 1}, {source : 1, target : 1}]
});


