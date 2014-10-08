!function () {

var ed = { version: "1.0.0" };

//
// This module implements an user interface for interacting with 
// an automata graph.
// 

// Look at some examples:
// http://bl.ocks.org/mbostock/4600693
// http://bl.ocks.org/MoritzStefaner/1377729
// http://bl.ocks.org/rkirsling/5001347
// http://bl.ocks.org/benzguo/4370043
// http://tutorials.jenkov.com/svg/svg-and-css.html // SVG and CSS


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



// This file implements a router object, which routes events to other objects.
// At the core of the router there is a list of target objects. Each target
// object should notify the router when it recieves the user focus.
// Only one object can have the user focus. Objects can notify the router when
// they lost focus. It may happen when no object has focus.

// JSLint options:
/*global d3*/
"use strict";


var router = (function () {
	// var objects = [];
	var current;

	return {
		// Takes 'handler' and later calls it if events occure
		// Pass 'null' to remove the handler
		handle: function (handler) {
			current = handler;
			// if (objects.indexOf(handler) < 0) {
			// 	objects.push(handler);
			// }
		},
		// Handler for events which will be routed to current handler
		handler: function () {
			if (current && typeof(current) === 'function') {
				current.apply(this, arguments);
			}
		}
	};
}());


d3.select(window)
    .on('keydown', router.handler)
    .on('keyup', router.handler);




// JSLint options:
/*global vec, View */
"use strict";

var elements = {};


//
// Methods to calculate loop, stright and curved lines for links
// 
elements.make_edge = (function () {
    var v = [0, 0]; // temporal vector
    // var r = node_radius;
    var norm = [0, 0];
    var r = 16;
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
        r1 : 0, // radiuses
        r2 : 0,
        // Calculates vectors of edge from given vectors 'v1' to 'v2'
        // Substracts radius of nodes 'r' from both vectors
        stright : function (v1, v2) {
            vec.subtract(v2, v1, v);    // v = v2 - v1
            vec.normalize(v, norm);     // norm = normalized v
            vec.scale(norm, this.r1, v);     // v = norm * r
            vec.add(v1, v, v1);         // v1 = v1 + v
            vec.scale(norm, this.r2, v);     // v = norm * r
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
            vec.scale(norm, this.r2, v);     // v = v * r
            vec.add(v1, v, v1);         // v1 = v1 + v
            if (to_node) {
                vec.subtract(v2, v, v2); // if subtract # v2 = v2 - v
            }
        },
        // Calculates vectors of Bezier curve for curved edge
        curve : function (v1, v2, cv) {
            vec.subtract(v2, v1, v);
            vec.normalize(v, norm);
            cv[0] = (v1[0] + v2[0]) * 0.5 + norm[1] * this.r1 * 2;
            cv[1] = (v1[1] + v2[1]) * 0.5 - norm[0] * this.r2 * 2;
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
elements.get_edge_transformation = (function () {
    var v1 = [0, 0];
    var v2 = [0, 0];
    var cv = [0, 0];
    var cv2 = [0, 0];
    return function (d) {
        v1[0] = d.source.x;
        v1[1] = d.source.y;
        v2[0] = d.target.x;
        v2[1] = d.target.y;
        elements.make_edge.r1 = d.source.r !== undefined ? d.source.r : 16;
        elements.make_edge.r2 = d.target.r !== undefined ? d.target.r : 16;
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


var b = true;

elements.get_node_transformation = function (d) {
    if (!d || d.x === undefined || d.y === undefined) { return ""; }
    return "translate(" + d.x + "," + d.y + ")";
};



function node_radius (d) {
    return d ? d.r : 16;
}



// Adds SVG element representing a graph node
elements.add_node = function (selection, handler) {
    selection.append('g')
        .attr('transform', elements.get_node_transformation)
        .append('circle')
        .attr('r', node_radius)
        .on('mousedown', handler)
        .on('mouseup', handler)
        .on('mouseover', handler)
        .on('mouseout', handler)
        .on('dblclick', handler);
};



// Adds SVG elements representing a graph link/edge
// Returns root of the added elements
elements.add_edge = function (selection, handler) {
    var g = selection.append('g')
        .on('mousedown', handler)
        .on('mouseup', handler)
        .on('mouseover', handler)
        .on('mouseout', handler)
        .on('dblclick', handler);
        // .on('mousemove', handler);

    g.append('path')
        .attr('class', 'edge') // CSS class style
        .attr('marker-end', 'url(#marker-arrow)');

    g.append('path')
        .attr('class', 'catch');

    return g;
};



// JSLint options:
/*global d3*/
"use strict";


// Return object which implements panoramic behaviour for given container
function pan(container) {
    var a_xy = [0, 0]; // Absolute coordinates
    var d_xy = [0, 0]; // Delta coordinates
    var p_xy = [0, 0]; // Previous coordinates
    var fnc = function () {
        return [a_xy[0], a_xy[1]];
    };

    fnc.start = function () {
        p_xy[0] = d3.event.pageX;
        p_xy[1] = d3.event.pageY;
    };

    fnc.mouse = function () {
        // return [mouse[0] - a_xy[0], mouse[1] - a_xy[1]];
        return d3.mouse(container[0][0]);
    };

    fnc.to_mouse = function () {
        d_xy[0] = d3.event.pageX - p_xy[0];
        d_xy[1] = d3.event.pageY - p_xy[1];
        p_xy[0] = d3.event.pageX;
        p_xy[1] = d3.event.pageY;
        a_xy[0] += d_xy[0];
        a_xy[1] += d_xy[1];
        container.attr('transform', 'translate(' + a_xy[0] + ',' + a_xy[1] + ')');
    };

    return fnc;
}



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



View.prototype.update_nodes = function () {
    // The below code is equal to:
    // this.node = this.node.data(this.graph().nodes);
    // this.node.enter().call(elements.add_node, this.node_handler);
    // this.node.exit().remove();

    // return;

    // Copy of data array
    var nodes = this.graph().nodes.slice(0);
    // Get nodes data linked to svg elements
    var exist = [];
    this.node.each(function (d) {
        var i = nodes.indexOf(d);
        if (i < 0) {
            d3.select(this).remove();
        } else {
            exist.push(d);
            nodes.splice(i, 1);
        }
    });
    // Now, 'nodes' contains data which are not linked to svg elements
    // We create svg elements for that data
    var nodes_group = this.svg.select('g.nodes');
    while (nodes.length) {
        nodes_group.call(elements.add_node, this.node_handler);
        exist.push(nodes.pop());
    }
    // Get all svg elements related to nodes
    this.node = nodes_group.selectAll('g');
    // Link datum to each svg element
    var i = 0;
    this.node.datum(function (d) {
        return exist[i++];
    });
}


View.prototype.update_edges = function () {
    // The below code is equal to:
    // this.link = this.link.data(this.graph().edges);
    // this.link.enter().call(elements.add_link, this.edge_handler);
    // this.link.exit().remove();

    // Copy of data array
    var edges = this.graph().edges.slice(0);
    // Get edges data linked to svg elements
    var exist = [];
    this.edge.each(function (d) {
        var i = edges.indexOf(d);
        if (i < 0) {
            d3.select(this).remove();
        } else {
            exist.push(d);
            edges.splice(i, 1);
        }
    });
    // Now, 'edges' contains data which are not linked to svg elements
    // We create svg elements for that data
    var edges_group = this.svg.select('g.edges');
    while (edges.length) {
        edges_group.call(elements.add_edge, this.edge_handler);
        exist.push(edges.pop());
    }
    // Get all svg elements related to edges
    this.edge = edges_group.selectAll('g');
    // Link datum to each svg element
    var i = 0;
    this.edge.datum(function (d) {
        return exist[i++];
    });
}



View.prototype.edge_by_data = function (d) {
    obj = null;
    this.edge.each(function (_d) { if (_d === d) { obj = d3.select(this); }});
    return obj;
}



// JSLint options:
/*global d3, View*/


// Creates and returns an object which implements a selection rectangle
View.prototype.selection_rectangle = (function () {
    var x0, y0, x, y, w, h;
    var rc = {};
    var svg_rc; // Reference to a SVG rectangle
    var svg;

    // Returns coordinates [topleft, bottomright] of selection rectangle.
    // Methods of this function: show, update and hide the selection rectange.
    var fnc = function () {
        var ret = [x0, y0, x, y];
        if (x0 > x) { ret[0] = x; ret[2] = x0; }
        if (y0 > y) { ret[1] = y; ret[3] = y0; }
        return ret;
    };

    // Shows a selection rectange (use CSS ot tune its look)
    fnc.show = function (xy) {
        x0 = xy[0];
        y0 = xy[1];
        svg_rc = svg.append('rect').attr({
            x : x0,
            y : y0,
            'class' : 'selection'
        });
    };

    // Updates position of the rectangle depending of current mouse position
    fnc.update = function (xy) {
        x = xy[0];
        y = xy[1];
        w = x - x0;
        h = y - y0;
        rc.x = x0;
        rc.y = y0;
        if (w < 0) { w = -w; rc.x = x; }
        if (h < 0) { h = -h; rc.y = y; }
        rc.width = w;
        rc.height = h;
        svg_rc.attr(rc);
    };

    // Removes selection rectangle
    fnc.hide = function () {
        svg_rc.remove();
    };

    fnc.context = function (a_svg) {
        svg = a_svg;
        return this;
    };

    return fnc;
}());



// This object contains methods to select nodes and edges of the graph
View.prototype.select = (function () {
    var nodes = [];
    var edges = [];

    function point_in_rectangle(x, y, r) {
        return x > r[0] && x < r[2] && y > r[1] && y < r[3];
    }

    var view;
    var svg;

    return {
        context : function (a_view, a_svg) {
            view = a_view;
            svg = a_svg;
            return this;
        },
        // Changes look of the graph node as selected
        node : function (d) {
            var node = view.node.filter(function (_d) { return _d === d; });
            var index = nodes.indexOf(d);
            if (index < 0) {
                d.selected = true;
                nodes.push(d);
            } else {
                d.selected = false;
                nodes.splice(index, 1);
            }
            node.classed('selected', d.selected);
        },
        nodes : function () {
            return nodes;
        },
        edges : function () {
            return edges;
        },
        edge : function (d) {
            var edge = view.edge.select('.edge')
                .filter(function (_d) { return _d === d; });
            var index = edges.indexOf(d);
            if (index < 0) {
                d.selected = true;
                edges.push(d);
            } else {
                d.selected = false;
                edges.splice(index, 1);
            }
            edge.classed('selected', d.selected);
        },
        nothing : function () {
            nodes.length = 0;
            edges.length = 0;
            svg = svg || d3;
            svg.selectAll('.selected')
                .classed('selected', false)
                .each(function (d) { d.selected = false; });
        },
        // Updates graphical appearance of selected_nodes nodes
        by_rectangle : function (r) {
            // Correct coordinates according to the current panoram
            var p = view.pan();
            r[0] -=  p[0];
            r[2] -=  p[0];
            r[1] -=  p[1];
            r[3] -=  p[1];
            view.node.each(function (d) {
                // Check if center of the node is in the selection rectange
                if (point_in_rectangle(d.x, d.y, r)) {
                    view.select().node(d);
                }
            });
            view.edge.each(function (d) {
                // Check if both start and and points of edge 
                // are in the selection
                if (point_in_rectangle(d.x1, d.y1, r) &&
                        point_in_rectangle(d.x2, d.y2, r)) {
                    view.select().edge(d);
                }
            });
        }
    };
}());



// JSLint options:
/*global d3, View*/
"use strict";


View.prototype.controller = (function () {

    var view;           // a view where current event occur
    var source;         // a SVG element where current event occur
    var type;           // type of event (copy of d3.type)

    var mouse;          // mouse position
    var select_rect;    // selection rectangle
    var d_source;       // referrence to a data of svg element
    var nodes;          // array of nodes (data)
    var edge_svg;       // reference to a SVG edge
    var edge_d;         // reference to an edge object
    var node_d;         // reference to a node object
    var drag_target;    // drag target node of edge [true, false]

    var state;          // Reference to a current state
    var old_state;      // Reference to a previous state

    var states = {
        init : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    break;
                case 'dblclick':
                    mouse = view.pan.mouse();
                    // Create new node
                    var node = { x : mouse[0], y : mouse[1] };
                    view.graph().nodes.push(d);
                    view.update();
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().node(node);
                    break;
                case 'mousedown':
                    if (d3.event.shiftKey) {
                        view.pan.start();
                        state = states.move_graph;
                        break;
                    }
                    mouse = d3.mouse(this);
                    state = states.wait_for_selection;
                    break;
                case 'keydown':
                    switch (d3.event.keyCode) {
                    case 46: // Delete
                        var nodes = view.graph().nodes;
                        var edges = view.graph().edges;
                        selected_nodes = view.select().nodes();
                        selected_edges = view.select().edges();
                        // Add edges of selected nodes
                        var i = edges.length;
                        var e;
                        while (i-- > 0) {
                            e = edges[i];
                            if (selected_nodes.indexOf(e.source) >= 0 || selected_nodes.indexOf(e.target) >= 0) {
                                if (selected_edges.indexOf(e) < 0) { selected_edges.push(e); }
                            }
                        }
                        // delete selected nodes
                        while (selected_nodes.length) {
                            i = nodes.indexOf(selected_nodes.pop());
                            if (i < 0) { continue; }
                            nodes.splice(i, 1);
                        }
                        // delete selected edges
                        while (selected_edges.length) {
                            i = edges.indexOf(selected_edges.pop());
                            if (i < 0) { continue; }
                            edges.splice(i, 1);
                        }
                        view.update();
                        state = states.wait_for_keyup;
                        break;
                    // default:
                    //     console.log('Key', d3.event.keyCode);
                    }
                    break;
                }
                break;
            case 'node':
                switch (type) {
                case 'mousedown':
                    d_source = d;
                    state = states.node_select_or_drag;
                    break;
                }
                break;
            case 'edge':
                switch (type) {
                case 'mousedown':
                    // What to drag: head or tail of the edge? What is more close to mouse pointer.
                    var head = [], tail = [];
                    mouse = view.pan.mouse();
                    vec.subtract(mouse, [d.x1, d.y1], tail);
                    vec.subtract(mouse, [d.x2, d.y2], head);
                    drag_target = vec.length(head) < vec.length(tail);
                    state = states.edge_select_or_drag;
                    break;
                }
                break;
            }
        },
        node_select_or_drag : function () {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    if (d3.event.shiftKey) {
                        mouse = view.pan.mouse();
                        if (!d_source.selected) {
                            view.select().node(d_source);
                        }
                        nodes = view.select().nodes();
                        nodes.forEach(function (d) { d.fixed = true; });
                        state = states.drag_node;
                    }
                    break;
                }
                break;
            case 'node':
                switch (type) {
                case 'mouseout':
                    if (d3.event.shiftKey) { break; }
                    mouse = view.pan.mouse();
                    // Start dragging the edge
                    // Firstly, create new node with zero size
                    node_d = { x : mouse[0], y : mouse[1], r : 1 };
                    // Create new edge
                    edge_d = { source : d_source, target : node_d };
                    drag_target = true;
                    view.graph().edges.push(edge_d);
                    view.update_edges();
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    edge_svg.attr('d', elements.get_edge_transformation(edge_d));
                    // Then attach edge to this new node
                    view.force.stop();
                    state = states.drag_edge;
                    break;
                case 'mouseup':
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().node(d_source);
                    state = states.init;
                    break;
                }
                break;
            }
        },
        edge_select_or_drag : function (d) {
            switch (source) {
            case 'edge':
                switch (type) {
                case 'mouseup':
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().edge(d);
                    state = states.init;
                    break;
                case 'mouseout':
                    mouse = view.pan.mouse();
                    // Start dragging the edge
                    // Firstly, create new node with zero size
                    node_d = { x : mouse[0], y : mouse[1], r : 1 };
                    if (drag_target) {
                        d.target = node_d;
                    } else {
                        d.source = node_d;
                    }
                    // Then attach edge to this new node
                    view.force.stop();
                    // Save values for next state
                    edge_d = d;
                    set_edge_type.call(view, edge_d);
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    state = states.drag_edge;
                    break;
                default:
                    state = states.init;
                }
                break;
            }
        },
        drag_edge : function (d) {
            switch (type) {
            case 'mousemove':
                mouse = view.pan.mouse();
                node_d.x = mouse[0];
                node_d.y = mouse[1];
                edge_svg.attr('d', elements.get_edge_transformation(edge_d));
                break;
            case 'mouseup':
                delete node_d.r;
                view.graph().nodes.push(node_d);
                view.update();
                if (!d3.event.ctrlKey) { view.select().nothing(); }
                view.select().node(node_d);
                view.select().edge(edge_d);
                state = states.init;
                break;
            case 'mouseover':
                switch (source) {
                case 'node':
                    if (drag_target) {
                        edge_d.target = d;
                    } else {
                        edge_d.source = d;
                    }
                    set_edge_type.call(view, edge_d);
                    edge_svg.attr('d', elements.get_edge_transformation(edge_d));
                    state = states.drop_edge_or_exit;
                    break;
                }
                break;
            }
        },
        drop_edge_or_exit : function () {
            switch (source) {
            case 'node':
                switch (type) {
                case 'mouseup':
                    // Get existing edges between selected nodes
                    var exists = view.graph().edges.filter(function (v) {
                        return ((v.source === edge_d.source) && (v.target === edge_d.target));
                    });
                    if (exists.length > 1) {
                        // Delete edge
                        var edges = view.graph().edges;
                        var i = edges.indexOf(edge_d);
                        edges.splice(i, 1);
                    }
                    view.update();
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    if (exists.length <= 1) {
                        view.select().edge(edge_d);
                    }
                    state = states.init;
                    break;
                case 'mouseout':
                    if (drag_target) {
                        edge_d.target = node_d;
                    } else {
                        edge_d.source = node_d;
                    }
                    set_edge_type.call(view, edge_d);
                    state = states.drag_edge;
                    break;
                }
                break;
            }
        },
        drag_node : function () {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    if (!d3.event.shiftKey) {
                        nodes.forEach(function (d) { d.fixed = false; });
                        state = states.init;
                        break;
                    }
                    // How far we move the node
                    var xy = mouse;
                    mouse = view.pan.mouse();
                    xy[0] = mouse[0] - xy[0];
                    xy[1] = mouse[1] - xy[1];
                    nodes.forEach(function (d) {
                        d.x += xy[0];
                        d.y += xy[1];
                        d.px = d.x;
                        d.py = d.y;
                    });
                    xy[0] = mouse[0];
                    xy[1] = mouse[1];
                    // Fix it while moving
                    view.force.resume();
                    // view.update();
                    break;
                case 'mouseup':
                    nodes.forEach(function (d) { d.fixed = false; });
                    state = states.init;
                    break;
                }
                break;
            case 'node':
                switch (type) {
                case 'mouseup':
                    nodes.forEach(function (d) { d.fixed = false; });
                    state = states.init;
                    break;
                }
                break;
            }
        },
        wait_for_selection : function () {
            switch (type) {
            case 'mousemove':
                if (!d3.event.ctrlKey) { view.select().nothing(); }
                select_rect = view.selection_rectangle();
                select_rect.show(mouse);
                mouse = d3.mouse(this);
                state = states.selection;
                break;
            case 'mouseup':
                if (!d3.event.ctrlKey) { view.select().nothing(); }
                state = states.init;
                break;
            default:
                state = states.init;
            }
        },
        selection : function () {
            switch (type) {
            case 'mousemove':
                select_rect.update(d3.mouse(this));
                break;
            case 'mouseup':
                view.select().by_rectangle(select_rect());
                select_rect.hide();
                state = states.init;
                break;
            }
        },
        move_graph : function () {
            switch (type) {
            case 'mousemove':
                if (!d3.event.shiftKey) { state = states.init; }
                view.pan.to_mouse();
                break;
            case 'mouseup':
                state = states.init;
                break;
            }
        },
        wait_for_keyup : function () {
            if (type === 'keyup') {
                state = states.init;
            }
        }
    };

    state = states.init;

    // Add 'name' property to the state functions to trace transitions
    var key;
    for (key in states) {
        if (states.hasOwnProperty(key)) {
            states[key]._name = key;
        }
    }

    var old_view = null;

    return {
        event : function () {
            if (!view) { return; }

            // Do not process events if the state is not initial.
            // It is necessary when user drags elements outside of the current view.
            if (old_view !== view) {
                if (state !== states.init) {
                    return;
                } else {
                    old_view = view;
                }
            }

            // Set default event source in case it is not set by 'set_event' method
            source = source || d3.event.target.nodeName;
            type = d3.event.type;

            old_state = state;
            state.apply(this, arguments);

            // Clear the context to prevent false process next time
            view = null;
            source = null;

            d3.event.stopPropagation();
            // If there wes a transition from state to state
            if (old_state !== state) {
                // Trace current transition
                console.log('transition:', old_state._name + ' -> ' + state._name);
            }
        },

        // Sets context in which an event occurs
        // Returns controller object for subsequent invocation
        context : function (a_view, a_element) {
            view = a_view;
            if (!old_view) { old_view = view; }
            source = a_element;
            return this;
        }
    };

}());



ed.view = function (container, graph) {
    return new View(container, graph);
};



this.jA = this.jA || {};
this.jA.editor = ed;

}(window);