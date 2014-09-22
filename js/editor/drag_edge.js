


// This object implements a dragged edge when user creates new graph edge
View.prototype.drag_edge = (function () {
    var v1 = [0, 0];
    var v2 = [0, 0];
    var d = {}; // Data object for a link
    var group; // Reference to the group svg element
    var edge;  // Reference to the edge svg element
    var shown = false;
    var to_node = false;
    var view;
    var svg;
    return {
        show : function (d_node) {
            d.source = d_node;
            group = elements.add_link(svg).classed('links', true);
            edge = group.select('path');
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
                set_link_type.call(view, d);
                edge.attr('d', elements.get_link_transformation(d));
            } else {
                elements.make_edge.drag(v1, v2);
                // TODO: can we move it to 'get_link_transormation'?
                edge.attr('d', 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1]);
            }
        },
        hide : function () {
            group.remove();
            shown = false;
        },
    	context : function (a_view, a_svg) {
    		view = a_view;
	        svg = a_svg;
	        return this;
	    }
    };
}());

