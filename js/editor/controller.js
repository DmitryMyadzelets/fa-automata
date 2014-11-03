
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
    var drag_target;    // drag target node of edge [true, false]

    var state;          // Reference to a current state
    var old_state;      // Reference to a previous state

    var node_text;      // reference to the SVG text element of a node

    var states = {
        init : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    break;
                case 'dblclick':
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    mouse = view.pan.mouse();
                    // Create new node
                    var node = { x : mouse[0], y : mouse[1] };
                    commands.start().add_node(view, node);
                    view.nodes(node).select();
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
                        var nodes = view.select().nodes();
                        // Get incoming and outgoing edges of deleted nodes, joined with selected edges 
                        var edges = view.nodes(nodes).edges();
                        edges = edges.concat(view.select().edges().filter(
                            function (d) { return edges.indexOf(d) < 0; }
                            ));
                        // Delete nodes edges
                        commands.start()
                            .del_node(view, nodes.splice(0))
                            .del_edge(view, edges);
                        state = states.wait_for_keyup;
                        break;
                    case 89: // Y
                        if (d3.event.ctrlKey) {
                            commands.redo();
                        }
                        state = states.wait_for_keyup;
                        break;
                    case 90: // Z
                        if (d3.event.ctrlKey) {
                            commands.undo();
                        }
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
                case 'dblclick':
                    d3.event.stopPropagation();
                    node_d = d;
                    node_text = d3.select(this).select('text');
                    // Remove text temporally, since it is viewed in text editor now
                    node_text.text('');
                    // Callback function which is called by textarea object when 
                    // user enters the text or cancels it.
                    // This function invokes this automaton iteself
                    var callback = (function () {
                        var self = view;
                        return function () {
                            self.controller().context('text').event.apply(this, arguments);
                        };
                    }());
                    var text = d.text || '';
                    var pan = view.pan();
                    textarea(view.container, text, d.x + pan[0], d.y + pan[1], callback, callback);
                    view.force.stop();
                    state = states.edit_node_text;
                    break;
                }
                break;
            case 'edge':
                switch (type) {
                case 'mousedown':
                    // What to drag: head or tail of the edge? What is closer to the mouse pointer.
                    var head = [], tail = [];
                    mouse = view.pan.mouse();
                    vec.subtract(mouse, [d.x1, d.y1], tail);
                    vec.subtract(mouse, [d.x2, d.y2], head);
                    drag_target = vec.length(head) < vec.length(tail);
                    state = states.edge_select_or_drag;
                    break;
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
                            if (!d3.event.ctrlKey) { view.select().nothing(); }
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
                    node_d = { x : mouse[0], y : mouse[1], r : 1 };
                    // Create new edge
                    edge_d = { source : d_source, target : node_d };
                    commands.start().add_edge(view, edge_d);
                    drag_target = true;
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    // Then attach edge to this new node
                    view.force.stop();
                    state = states.drag_edge;
                    break;
                case 'mouseup':
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    view.select().node(d_source);
                    state = states.init;
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
                    view.select().edge(d);
                    state = states.init;
                    break;
                case 'mouseout':
                    mouse = view.pan.mouse();
                    // Start dragging the edge
                    // Firstly, create new node with zero size
                    node_d = { x : mouse[0], y : mouse[1], r : 1 };
                    edge_d = { source : d.source, target : d.target }
                    if (drag_target) {
                        edge_d.target = node_d;
                    } else {
                        edge_d.source = node_d;
                    }
                    commands.start()
                        .del_edge(view, d)
                        .add_edge(view, edge_d);
                    // Then attach edge to this new node
                    view.force.stop();
                    // Save values for next state
                    set_edge_type.call(view, edge_d);
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    state = states.drag_edge;
                    break;
                default:
                    state = states.init;
                }
                break;
            }
        },
        drag_edge : function (d) {
            switch (type) {
            case 'mousemove':
                mouse = view.pan.mouse();
                node_d.x = mouse[0];
                node_d.y = mouse[1];
                edge_svg.attr('d', elements.get_edge_transformation(edge_d));
                break;
            case 'mouseup':
                delete node_d.r; // in order to use default radius
                commands.add_node(view, node_d);
                if (!d3.event.ctrlKey) { view.select().nothing(); }
                view.select().node(node_d);
                state = states.init;
                break;
            case 'mouseover':
                switch (source) {
                case 'node':
                    if (drag_target) {
                        edge_d.target = d;
                    } else {
                        edge_d.source = d;
                    }
                    set_edge_type.call(view, edge_d);
                    edge_svg.attr('d', elements.get_edge_transformation(edge_d));
                    state = states.drop_edge_or_exit;
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
                    // Get existing edges between selected nodes
                    var exists = view.graph().edges.filter(function (v) {
                        return ((v.source === edge_d.source) && (v.target === edge_d.target));
                    });
                    if (exists.length > 1) {
                        // Delete edge
                        commands.del_edge(view, edge_d);
                    }
                    if (!d3.event.ctrlKey) { view.select().nothing(); }
                    if (exists.length <= 1) {
                        view.select().edge(edge_d);
                    }
                    view.update();
                    state = states.init;
                    break;
                case 'mouseout':
                    if (drag_target) {
                        edge_d.target = node_d;
                    } else {
                        edge_d.source = node_d;
                    }
                    set_edge_type.call(view, edge_d);
                    state = states.drag_edge;
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
                    // How far we move the nodes
                    var xy = mouse;
                    mouse = view.pan.mouse();
                    xy[0] = mouse[0] - xy[0];
                    xy[1] = mouse[1] - xy[1];
                    // Change positions of the selected nodes
                    view.nodes().move(nodes, xy);
                    // nodes.forEach(function (d) {
                    //     d.x += xy[0];
                    //     d.y += xy[1];
                    //     d.px = d.x;
                    //     d.py = d.y;
                    // });
                    xy[0] = mouse[0];
                    xy[1] = mouse[1];
                    // view.force.resume();
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
        },
        edit_node_text : function () {
            if (source === 'text') {
                // Set original text back
                node_text.text(function(d) { return d.text; });
                // Change text if user hit Enter
                switch (type) {
                case 'keydown':
                    if (d3.event.keyCode === 13) {
                        commands.start().text(view, node_d, this.value); // FIX: should be a ref to SVG text here
                        
                    } else {
                    }
                    break;
                }
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


    var methods = {
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

            // d3.event.stopPropagation();

            // If there wes a transition from state to state
            if (old_state !== state) {
                // Trace current transition
                console.log('transition:', old_state._name + ' -> ' + state._name);
            }
        },

        // Sets context in which an event occurs
        // Returns controller object for subsequent invocation
        context : function (a_element) {
            source = a_element;
            return this;
        },
        control : function () {
            var self = view;
            // Handles nodes events
            view.node_handler = function () {
                self.controller().context('node').event.apply(this, arguments);
            };

            // Handles edge events
            view.edge_handler = function () {
                self.controller().context('edge').event.apply(this, arguments);
            };

            // Handles plane (out of other elements) events
            view.plane_handler = function () {
                self.controller().context('plane').event.apply(this, arguments);
            }

            return methods;
        }
    };

    return function () {
        view = this;
        if (!old_view) { old_view = view; }
        return methods;
    };

}());


