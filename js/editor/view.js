
// JSLint options:
/*global d3, ed, elements, pan*/
"use strict";

// Structure of SVG elements:
// <svg>
//   <g>
//     <g .nodes>
//       <g>
//         <circle>
//     <g .edges>
//       <g>
//         <path .edge>
//         <path .catch>


// Returns new empty graphoo
function get_empty_graph() {
    return {
        nodes: [],
        edges: []
    };
}



// Returns true if link 'a' is counter to link 'b'
function has_counter_edge(d) {
    return (this.target === d.source) && (this.source === d.target);
}



// Set type of the link (0-stright, 1-curved, 2-loop)
function set_edge_type(d) {
    if (d.source === d.target) {
        d.type = 2;
    } else if (this._graph.edges.filter(has_counter_edge, d).length > 0) {
        d.type = 1;
    } else {
        d.type = 0;
    }
}



function View(aContainer, aGraph) {
    var self = this;

    // Create SVG elements
    var container = d3.select(aContainer || 'body');

    // Default dimension of SVG element
    var width = 500;
    var height = 300;

    var svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        // Disable browser popup menu
        .on('contextmenu', function () { d3.event.preventDefault(); });

    var root_group = svg.append('g');

    // Returns View.prototype.selection_rectangle object with context of 
    // current SVG object
    this.selection_rectangle = function () {
        return View.prototype.selection_rectangle.context(svg);
    };

    // Returns View.prototype.select object with context of current object
    this.select = function () {
        return View.prototype.select.context(self, root_group);
    };


    // Handles nodes events
    this.node_handler = function () {
        self.controller.context(self, 'node').event.apply(this, arguments);
    };


    // Handles edge events
    this.edge_handler = function () {
        self.controller.context(self, 'edge').event.apply(this, arguments);
    };


    // Handles plane (out of other elements) events
    function plane_handler() {
        self.controller.context(self, 'plane').event.apply(this, arguments);
    }


    // Makes current view focused and requests routing of window events (keys) to itb
    function focus() {
        router.handle(plane_handler);
    }



    svg.on('mousedown', plane_handler)
        .on('mouseover', focus)
        .on('mouseup', plane_handler)
        .on('mousemove', plane_handler)
        // .on('mouseout', plane_handler)
        .on('dblclick', plane_handler)
        .on('dragstart', function () { d3.event.preventDefault(); });

    // Arrow marker
    svg.append('svg:defs').append('svg:marker')
            .attr('id', 'marker-arrow')
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('refX', 6)
            .attr('refY', 3)
        .append('svg:path')
            .attr('d', 'M0,0 L6,3 L0,6');

    this.force = d3.layout.force()
        .charge(-800)
        .linkDistance(150)
        .chargeDistance(450)
        .size([width, height])
        .on('tick', function () {
            self.node.attr('transform', elements.get_node_transformation);
            self.edge.each(function (d) {
                var str = elements.get_edge_transformation(d);
                d3.select(this).selectAll('path').attr('d', str);
            });
        });

    this.node = root_group.append('g').attr('class', 'nodes').selectAll('g');
    this.edge = root_group.append('g').attr('class', 'edges').selectAll('g');

    this.pan = pan(root_group);

    this.svg = svg;

    // Attach graph
    this.graph(aGraph);
}



// Returns a graph attached to the view.
// If new graph is given, attches it to the view.
View.prototype.graph = function (graph) {
    if (arguments.length > 0) {
        this._graph = null;
        this._graph = graph || get_empty_graph();
        this.force.nodes(this._graph.nodes).links(this._graph.edges);
        this.update();
    }
    return this._graph;
};



// Updates SVG structure according to the graph structure
View.prototype.update = function () {
    this.update_nodes();
    this.update_edges();

    var self = this;
    // Identify type of edge {int} (0-straight, 1-curved, 2-loop)
    this.edge.each(function () {
        set_edge_type.apply(self, arguments);
    });

    this.force.start();
};



// Returns an unique identifier
var uid = (function () {
    var id = 0;
    return function () {
        return id++;
    }
}());



// Returns key of thge datum
function key(d) {
    if (d.uid === undefined) { d.uid = uid(); }
    return d.uid;
}



View.prototype.update_nodes = function () {
    this.node = this.node.data(this.graph().nodes, key);
    this.node.enter().call(elements.add_node, this.node_handler);
    this.node.exit().remove();
}



View.prototype.update_edges = function () {
    // The below code is equal to:
    this.edge = this.edge.data(this.graph().edges, key);
    this.edge.enter().call(elements.add_edge, this.edge_handler);
    this.edge.exit().remove();
}



View.prototype.edge_by_data = function (d) {
    obj = null;
    this.edge.each(function (_d) { if (_d === d) { obj = d3.select(this); }});
    return obj;
}



