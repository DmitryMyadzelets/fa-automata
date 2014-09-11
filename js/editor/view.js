
// JSLint options:
/*global d3, ed, elements*/
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



// Updates SVG structure according to the graph structure
function update() {
    this.node = this.node.data(this._graph.nodes);
    this.node.enter().call(elements.add_node);
    this.node.exit().remove();

    this.link = this.link.data(this._graph.edges);
    this.link.enter().call(elements.add_link);
    this.link.exit().remove();

    var self = this;
    // Identify type of edge {int} (0-straight, 1-curved, 2-loop)
    this.link.each(function () {
        set_link_type.apply(self, arguments);
    });

    this.force.start();
}



function set_graph(graph) {
    this._graph = null;
    this._graph = graph || get_empty_graph();
    this.force.nodes(this._graph.nodes).links(this._graph.edges);
    update.call(this);
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

    this.on_event = function() {
        if(true) {
            View.prototype.controller.process_event.call(self, arguments);
        }
    };

    svg.on('mousemove', this.on_event)
        .on('mouseout', this.on_event)
        .on('mouseover', this.on_event);

    svg = svg.append('g');

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
            self.link.selectAll('path').attr('d', elements.get_link_transformation);
        });

    this.node = svg.append('g').attr('class', 'nodes').selectAll('g');
    this.link = svg.append('g').attr('class', 'links').selectAll('g');

    // Attach graph
    set_graph.call(this, aGraph);
}



// Returns a graph attached to the view, and attches new graph if given
View.prototype.graph = function (graph) {
    if (arguments.length > 0) {
        set_graph.call(this, graph);
    }
    return this._graph;
};



ed.view = function (container, graph) {
    return new View(container, graph);
};


