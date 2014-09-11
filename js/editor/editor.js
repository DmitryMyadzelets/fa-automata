!function () {

var ed = { version: "1.0.0" };


"use strict";

//
// 2D Vector Methods
//
var vec = {

    length : function (v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); },

    normalize : function (v, out) {
        var len = this.length(v);
        len = 1 / len;
        out[0] = v[0] * len;
        out[1] = v[1] * len;
        return out;
    },

    orthogonal : function (v, out) {
        out[0] =  v[1];
        out[1] = -v[0];
        return out;
    },

    scale : function (a, rate, out) {
        out[0] = a[0] * rate;
        out[1] = a[1] * rate;
        return out;
    },

    add : function (a, b, out) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    },

    subtract : function (a, b, out) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    },

    copy : function (src, dst) {
        dst[0] = src[0];
        dst[1] = src[1];
        return dst;
    }
};



// JSLint options:
/*global vec */
"use strict";

var elements = {};


//
// Methods to calculate loop, stright and curved lines for links
// 
elements.make_edge = (function () {
    var v = [0, 0]; // temporal vector
    // var r = node_radius;
    var r = 16;
    var norm = [0, 0];

    // Constants for calculating a loop
    var K = (function () {
        var ANGLE_FROM = Math.PI / 3;
        var ANGLE_TO = Math.PI / 12;
        return {
            DX1 : r * Math.cos(ANGLE_FROM),
            DY1 : r * Math.sin(ANGLE_FROM),
            DX2 : r * 4 * Math.cos(ANGLE_FROM),
            DY2 : r * 4 * Math.sin(ANGLE_FROM),
            DX3 : r * 4 * Math.cos(ANGLE_TO),
            DY3 : r * 4 * Math.sin(ANGLE_TO),
            DX4 : r * Math.cos(ANGLE_TO),
            DY4 : r * Math.sin(ANGLE_TO),
            NX : Math.cos(ANGLE_FROM - Math.PI / 24),
            NY : Math.sin(ANGLE_FROM - Math.PI / 24)
        };
    }());


    return {
        // Calculates vectors of edge from given vectors 'v1' to 'v2'
        // Substracts radius of nodes 'r' from both vectors
        stright : function (v1, v2) {
            vec.subtract(v2, v1, v);    // v = v2 - v1
            vec.normalize(v, norm);     // norm = normalized v
            vec.scale(norm, r, v);      // v = norm * r
            vec.add(v1, v, v1);         // v1 = v1 + v
            vec.subtract(v2, v, v2);    // v2 = v2 - v
            // Middle of the vector
            // cv[0] = (v1[0] + v2[0])/2
            // cv[1] = (v1[1] + v2[1])/2
        },
        // Calculates vectors of a dragged edge
        // Substracts radius of nodes 'r' from the first vector
        // Substracts radius of nodes 'r' from the last vector if to_node is true
        drag : function (v1, v2, to_node) {
            vec.subtract(v2, v1, v);    // v = v2 - v1
            vec.normalize(v, norm);     // v = normalized v
            vec.scale(norm, r, v);      // v = v * r
            vec.add(v1, v, v1);         // v1 = v1 + v
            if (to_node) {
                vec.subtract(v2, v, v2); // if subtract # v2 = v2 - v
            }
        },
        // Calculates vectors of Bezier curve for curved edge
        curve : function (v1, v2, cv) {
            vec.subtract(v2, v1, v);
            vec.normalize(v, norm);
            cv[0] = (v1[0] + v2[0]) * 0.5 + norm[1] * r * 2;
            cv[1] = (v1[1] + v2[1]) * 0.5 - norm[0] * r * 2;
            vec.copy(cv, v);
            this.stright(v1, v);
            vec.copy(cv, v);
            this.stright(v2, v);
        },
        loop : function (v1, v2, cv1, cv2) {
            // Some Bazier calc (http://www.moshplant.com/direct-or/bezier/math.html)
            vec.copy(v1, v);
            // Coordinates of the Bazier curve (60 degrees angle)
            v1[0] = v[0] + K.DX1;
            v1[1] = v[1] - K.DY1;
            //
            cv1[0] = v[0] + K.DX2;
            cv1[1] = v[1] - K.DY2;
            //
            cv2[0] = v[0] + K.DX3; // 15 degrees
            cv2[1] = v[1] - K.DY3;
            //
            v2[0] = v[0] + K.DX4;
            v2[1] = v[1] - K.DY4;
        }
    };

}());



// Returns SVG string for graph edge
elements.get_link_transformation = (function () {
    var v1 = [0, 0];
    var v2 = [0, 0];
    var cv = [0, 0];
    var cv2 = [0, 0];
    return function (d) {
        v1[0] = d.source.x;
        v1[1] = d.source.y;
        v2[0] = d.target.x;
        v2[1] = d.target.y;
        switch (d.type) {
        case 1:
            elements.make_edge.curve(v1, v2, cv);
            break;
        case 2:
            elements.make_edge.loop(v1, v2, cv, cv2);
            break;
        default:
            elements.make_edge.stright(v1, v2);
        }
        // Keep link points for further use (i.e. link selection)
        d.x1 = v1[0];
        d.y1 = v1[1];
        d.x2 = v2[0];
        d.y2 = v2[1];
        switch (d.type) {
        case 1:
            return 'M' + v1[0] + ',' + v1[1] + 'Q' + cv[0] + ',' + cv[1] + ',' + v2[0] + ',' + v2[1];
        case 2:
            return 'M' + v1[0] + ',' + v1[1] + 'C' + cv[0] + ',' + cv[1] + ',' + cv2[0] + ',' + cv2[1] + ',' + v2[0] + ',' + v2[1];
        default:
            return 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1];
        }
    };
}());



elements.get_node_transformation = function (d) {
    d.x = d.x || 0;
    d.y = d.y || 0;
    return "translate(" + d.x + "," + d.y + ")";
};



elements.add_node = function (selection) {
    selection.append('g')
        .attr('transform', this.get_node_transformation)
        .append('circle')
        .attr('r', 16);
};



// Adds SVG elements representing a graph link/edge
// Returns root of the added elements
elements.add_link = function (selection) {
    var g = selection.append('g');
        // .attr('class', 'transition')
        // .on('dblclick', on_link_dblclick)
        // .on('mousedown', on_link_mousedown);
        // .on('mouseover', controller.on_link_mouseover)
        // .on('mousemove', controller.on_link_mousemove);

    g.append('path')
        .attr('class', 'link') // CSS class style
        .attr('marker-end', 'url(#marker-arrow)');

    g.append('path')
        .attr('class', 'catchlink');

    return g;
};



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



// JSLint options:
/*global */
"use strict";


var controller = View.prototype.controller = {};



controller.process_event = (function () {

	var self = this; // Here 'this' should refer to an instance of View
    var state;		// Reference to a current state
    var old_state;	// Reference to previous state
    var target, old_target;
    var states = {
    	init : function () {
    		target = d3.event.target;
    		if (target !== old_target) {
    			old_target = target;
    			console.log(d3.event.type, target.nodeName);
    		}
    	},
    };

    state = states.init;

    return function () {
        old_state = state;
        state.apply(this, arguments);
        if (old_state !== state) {
            // Trace current transition
            console.log('transition:', old_state._name + ' -> ' + state._name);
        }
    };
}());



this.jA = this.jA || {};
this.jA.editor = ed;

}(window);