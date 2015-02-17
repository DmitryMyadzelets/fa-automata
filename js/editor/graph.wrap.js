
// JSLint options:
/*global View*/
"use strict";

// Incapsulates and returns the graph object.
//  Overrides methods which change the graph. 
//  When the methods are called invokes correspondent View methods.
function wrap(graph, aView) {

    var view = aView;

    // Creates a new function for o.key, which calls the old o.key and 'fn' after it
    function after(o, key, fn) {
        var ofn = o[key];
        if (typeof ofn !== 'function' || typeof fn !== 'function') {
            throw new Error('Function should be called after function here');
        }
        o[key] = function () {
            var ret = ofn.apply(this, arguments);
            fn.apply(this, arguments);
            return ret;
        };
    }


    function update_view() {
        view.update();
    }

    after(graph.node, 'add', update_view);
    after(graph.node, 'remove', update_view);
    after(graph.node, 'text', view.node_text.bind(view));
    after(graph.node, 'shift', view.transform);
    after(graph.node, 'move', view.transform);
    after(graph.node, 'mark', view.mark_node.bind(view));
    after(graph.node, 'unmark', view.mark_node.bind(view));
    after(graph.node, 'initial', view.initial.bind(view));

    after(graph.edge, 'add', update_view);
    after(graph.edge, 'remove', update_view);
    after(graph.edge, 'text', view.edge_text.bind(view));
    after(graph.edge, 'move', update_view);

    return graph;
}


