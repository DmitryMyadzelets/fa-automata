
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
                    var node = {x : mouse[0], y : mouse[1] };
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
                }
                break;
            case 'node':
                switch (type) {
                case 'mousedown':
                    d_source = d;
                    state = states.select_or_drag;
                    break;
                }
                break;
            }
        },
        select_or_drag : function () {
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
                    view.drag_edge().show(d_source);
                    state = states.drag_link;
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


    return {
        event : function () {
            if (!view) { return; }

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
            source = a_element;
            return this;
        }
    };

}());


