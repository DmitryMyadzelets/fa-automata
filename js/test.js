// JSLint options:
/*global jA*/

console.log('test');


var view1 = jA.editor.instance(document.getElementById('svg_container1'));
var view2 = jA.editor.instance(document.getElementById('svg_container2'));
var view3 = jA.editor.instance();


// view1.controller().control(); // FIX : can't be attached when a graph already linked to the view.
// view1.graph({
//     // nodes : [{}],
//     // edges : []
//     nodes : [{}, {}, {}],
//     edges : [{source : 1, target : 2}, {source : 2, target : 1}, {source : 2, target : 2}]
// });


// view3.graph({
//     nodes : [{}, {}],
//     edges : [{source : 0, target : 1}, {source : 1, target : 1}]
// });


