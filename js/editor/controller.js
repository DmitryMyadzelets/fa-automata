
// JSLint options:
/*global d3, View*/
"use strict";


View.prototype.controller = (function () {

    var view;           // a view where current event occur
    var source;         // a SVG element where current event occur
    var type;           // type of event (copy of d3.type)

    var state;          // Reference to a current state
    var old_state;      // Reference to a previous state

    var states = {
        init : function () {
            console.log(source, type);

            // if (controller.source !== old_source) {
            //     old_source = controller.source;
            // }
            // console.log(d3.event.type, controller.source);
        },
    };

    state = states.init;

    return {
        process_event : function () {
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


