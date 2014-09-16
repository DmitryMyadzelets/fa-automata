
// JSLint options:
/*global d3, View*/
"use strict";


View.prototype.controller = {};
var controller = View.prototype.controller;


controller.source = null;


controller.process_event = (function () {

    // var self = this;    // Here 'this' should refer to an instance of View
    var state;          // Reference to a current state
    var old_state;      // Reference to a previous state
    var old_source;

    var states = {
        init : function () {
            // if (controller.source !== old_source) {
            //     old_source = controller.source;
            // }
            // console.log(d3.event.type, controller.source);
        },
    };

    state = states.init;

    return function () {
        old_state = state;
        // Set default event source in case it is not set by 'set_event' method
        controller.source = controller.source || d3.event.target.nodeName;
        state.apply(this, arguments);
        d3.event.stopPropagation();
        // Clear the source of event to prevent false process next time
        controller.source = null;
        // If there wes a transition from state to state
        if (old_state !== state) {
            // Trace current transition
            console.log('transition:', old_state._name + ' -> ' + state._name);
        }
    };
}());



// Sets source of event for the controller.
// Returns controller.process_event function for subsequent invocation
controller.element = function (element) {
    controller.source = element;
    return controller.process_event;
};


