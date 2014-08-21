// JSLint options:
/*jslint bitwise: true*/
/*global d3*/

//
// This module implements an user interface for interacting with 
// an automata graph.
// 


// The global variable (module) to access to the methods
this.jA = this.jA || {};
this.jA.ui = {};

(function (module) {

    "use strict";

    //
    // Configurations constants for d3.js force-directed algorithm
    // 
    // 
    var width = 600;
    var height = 500;
    var node_radius = 16;

    var link_distance = 100;
    var link_charge = link_distance * -300; // How strong the nodes push each other away
    var link_charge_distance = link_distance * 5; // Maximal distance where charge works
    var link_gravity = 0.5;
    var friction = 0.2; // [0..1] [high..low]

    var svg_container_id = 'svg_container';

    // Graph object to store data for d3.js SVG representation
    var graph = {
        'nodes' : [],
        'links' : []
    };


    graph.nodes.push({});
    graph.nodes.push({});
    graph.nodes.push({});

    graph.links.push({source : 0, target : 1});



    //=============================================================================
    //
    // Helper methods
    // 
    // 

    //
    // 2D Vector Methods
    //
    var vec = {

        length : function (v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); },

        normalize : function (v, out) {
            var len = vec.length(v);
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


    //
    // Methods to calculate loop, stright and curved lines for links
    // 

    var makeEdge = {
        v : [0, 0],
        r : node_radius,

        stright : function (v1, v2, norm) {
            vec.subtract(v2, v1, this.v);    // v = v2 - v1
            vec.normalize(this.v, norm);     // norm = normalized v
            vec.scale(norm, this.r, this.v); // v = norm * r
            vec.add(v1, this.v, v1);         // v1 = v1 + v
            vec.subtract(v2, this.v, v2); // if subtract # v2 = v2 - v
            // Middle of the vector
            // cv[0] = (v1[0] + v2[0])/2
            // cv[1] = (v1[1] + v2[1])/2
        }
    };



    // Create SVG element and make it the size of container
    var svg = d3.select('#' + svg_container_id)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');


    // Arrow marker
    svg.append("svg:defs").append("svg:marker")
            .attr('id', 'marker-arrow')
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('refX', 6)
            .attr('refY', 3)
        .append('svg:path')
            .attr('d', 'M0,0 L6,3 L0,6');


    var force = d3.layout.force()
        .charge(link_charge)
        .chargeDistance(link_charge_distance)
        .gravity(link_gravity)
        .friction(friction) // range [0,1], 1 is frictioneless
        // .linkDistance((d)-> if d.loop? then 0 else link_distance)
        // .linkStrength((d)-> if d.loop? then 0 else 1)
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.links);

    var node = svg.selectAll('g.state');
    var link = svg.selectAll('g.transition');

    var update;


    // Creates and returns an object wich implements a selection rectangle
    function selection_rectangle() {
        var x0, y0, x, y, w, h;
        var rc = {};
        var svg_rc; // Reference to a SVG rectangle

        // Returns coordinates [topleft, bottomright] of selection rectangle.
        // Methods of this function: show, update and hide the selection rectange.
        var fnc = function () {
            var ret = [x0, y0, x, y];
            if (x0 > x) { ret[0] = x; ret[2] = x0; }
            if (y0 > y) { ret[1] = y; ret[3] = y0; }
            return ret;
        };

        // Shows a selection rectange (use CSS ot tune its look)
        fnc.show = function (container, xy) {
            x0 = xy[0];
            y0 = xy[1];
            svg_rc = container.append('rect').attr({
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

        return fnc;
    }



    // Creates a container for the 'selection' graphical behaviour
    function Selection() {
        // Selected nodes and edges. Both are objects
        var selected = [];
        var self = this;

        this.rectangle = selection_rectangle();

        // Appends a selection circle to the given graph node
        this.select_node = function (node) {
            if (this && node) {
                selected.push(node);
                d3.select(this)
                    .append('circle')
                    .attr('r', node_radius * 1.2)
                    .attr('class', 'selection');
            }
        };


        this.unselect_node = function (index) {
            if (this && index >= 0) {
                selected.splice(index, 1);
                d3.select(this).select('circle.selection').remove();
            }
        };


        this.select_only_node = function (a_node) {
            var index;
            var that;
            node.each(function (d) {
                index = selected.indexOf(d);
                if (index >= 0) {
                    self.unselect_node.call(this, index);
                }
                if (d === a_node) { that = this; }
            });
            self.select_node.call(that, a_node);
        };


        // Updates graphical appearance of selected nodes
        this.update = function () {
            var r = self.rectangle();
            var index;
            node.each(function (d) {
                index = selected.indexOf(d);
                // Check if center of the node is in the selection rectange
                if (d.x > r[0] && d.x < r[2] && d.y > r[1] && d.y < r[3]) {
                    if (index < 0) {
                        self.select_node.call(this, d);
                    }
                } else {
                    if (index >= 0) {
                        self.unselect_node.call(this, index);
                    }
                }
            });
        };
    }

    var selection = new Selection();



    // 
    // 
    // The function which is called during animation of the graph
    // Is called on each tick during graph animation
    // 
    // 
    var tick = (function () {
        var v1 = [0, 0];
        var v2 = [0, 0];
        var norm = [0, 0];

        // Returns SVG string for a node
        var on_node_tick = function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        };

        // Returns SVG string for an edge
        var on_link_tick = function (d) {
            v1[0] = d.source.x;
            v1[1] = d.source.y;
            v2[0] = d.target.x;
            v2[1] = d.target.y;
            // d.cv = [0, 0] if not d.cv?
            makeEdge.stright(v1, v2, norm, d.cv);
            return 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1];
        };

        return function () {
            node.attr("transform", on_node_tick);
            link.select('path').attr('d', on_link_tick);
        };
    }());

    force.on('tick', tick);


    //=============================================================================
    //
    // State machine to process user input
    //
    //=============================================================================

    var process_event = (function () {
        var state; // Reference to a current state
        // var current_node; // Current node
        var xy_down; // mousedown position
        // States are represented as functions
        var states = {
            init : function (event, object) {
                switch (event) {
                case 'node.mousedown':
                    // current_node = object;
                    state = states.going_from_node;
                    break;
                case 'doc.mousedown':
                    xy_down = object;
                    state = states.create_new_node;
                    break;
                }
            },
            going_from_node : function (event) {
                switch (event) {
                case 'node.mouseout':
                    state = states.init;
                    break;
                case 'node.mouseup':
                    // var ix = selected.indexOf(object);
                    // if (ix < 0) {
                    //     selected.push(object);
                    // } else {
                    //     selected.splice(ix, 1);
                    // }
                    // update();
                    state = states.init;
                    break;
                }
            },
            create_new_node : function (event, object) {
                switch (event) {
                case 'doc.mousemove':
                    // object contains coordinates [x, y]
                    var len = vec.length(vec.subtract(xy_down, object, [0, 0]));
                    if (len > node_radius >> 1) {
                        selection.rectangle.show(svg, xy_down);
                        state = states.selection;
                    }
                    break;
                case 'doc.mouseup':
                    var o = {x : object[0], y : object[1]};
                    graph.nodes.push(o);
                    update();
                    selection.select_only_node(o);
                    state = states.init;
                    break;
                default:
                    state = states.init;
                }
            },
            selection : function (event, object) {
                switch (event) {
                case 'doc.mousemove':
                    selection.rectangle.update(object);
                    selection.update();
                    break;
                case 'doc.mouseup':
                    selection.rectangle.hide();
                    state = states.init;
                    break;
                }
            }
        };


        // Add 'name' property to the state functions to trace transitions
        var key;
        for (key in states) {
            if (states.hasOwnProperty(key)) {
                states[key]._name = key;
            }
        }

        state = states.init;
        var old_state;

        return function () {
            if (typeof state === 'function') {
                old_state = state;
                var ret = state.apply(this, arguments);
                if (old_state !== state) {
                    // Trace the transition
                    console.log(old_state._name + ' -> ' + state._name);
                }
                return ret;
            }
        };
    }());



    // Call this function to update SVG representation of the graph object
    update = function () {
        // link = svg.selectAll('g.transition').data(graph.links);
        link = link.data(graph.links);
        link.exit().remove();
        link.enter().append('g')
            .attr('class', 'transition')
            .append('path')
            .attr('class', 'link') // CSS class style
            .attr("marker-end", "url(#marker-arrow)");


        // node = node.data(graph.nodes);
        node = svg.selectAll('g.state').data(graph.nodes);

        node.exit().remove();
        var g = node.enter()
            .append('g')
            .attr('class', 'state');


        g.append('circle')
            .attr('r', node_radius)
            .attr('class', 'node') // CSS class style
            .on('mousedown', function (d) { process_event.call(this, 'node.mousedown', d); })
            .on('mouseup', function (d) { process_event('node.mouseup', d); })
            .on('mouseover', function (d) { process_event('node.mouseover', d); })
            .on('mouseout', function (d) { process_event('node.mouseout', d); });


        force.start();
    };

    update();


    svg.on('mousedown', function () {
        // Left mouse button only
        if (d3.event.button === 0) {
            process_event('doc.mousedown', d3.mouse(this));
        }
    });

    svg.on('mouseup', function () {
        // Left mouse button only
        if (d3.event.button === 0) {
            process_event('doc.mouseup', d3.mouse(this));
        }
    });

    svg.on('mousemove', function () {
        process_event('doc.mousemove', d3.mouse(this));
    });

    // 
    // Public
    // 

    module.graph = graph;
    module.update = update;

}(this.jA.ui));


