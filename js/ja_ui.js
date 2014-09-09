// JSLint options:
/*jslint bitwise: true*/
/*global d3*/

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



    //=============================================================================
    // 'View' part of MVC

    var View = function () {

        // Configurations constants for d3.js force-directed algorithm

        var width = 600;
        var height = 500;
        var node_radius = 16;

        var link_distance = 150;
        var link_charge = -800; // How strong the nodes push each other away
        var link_charge_distance = link_distance * 3; // Maximal distance where charge works
        // var link_gravity = 0.5;
        // var friction = 0.2; // [0..1] [high..low]

        var svg_container_id = 'svg_container';

        // ... end of config


        var self = this;

        var svg;    // Reference to SVG element
        var container;
        var force;  // d3.js force object
        // this.node;   // Array of SVG nodes representing states
        // this.link;   // Array of SVG links representing edges


        //
        // Methods to calculate loop, stright and curved lines for links
        // 

        var make_edge = (function () {
            var v = [0, 0]; // temporal vector
            var r = node_radius;
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



        // Returns SVG string for an edge
        var get_link_path = (function () {
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
                    make_edge.curve(v1, v2, cv);
                    break;
                case 2:
                    make_edge.loop(v1, v2, cv, cv2);
                    break;
                default:
                    make_edge.stright(v1, v2);
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

        function get_node_translate(d) {
            d.x = d.x || Math.floor(Math.random() * width);
            d.y = d.y || Math.floor(Math.random() * height);
            return "translate(" + d.x + "," + d.y + ")";
        }



        var tick = (function () {

            // Returns SVG string for a node

            return function () {
                self.node.attr("transform", get_node_translate);
                self.drag_link.update();
                self.link.selectAll('path').attr('d', get_link_path);
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
            svg.append('svg:defs').append('svg:marker')
                    .attr('id', 'marker-arrow')
                    .attr('orient', 'auto')
                    .attr('markerWidth', 6)
                    .attr('markerHeight', 6)
                    .attr('refX', 6)
                    .attr('refY', 3)
                .append('svg:path')
                    .attr('d', 'M0,0 L6,3 L0,6');

            svg.on('mousedown', on_doc_mousedown);
            svg.on('mouseup', on_doc_mouseup);
            svg.on('mousemove', on_doc_mousemove);
            svg.on('dblclick', on_doc_dblclick);
            svg.on('dragstart', function () { d3.event.preventDefault(); });

            // var rect = svg.append('rect')
            //     .style('pointer-events', 'all')
            //     .attr('width', 500)
            //     .attr('height', 500)
            //     .style('fill', 'lightgray');

            container = svg.append('g');
            self.node = container.selectAll('g.state');
            self.link = container.selectAll('g.transition');

            force = d3.layout.force()
                .charge(link_charge)
                .linkDistance(link_distance)
                .chargeDistance(link_charge_distance)
                // .gravity(link_gravity)
                // .friction(friction) // range [0,1], 1 is frictioneless
                // .linkDistance((d)-> if d.loop? then 0 else link_distance)
                // .linkStrength((d)-> if d.loop? then 0 else 1)
                .size([width, height])
                .nodes(graph.nodes)
                .links(graph.links);

            self.force = force;

            // The function which is called during animation of the graph
            // Is called on each tick during graph animation
            force.on('tick', tick);
        };



        // This object implements panoramic behaviour
        this.pan = (function () {
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
                return [d3.event.pageX - a_xy[0], d3.event.pageY - a_xy[1]];
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
        }());



        // Returns true if link 'a' is a counter link 'b'
        function is_counter_link(d) {
            return (this.target === d.source) && (this.source === d.target);
        }



        // Set type of the link (0-stright, 1-curved, 2-loop)
        function set_link_type(d) {
            if (d.source === d.target) {
                d.type = 2;
            } else if (graph.links.filter(is_counter_link, d).length > 0) {
                d.type = 1;
            } else {
                d.type = 0;
            }
        }



        // Adds SVG elements representing a graph link/edge
        // Returns root of the added elements
        function add_link(selection) {
            var g = selection.append('g')
                .attr('class', 'transition')
                .on('dblclick', on_link_dblclick)
                .on('mousedown', on_link_mousedown);
                // .on('mouseover', controller.on_link_mouseover)
                // .on('mousemove', controller.on_link_mousemove);

            g.append('path')
                .attr('class', 'link') // CSS class style
                .attr('marker-end', 'url(#marker-arrow)');

            g.append('path')
                .attr('class', 'catchlink');

            return g;
        }



        // Call this function to update SVG representation of the graph object
        this.update = function () {
            var g;
            // node = node.data(graph.nodes);
            self.node = self.node.data(graph.nodes);

            self.node.exit().remove();
            g = self.node.enter()
                .append('g')
                .attr('class', 'state')
                .on('mousedown', on_node_mousedown)
                .on('mouseup', on_node_mouseup)
                // .on('mousemove', on_node_mousemove)
                .on('mouseover', on_node_mouseover)
                .on('mouseout', on_node_mouseout)
                .on('dblclick', on_node_dblclick)
                .attr('transform', get_node_translate);

            g.append('circle')
                .attr('r', node_radius)
                .attr('class', 'node'); // CSS class style

            // link = svg.selectAll('g.transition').data(graph.links);
            self.link = self.link.data(graph.links);
            self.link.enter().call(add_link);
            self.link.exit().remove();

            // Identify type of edge {int} (0-straight, 1-curved, 2-loop)
            self.link.each(set_link_type);

            force.start();
        };



        // Creates and returns an object which implements a selection rectangle
        var selection_rectangle = function () {
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


        // This object contains methods to select nodes and links of the graph
        this.select = (function () {
            var nodes = [];
            var links = [];

            function point_in_rectangle(x, y, r) {
                return x > r[0] && x < r[2] && y > r[1] && y < r[3];
            }

            return {
                rectangle : selection_rectangle(),
                // Changes look of the graph node as selected
                node : function (d) {
                    var node = self.node.filter(function (_d) { return _d === d; });
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
                link : function (d) {
                    var link = self.link.select('.link')
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
                    d3.selectAll('.selected')
                        .classed('selected', false)
                        .each(function (d) { d.selected = false; });
                },
                // Updates graphical appearance of selected_nodes nodes
                by_rectangle : function () {
                    var r = this.rectangle();
                    // Correct coordinates according to the current panoram
                    var p = self.pan();
                    r[0] -=  p[0];
                    r[2] -=  p[0];
                    r[1] -=  p[1];
                    r[3] -=  p[1];
                    self.node.each(function (d) {
                        // Check if center of the node is in the selection rectange
                        if (point_in_rectangle(d.x, d.y, r)) {
                            self.select.node(d);
                        }
                    });
                    self.link.each(function (d) {
                        // Check if both start and and points of link 
                        // are in the selection
                        if (point_in_rectangle(d.x1, d.y1, r) &&
                                point_in_rectangle(d.x2, d.y2, r)) {
                            self.select.link(d);
                        }
                    });
                }
            };
        }());



        // This object implements a drag link when user creates new graph edge
        this.drag_link = (function () {
            var v1 = [0, 0];
            var v2 = [0, 0];
            var d = {}; // Data object for a link
            var ref_link; // Reference to a link svg element
            var shown = false;
            var to_node = false;
            return {
                show : function (d_node) {
                    d.source = d_node;
                    ref_link = add_link(container).select('path.link');
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
                        set_link_type(d);
                        ref_link.attr('d', get_link_path(d));
                    } else {
                        make_edge.drag(v1, v2);
                        // TODO: can we move it to 'get_link_path'?
                        ref_link.attr('d', 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1]);
                    }
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
        var nodes;
        // States are represented as functions
        var mouse;
        var states = {
            init : function (d) {
                // What if get rid of 'node.' and 'doc.' prefixes?
                // What if use different automata for document, nodes etc?
                // switch (d3.event.type) {
                // case 'mousemove':
                //     // process it first since it is most frequent
                //     break;
                // case 'mousedown':
                //     var target = d3.event.target || d3.event.srcElement;
                //     var v = target.__data__;
                //     console.log(target, v);
                //     break;
                // }
                switch (controller.event) {
                case 'node.mousedown':
                    d_source = d;
                    state = states.select_or_drag;
                    break;
                case 'doc.mousedown':
                    xy = d3.mouse(this);
                    if (d3.event.shiftKey) {
                        view.pan.start();
                        state = states.move_graph;
                        break;
                    }
                    state = states.wait_for_selection;
                    break;
                case 'link.mousedown':
                    xy = d3.mouse(this);
                    if (!d3.event.ctrlKey) { view.select.nothing(); }
                    view.select.link(d);
                    break;
                case 'doc.dblclick':
                    mouse = view.pan.mouse();
                    // Create new node
                    var node = {x : mouse[0], y : mouse[1]};
                    graph.nodes.push(node);
                    // Update view, select the node and link
                    view.update();
                    if (!d3.event.ctrlKey) { view.select.nothing(); }
                    view.select.node(node);
                    break;
                }
            },
            select_or_drag : function (d) {
                switch (controller.event) {
                case 'doc.mousemove':
                    if (d3.event.shiftKey) {
                        xy = view.pan.mouse();
                        if (!d_source.selected) {
                            view.select.node(d_source);
                        }
                        nodes = d3.selectAll('.state.selected');
                        nodes.each(function (d) { d.fixed = true; });
                        state = states.drag_node;
                    }
                    break;
                case 'node.mouseout':
                    if (d3.event.shiftKey) { break; }
                    view.drag_link.show(d_source);
                    state = states.drag_link;
                    break;
                case 'node.mouseup':
                    if (!d3.event.ctrlKey) { view.select.nothing(); }
                    // selection.select_node(d);
                    view.select.node(d);
                    state = states.init;
                    break;
                }
            },
            drag_link : function (d) {
                switch (controller.event) {
                case 'doc.mousemove':
                    view.drag_link.to_point(view.pan.mouse());
                    break;

                // User have dragged the link to another node
                case 'node.mouseover':
                    view.drag_link.to_node(d);
                    state = states.drop_link_or_exit;
                    break;

                // Create new node and new link to it
                case 'doc.mouseup':
                    view.drag_link.hide();
                    // Create new node
                    mouse = view.pan.mouse();
                    var node = {x : mouse[0], y : mouse[1]};
                    graph.nodes.push(node);
                    // Create new link
                    var link = {source : d_source, target : node};
                    graph.links.push(link);
                    // Update view, select the node and link
                    view.update();
                    if (!d3.event.ctrlKey) { view.select.nothing(); }
                    view.select.node(node);
                    view.select.link(link);

                    state = states.init;
                    break;
                }
            },
            drop_link_or_exit : function (d) {
                switch (controller.event) {
                case 'node.mouseup':
                    view.drag_link.hide();
                    // Get existing links between selected nodes
                    var exists = graph.links.filter(function (v) {
                        return ((v.source === d_source) && (v.target === d));
                    });
                    var link;
                    if (exists.length === 0) {
                        // Create new link
                        link = {source : d_source, target : d};
                        graph.links.push(link);
                        view.update();
                    } else {
                        // otherwise select already existing link
                        link = exists[0];
                    }
                    if (!d3.event.ctrlKey) { view.select.nothing(); }
                    view.select.link(link);
                    state = states.init;
                    break;
                case 'node.mouseout':
                    state = states.drag_link;
                    break;
                }
            },
            drag_node : function () {
                switch (controller.event) {
                case 'doc.mousemove':
                    if (!d3.event.shiftKey) {
                        nodes.each(function (d) { d.fixed = false; });
                        state = states.init;
                        break;
                    }
                    // How far we move the node
                    mouse = view.pan.mouse();
                    xy[0] = mouse[0] - xy[0];
                    xy[1] = mouse[1] - xy[1];
                    nodes.each(function (d) {
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
                case 'doc.mouseup':
                case 'node.mouseup':
                    nodes.each(function (d) { d.fixed = false; });
                    state = states.init;
                    break;
                }
            },
            wait_for_selection : function () {
                switch (controller.event) {
                case 'doc.mousemove':
                    mouse = d3.mouse(this);
                    if (!d3.event.ctrlKey) { view.select.nothing(); }
                    view.select.rectangle.show(xy);
                    state = states.selection;
                    break;
                case 'doc.mouseup':
                    if (!d3.event.ctrlKey) { view.select.nothing(); }
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
                    view.select.rectangle.update(mouse);
                    break;
                case 'doc.mouseup':
                    view.select.rectangle.hide();
                    view.select.by_rectangle();
                    state = states.init;
                    break;
                }
            },
            move_graph : function () {
                switch (controller.event) {
                case 'doc.mousemove':
                    if (!d3.event.shiftKey) { state = states.init; }
                    view.pan.to_mouse();
                    break;
                case 'doc.mouseup':
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
                    // Trace current transition
                    console.log('transition:', old_state._name + ' -> ' + state._name);
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

