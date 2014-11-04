
// JSLint options:
/*global View*/
"use strict";

var Model = (function () {


    // Methods for nodes only
    function nodes_methods() {

    }


    // Methods for edges only
    function edges_methods() {

        // Returns array of edges filtered upon the result of the test(edge, node) call
        function filter(edges, node, test) {
            var out;
            if (node instanceof Array) {
                out = [];
                node.forEach(function (n) {
                    var a = edges.filter(function (e) { return test(e, n); });
                    while (a.length) { out.push(a.pop()); }
                });
            } else {
                out = edges.filter(function (e) { return test(e, node); });
            }
            return out;
        }


        // Returns array of incoming and outgoing edges of the given node[s]
        this.adjacent = function (nodes) {
            return filter(this.data, nodes, function (edge, node) {
                return edge.source === node || edge.target === node;
            });
        };

        // Returns array of incoming edges to the given node[s]
        this.incoming = function (nodes) {
            return filter(this.data, nodes, function (edge, node) {
                return edge.target === node;
            });
        };

        // Returns array of outgoing edges from the given node[s]
        this.outgoing = function (nodes) {
            return filter(this.data, nodes, function (edge, node) {
                return edge.source === node;
            });
        };

    }


    // Methods for both nodes and edges
    function basic_methods() {

        var data;

        // Calls function 'fun' for a single datum or an array of data
        function foreach(d, fun) {
            if (d instanceof Array) {
                d.forEach(fun);
            } else {
                fun(d);
            }
        }

        function add(d) {
            data.push(d);
        }

        function remove(d) {
            var i = data.indexOf(d);
            if (i >= 0) {
                data.splice(i, 1);
            }
        }

        // Adds a single datum or an array of data into the array
        this.add = function (d) {
            data = this.data;
            foreach(d, add);
            return this;
        };

        // Removes a single datum or an array of data from the array
        this.remove = function (d) {
            data = this.data;
            foreach(d, remove);
            return this;
        };
    };


    // The prototype with basic methods
    var basic_prototype = Object.create({});
    basic_methods.call(basic_prototype);

    // The prototype with nodes methods
    var nodes_prototype = Object.create(basic_prototype);
    nodes_methods.call(nodes_prototype);

    var edges_prototype = Object.create(basic_prototype);
    edges_methods.call(edges_prototype);


    // Model public interface
    return {
        // Returns a new graph object
        graph : function () {
            var o = {
                node : Object.create(nodes_prototype),
                edge : Object.create(edges_prototype),
            };
            o.node.data = [];
            o.edge.data = [];
            // Returns a simple object with only nodes and edges (for serialisation etc)
            o.object = function () {
                return {
                    nodes : this.node.data,
                    edges : this.edge.data
                };
            };
            return o;
        }
    };

}());


