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


var b = true;

elements.get_node_transformation = function (d) {
    d.x = d.x || 0;
    d.y = d.y || 0;
    return "translate(" + d.x + "," + d.y + ")";
};



// Adds SVG element representing a graph node
elements.add_node = function (selection, handler) {
    selection.append('g')
        .attr('transform', elements.get_node_transformation)
        .append('circle')
        .attr('r', 16)
        .on('mousedown', handler)
        .on('mouseup', handler)
        .on('mouseover', handler)
        .on('mouseout', handler)
        .on('dblclick', handler);
};



// Adds SVG elements representing a graph link/edge
// Returns root of the added elements
elements.add_link = function (selection, handler) {
    var g = selection.append('g')
        .on('mousedown', handler)
        .on('mouseup', handler)
        .on('mouseover', handler)
        .on('dblclick', handler);
        // .on('mousemove', handler);

    g.append('path')
        .attr('class', 'link') // CSS class style
        .attr('marker-end', 'url(#marker-arrow)');

    g.append('path')
        .attr('class', 'catchlink');

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


    svg.on('mousedown', plane_handler)
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
            self.link.selectAll('path').attr('d', elements.get_link_transformation);
            self.drag_edge().update();
        });

    this.node = root_group.append('g').attr('class', 'nodes').selectAll('g');
    this.link = root_group.append('g').attr('class', 'links').selectAll('g');

    this.pan = pan(root_group);

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

    this.link = this.link.data(graph.edges);
    this.link.enter().call(elements.add_link, this.edge_handler);
    this.link.exit().remove();

    var self = this;
    // Identify type of edge {int} (0-straight, 1-curved, 2-loop)
    this.link.each(function () {
        set_link_type.apply(self, arguments);
    });

    this.force.start();
};



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



// This object contains methods to select nodes and links of the graph
View.prototype.select = (function () {
    var nodes = [];
    var links = [];

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
        link : function (d) {
            var link = view.link.select('.link')
                .filter(function (_d) { return _d === d; });
            var index = links.indexOf(d);
            if (index < 0) {
                d.selected = true;
                links.push(d);
            } else {
                d.selected = false;
                links.splice(index, 1);
            }
            link.classed('selected', d.selected);
        },
        nothing : function () {
            nodes.length = 0;
            links.length = 0;
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
            view.link.each(function (d) {
                // Check if both start and and points of link 
                // are in the selection
                if (point_in_rectangle(d.x1, d.y1, r) &&
                        point_in_rectangle(d.x2, d.y2, r)) {
                    view.select().link(d);
                }
            });
        }
    };
}());





// This object implements a dragged edge when user creates new graph edge
View.prototype.drag_edge = (function () {
    var v1 = [0, 0];
    var v2 = [0, 0];
    var d = {}; // Data object for a link
    var group; // Reference to the group svg element
    var edge;  // Reference to the edge svg element
    var shown = false;
    var to_node = false;
    var view;
    var svg;
    return {
        show : function (d_node) {
            d.source = d_node;
            group = elements.add_link(svg).classed('links', true);
            edge = group.select('path');
            shown = true;
        },
        to_point : function (xy) {
            vec.copy(xy, v2);
            to_node = false;
            this.update();
        },
        to_node : function (d_node) {
            d.target = d_node;
            to_node = true;
            this.update();
        },
        update : function () {
            if (!shown) { return; }
            v1[0] = d.source.x;
            v1[1] = d.source.y;
            if (to_node) {
                set_link_type.call(view, d);
                edge.attr('d', elements.get_link_transformation(d));
            } else {
                elements.make_edge.drag(v1, v2);
                // TODO: can we move it to 'get_link_transormation'?
                edge.attr('d', 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1]);
            }
        },
        hide : function () {
            group.remove();
            shown = false;
        },
    	context : function (a_view, a_svg) {
    		view = a_view;
	        svg = a_svg;
	        return this;
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
                    view.graph().nodes.push(node);
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
                }
                break;
            case 'node':
                switch (type) {
                case 'mousedown':
                    d_source = d;
                    state = states.select_or_drag;
                    break;
                }
                break;
            }
        },
        select_or_drag : function () {
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
                    view.drag_edge().show(d_source);
                    state = states.drag_link;
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
        drag_link : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                    case 'mousemove':
                        view.drag_edge().to_point(view.pan.mouse());
                        break;
                    // Create new node and new edge to it
                    case 'mouseup':
                        view.drag_edge().hide();
                        // Create new node
                        mouse = view.pan.mouse();
                        var node = {x : mouse[0], y : mouse[1]};
                        view.graph().nodes.push(node);
                        // Create new edge
                        var edge = {source : d_source, target : node};
                        view.graph().edges.push(edge);
                        // Update view, select the node and edge
                        view.update();
                        if (!d3.event.ctrlKey) { view.select().nothing(); }
                        view.select().node(node);
                        view.select().link(edge);

                        state = states.init;
                        break;
                }
                break;
            case 'node':
                switch (type) {
                    // User have dragged the link to another node
                    case 'mouseover':
                        view.drag_edge().to_node(d);
                        state = states.drop_link_or_exit;
                        break;
                }
                break;
            }
        },
        drop_link_or_exit : function (d) {
            switch (source) {
            case 'node':
                switch (type) {
                case 'mouseup':
                    view.drag_edge().hide();
                    // Get existing links between selected nodes
                    var exists = view.graph().edges.filter(function (v) {
                        return ((v.source === d_source) && (v.target === d));
                    });
                    var edge;
                    if (exists.length === 0) {
                        // Create new edge
                        edge = {source : d_source, target : d};
                        view.graph().edges.push(edge);
                        view.update();
                    } else {
                        // otherwise select already existing edge
                        edge = exists[0];
                    }
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().link(edge);
                    state = states.init;
                    break;
                case 'mouseout':
                    state = states.drag_link;
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


    return {
        event : function () {
            if (!view) { return; }

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