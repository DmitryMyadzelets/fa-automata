
// JSLint options:
/*global View*/
"use strict";

// Incapsulates and returns the graph object.
//  Overrides methods which change the graph. 
//  When the methods are called invokes correspondent View methods.
function wrap(graph, aView) {

    var view = aView;

    // References to the parent objects
    var node = graph.node;
    var edge = graph.edge;

    // Child objects
    graph.node = Object.create(graph.node);
    graph.edge = Object.create(graph.edge);


    function update_view() {
        view.update();
    }

    graph.node.add = function () {
        var ret = node.add.apply(this, arguments);
        update_view();
        return ret;
    };


    graph.node.remove = function () {
        var ret = node.remove.apply(this, arguments);
        update_view();
        return ret;
    };

    graph.node.text = function (d, text) {
        var ret = node.text.apply(this, arguments);
        view.node_text(d, text);
        return ret;
    };

    graph.node.shift = function () {
        var ret = node.shift.apply(this, arguments);
        view.transform();
        return ret;
    };

    graph.node.move = function () {
        var ret = node.move.apply(this, arguments);
        view.transform();
        return ret;
    };

    graph.node.mark = function (d) {
        var ret = node.mark.apply(this, arguments);
        view.mark_node(d);
        return ret;
    };

    graph.node.unmark = function (d) {
        var ret = node.unmark.apply(this, arguments);
        view.mark_node(d);
        return ret;
    };

    graph.node.initial = function (d) {
        node.initial(d);
        view.initial(d);
    };

    graph.edge.add = function () {
        var ret = edge.add.apply(this, arguments);
        update_view();
        return ret;
    };

    graph.edge.remove = function () {
        var ret = edge.remove.apply(this, arguments);
        update_view();
        return ret;
    };


    graph.edge.text = function (d, text) {
        var ret = edge.text.apply(this, arguments);
        view.edge_text(d, text);
        return ret;
    };

    // Move edge to nodes 'target', 'source'
    graph.edge.move = function (d, source, target) {
        d.source = source;
        d.target = target;
        update_view();
    };

    return graph;
}


