
// The global variable (module) to access to the methods
this.jA = this.jA || {};


(function (module) {

    "use strict";


    // For each edge outgoing from the node 'q' invokes 'func' with the edge object
    var out = function (o, q, func) {
        if (typeof func === 'function') {
            var i = o.cardinality();
            var t;
            while (i--) {
                t = o(i); // transition object
                if (t.q === q) { func(t); }
            }
        }
    };



    // Returns maximal value of the 'o[key]' array property
    var max = function (o, key) {
        var v = 0;
        var i = o.cardinality();
        while (i--) {
            if (o(i)[key] > v) { v = o(i)[key]; }
        }
        return v;
    };



    // Depth-first search over transitions
    var dfs = function (o, start, func) {
        if (typeof func === 'function') {
            var max_p = max(o, 'p'); // Maximal index of ingoing nodes (property 'p')
            var visited = module.binary().add(max_p + 1).set(start, true);

            var edge = function (t) {
                if (func(t)) { return; } // interrupt seach
                if (!visited.get(t.p)) {
                    visited.set(t.p, true);
                    out(o, t.p, edge);
                }
            };

            out(o, start, edge);
        }
    };



    // Creates and returns a 'Transitions' object
    var transitions = function () {
        var o = module.indexed_property({
            q : 'indexes', // Outgoing node (state) index
            e : 'indexes', // Edge (event) index
            p : 'indexes', // Ingoing node (state) index
        });



        o.out = function (q, func) {
            return out(o, q, func);
        };



        o.dfs = function (start, func) {
            return dfs(o, start, func);
        };


        return o;
    };



    //-----------------------------------------------------------------------------
    // 
    // Public:
    //
    //

    module.transitions = transitions;


}(this.jA));