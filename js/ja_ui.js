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
    var link_charge = link_distance * -20; // How strong the nodes push each other away
    var link_charge_distance = link_distance * 5; // Maximal distance where charge works
    var link_gravity = 0.05;
    var friction = 0.7; // [0..1]

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

    var node = svg.selectAll("svg.g.circle");
    var link = svg.selectAll("svg.path");

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
            return "translate(" +
                ((d.x * 10 | 0) / 10) + "," +
                ((d.y * 10 | 0) / 10) + ")";
        };

        // Returns SVG string for an edge
        var on_link_tick = function (d) {
            v1[0] = d.source.x;
            v1[1] = d.source.y;
            v2[0] = d.target.x;
            v2[1] = d.target.y;
            // d.cv = [0, 0] if not d.cv?
            makeEdge.stright(v1, v2, norm, d.cv);
            return 'M' +
                ((v1[0] * 10 | 0) / 10) + ',' +
                ((v1[1] * 10 | 0) / 10) + 'L' +
                ((v2[0] * 10 | 0) / 10) + ',' +
                ((v2[1] * 10 | 0) / 10);
        };

        return function () {
            node.attr("transform", on_node_tick);
            link.attr('d', on_link_tick);
        };
    }());

    force.on('tick', tick);


    var update;

    // State machine for process user input
    var process_event = (function () {
        var state; // Reference to a current state
        var current_node; // Current node
        // States are represented as functions
        var states = {
            init : function (event, object) {
                switch (event) {
                case 'node.mousedown':
                    current_node = object;
                    state = this.going_from_node;
                    break;
                case 'doc.mousedown':
                    state = this.create_new_node;
                    break;
                }
            },
            going_from_node : function (event) {
                switch (event) {
                case 'node.mouseout':
                    state = this.init;
                    break;
                }
            },
            create_new_node : function (event, object) {
                switch (event) {
                case 'doc.mouseup':
                    var xy = object;
                    graph.nodes.push({x : xy[0], y : xy[1]});
                    update();
                    state = this.init;
                    break;
                default:
                    state = this.init;
                    break;
                }
            }
        };

        // Add 'name' property to the state functions for debugging
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
                var ret = state.apply(states, arguments);
                if (old_state !== state) {
                    console.log(old_state._name + ' -> ' + state._name);
                }
                return ret;
            }
        };
    }());



    // Call this function to update SVG representation of the graph object
    update = function () {
        link = link.data(graph.links);
        link.exit().remove();
        link.enter().append('path')
            .attr('class', 'link') // CSS class style
            .attr("marker-end", "url(#marker-arrow)");

        node = node.data(graph.nodes);
        node.exit().remove();
        node.enter()
            .append("g")
            .append('circle')
            .attr('r', node_radius)
            .attr('class', 'node') // CSS class style
            .on('mousedown', function (d) { process_event('node.mousedown', d); })
            .on('mouseup', function (d) { process_event('node.mouseup', d); })
            .on('mouseover', function (d) { process_event('node.mouseover', d); })
            .on('mouseout', function (d) { process_event('node.mouseout', d); });
        force.start();
    };

    update();


    svg.on('mousedown', function () {
        process_event('doc.mousedown', d3.mouse(this));
    });

    svg.on('mouseup', function () {
        process_event('doc.mouseup', d3.mouse(this));
    });



    // 
    // Public
    // 

    module.graph = graph;
    module.update = update;

}(this.jA.ui));


