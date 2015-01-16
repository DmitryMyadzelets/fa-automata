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
        // console.log(s);
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
    // A separate SVG document must have its styling included into a CDATA section.
    // The below code does it.

    // Get SVG document, make a copy, and set namespace explicitly
    var svg = document.getElementById('svg_container1').getElementsByTagName('svg')[0];
    if (!svg) { return; }
    svg = svg.cloneNode(true);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Make a fake parent node in oder do delete copy of SVG late
    var foo = document.createElement('foo');
    foo.appendChild(svg);
    
    var defs = foo.getElementsByTagName('defs')[0];
    if (defs) {
        var style = defs.getElementsByTagName('style')[0];
        if (style) {
            var cdata = document.createTextNode('<![CDATA[' + style.innerHTML + ' ]]>');

            style.parentNode.removeChild(style);
            style = document.createElement('style');
            style.appendChild(cdata);
            defs.appendChild(style);
        }
    }

    // Save the SVG into a file
    var blob = new Blob(
        // [(new XMLSerializer).serializeToString(doc)],
        [foo.innerHTML],
        {type: 'image/svg+xml'}
    );
    saveAs(blob, 'graph' + '.svg');

    // Delete the copy of SVG
    svg.parentNode.removeChild(svg);
});



window.moo = function () {
    view1.set_graph({
        nodes: [{}, {}],
        // nodes: [{ x : 10, y : 200 }, { x : 50, y : 5 }],
        edges : [{source : 0, target : 1}, {source : 1, target : 1}]
     });
}


