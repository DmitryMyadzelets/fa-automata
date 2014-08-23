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

    // Controller events for invokation by View

    controller.on_node_mousedown = function () {
        if (d3.event.button === 0) {
            controller.event = 'node.mousedown';
            controller.process_event.apply(this, arguments);
        }
    };

    controller.on_node_mouseup = function () {
        if (d3.event.button === 0) {
            controller.event = 'node.mouseup';
            controller.process_event.apply(this, arguments);
        }
    };

    controller.on_node_mouseover = function () {
        controller.event = 'node.mouseover';
        controller.process_event.apply(this, arguments);
    };

    controller.on_node_mouseout = function () {
        controller.event = 'node.mouseout';
        controller.process_event.apply(this, arguments);
    };

    controller.on_doc_mousedown = function () {
        if (d3.event.button === 0) {
            controller.event = 'doc.mousedown';
            controller.process_event.apply(this, arguments);
        }
    };

    controller.on_doc_mouseup = function () {
        controller.event = 'doc.mouseup';
        controller.process_event.apply(this, arguments);
    };

    controller.on_doc_mousemove = function () {
        controller.event = 'doc.mousemove';
        controller.process_event.apply(this, arguments);
    };

    controller.on_doc_dblclick = function () {
        controller.event = 'doc.dblclick';
        controller.process_event.apply(this, arguments);
    };

    // controller.on_link_mouseover = function () {
    //     controller.event = 'link.mouseover';
    //     controller.process_event.apply(this, arguments);
    // };

    // controller.on_link_mousemove = function () {
    //     controller.event = 'link.mousemove';
    //     controller.process_event.apply(this, arguments);
    // };

    controller.on_link_mousedown = function () {
        controller.event = 'link.mousedown';
        controller.process_event.apply(this, arguments);
    };


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
                self.link.selectAll('path').attr('d', on_link_tick);
            };
        }());



        this.init = function () {
            // Create SVG element and make it the size of container
            svg = d3.select('#' + svg_container_id)
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%');

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

            svg.on('mousedown', controller.on_doc_mousedown);
            svg.on('mouseup', controller.on_doc_mouseup);
            svg.on('mousemove', controller.on_doc_mousemove);
            svg.on('dblclick', controller.on_doc_dblclick);

            // The function which is called during animation of the graph
            // Is called on each tick during graph animation
            force.on('tick', tick);
        };



        // Call this function to update SVG representation of the graph object
        this.update = function () {
            var g;
            // link = svg.selectAll('g.transition').data(graph.links);
            self.link = self.link.data(graph.links);
            self.link.exit().remove();
            g = self.link.enter().append('g')
                .attr('class', 'transition');

            g.append('path')
                .attr('class', 'link') // CSS class style
                .attr('marker-end', 'url(#marker-arrow)');

            g.append('path')
                .attr('class', 'dummylink')
                // .on('mouseover', controller.on_link_mouseover)
                // .on('mousemove', controller.on_link_mousemove);
                .on('mousedown', controller.on_link_mousedown);


            // node = node.data(graph.nodes);
            self.node = svg.selectAll('g.state').data(graph.nodes);

            self.node.exit().remove();
            g = self.node.enter()
                .append('g')
                .attr('class', 'state');


            g.append('circle')
                .attr('r', node_radius)
                .attr('class', 'node') // CSS class style
                .on('mousedown', controller.on_node_mousedown)
                .on('mouseup', controller.on_node_mouseup)
                .on('mouseover', controller.on_node_mouseover)
                .on('mouseout', controller.on_node_mouseout);


            force.start();
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

        this.select_link = function (link) {
            d3.select(link).classed('selection', true);
        };

        this.unselect_link = function (link) {
            d3.select(link).classed('selection', false);
        };


        this.unselect_all = function () {
            self.node.each(function () {
                self.unselect_node.call(this);
            });
            self.link.selectAll('.selection').classed('selection', false);
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
        var selected_nodes = [];
        var selected_links = [];
        var self = this;

        this.rectangle = view.selection_rectangle();

        function node_by_data(data) {
            var o = null;
            view.node.each(function (d) {
                if (d === data) { o = this; }
            });
            return o;
        }


        this.not_selected_node = function (d) {
            return selected_nodes.indexOf(d) < 0;
        };


        // Appends a selection circle to the given graph node
        this.select_node = function (d) {
            var o = node_by_data(d);
            if (o && self.not_selected_node(d)) {
                selected_nodes.push(d);
                view.select_node.call(o);
            }
        };


        this.unselect_node = function (d) {
            selected_nodes.splice(selected_nodes.indexOf(d), 1);
            view.unselect_node.call(node_by_data(d));
        };


        this.select_only_node = function (d) {
            selected_nodes.length = 0;
            selected_links.length = 0;
            view.unselect_all.call(this);
            self.select_node(d);
        };


        // Updates graphical appearance of selected_nodes nodes
        this.update = function () {
            var r = self.rectangle();
            var not_selected;
            view.node.each(function (d) { // TODO: view.node should be hidden in View
                not_selected = self.not_selected_node(d);
                // Check if center of the node is in the selection rectange
                if (d.x > r[0] && d.x < r[2] && d.y > r[1] && d.y < r[3]) {
                    if (not_selected) {
                        self.select_node(d);
                    }
                } else {
                    if (!d3.event.ctrlKey && !not_selected) {
                        self.unselect_node(d);
                    }
                }
            });
        };

        this.select_link = function (svg_element) {
            // 'svg_element' is a <path.dummilink>
            // Get <path.link> object and check its data
            d3.select(svg_element.parentNode).selectAll('.link')
                .each(function (d) {
                    if (selected_links.indexOf(d) < 0) {
                        selected_links.push(d);
                        view.select_link(this);
                    } else {
                        selected_links.splice(selected_links.indexOf(d), 1);
                        view.unselect_link(this);
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
        var xy; // mousedown position
        // States are represented as functions
        var mouse;
        var states = {
            init : function () {
                switch (controller.event) {
                case 'node.mousedown':
                    state = states.select_or_exit;
                    break;
                case 'doc.mousedown':
                    xy = d3.mouse(this);
                    state = states.wait_for_selection;
                    break;
                case 'link.mousedown':
                    xy = d3.mouse(this);
                    if (!d3.event.ctrlKey) {
                        selection.select_only_node(null);
                    }
                    selection.select_link(this);
                    d3.event.stopPropagation();
                    break;
                case 'doc.dblclick':
                    mouse = d3.mouse(this);
                    var o = {x : mouse[0], y : mouse[1]};
                    graph.nodes.push(o);
                    view.update();
                    if (d3.event.ctrlKey) {
                        selection.select_node(o);
                    } else {
                        selection.select_only_node(o);
                    }
                    break;
                }
            },
            select_or_exit : function (d) {
                switch (controller.event) {
                case 'node.mouseout':
                    state = states.init;
                    break;
                case 'node.mouseup':
                    if (d3.event.ctrlKey) {
                        if (selection.not_selected_node(d)) {
                            selection.select_node(d);
                        } else {
                            selection.unselect_node(d);
                        }
                    } else {
                        selection.select_only_node(d);
                    }
                    state = states.init;
                    break;
                }
            },
            wait_for_selection : function () {
                switch (controller.event) {
                case 'doc.mousemove':
                    mouse = d3.mouse(this);
                    var len = vec.length(vec.subtract(xy, mouse, [0, 0]));
                    if (view.can_start_selection(len)) {
                        selection.rectangle.show(xy);
                        state = states.selection;
                    }
                    break;
                case 'doc.mouseup':
                    selection.select_only_node(null);
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



    // 
    // Public
    // 

    module.graph = graph;

}(this.jA.ui));


