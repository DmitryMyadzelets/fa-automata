
(function (module) {

    "use strict";

    var convert = {};



    // Verifies if an object has the given properties
    function hasOwnProperties(object, properties) {
        var i = properties.length;
        while (i--) {
            if (!object.hasOwnProperty(properties[i])) { return false; }
        }
        return true;
    }


    // Returns transitions extracted from the given literal object 'o'
    // Literal Ojbect -> Transitions
    // Object has to have properties as in the framework:
    // https://github.com/hyperandroid/Automata
    convert.object2transitions = function (o) {
        var T = module.transitions();
        // Check for array property of transitions
        if (o.hasOwnProperty('transitions')) {
            var array = o.transitions;
            var i = array.length;
            var t;
            while (i--) {
                t = array[i];
                if (hasOwnProperties(t, ['event', 'from', 'to'])) {
                    T.add().set()
                        .q(t.from)
                        .e(t.event)
                        .p(t.to);
                }
            }
        }

        return T;
    };


    //-----------------------------------------------------------------------------
    // 
    // Public:
    //
    //

    module.convert = convert;



}(this.jA));


