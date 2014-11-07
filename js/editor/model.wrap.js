
// JSLint options:
/*global View*/
"use strict";

// Incapsulates and returns the graph object.
//  Overrides methods which change the graph. 
//  When the methods are called invokes correspondent View methods.
function wrap (graph) {

    graph.node = Object.create(graph.node);
    graph.edge = Object.create(graph.edge);

    var node = graph.node.__proto__;
    var edge = graph.edge.__proto__;

    function update_view() {
        graph.view.update();
    }

    graph.node.add = function (d) {
        var ret = node.add.apply(this, arguments);
        update_view();
        return ret;
    };


    graph.node.remove = function (d) {
        var ret = node.remove.apply(this, arguments);
        update_view();
        return ret;
    };


    graph.edge.add = function (d) {
        var ret = edge.add.apply(this, arguments);
        update_view();
        return ret;
    };


    graph.edge.remove = function (d) {
        var ret = edge.remove.apply(this, arguments);
        update_view();
        return ret;
    };

    graph.node.text = function (d, text) {
        var ret = node.text.apply(this, arguments);
        graph.view.node_text(d, text);
        return ret;
    };


    graph.edge.text = function (d, text) {
        var ret = edge.text.apply(this, arguments);
        graph.view.edge_text(d, text);
        return ret;
    };


    graph.node.shift = function () {
        var ret = node.shift.apply(this, arguments);
        graph.view.transform();
        return ret;
    };


    graph.node.move = function () {
        var ret = node.move.apply(this, arguments);
        graph.view.transform();
        return ret;
    };

    return graph;
}


