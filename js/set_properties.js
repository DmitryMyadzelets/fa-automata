
// The global variable (module) to access to the methods
this.jA = this.jA || {};


(function (module) {

    "use strict";


    var indexed_property = function (array_properties) {

        var cardinality = 0;
        var arrays = array_properties;
        var o = {
        };

        var current_index = -1;
        var set = {}; // container for 'write' methods


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



        var k;

        var array_set = function (key) {
            return function (value) {
                arrays[key].set(current_index, value);
                return set;
            };
        };

        for (k in arrays) {
            if (arrays.hasOwnProperty(k)) {
                set[k] = array_set(k);
            }
        }


        func.set = function (index) {
            current_index = index;
            return set;
        };



        return func;
    };



    module.indexed_property = indexed_property;



}(this.jA));
