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


(function () {
    var elm = document.getElementById('svg_container');
    var editor = jA.editor.instance(elm);

    function resize() {
        editor.view.size(elm.offsetWidth, elm.offsetHeight);
    }

    resize();

    new ResizeSensor(elm, resize);

}());


function save_graph (graph, name) {
    if ($ && $.jStorage && $.jStorage.storageAvailable()) {
        var s = JSON.stringify(graph);
        console.log(s);
        $.jStorage.set(name, s);
    }
}


function load_graph (name) {
    if ($ && $.jStorage && $.jStorage.storageAvailable()) {
        // $.jStorage.flush();
        return JSON.parse($.jStorage.get(name));
    }
    return null;
}


jA.editor.commands.on['update'] = function () {
    var graph = view1.graph.storable();
    save_graph(graph, 'graph');
};


(function init () {
    var graph = load_graph('graph');
    if (typeof graph === 'object') {
        console.log(graph);
        view1.set_graph(graph);
    }
}());

// window.foo = function () {
//     var s = JSON.stringify(view1.graph.compact_object());
//     console.log('JSON', s);
//     view2.set_graph(JSON.parse(s));
//     // return s;
// };

d3.select('#btn_save').on('click', function () {
    // var doc = document.getElementById('svg_container1');
    var doc = document.getElementById('svg_container1').getElementsByTagName('svg')[0];
    console.log(doc);
    var blob = new Blob(
        [(new XMLSerializer).serializeToString(doc)],
        {type: 'image/svg+xml'}
    );
    console.log(blob);
    saveAs(blob, 'graph' + '.svg');
    // alert('click');
});


window.moo = function () {
    view1.set_graph({
        nodes: [{}, {}],
        // nodes: [{ x : 10, y : 200 }, { x : 50, y : 5 }],
        edges : [{source : 0, target : 1}, {source : 1, target : 1}]
     });
}


