// JSLint options:
/*global jA*/

console.log('test');

//TODO: make 2 containers and 1 with no container graphs

var view1 = jA.editor.view(document.getElementById('svg_container1'));
var view2 = jA.editor.view(document.getElementById('svg_container2'));
var view3 = jA.editor.view();


view1.controller().control(); // FIX : can't be attached when a graph already linked to the view.
view1.graph({
    // nodes : [{}],
    // edges : []
    nodes : [{}, {}, {}],
    edges : [{source : 1, target : 2}, {source : 2, target : 1}, {source : 2, target : 2}]
});


view2.controller().control();
var graph = jA.model.graph();
view2.graph(graph.object());
view2.model = graph;
graph.view = view2;



view3.graph({
    nodes : [{}, {}],
    edges : [{source : 0, target : 1}, {source : 1, target : 1}]
});


