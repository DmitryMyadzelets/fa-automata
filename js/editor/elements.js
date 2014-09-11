
// JSLint options:
/*global vec */
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



elements.get_node_transformation = function (d) {
    d.x = d.x || 0;
    d.y = d.y || 0;
    return "translate(" + d.x + "," + d.y + ")";
};



elements.add_node = function (selection) {
    selection.append('g')
        .attr('transform', this.get_node_transformation)
        .append('circle')
        .attr('r', 16);
};



// Adds SVG elements representing a graph link/edge
// Returns root of the added elements
elements.add_link = function (selection) {
    var g = selection.append('g');
        // .attr('class', 'transition')
        // .on('dblclick', on_link_dblclick)
        // .on('mousedown', on_link_mousedown);
        // .on('mouseover', controller.on_link_mouseover)
        // .on('mousemove', controller.on_link_mousemove);

    g.append('path')
        .attr('class', 'link') // CSS class style
        .attr('marker-end', 'url(#marker-arrow)');

    g.append('path')
        .attr('class', 'catchlink');

    return g;
};


