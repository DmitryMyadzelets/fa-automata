
// JSLint options:
/*global d3, ed*/



// Returns new empty graph
function get_empty_graph() {
    return {
        nodes: [],
        edges: []
    };
}


function set_graph(graph) {
    this._graph = null;
    this._graph = graph || get_empty_graph();
}


function get_node_transformation(d) {
    d.x = d.x || Math.floor(Math.random() * 200);
    d.y = d.y || Math.floor(Math.random() * 300);
    return "translate(" + d.x + "," + d.y + ")";
}



function tick() {
    this.node.attr('transform', get_node_transformation);
}



function update() {
    console.log(this);
    this.node = this.node.data(this._graph);
    this.node.exit().remove();
    this.node.enter().append('g')
        .attr('transform', get_node_transformation)
        .append('circle')
        .attr('r', 16);

    this.force.start();
}



function View(aContainer, aGraph) {
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
        .on('tick', tick);

    this.node = svg.append('g').attr('class', 'nodes').selectAll('g');
    this.edge = svg.append('g').attr('class', 'edges').selectAll('g');

    // Attach graph
    set_graph.call(this, aGraph);
    this.force.nodes(this._graph.nodes).links(this._graph.links);
    update.call(this);
}



// Returns a graph attached to the view, and attches new graph if given
View.prototype.graph = function (graph) {
    if (arguments.length > 0) {
        set_graph.call(this, graph);
        update.call(this);
    }
    return this._graph;
};



// View.prototype.update = function () {
//     console.log(this);
//     this.node = this.node.data(this._graph);
//     this.node.exit().remove();
//     this.node.enter().append('g')
//         .attr('transform', get_node_transformation)
//         .append('circle')
//         .attr('r', 16);
// };


ed.view = function (container, graph) {
    return new View(container, graph);
};


