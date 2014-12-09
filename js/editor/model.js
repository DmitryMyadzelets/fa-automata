
// JSLint options:
/*global */
"use strict";

var Model = (function () {

    // Helpers
    // Calls function 'fun' for a single datum or an array of data
    function foreach(d, fun) {
        if (d instanceof Array) {
            d.forEach(fun);
        } else {
            fun(d);
        }
    }


    // Methods for nodes only
    function nodes_methods() {

        var delta = [0, 0];
        var xy = [0, 0];

        function shift(d) {
            d.x += delta[0];
            d.y += delta[1];
            d.px = d.x;
            d.py = d.y;
        }

        // function move(d) {
        //     d.x = xy[0];
        //     d.y = xy[1];
        //     d.px = d.x;
        //     d.py = d.y;
        // }

        // Changes node position relatively to the previous one
        this.shift = function (d, dxy) {
            delta[0] = dxy[0];
            delta[1] = dxy[1]
            foreach(d, shift);
        };

        // Moves node to new position
        this.move = function (d, xy) {
            if (xy instanceof Array) {
                var i = 0;
                foreach(d, function (d) {
                    d.x = xy[i++];
                    d.y = xy[i++];
                    d.px = d.x;
                    d.py = d.y;
                });
            }
        };

        // [Un]Marking nodes\states

        function mark(d) { d.marked = true; }
        function unmark(d) { delete d.marked; }

        this.mark = function (d) { foreach(d, mark); }
        this.unmark = function (d) { foreach(d, unmark); }

        // Making [not] initial nodes\states

        function initial(d) { d.initial = true; }
        function uninitial(d) { delete d.initial; }

        this.initial = function (d) {
            foreach(this.data, uninitial);
            foreach(d, initial);
        }

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

        // Sets text for the datum
        this.text = function (d, text) {
            d.text = text;
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
        // Creates and returns a new graph object
        graph : function (user_graph) {
            var graph = {
                node : Object.create(nodes_prototype),
                edge : Object.create(edges_prototype),
            };
            graph.node.data = [];
            graph.edge.data = [];

            // Replace default nodes and edges arrays with ones provided by user.
            // Exists 'edges' implies that 'nodes' exists, i.e. the must be no edges with no nodes.
            if(user_graph) {
                if (user_graph['nodes'] instanceof Array) {
                    graph.node.data = user_graph['nodes'];
                    if (user_graph['edges'] instanceof Array) {
                        graph.edge.data = user_graph['edges'];
                    }
                }
            }

            // Returns a simple graph object with only nodes and edges (for serialization etc)
            graph.object = function () {
                return {
                    nodes : this.node.data,
                    edges : this.edge.data
                };
            };

            // Returns graph object ready for convertion to JSON, 
            // with the nodes references in edges replaced by indexes
            graph.storable = function () {
                var graph = this.object();
                // Copy edges while calculating the indexes to the nodes
                graph.edges = graph.edges.map(function (edge) {
                    var e = clone(edge);
                    e.source = graph.nodes.indexOf(edge.source);
                    e.target = graph.nodes.indexOf(edge.target);
                    return e;
                });
                // Make deep clone, i.e. the objects of the copy will have no references to the source
                graph = clone(graph, true);
                // Convert all the  float values to integers
                float2int(graph);
                return graph;
            };


            if (typeof wrap === 'function') {
                graph = wrap(graph);
            }
            return graph;
        }
    };

}());


