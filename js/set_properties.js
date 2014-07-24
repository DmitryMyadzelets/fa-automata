
// The global variable (module) to access to the methods
this.jA = this.jA || {};


(function (module) {

    "use strict";


    var indexed_property = function (array_properties) {

        var cardinality = 0;
        var arrays = array_properties;
        var o = {};


        var func = function (index, func) {
            if (index >= 0 && index < cardinality) {
                var key;
                for (key in arrays) {
                    if (arrays.hasOwnProperty(key)) {
                        o[key] = arrays[key].get(index);
                    }
                }
                if (typeof func === 'function') { func(o); }
                return o;
            }
            return null;
        };


        func.cardinality = function () { return cardinality; };


        // Adds 'n' elements to the set, i.e. adds 'n' elements to 
        // the properties' arrays
        func.add = function (n) {
            var key;
            for (key in arrays) {
                if (arrays.hasOwnProperty(key)) {
                    arrays[key].add(n);
                }
            }
            // Make cardinality value equal to the first array's length
            for (key in arrays) {
                if (arrays.hasOwnProperty(key)) {
                    cardinality = arrays[key].length;
                    break;
                }
            }
            return this;
        };


        return func;
    };



    var event = indexed_property({
        // name : module.objects(),
        observable : module.binary()
    });


    event.add(10);


    event(9, function (o) {
        console.log(o);
    });


    module.event = event;



}(this.jA));
