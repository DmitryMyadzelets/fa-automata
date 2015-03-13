// JSLint options:
/*global jas, d3, ResizeSensor*/

console.log('test');



var editor1 = new jas.Editor(document.getElementById('svg_container1'));
var editor2 = new jas.Editor(document.getElementById('svg_container2'));
var editor3 = new jas.Editor();



// editor1.controller().control(); // FIX : can't be attached when a graph already linked to the view.
// editor1.graph({
//     // nodes : [{}],
//     // edges : []
//     nodes : [{}, {}, {}],
//     edges : [{source : 1, target : 2}, {source : 2, target : 1}, {source : 2, target : 2}]
// });


// editor3.graph({
//     nodes : [{}, {}],
//     edges : [{source : 0, target : 1}, {source : 1, target : 1}]
// });


(function () {
    var elm = document.getElementById('svg_container');
    var editor = new jas.Editor(elm);

    function resize() {
        editor.view.size(elm.offsetWidth, elm.offsetHeight);
    }

    resize();

    new ResizeSensor(elm, resize);

}());


function save(object, name) {
    if ($ && $.jStorage && $.jStorage.storageAvailable()) {
        var s = JSON.stringify(object);
        // console.log(s);
        $.jStorage.set(name, s);
    }
}


function load(name) {
    if ($ && $.jStorage && $.jStorage.storageAvailable()) {
        // $.jStorage.flush();
        return JSON.parse($.jStorage.get(name));
    }
    return null;
}

function save_editor1_graph() {
    var graph = editor1.graph.get_json();
    save(graph, 'graph');
}

/**
 * State machine which calls save method after the last change when its timer expires.
 * It accepts two events: 
 * 1. 'update' from an editor.
 * 2. Timer event (the timer is set by the machine itslef).
 */
var save_controller = (function () {
    "use strict";
    var timer, counter;

    function tout() { state(); }

    var state, states = {
        init : function () {
            counter = 0;
            timer = setInterval(tout, 500);
            state = states.wait_for_tout;
        },
        wait_for_tout : function (event) {
            if (event === 'update') {
                counter = 0;
            } else {
                // Wait for at least 2 consiquent timer events
                if (++counter > 1) {
                    clearInterval(timer);
                    save_editor1_graph();
                    state = states.init;
                }
            }
        }
    };
    state = states.init;

    return function loop() {
        state.apply(this, arguments);
        return loop;
    };
}());


jas.after(editor1.commands, 'update', function () {
    save_controller('update');
});


(function init() {
    var graph = load('graph');
    editor1.graph.set_json(graph);
}());


function save_svg() {
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
}


function save_json_file() {
    var s = JSON.stringify(editor1.graph.get_json());
    var blob = new Blob(
        // [(new XMLSerializer).serializeToString(doc)],
        [s],
        {type: 'application/json'}
    );
    saveAs(blob, 'graph' + '.json');
}


function load_json_file() {

    // Invoked when a file is loaded
    function on_file_loaded() {
        var graph = JSON.parse(this.result);
        editor1.graph.set_json(graph);
    }

    // Invoked when a file is selected in dialog
    function on_file_selected() {
        var f = this.files[0];
        if (f.type.match('json')) {
            var reader = new FileReader();
            reader.onload = on_file_loaded;
            reader.readAsText(f);
        } else {
            alert('Expected file extention \'*.json\'');
        }
    }

    var input = d3.select('body').append('input')
        .attr('type', 'file')
        .style('opacity', '0')
        .on('change', on_file_selected)
        .each(function () { this.click(); })
        .remove();
}


d3.select('#btn_save').on('click', function () {
    // save_svg();
    save_json_file();
});

d3.select('#btn_load').on('click', function () {
    // save_svg();
    load_json_file();
});




window.moo = function () {
    editor1.graph.json({
        nodes: [{}, {}],
        // nodes: [{ x : 10, y : 200 }, { x : 50, y : 5 }],
        edges : [{source : 0, target : 1}, {source : 1, target : 1}]
    });
};

