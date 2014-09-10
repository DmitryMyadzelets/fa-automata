// JSLint options:
/*global jA*/

console.log('test');

//TODO: make 2 containers and 1 with no container graphs

var view = jA.editor.view();
view.graph({
    nodes : [{}, {}, {}],
    edges : []
});
view.graph({
    nodes : [{}, {}],
    edges : []
});
