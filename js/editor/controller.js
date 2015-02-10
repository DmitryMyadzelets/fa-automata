
// JSLint options:
/*global d3, View, commands, textarea, vec, elements, set_edge_type*/
"use strict";


// Returns whether the editor is in the ADD mode
function mode_add() {
    return d3.event.ctrlKey;
}


// Returns whether the editor is in the MOVE mode
function mode_move() {
    return d3.event.shiftKey;
}


// ===========================================================================
// Controller of the selection by rectangle
// Returns itself
// .done implies it is in the initial state
var control_selection = (function () {

    var loop, mouse, rect;

    // The state machine
    var state, states = {
        init : function () {
            mouse = d3.mouse(this);
            state = states.ready;
        },
        ready : function (view) {
            switch (d3.event.type) {
            case 'mousemove':
                if (!mode_add()) { view.unselect_all(); }
                rect = view.selection_rectangle();
                rect.show(mouse);
                state = states.update;
                break;
            case 'mouseup':
                if (!mode_add()) { view.unselect_all(); }
                state = states.init;
                break;
            default:
                state = states.init;
            }
        },
        update : function (view) {
            switch (d3.event.type) {
            case 'mousemove':
                rect.update(d3.mouse(this));
                break;
            case 'mouseup':
                view.select().by_rectangle(rect());
                rect.hide();
                state = states.init;
                break;
            }
        }
    };

    state = states.init;

    loop = function () {
        state.apply(this, arguments);
        loop.done = state === states.init;
        return loop;
    };
    return loop;
}());



// ===========================================================================
var control_nodes_drag = (function () {

    var loop, mouse, nodes;
    var from_xy = [], xy, to_xy = [];

    // The state machine
    var state, states = {
        init : function (view) {
            mouse = view.pan.mouse();
            state = states.ready;
        },
        ready : function (view) {
            switch (d3.event.type) {
            case 'mousemove':
                // Remember nodes coordinates for undo the command
                from_xy.length = 0;
                nodes = view.selected_nodes();
                nodes.forEach(function (d) { d.fixed = true; from_xy.push(d.x, d.y); });
                state = states.update;
                break;
            case 'mouseup':
                state = states.init;
                break;
            }
        },
        update : function (view, model) {
            switch (d3.event.type) {
            case 'mousemove':
                // How far we move the nodes
                xy = mouse;
                mouse = view.pan.mouse();
                xy[0] = mouse[0] - xy[0];
                xy[1] = mouse[1] - xy[1];
                // Change positions of the selected nodes
                view.model.node.shift(nodes, xy);
                view.spring.on();
                xy[0] = mouse[0];
                xy[1] = mouse[1];
                break;
            case 'mouseup':
                to_xy.length = 0;
                nodes.forEach(function (d) { delete d.fixed; to_xy.push(d.x, d.y); });
                // Record the command only when the force is not working
                if (view.spring()) {
                    view.spring.on();
                } else {
                    commands.start().move_node(model, nodes, from_xy, to_xy);
                }
                state = states.init;
                break;
            }
        }
    };

    state = states.init;

    loop = function () {
        state.apply(this, arguments);
        loop.done = state === states.init;
        return loop;
    };
    return loop;
}());



View.prototype.controller = (function () {

    var view;           // a view where current event occur
    var model;          // a model connected to the current view
    var source;         // a SVG element where current event occur
    var type;           // type of event (copy of d3.type)

    var mouse;          // mouse position
    var d_source;       // referrence to a data of svg element
    var nodes;          // array of nodes (data)
    var edge_svg;       // reference to a SVG edge
    var edge_d;         // reference to an edge object
    var node_d;         // reference to a node object
    var drag_target;    // drag target node of edge [true, false]

    var state;          // Reference to a current state
    var old_state;      // Reference to a previous state

    var svg_text;      // reference to the SVG text element of a node

    var states = {
        init : function (d) {
            switch (source) {
            case 'plane':
                switch (type) {
                case 'mousemove':
                    // placed here to prevent the enumeration of other cases
                    break;
                case 'dblclick':
                    if (!mode_add()) { view.unselect_all(); }
                    mouse = view.pan.mouse();
                    // Create new node
                    var node = { x : mouse[0], y : mouse[1] };
                    commands.start().add_node(model, node);
                    view.select_node(node);
                    break;
                case 'mousedown':
                    if (mode_move()) {
                        view.pan.start();
                        state = states.move_graph;
                    } else {
                        control_selection.call(this, view);
                        state = states.selection;
                    }
                    break;
                case 'keydown':
                    switch (d3.event.keyCode) {
                    case 46: // Delete
                        nodes = view.selected_nodes();
                        // Get incoming and outgoing edges of deleted nodes, joined with selected edges 
                        var edges = view.model.edge.adjacent(nodes);
                        edges = edges.concat(view.selected_edges().filter(
                            function (d) { return edges.indexOf(d) < 0; }
                        ));
                        // Delete nodes edges
                        commands.start()
                            .del_node(model, nodes)
                            .del_edge(model, edges);
                        state = states.wait_for_keyup;
                        break;
                    case 70: // F
                        // On/off spring behaviour
                        if (view.spring()) {
                            view.spring(false);
                        } else {
                            commands.start().spring(view, model);
                        }
                        break;
                    case 73: // I
                        // Mark a selected state as the initial one
                        commands.start().initial(model,
                            view._graph.nodes.filter(function (d) { return !!d.initial; }),
                            view.selected_nodes());
                        break;
                    case 77: // M
                        // Mark selected states
                        nodes = view.selected_nodes();
                        if (mode_add()) {
                            commands.start().unmark_node(model, nodes);
                        } else {
                            commands.start().mark_node(model, nodes);
                        }
                        break;
                    case 89: // Y
                        if (mode_add()) {
                            commands.redo();
                            view.spring.on();
                        }
                        state = states.wait_for_keyup;
                        break;
                    case 90: // Z
                        if (mode_add()) {
                            commands.undo();
                            view.spring.on();
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

                    // Selection
                    if (mode_move()) {
                        view.select_node(d);
                    } else {
                        // XOR selection mode
                        if (mode_add()) {
                            // Invert selection of the node
                            view.select_node(d, nodes.indexOf(d) < 0);
                        } else {
                            // AND selection
                            view.unselect_all();
                            view.select_node(d);
                        }
                    }
                    // Drag the node or create new edge
                    if (mode_move()) {
                        control_nodes_drag.call(this, view);
                        state = states.drag_node;
                    } else {
                        state = states.wait_for_new_edge;
                    }
                    break;
                case 'dblclick':
                    d3.event.stopPropagation();
                    svg_text = d3.select(this).select('text');
                    // Remove text temporally, since it is viewed in text editor now
                    svg_text.text('');
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
                    state = states.edit_node_text;
                    break;
                }
                break;
            case 'edge':
                switch (type) {
                case 'mousedown':
                    // Conditional selection
                    edges = view.selected_edges();
                    // OR selection
                    if (mode_move()) {
                        view.select_edge(d);
                        edges = view.selected_edges();
                    } else {
                        // XOR selection mode
                        if (mode_add()) {
                            // Invert selection of the node
                            view.select_edge(d, edges.indexOf(d) < 0);
                        } else {
                            // AND selection
                            view.unselect_all();
                            view.select_edge(d);
                        }
                        state = states.wait_for_new_edge; // BUG! Never goes there!
                    }
                    // What to drag: head or tail of the edge? What is closer to the mouse pointer.
                    var head = [], tail = [];
                    mouse = view.pan.mouse();
                    vec.subtract(mouse, [d.x1, d.y1], tail);
                    vec.subtract(mouse, [d.x2, d.y2], head);
                    drag_target = vec.length(head) < vec.length(tail);
                    state = states.wait_for_edge_dragging;
                    break;
                case 'dblclick':
                    d3.event.stopPropagation();
                    d_source = d;
                    svg_text = d3.select(this).select('text');
                    // Remove text temporally, since it is viewed in text editor now
                    svg_text.text('');
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
                    // Place the text 
                    var x = d.tx + pan[0];
                    var y = d.ty + pan[1];
                    textarea(view.container, text, x, y, callback, callback);
                    view.spring.off();
                    state = states.edit_edge_text;
                    break;
                }
                break;
            }
        },
        wait_for_new_edge : function () {
            switch (type) {
            case 'mouseup':
                state = states.init;
                break;
            case 'mouseout':
                mouse = view.pan.mouse();
                // Start dragging the edge
                // Firstly, create new node with zero size
                node_d = { x : mouse[0], y : mouse[1], r : 1 };
                // Create new edge
                edge_d = { source : d_source, target : node_d };
                commands.start().add_edge(model, edge_d);
                drag_target = true;
                edge_svg = view.edge_by_data(edge_d).selectAll('path');
                // Then attach edge to this new node
                view.spring.off();
                state = states.drag_edge;
                break;
            }
        },
        wait_for_edge_dragging : function (d) {
            switch (source) {
            case 'edge':
                switch (type) {
                case 'mouseup':
                    state = states.init;
                    break;
                case 'mouseout':
                    mouse = view.pan.mouse();
                    // Start dragging the edge
                    // Firstly, create new node with zero size
                    node_d = { x : mouse[0], y : mouse[1], r : 1 };
                    edge_d = d;
                    // edge_d = { source : d.source, target : d.target }
                    var from = [edge_d.source, edge_d.target];
                    if (drag_target) {
                        d.target = node_d;
                    } else {
                        d.source = node_d;
                    }
                    // edge_d.text = d.text;
                    commands.start().move_edge(model, edge_d, from, [edge_d.source, edge_d.target]);
                        // .del_edge(model, d)
                        // .add_edge(model, edge_d);
                    // Then attach edge to this new node
                    view.spring.off();
                    // Save values for next state
                    set_edge_type.call(view, edge_d);
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    view.unselect_all();
                    view.select_edge(edge_d);
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
                commands.add_node(model, node_d);
                view.unselect_all();
                view.select_edge(edge_d);
                view.select_node(drag_target ? edge_d.target : edge_d.source);
                view.spring.on();
                state = states.init;
                break;
            case 'mouseover':
                switch (source) {
                case 'node':
                    var from = [edge_d.source, edge_d.target];
                    if (drag_target) {
                        edge_d.target = d;
                    } else {
                        edge_d.source = d;
                    }
                    commands.move_edge(model, edge_d, from, [edge_d.source, edge_d.target]);
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
                        commands.del_edge(model, edge_d);
                    }
                    if (!mode_add()) { view.unselect_all(); }
                    if (exists.length <= 1) {
                        view.select_edge(edge_d);
                    }
                    view.update();
                    state = states.init;
                    break;
                case 'mouseout':
                    var from = [edge_d.source, edge_d.target];
                    if (drag_target) {
                        edge_d.target = node_d;
                    } else {
                        edge_d.source = node_d;
                    }
                    commands.move_edge(model, edge_d, from, [edge_d.source, edge_d.target]);
                    set_edge_type.call(view, edge_d);
                    state = states.drag_edge;
                    break;
                }
                break;
            }
        },
        drag_node : function () {
            if (control_nodes_drag.call(this, view, model).done) {
                state = states.init;
            }
        },
        selection : function () {
            if (control_selection.call(this, view).done) {
                state = states.init;
            }
        },
        move_graph : function () {
            switch (type) {
            case 'mousemove':
                if (!mode_move()) { state = states.init; }
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
                svg_text.text(function (d) { return d.text; });
                // Change text if user hit Enter
                switch (type) {
                case 'keydown':
                    if (d3.event.keyCode === 13) {
                        commands.start().node_text(model, d_source, this.value); // FIX: should be a ref to SVG text here
                    }
                    break;
                }
                view.spring.on();
                state = states.init;
            }
        },
        edit_edge_text : function () {
            if (source === 'text') {
                // Set original text back
                svg_text.text(function (d) { return d.text; });
                // Change text if user hit Enter
                switch (type) {
                case 'keydown':
                    if (d3.event.keyCode === 13) {
                        commands.start().edge_text(model, d_source, this.value); // FIX: should be a ref to SVG text here
                    }
                    break;
                }
                view.spring.on();
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
                }
                old_view = view;
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
        // Sets event handlers for the given View
        control_view : function () {
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
            };

            return methods;
        }
    };

    return function () {
        view = this;
        model = view.model;
        if (!old_view) { old_view = view; }
        return methods;
    };

}());


