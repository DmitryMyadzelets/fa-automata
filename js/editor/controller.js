
// JSLint options:
/*global d3, View*/
"use strict";


View.prototype.controller = (function () {

    var view;           // a view where current event occur
    var source;         // a SVG element where current event occur
    var type;           // type of event (copy of d3.type)

    var mouse;          // mouse position
    var select_rect;    // selection rectangle
    var d_source;       // referrence to a data of svg element
    var nodes;          // array of nodes (data)
    var edge_svg;       // reference to a SVG edge
    var edge_d;         // reference to an edge object
    var node_d;         // reference to a node object

    var state;          // Reference to a current state
    var old_state;      // Reference to a previous state

    var states = {
        init : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    break;
                case 'dblclick':
                    mouse = view.pan.mouse();
                    // Create new node
                    var node = { x : mouse[0], y : mouse[1] };
                    view.graph().nodes.push(node);
                    view.update();
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().node(node);
                    break;
                case 'mousedown':
                    if (d3.event.shiftKey) {
                        view.pan.start();
                        state = states.move_graph;
                        break;
                    }
                    mouse = d3.mouse(this);
                    state = states.wait_for_selection;
                    break;
                case 'keydown':
                    switch (d3.event.keyCode) {
                    case 46: // Delete
                        var selected = view.select().links();
                        var edges = view.graph().edges;
                        console.log(edges);
                        var i = selected.length;
                        var ix;
                        while(i-- > 0) {
                            ix = edges.indexOf(selected[i]);
                            // console.log(i, ix, edges, selected[i]);
                            if (ix >= 0) {
                                edges.splice(ix, 1);
                            }
                        }
                        view.update();
                        state = states.wait_for_keyup;
                        break;
                    // default:
                    //     console.log('Key', d3.event.keyCode);
                    }
                    break;
                }
                break;
            case 'node':
                switch (type) {
                case 'mousedown':
                    d_source = d;
                    state = states.node_select_or_drag;
                    break;
                }
                break;
            case 'edge':
                switch (type) {
                case 'mousedown':
                    state = states.edge_select_or_drag;
                    break;
                }
                break;
            }
        },
        edge_select_or_drag : function (d) {
            switch (source) {
            case 'edge':
                switch (type) {
                case 'mouseup':
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().link(d);
                    state = states.init;
                    console.log('edge', d);
                    break;
                case 'mouseout':
                    mouse = view.pan.mouse();
                    // Start dragging the edge
                    // Firstly, create new node with zero size
                    node_d = { x : mouse[0], y : mouse[1], r : 1};
                    // Then attach edge to this new node
                    view.force.stop();
                    d.target = node_d;
                    // Save values for next state
                    edge_d = d;
                    set_link_type.call(view, edge_d);
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    state = states.drag_edge;
                    break;
                default:
                    state = states.init;
                }
                break;
            }
        },
        node_select_or_drag : function () {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    if (d3.event.shiftKey) {
                        mouse = view.pan.mouse();
                        if (!d_source.selected) {
                            view.select().node(d_source);
                        }
                        nodes = view.select().nodes();
                        nodes.forEach(function (d) { d.fixed = true; });
                        state = states.drag_node;
                    }
                    break;
                }
                break;
            case 'node':
                switch (type) {
                case 'mouseout':
                    if (d3.event.shiftKey) { break; }
                    mouse = view.pan.mouse();
                    // Start dragging the edge
                    // Firstly, create new node with zero size
                    node_d = { x : mouse[0], y : mouse[1], r : 1};
                    // Create new edge
                    edge_d = { source : d_source, target : node_d };
                    view.graph().edges.push(edge_d);
                    view.update_edges();
                    console.log(view.graph().edges);
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    edge_svg.attr('d', elements.get_link_transformation(edge_d));
                    // Then attach edge to this new node
                    view.force.stop();
                    state = states.drag_edge;
                    break;
                case 'mouseup':
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().node(d_source);
                    state = states.init;
                    console.log('node', d_source);
                    break;
                }
                break;
            }
        },
        drag_edge : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    mouse = view.pan.mouse();
                    node_d.x = mouse[0];
                    node_d.y = mouse[1];
                    edge_svg.attr('d', elements.get_link_transformation(edge_d));
                    break;
                case 'mouseup':
                    delete node_d.r;
                    view.graph().nodes.push(node_d);
                    view.update();
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().node(node_d);
                    view.select().link(edge_d);

                    state = states.init;
                }
                break;
            case 'node':
                switch (type) {
                case 'mouseover':
                    edge_d.target = d;
                    set_link_type.call(view, edge_d);
                    edge_svg.attr('d', elements.get_link_transformation(edge_d));
                    state = states.drop_edge_or_exit;
                    console.log(view.graph().edges);
                    break;
                }
                break;
            }
        },
        drop_edge_or_exit : function () {
            switch (source) {
            case 'node':
                switch (type) {
                case 'mouseup':
                    console.log(view.graph().edges);
                    // Get existing links between selected nodes
                    // var exists = view.graph().edges.filter(function (v) {
                    //     return ((v.source === edge_d.source) && (v.target === edge_d.target));
                    // });
                    // if (exists.length > 1) {
                    //     // Delete edge
                    //     console.log(view.graph().edges);
                    //     var edges = view.graph().edges;
                    //     var i = edges.indexOf(edge_d);
                    //     // console.log(edge_d);
                    //     // console.log(edges[i]);
                    //     // console.log(edges);
                    //     console.log(edges.splice(i, 1)[0]);
                    // }
                    view.update();
                    // if (!d3.event.ctrlKey) { view.select().nothing(); }
                    // if (exists.length <= 1) {
                    //     view.select().link(edge_d);
                    // }
                    state = states.init;
                    break;
                case 'mouseout':
                    edge_d.target = node_d;
                    set_link_type.call(view, edge_d);
                    state = states.drag_edge;
                    break;
                }
                break;
            }
        },
        drag_link : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    view.drag_edge().to_point(view.pan.mouse());
                    break;
                // Create new node and new edge to it
                case 'mouseup':
                    view.drag_edge().hide();
                    // Create new node
                    mouse = view.pan.mouse();
                    var node = {x : mouse[0], y : mouse[1]};
                    view.graph().nodes.push(node);
                    // Create new edge
                    var edge = {source : d_source, target : node};
                    view.graph().edges.push(edge);
                    // Update view, select the node and edge
                    view.update();
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().node(node);
                    view.select().link(edge);

                    state = states.init;
                    break;
                }
                break;
            case 'node':
                switch (type) {
                    // User have dragged the link to another node
                    case 'mouseover':
                        view.drag_edge().to_node(d);
                        state = states.drop_link_or_exit;
                        break;
                }
                break;
            }
        },
        drop_link_or_exit : function (d) {
            switch (source) {
            case 'node':
                switch (type) {
                case 'mouseup':
                    view.drag_edge().hide();
                    // Get existing links between selected nodes
                    var exists = view.graph().edges.filter(function (v) {
                        return ((v.source === d_source) && (v.target === d));
                    });
                    var edge;
                    if (exists.length === 0) {
                        // Create new edge
                        edge = {source : d_source, target : d};
                        view.graph().edges.push(edge);
                        view.update();
                    } else {
                        // otherwise select already existing edge
                        edge = exists[0];
                    }
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().link(edge);
                    state = states.init;
                    break;
                case 'mouseout':
                    state = states.drag_link;
                    break;
                }
                break;
            }
        },
        drag_node : function () {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    if (!d3.event.shiftKey) {
                        nodes.forEach(function (d) { d.fixed = false; });
                        state = states.init;
                        break;
                    }
                    // How far we move the node
                    var xy = mouse;
                    mouse = view.pan.mouse();
                    xy[0] = mouse[0] - xy[0];
                    xy[1] = mouse[1] - xy[1];
                    nodes.forEach(function (d) {
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
                case 'mouseup':
                    nodes.forEach(function (d) { d.fixed = false; });
                    state = states.init;
                    break;
                }
                break;
            case 'node':
                switch (type) {
                case 'mouseup':
                    nodes.forEach(function (d) { d.fixed = false; });
                    state = states.init;
                    break;
                }
                break;
            }
        },
        wait_for_selection : function () {
            switch (type) {
            case 'mousemove':
                if (!d3.event.ctrlKey) { view.select().nothing(); }
                select_rect = view.selection_rectangle();
                select_rect.show(mouse);
                mouse = d3.mouse(this);
                state = states.selection;
                break;
            case 'mouseup':
                if (!d3.event.ctrlKey) { view.select().nothing(); }
                state = states.init;
                break;
            default:
                state = states.init;
            }
        },
        selection : function () {
            switch (type) {
            case 'mousemove':
                select_rect.update(d3.mouse(this));
                break;
            case 'mouseup':
                view.select().by_rectangle(select_rect());
                select_rect.hide();
                state = states.init;
                break;
            }
        },
        move_graph : function () {
            switch (type) {
            case 'mousemove':
                if (!d3.event.shiftKey) { state = states.init; }
                view.pan.to_mouse();
                break;
            case 'mouseup':
                state = states.init;
                break;
            }
        },
        wait_for_keyup : function () {
            if (type === 'keyup') {
                state = states.init;
            }
        }
    };

    state = states.init;

    // Add 'name' property to the state functions to trace transitions
    var key;
    for (key in states) {
        if (states.hasOwnProperty(key)) {
            states[key]._name = key;
        }
    }

    var old_view = null;

    return {
        event : function () {
            if (!view) { return; }

            // Do not process events if the state is not initial.
            // It is necessary when user drags elements outside of the current view.
            if (old_view !== view) {
                if (state !== states.init) {
                    return;
                } else {
                    old_view = view;
                }
            }

            // Set default event source in case it is not set by 'set_event' method
            source = source || d3.event.target.nodeName;
            type = d3.event.type;

            old_state = state;
            state.apply(this, arguments);

            // Clear the context to prevent false process next time
            view = null;
            source = null;

            d3.event.stopPropagation();
            // If there wes a transition from state to state
            if (old_state !== state) {
                // Trace current transition
                console.log('transition:', old_state._name + ' -> ' + state._name);
            }
        },

        // Sets context in which an event occurs
        // Returns controller object for subsequent invocation
        context : function (a_view, a_element) {
            view = a_view;
            if (!old_view) { old_view = view; }
            source = a_element;
            return this;
        }
    };

}());


