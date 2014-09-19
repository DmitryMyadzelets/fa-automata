
// JSLint options:
/*global vec, View*/


// This object implements a dragged edge when user creates new graph edge
var drag_edge = (function () {
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


