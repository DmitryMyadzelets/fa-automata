
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
        // node : function (d) {
        //     var node = view.node.filter(function (_d) { return _d === d; });
        //     var index = nodes.indexOf(d);
        //     if (index < 0) {
        //         d.selected = true;
        //         nodes.push(d);
        //     } else {
        //         d.selected = false;
        //         nodes.splice(index, 1);
        //     }
        //     node.select('circle').classed('selected', d.selected);
        // },
        nodes : function () {
            return nodes;
        },
        edges : function () {
            return edges;
        },
        // edge : function (d) {
        //     var edge = view.edge.filter(function (_d) { return _d === d; });
        //     var index = edges.indexOf(d);
        //     if (index < 0) {
        //         d.selected = true;
        //         edges.push(d);
        //     } else {
        //         d.selected = false;
        //         edges.splice(index, 1);
        //     }
        //     edge.select('path.edge').classed('selected', d.selected);
        // },
        // nothing : function () {
        //     nodes.length = 0;
        //     edges.length = 0;
        //     svg = svg || d3;
        //     svg.selectAll('.selected')
        //         .classed('selected', false)
        //         .each(function (d) { d.selected = false; });
        // },
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
                    view.select_node(d);
                }
            });
            view.edge.each(function (d) {
                // Check if both start and and points of edge 
                // are in the selection
                if (point_in_rectangle(d.x1, d.y1, r) &&
                        point_in_rectangle(d.x2, d.y2, r)) {
                    view.select_edge(d);
                }
            });
        }
    };
}());


