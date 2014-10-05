
// JSLint options:
/*global d3, ed, elements, pan*/
"use strict";



// Returns new empty graphoo
function get_empty_graph() {
    return {
        nodes: [],
        edges: []
    };
}



// Returns true if link 'a' is counter to link 'b'
function is_counter_link(d) {
    return (this.target === d.source) && (this.source === d.target);
}



// Set type of the link (0-stright, 1-curved, 2-loop)
function set_link_type(d) {
    if (d.source === d.target) {
        d.type = 2;
    } else if (this._graph.edges.filter(is_counter_link, d).length > 0) {
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


    this.drag_edge = function () {
        return View.prototype.drag_edge.context(self, root_group);
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


    // Makes current view focused and request routing of window events (keys) to it
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
            // TODO: you calculate paths both for link and catchlinks which
            // have the same coordinates. Better just copy it.
            self.link.each(function (d) {
                var str = elements.get_link_transformation(d);
                d3.select(this).selectAll('path').attr('d', str);
            });
            // var tmp = self.link.selectAll('path');
            // console.log(tmp);
            // self.link.selectAll('path').attr('d', elements.get_link_transformation);
            // self.drag_edge().update();
        });

    this.node = root_group.append('g').attr('class', 'nodes').selectAll('g');
    this.link = root_group.append('g').attr('class', 'links').selectAll('g');

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
    var graph = this._graph;
    this.node = this.node.data(graph.nodes);
    this.node.enter().call(elements.add_node, this.node_handler);
    this.node.exit().remove();

    this.update_edges();

    var self = this;
    // Identify type of edge {int} (0-straight, 1-curved, 2-loop)
    this.link.each(function () {
        set_link_type.apply(self, arguments);
    });

    this.force.start();
};



View.prototype.update_edges = function () {
    // Copy of data array
    var edges = this.graph().edges.slice(0);
    // Array of data linked to svg elements
    var exist = [];
    this.link.each(function (d) {
        var i = edges.indexOf(d);
        if (i < 0) {
            d3.select(this).remove();
        } else {
            exist.push(d);
            edges.splice(i, 1);
        }
    });
    // Now, 'edges' contains data which are not linked to svg elements
    var links_group = this.svg.select('g.links');
    while (edges.length) {
        links_group.call(elements.add_link, this.edge_handler);
        exist.push(edges.pop());
    }
    this.link = links_group.selectAll('g');
    var i = 0;
    this.link.datum(function (d) {
        return exist[i++];
    });

    // this.link = this.link.data(this.graph().edges);
    // this.link.enter().call(elements.add_link, this.edge_handler);
    // this.link.exit().remove();
}



View.prototype.edge_by_data = function (d) {
    obj = null;
    this.link.each(function (_d) { if (_d === d) { obj = d3.select(this); }});
    return obj;
}
