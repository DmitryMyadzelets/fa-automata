
// JSLint options:
/*global */
"use strict";


var controller = View.prototype.controller = {};



controller.process_event = (function () {

	var self = this; // Here 'this' should refer to an instance of View
    var state;		// Reference to a current state
    var old_state;	// Reference to previous state
    var target, old_target;
    var states = {
    	init : function () {
    		target = d3.event.target;
    		if (target !== old_target) {
    			old_target = target;
    			console.log(d3.event.type, target.nodeName);
    		}
    	},
    };

    state = states.init;

    return function () {
        old_state = state;
        state.apply(this, arguments);
        if (old_state !== state) {
            // Trace current transition
            console.log('transition:', old_state._name + ' -> ' + state._name);
        }
    };
}());


