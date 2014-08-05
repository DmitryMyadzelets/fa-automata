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
        .links(graph.links)
        .on('tick', tick)
        .start();


    var node, link;

    var update = function () {

        // Links (edges) of the graph

        link = svg.selectAll(".path").data(force.links());

        link.enter().append('path')
            .attr('class', 'link') // CSS class style
            .attr("marker-end", "url(#marker-arrow)");

        link.exit().remove();


        // Nodes of the graph

        node = svg.selectAll(".g").data(force.nodes());

        node.enter()
            .append("g")
            .append('circle')
            .attr('r', node_radius)
            .attr('class', 'node'); // CSS class style

        node.exit().remove();

    };

    update();


    // 
    // 
    // The function which is called during animation of the graph
    // 
    // 

    // Callback function for tick event
    var on_node_tick = function (d) {
        return "translate(" +
            ((d.x * 10 | 0) / 10) + "," +
            ((d.y * 10 | 0) / 10) + ")";
    };

    // Make SVG string for a link curve
    var v1 = [0, 0];
    var v2 = [0, 0];
    var norm = [0, 0];

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


    // Is called on each tick during graph animation
    function tick() {
        node.attr("transform", on_node_tick);
        link.attr('d', on_link_tick);
    }


    // 
    // Public
    // 

    module.graph = graph;
    module.update = update;

}(this.jA.ui));


