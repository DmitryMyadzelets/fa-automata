//
// This module implements 'edges/transitions' function to create set of transitions, and
// methods to work with set of edges/transitions.
// 
// How to create a set of transitions:
// T = transitions()
// 
// How to add transitions:
// T.add() - adds one transition
// T.add(5) - adds five transitions
// 
// How to read transitions:
// t = T(0) - returns object 
// {
//   q - index of outgoing node/state
//   e - index of edge/event
//   p - index of ingoing node/state
// }
// 
// How to write values to transitions:
// T.set(0).q(5).e(6).p(7)
// or
// t = T.set(0)
// t.q(5)
// t.e(6)
// t.p(7)
// 
//  How to find all outgoing edges from a given node:
//  T.out(0, function (t, index) {
//    t.q // we can read values
//    T.set(index).q(8) // we can write values
//  })



(function (module) {

    "use strict";



    // Returns maximal value of the 'o[key]' array property
    var max = function (o, key) {
        var v = 0;
        var i = o.cardinality();
        while (i--) {
            if (o(i)[key] > v) { v = o(i)[key]; }
        }
        return v;
    };



    // Creates and returns a 'Transitions' object
    var transitions = function () {
        var o = module.indexed_property({
            q : 'indexes', // Outgoing node (state) index
            e : 'indexes', // Edge (event) index
            p : 'indexes', // Ingoing node (state) index
        });



        o.out = function (q, func) {
            return module.out(o, q, func);
        };


        return o;
    };



    //-----------------------------------------------------------------------------
    // 
    // Public:
    //
    //

    module.transitions = transitions;


    // For each edge outgoing from the node 'q' invokes 'func' with the edge object
    module.out = function (o, q, func) {
        if (typeof func === 'function') {
            var i = o.cardinality();
            var t;
            while (i--) {
                t = o(i); // transition object
                if (t.q === q) { func(t, i); }
            }
        }
    };



    // Depth-first search over transitions
    module.dfs = function (transitions, start, func) {
        if (typeof func === 'function') {
            // Maximal index of ingoing nodes (property 'p') to make array 
            // of a correspondent size
            var max_p = max(transitions, 'p');
            var visited = module.binary().add(max_p + 1).set(start, true);

            var edge = function (t, index) {
                // Invoke callback function, and interrupt search if it returns 'true'
                if (func(t, index)) { return; }
                if (!visited.get(t.p)) {
                    visited.set(t.p, true);
                    module.out(transitions, t.p, edge);
                }
            };

            module.out(transitions, start, edge);
        }
    };



}(this.jA));


