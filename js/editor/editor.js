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



// Returns SVG string for a graph edge
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
    if (d && d.r) {
        return d.r;
    }
    return 16;
}


// Adds SVG elements representing graph nodes
elements.add_node = function (selection, handler) {
    var g = selection.append('g')
        .attr('transform', elements.get_node_transformation)
        .on('mousedown', handler)
        .on('mouseup', handler)
        .on('mouseover', handler)
        .on('mouseout', handler)
        .on('dblclick', handler);

    g.append('circle')
        .attr('r', node_radius);

    g.append('text')
        // .style('text-anchor', 'middle')
        .attr('alignment-baseline', 'center')
        .text(function (d) { return d.text || ''; });
};



// Adds SVG elements representing graph links/edges
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




/**
 * Textarea control element with auto-resize.
 * Inspired from:
 * http://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
 * http://jsfiddle.net/CbqFv/
*/


var textarea = function() {
    var delayedResize, hook, keydown, offocus, resize, shown, _onCancel, _onEnter, _text;

    _text = null;
    _onEnter = null;
    _onCancel = null;
    shown = false;

    if (window.attachEvent) {
        hook = function(element, event, handler) {
            element.attachEvent('on' + event, handler);
            return null;
        };
    } else {
        hook = function(element, event, handler) {
            element.addEventListener(event, handler, false);
            return null;
        };
    }

    resize = function() {
        _text.style.height = 'auto';
        _text.style.height = _text.scrollHeight + 'px';
        return null;
    };

    delayedResize = function(ev) {
        window.setTimeout(resize, 0);
        return null;
    };

    keydown = function(ev) {
        switch (ev.keyCode) {
            case 13: // Enter
                _text.style.display = "none";
                shown = false;
                if (typeof _onEnter === "function") {
                    _onEnter(ev);
                }
                break;
            case 27: // Escape
                _text.style.display = "none";
                shown = false;
                if (typeof _onCancel === "function") {
                    _onCancel(ev);
                }
                break;
            default:
                delayedResize();
        }
        return null;
    };

    offocus = function() {
        _text.style.display = "none";
        if (shown) {
            shown = false;
            if (typeof _onCancel === "function") {
                _onCancel();
            }
        }
        return null;
    };

    return {
        attach: function(id, onEnter, onCancel) {
            _text = document.getElementById(id);
            hook(_text, 'keydown', keydown);
            hook(_text, 'blur', offocus);
            hook(_text, 'input', delayedResize);
            _onEnter = onEnter;
            _onCancel = onCancel;
            _text.style.font = "0.8em Verdana 'Courier New'";
            return null;
        },
        show: function(text, x, y) {
            // _text.value = text;
            // _text.style.width = "4em";
            // _text.style.left = x + "px";
            // _text.style.top = y + "px";
            // _text.style.display = null;
            _text.focus();
            resize();
            shown = true;
            return null;
        },
        text: function() {
            return _text.value;
        }
    };
};


// Creates <input> HTML object with unique ID and attach it to the textarea object
var textarea = (function () {
    var UID = 'c88d9c30-5871-11e4-8ed6-0800200c9a66';
    var editor = null;
    var parent = null;
    _enter = null;
    _cancel = null;



    function cancel() {
        if (typeof _cancel === 'function') { _cancel.apply(this, arguments); }
        editor.remove();
    }


    function enter() {
        if (typeof _enter === 'function') { _enter.apply(this, arguments); }
        editor.remove();
    }


    function keydown() {
        switch (d3.event.keyCode) {
        case 13: // Enter
            enter.apply(this, arguments);
            break;
        case 27: // Escape
            cancel.apply(this, arguments);
            break;
        default:
            d3.event.stopPropagation();
            delayedResize();
        }
        return null;
    };

    function resize() {
        editor.each(function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    };

    function delayedResize(ev) {
        window.setTimeout(resize, 0);
    }

    return function (d3selection, text, x, y, onEnter, onCancel) {
        if (editor) {
            editor.remove();
        }
        parent = d3selection;
        x = x || 0;
        y = y || 0;
        _enter = onEnter;
        _cancel = onCancel;

        // Get height of 1em symbol 
        // Taken from [http://stackoverflow.com/questions/10463518/converting-em-to-px-in-javascript-and-getting-default-font-size]
        var h = Number(getComputedStyle(document.body, null).fontSize.match(/(\d*(\.\d*)?)px/)[1]);
        // Adjust textarea vertically
        if (!isNaN(h)) {
            h /= 2;
            y -= h;
        }

        editor = parent.append('textarea')
            .attr('id', UID)
            .attr('rows', 1)
            .style('position', 'absolute')
            // .style('width', '4em')
            .style('height', '1em')
            .style('left', x + 'px')
            .style('top', y + 'px')
            .attr('placeholder', 'Type here...');

        editor
            .on('blur', cancel)
            .on('change', resize)
            .on('keydown', keydown)
            .on('cut', delayedResize)
            .on('drop', delayedResize)
            .on('paste', delayedResize);

        editor.each(function() {
            this.value = text;
            this.focus();
            this.select();
        });

        resize();
    };
}());


window.textarea = textarea;
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

// Structure of SVG tree:
// <svg>
//   <g>
//     <g .nodes>
//       <g>
//         <circle>
//         <text>
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
        .classed('unselectable', true)
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
    this.node_handler;

    // Handles edge events
    this.edge_handler;

    // Handles plane (out of other elements) events
    function plane_handler () {
        if (typeof self.plane_handler === 'function') {
            self.plane_handler.apply(this, arguments);
        }
    };

    // Makes current view focused and requests routing of window events (keys) to it
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
    this.container = container;

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



// JSLint options:
/*global View*/
"use strict";

View.prototype.nodes = (function () {
    var view;
    var methods = {};
    var last = [];
    var data;

    function cache (d) {
    	if (d instanceof Array) {
    		last = d.slice(0);
    	} else {
    		last.lenth = 0;
    		last.push(d);
    	}
    }

    function add(d) {
        data.push(d);
    }

    methods.add = function (d) {
        last.length = 0;
        cache(d);
        if (d instanceof Array) {
            d.forEach(function (d) { add(d); } );
        } else {
            add(d);
        }
        view.update();
        return methods;
    };

    function remove(d) {
        var i = data.indexOf(d);
        if (i >= 0) {
            data.splice(i, 1);
        }
    }

    methods.remove = function (d) {
    	cache(d);
        if (d instanceof Array) {
            d.forEach(function (d) { remove(d); });
        } else {
            remove(d);
        }
        view.update();
        return methods;
    };

    methods.select = function (d) {
        if (!arguments.length) {
            if (last.length) {
                view.select().node(last[0]);
            }
        } else if (!d) {
            view.select().nothing();
        } else {
            view.select().node(d);
        }
        return methods;
    };

    methods.text = function (d, text) {
        d.text = text;
        // view.update();
        view.node.each(function(_d) {
            if (_d === d) {
                d3.select(this).select('text').text(text);
            }
        });
    };

    // Returns incominng and outgoing edges of last nodes
    methods.edges = function () {
    	var ret = [];
    	view.graph().edges.forEach(function (d) {
    		if (last.indexOf(d.source) >= 0 || last.indexOf(d.target) >= 0) {
    			if (ret.indexOf(d) < 0) {
    				ret.push(d);
    			}
    		}
    	});
    	return ret;
    }

    return function (d) {
        view = this;
        data = view.graph().nodes;
        if (arguments.length) {
        	cache(d);
        }
        return methods;
    }
}());



View.prototype.edges = (function () {
    var view;
    var methods = {};
    var last = [];
    var data;

    function cache (d) {
        if (d instanceof Array) {
            last = d.slice(0);
        } else {
            last.lenth = 0;
            last.push(d);
        }
    }

    function add(d) {
        data.push(d);
    }

    methods.add = function (d) {
        last.length = 0;
        cache(d);
        if (d instanceof Array) {
            d.forEach(function (d) { add(d); } );
        } else {
            add(d);
        }
        view.update();
        return methods;
    };

    function remove(d) {
        var i = data.indexOf(d);
        if (i >= 0) {
            data.splice(i, 1);
        }
    }

    methods.remove = function (d) {
        cache(d);
        if (d instanceof Array) {
            d.forEach(function (d) { remove(d); });
        } else {
            remove(d);
        }
        view.update();
        return methods;
    };

    methods.select = function (d) {
        if (!arguments.length) {
            if (last.length) {
                view.select().edge(last[0]);
            }
        } else if (!d) {
            view.select().nothing();
        } else {
            view.select().edge(d);
        }
        return methods;
    };

    return function (d) {
        view = this;
        data = view.graph().edges;
        if (arguments.length) {
        	cache(d);
        }
        return methods;
    }
}());



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
            node.select('circle').classed('selected', d.selected);
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
/*global */
"use strict";


// 'Command' class
// 
var Command = function (redo, undo) {
    if (redo) { this.redo = redo; }
    if (undo) { this.undo = undo; }
};

Command.prototype.redo = function () {};
Command.prototype.undo = function () {};



// 'Commands' class
// 
var Commands = function () {
    this.stack = [];
    this.macro = [];
    this.index = 0;
    // Index is equal to a number of commands which user can undo;
    // If index is not equal to the length of stack, it implies
    // that user did "undo". Then new command cancels all the
    // values in stack above the index.
};



// Starts new macro recording
Commands.prototype.start = function () {
    if (this.index < this.stack.length) { this.stack.length = this.index; }
    this.macro = [];
    this.stack.push(this.macro);
    this.index = this.stack.length;
    return this;
};



Commands.prototype.undo = function () {
    if (this.index > 0) {
        var macro = this.stack[--this.index];
        var i = macro.length;
        while (i-- > 0) {
            macro[i].undo();
        }
    }
};



Commands.prototype.redo = function () {
    if (this.index < this.stack.length) {
        var macro = this.stack[this.index++];
        var i, n = macro.length;
        for (i = 0; i < n; i++) {
            macro[i].redo();
        }
    }
};


// Creates new command-function as the key of a 'Commands' instance, i.e. it will be
// var command = new Commands();
// ...
// command
Commands.prototype.new = function (name, fun) {
    if (this[name] && console ) {
        console.error('Command', name, 'already exists' );
        return;
    }
    var self = this;
    if (name && typeof fun === 'function') {
        this[name] = function () {
            var command = new Command();
            fun.apply(command, arguments);
            self.macro.push(command);
            command.redo();
            return self;
        }
    }
};



var commands = new Commands();


commands.new('add_node', function (view, d) {
    this.redo = function () { view.nodes().add(d); };
    this.undo = function () { view.nodes().remove(d); };
});


commands.new('del_node', function (view, d) {
    this.redo = function () { view.nodes().remove(d); };
    this.undo = function () { view.nodes().add(d); };
});


commands.new('add_edge', function (view, d) {
    this.redo = function () { view.edges().add(d); };
    this.undo = function () { view.edges().remove(d); };
});


commands.new('del_edge', function (view, d) {
    this.redo = function () { view.edges().remove(d); };
    this.undo = function () { view.edges().add(d); };
});


commands.new('text', function (view, d, text) {
    var old_text = d.text;
    this.redo = function () { view.nodes().text(d, text); };
    this.undo = function () { view.nodes().text(d, old_text); };
});


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

    var node_text;      // reference to the SVG text element of a node

    var states = {
        init : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    break;
                case 'dblclick':
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    mouse = view.pan.mouse();
                    // Create new node
                    var node = { x : mouse[0], y : mouse[1] };
                    commands.start().add_node(view, node);
                    view.nodes(node).select();
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
                        var nodes = view.select().nodes();
                        // Get incoming and outgoing edges of deleted nodes, joined with selected edges 
                        var edges = view.nodes(nodes).edges();
                        edges = edges.concat(view.select().edges().filter(
                            function (d) { return edges.indexOf(d) < 0; }
                            ));
                        // Delete nodes edges
                        commands.start()
                            .del_node(view, nodes.splice(0))
                            .del_edge(view, edges);
                        state = states.wait_for_keyup;
                        break;
                    case 89: // Y
                        if (d3.event.ctrlKey) {
                            commands.redo();
                        }
                        state = states.wait_for_keyup;
                        break;
                    case 90: // Z
                        if (d3.event.ctrlKey) {
                            commands.undo();
                        }
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
                case 'dblclick':
                    d3.event.stopPropagation();
                    node_d = d;
                    node_text = d3.select(this).select('text');
                    // Remove text temporally, since it is viewed in text editor now
                    node_text.text('');
                    // Callback function which is called by textarea object when 
                    // user enters the text or cancels it.
                    // This function invokes this automaton iteself
                    var callback = (function () {
                        var self = view;
                        return function () {
                            self.controller().context('text').event.apply(this, arguments);
                        };
                    }());
                    var text = d.text || '';
                    var pan = view.pan();
                    textarea(view.container, text, d.x + pan[0], d.y + pan[1], callback, callback);
                    view.force.stop();
                    state = states.edit_node_text;
                    break;
                }
                break;
            case 'edge':
                switch (type) {
                case 'mousedown':
                    // What to drag: head or tail of the edge? What is closer to the mouse pointer.
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
                            if (!d3.event.ctrlKey) { view.select().nothing(); }
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
                    commands.start().add_edge(view, edge_d);
                    drag_target = true;
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
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
                    edge_d = { source : d.source, target : d.target }
                    if (drag_target) {
                        edge_d.target = node_d;
                    } else {
                        edge_d.source = node_d;
                    }
                    commands.start()
                        .del_edge(view, d)
                        .add_edge(view, edge_d);
                    // Then attach edge to this new node
                    view.force.stop();
                    // Save values for next state
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
                delete node_d.r; // in order to use default radius
                commands.add_node(view, node_d);
                if (!d3.event.ctrlKey) { view.select().nothing(); }
                view.select().node(node_d);
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
                        commands.del_edge(view, edge_d);
                    }
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    if (exists.length <= 1) {
                        view.select().edge(edge_d);
                    }
                    view.update();
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
        },
        edit_node_text : function () {
            if (source === 'text') {
                // Set original text back
                node_text.text(function(d) { return d.text; });
                // Change text if user hit Enter
                switch (type) {
                case 'keydown':
                    if (d3.event.keyCode === 13) {
                        commands.start().text(view, node_d, this.value); // FIX: should be a ref to SVG text here
                        
                    } else {
                    }
                    break;
                }
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


    var methods = {
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

            // d3.event.stopPropagation();

            // If there wes a transition from state to state
            if (old_state !== state) {
                // Trace current transition
                console.log('transition:', old_state._name + ' -> ' + state._name);
            }
        },

        // Sets context in which an event occurs
        // Returns controller object for subsequent invocation
        context : function (a_element) {
            source = a_element;
            return this;
        },
        control : function () {
            var self = view;
            // Handles nodes events
            view.node_handler = function () {
                self.controller().context('node').event.apply(this, arguments);
            };

            // Handles edge events
            view.edge_handler = function () {
                self.controller().context('edge').event.apply(this, arguments);
            };

            // Handles plane (out of other elements) events
            view.plane_handler = function () {
                self.controller().context('plane').event.apply(this, arguments);
            }

            return methods;
        }
    };

    return function () {
        view = this;
        if (!old_view) { old_view = view; }
        return methods;
    };

}());



ed.view = function (container, graph) {
    return new View(container, graph);
};



this.jA = this.jA || {};
this.jA.editor = ed;

}(window);