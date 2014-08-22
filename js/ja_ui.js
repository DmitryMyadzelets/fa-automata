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

    var controller = {}; // Predefiniton of 'Controller' of MVC


    //=============================================================================
    // 'Model' part of MVC

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
    // Helper methods for View

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



    //=============================================================================
    // 'View' part of MVC

    var View = function () {

        // Configurations constants for d3.js force-directed algorithm

        var width = 600;
        var height = 500;
        var node_radius = 16;

        var link_distance = 100;
        var link_charge = link_distance * -300; // How strong the nodes push each other away
        var link_charge_distance = link_distance * 5; // Maximal distance where charge works
        var link_gravity = 0.5;
        var friction = 0.2; // [0..1] [high..low]

        var svg_container_id = 'svg_container';

        // ... end of config


        var self = this;

        var svg;    // Reference to SVG element
        var force;  // d3.js force object
        // this.node;   // Array of SVG nodes representing states
        // this.link;   // Array of SVG links representing edges


        var on_mousedown = function () {
            // Left mouse button only
            if (d3.event.button === 0) {
                controller.process_event('doc.mousedown', d3.mouse(this));
            }
        };


        var on_mouseup = function () {
            // Left mouse button only
            if (d3.event.button === 0) {
                controller.process_event('doc.mouseup', d3.mouse(this));
            }
        };


        var on_mousemove = function () {
            controller.process_event('doc.mousemove', d3.mouse(this));
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
                self.node.attr("transform", on_node_tick);
                self.link.select('path').attr('d', on_link_tick);
            };
        }());


        this.init = function () {
            // Create SVG element and make it the size of container
            svg = d3.select('#' + svg_container_id)
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

            force = d3.layout.force()
                .charge(link_charge)
                .chargeDistance(link_charge_distance)
                .gravity(link_gravity)
                .friction(friction) // range [0,1], 1 is frictioneless
                // .linkDistance((d)-> if d.loop? then 0 else link_distance)
                // .linkStrength((d)-> if d.loop? then 0 else 1)
                .size([width, height])
                .nodes(graph.nodes)
                .links(graph.links);

            self.node = svg.selectAll('g.state');
            self.link = svg.selectAll('g.transition');

            svg.on('mousedown', on_mousedown);
            svg.on('mouseup', on_mouseup);
            svg.on('mousemove', on_mousemove);

            // 
            // 
            // The function which is called during animation of the graph
            // Is called on each tick during graph animation
            // 
            // 

            force.on('tick', tick);
        };


        // Creates and returns an object wich implements a selection rectangle
        this.selection_rectangle = function () {
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

            return fnc;
        };


        this.select_node = function () {
            d3.select(this)
                .append('circle')
                .attr('r', node_radius * 1.2)
                .attr('class', 'selection');
        };


        this.unselect_node = function () {
            d3.select(this).select('circle.selection').remove();
        };



        // Call this function to update SVG representation of the graph object
        this.update = function () {
            // link = svg.selectAll('g.transition').data(graph.links);
            this.link = this.link.data(graph.links);
            this.link.exit().remove();
            this.link.enter().append('g')
                .attr('class', 'transition')
                .append('path')
                .attr('class', 'link') // CSS class style
                .attr("marker-end", "url(#marker-arrow)");


            // node = node.data(graph.nodes);
            this.node = svg.selectAll('g.state').data(graph.nodes);

            this.node.exit().remove();
            var g = this.node.enter()
                .append('g')
                .attr('class', 'state');


            g.append('circle')
                .attr('r', node_radius)
                .attr('class', 'node') // CSS class style
                .on('mousedown', function (d) { controller.process_event('node.mousedown', d); })
                .on('mouseup', function (d) { controller.process_event('node.mouseup', d); })
                .on('mouseover', function (d) { controller.process_event('node.mouseover', d); })
                .on('mouseout', function (d) { controller.process_event('node.mouseout', d); });


            force.start();
        };


        // Returns decision if selection should be started
        this.can_start_selection = function (length) {
            return length > node_radius >> 1;
        };


    }; // View

    var view = new View();
    view.init();
    view.update();



    // Creates a container for the 'selection' graphical behaviour
    function Selection() {
        // Selected nodes and edges. Both are objects
        var selected = [];
        var self = this;

        this.rectangle = view.selection_rectangle();

        // Appends a selection circle to the given graph node
        this.select_node = function (node) {
            if (this && node) {
                selected.push(node);
                view.select_node.call(this);
            }
        };


        this.unselect_node = function (index) {
            if (this && index >= 0) {
                selected.splice(index, 1);
                view.unselect_node.call(this);
            }
        };


        this.select_only_node = function (a_node) {
            var index;
            var that;
            view.node.each(function (d) { // TODO: view.node should be hidden in View
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
            view.node.each(function (d) { // TODO: view.node should be hidden in View
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



    //=============================================================================
    // 'Controller' part of MVC


    //=============================================================================
    //
    // State machine to process user input
    //
    //=============================================================================


    controller.process_event = (function () {
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
            going_from_node : function (event, object) {
                switch (event) {
                case 'node.mouseout':
                    state = states.init;
                    break;
                case 'node.mouseup':
                    selection.select_only_node(object);
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
            create_new_node : function (event, xy) {
                switch (event) {
                case 'doc.mousemove':
                    // xy contains coordinates [x, y]
                    var len = vec.length(vec.subtract(xy_down, xy, [0, 0]));
                    if (view.can_start_selection(len)) {
                        selection.rectangle.show(xy_down);
                        state = states.selection;
                    }
                    break;
                case 'doc.mouseup':
                    var o = {x : xy[0], y : xy[1]};
                    graph.nodes.push(o);
                    view.update();
                    selection.select_only_node(o);
                    state = states.init;
                    break;
                default:
                    state = states.init;
                }
            },
            selection : function (event, xy) {
                switch (event) {
                case 'doc.mousemove':
                    selection.rectangle.update(xy);
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



    // 
    // Public
    // 

    module.graph = graph;

}(this.jA.ui));


