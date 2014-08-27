// JSLint options:
/*jslint bitwise: true*/
/*global d3*/

//
// This module implements an user interface for interacting with 
// an automata graph.
// 

// Look at some examples:
// http://bl.ocks.org/MoritzStefaner/1377729
// http://bl.ocks.org/rkirsling/5001347
// http://bl.ocks.org/benzguo/4370043

// The global variable (module) to access to the methods
this.jA = this.jA || {};
this.jA.ui = {};

(function (module) {

    "use strict";

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
    graph.links.push({source : 2, target : 1});



    //=============================================================================
    // 'Controller' part of MVC, used by a 'View'

    var controller = {};



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


        //
        // Methods to calculate loop, stright and curved lines for links
        // 

        var make_edge = {
            v : [0, 0],
            r : node_radius,

            // Calculates vectors of edge from given vectors 'v1' to 'v2'
            // Substracts radius of nodes 'r' from both vectors
            stright : function (v1, v2, norm) {
                vec.subtract(v2, v1, this.v);    // v = v2 - v1
                vec.normalize(this.v, norm);     // norm = normalized v
                vec.scale(norm, this.r, this.v); // v = norm * r
                vec.add(v1, this.v, v1);         // v1 = v1 + v
                vec.subtract(v2, this.v, v2); // if subtract # v2 = v2 - v
                // Middle of the vector
                // cv[0] = (v1[0] + v2[0])/2
                // cv[1] = (v1[1] + v2[1])/2
            },
            // Calculates vectors of a dragged edge
            // Substracts radius of nodes 'r' from the first vector
            // Substracts radius of nodes 'r' from the last vector if to_node is true
            drag : function (v1, v2, to_node) {
                vec.subtract(v2, v1, this.v);    // v = v2 - v1
                vec.normalize(this.v, this.v);   // v = normalized v
                vec.scale(this.v, this.r, this.v); // v = v * r
                vec.add(v1, this.v, v1);         // v1 = v1 + v
                if (to_node) {
                    vec.subtract(v2, this.v, v2); // if subtract # v2 = v2 - v
                }
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
                make_edge.stright(v1, v2, norm);
                return 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1];
            };

            return function () {
                self.node.attr("transform", on_node_tick);
                self.link.selectAll('path').attr('d', on_link_tick);
                self.drag_link.update();
            };
        }());



        // Node's user input


        function on_node_mousedown() {
            // Prevent the event passing to parent elements
            d3.event.stopPropagation();
            // Process left button only
            if (d3.event.button !== 0) { return; }
            controller.set_event('node.mousedown').apply(this, arguments);
        }


        function on_node_mouseup() {
            // Process left button only
            if (d3.event.button !== 0) { return; }
            controller.set_event('node.mouseup').apply(this, arguments);
        }


        function on_node_mouseover() {
            controller.set_event('node.mouseover').apply(this, arguments);
        }


        function on_node_mouseout() {
            controller.set_event('node.mouseout').apply(this, arguments);
        }

        function on_node_dblclick() { d3.event.stopPropagation(); }



        // Link's user input


        function on_link_dblclick() { d3.event.stopPropagation(); }


        function on_link_mousedown() {
            // Prevent the event passing to parent elements
            d3.event.stopPropagation();
            controller.set_event('link.mousedown').apply(this, arguments);
        }



        // Document's user input


        function on_doc_mousedown() {
            // Process left button only
            if (d3.event.button !== 0) { return; }
            controller.set_event('doc.mousedown').apply(this, arguments);
        }

        function on_doc_mouseup() {
            controller.set_event('doc.mouseup').apply(this, arguments);
        }

        function on_doc_mousemove() {
            controller.set_event('doc.mousemove').apply(this, arguments);
        }

        function on_doc_dblclick() {
            controller.set_event('doc.dblclick').apply(this, arguments);
        }




        this.init = function () {
            // Create SVG element and make it the size of container
            svg = d3.select('#' + svg_container_id)
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                // Disable browser popup menu
                .on('contextmenu', function () { d3.event.preventDefault(); });

            self.svg = svg;

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

            svg.on('mousedown', on_doc_mousedown);
            svg.on('mouseup', on_doc_mouseup);
            svg.on('mousemove', on_doc_mousemove);
            svg.on('dblclick', on_doc_dblclick);
            svg.on('dragstart', function () { d3.event.preventDefault(); });

            // The function which is called during animation of the graph
            // Is called on each tick during graph animation
            force.on('tick', tick);
        };



        // Adds SVG elements representing a graph link/edge
        // Returns root of the added elements
        function add_link(selection) {
            var g = selection.append('g')
                .attr('class', 'transition')
                .on('dblclick', on_link_dblclick);

            g.append('path')
                .attr('class', 'link') // CSS class style
                .attr('marker-end', 'url(#marker-arrow)');

            g.append('path')
                .attr('class', 'catchlink')
                // .on('mouseover', controller.on_link_mouseover)
                // .on('mousemove', controller.on_link_mousemove);
                .on('mousedown', on_link_mousedown);

            return g;
        }



        // Call this function to update SVG representation of the graph object
        this.update = function () {
            var g;
            // link = svg.selectAll('g.transition').data(graph.links);
            self.link = self.link.data(graph.links);
            self.link.enter().call(add_link);
            self.link.exit().remove();


            // node = node.data(graph.nodes);
            self.node = svg.selectAll('g.state').data(graph.nodes);

            self.node.exit().remove();
            g = self.node.enter()
                .append('g')
                .attr('class', 'state')
                .on('mousedown', on_node_mousedown)
                .on('mouseup', on_node_mouseup)
                .on('mouseover', on_node_mouseover)
                .on('mouseout', on_node_mouseout)
                .on('dblclick', on_node_dblclick);


            g.append('circle')
                .attr('r', node_radius)
                .attr('class', 'node'); // CSS class style


            force.start();
        };



        // Creates and returns an object which implements a selection rectangle
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


        // Shows the node as selected
        this.select_node = function () {
            this.classed('selection', true);
        };


        // Shows the node as not selected
        this.unselect_node = function () {
            this.classed('selection', false);
        };

        // Shows a link as selected
        this.select_link = function () {
            this.classed('selection', true);
        };

        this.unselect_link = function () {
            this.classed('selection', false);
        };


        this.unselect_all = function () {
            d3.selectAll('.selection').classed('selection', false);
        };


        // Returns decision if selection should be started
        this.can_start_selection = function (length) {
            return length > node_radius >> 1;
        };


        // This object implements a drag link when user creates new graph edge
        this.drag_link = (function () {
            var v1 = [0, 0];
            var v2 = [0, 0];
            var from_d, to_d; // References to node data objects
            var ref_link; // Reference to a link svg element
            var shown = false;
            var to_node = false;
            return {
                show : function (d) {
                    from_d = d;
                    ref_link = add_link(svg).select('path.link');
                    shown = true;
                },
                to_point : function (xy) {
                    vec.copy(xy, v2);
                    to_node = false;
                    this.update();
                },
                to_node : function (d) {
                    to_d = d;
                    to_node = true;
                    this.update();
                },
                update : function () {
                    if (!shown) { return; }
                    v1[0] = from_d.x;
                    v1[1] = from_d.y;
                    if (to_node) {
                        v2[0] = to_d.x;
                        v2[1] = to_d.y;
                        make_edge.drag(v1, v2, true);
                    } else {
                        make_edge.drag(v1, v2);
                    }
                    ref_link.attr('d', 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1]);
                },
                hide : function () {
                    ref_link.remove();
                    shown = false;
                }
            };

        }());



    }; // View

    var view = new View();
    view.init();
    view.update();



    // Creates a container for the 'selection' graphical behaviour
    function Selection() {
        // Selected nodes and edges. Both are objects
        var selected_nodes = [];
        var selected_links = [];
        var self = this;

        this.rectangle = view.selection_rectangle();


        // Appends a selection circle to the given graph node
        this.select_node = function (d) {
            var node = view.node.filter(function (_d) { return _d === d; });
            var index = selected_nodes.indexOf(d);
            if (index < 0) {
                selected_nodes.push(d);
                node.call(view.select_node);
            } else {
                selected_nodes.splice(index, 1);
                node.call(view.unselect_node);
            }
        };


        this.select_link = function (d) {
            var link = view.link.filter(function (_d) { return _d === d; });
            var index = selected_links.indexOf(d);
            if (index < 0) {
                selected_links.push(d);
                link.call(view.select_link);
            } else {
                selected_links.splice(index, 1);
                link.call(view.unselect_link);
            }
        };


        this.unselect_all = function () {
            selected_nodes.length = 0;
            selected_links.length = 0;
            view.unselect_all();
        };


        // Updates graphical appearance of selected_nodes nodes
        this.update = function () {
            var r = self.rectangle();
            view.node.each(function (d) {
                // Check if center of the node is in the selection rectange
                if (d.x > r[0] && d.x < r[2] && d.y > r[1] && d.y < r[3]) {
                    self.select_node(d);
                }
            });
            // var not_selected;
            // view.node.each(function (d) { // TODO: view.node should be hidden in View
            //     not_selected = self.not_selected_node(d);
            //     // Check if center of the node is in the selection rectange
            //     if (d.x > r[0] && d.x < r[2] && d.y > r[1] && d.y < r[3]) {
            //         if (not_selected) {
            //             self.select_node(d);
            //         }
            //     } else {
            //         if (!d3.event.ctrlKey && !not_selected) {
            //             self.unselect_node(d);
            //         }
            //     }
            // });
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
        var xy; // mousedown position
        var d_source;
        // States are represented as functions
        var mouse;
        var states = {
            init : function (d) {
                switch (controller.event) {
                case 'node.mousedown':
                    d_source = d;
                    state = states.select_or_drag;
                    break;
                case 'doc.mousedown':
                    xy = d3.mouse(this);
                    state = states.wait_for_selection;
                    break;
                case 'link.mousedown':
                    xy = d3.mouse(this);
                    if (!d3.event.ctrlKey) { selection.unselect_all(); }
                    selection.select_link(d);
                    break;
                case 'doc.dblclick':
                    mouse = d3.mouse(this);
                    var o = {x : mouse[0], y : mouse[1]};
                    graph.nodes.push(o);
                    view.update();
                    if (!d3.event.ctrlKey) { selection.unselect_all(); }
                    selection.select_node(o);
                    break;
                }
            },
            select_or_drag : function (d) {
                switch (controller.event) {
                case 'node.mouseout':
                    view.drag_link.show(d_source);
                    state = states.drag_link;
                    break;
                case 'node.mouseup':
                    if (!d3.event.ctrlKey) { selection.unselect_all(); }
                    selection.select_node(d);
                    state = states.init;
                    break;
                }
            },
            drag_link : function (d) {
                switch (controller.event) {
                case 'doc.mousemove':
                    view.drag_link.to_point(d3.mouse(this));
                    break;
                case 'node.mouseover':
                    view.drag_link.to_node(d);
                    state = states.drop_link_or_exit;
                    break;
                case 'doc.mouseup':
                    view.drag_link.hide();
                    state = states.init;
                    break;
                }
            },
            drop_link_or_exit : function (d) {
                switch (controller.event) {
                case 'node.mouseup':
                    view.drag_link.hide();
                    var o = {source : d_source.index, target : d.index};
                    graph.links.push(o);
                    view.update();
                    if (!d3.event.ctrlKey) { selection.unselect_all(); }
                    selection.select_link(o);
                    state = states.init;
                    break;
                case 'node.mouseout':
                    state = states.drag_link;
                    break;
                }
            },
            wait_for_selection : function () {
                switch (controller.event) {
                case 'doc.mousemove':
                    mouse = d3.mouse(this);
                    var len = vec.length(vec.subtract(xy, mouse, [0, 0]));
                    if (view.can_start_selection(len)) {
                        if (!d3.event.ctrlKey) { selection.unselect_all(); }
                        selection.rectangle.show(xy);
                        state = states.selection;
                    }
                    break;
                case 'doc.mouseup':
                    if (!d3.event.ctrlKey) { selection.unselect_all(); }
                    state = states.init;
                    break;
                default:
                    state = states.init;
                }
            },
            selection : function () {
                mouse = d3.mouse(this);
                switch (controller.event) {
                case 'doc.mousemove':
                    selection.rectangle.update(mouse);
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


    // Sets 'event' value of the controller. Returns controller itself for chaining
    controller.set_event = function (event) {
        controller.event = event;
        return controller.process_event;
    };



    // 
    // Public
    // 

    module.graph = graph;

}(this.jA.ui));


