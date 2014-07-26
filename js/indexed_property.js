
// The global variable (module) to access to the methods
this.jA = this.jA || {};


(function (module) {

    "use strict";


    // Copies values from each array[index] to the object 'o'
    // i.e. o.key = arrays.key[index] for each 'key' of 'o'
    var get = function (o, arrays, index) {
        var key;
        for (key in arrays) {
            if (arrays.hasOwnProperty(key)) {
                o[key] = arrays[key].get(index);
            }
        }
    };



    // Adds 'n' elements to each array of 'arrays'
    // Returns length of the first array (assumed to be equal for the all arrays)
    // Returns 'undefined' if there is no arrays
    var add = function (arrays, n) {
        var key;
        for (key in arrays) {
            if (arrays.hasOwnProperty(key)) {
                arrays[key].add(n);
            }
        }
        // Return the first array's length
        for (key in arrays) {
            if (arrays.hasOwnProperty(key)) {
                return arrays[key].length;
            }
        }
    };



    var indexed_property = function (properties) {

        var arrays = {};
        var cardinality = 0;
        var current_index = 0;
        var o = {}; // object to return with 'get' methods
        var set_methods = {}; // container for 'write' methods


        (function () {
            var key;
            var func;
            for (key in properties) {
                if (properties.hasOwnProperty(key)) {
                    func = module.uniproperties[properties[key]];
                    if (typeof func === 'function') {
                        arrays[key] = func();
                    }
                }
            }
        }());



        var func = function (index, func) {
            if (index >= 0 && index < cardinality) {
                get(o, arrays, index);
                if (typeof func === 'function') { func(o); }
                return o;
            }
        };


        func.cardinality = function () { return cardinality; };


        // Adds 'n' elements to the set
        func.add = function (n) {
            cardinality = add(arrays, n) || 0;
            return this;
        };


        // Implements 'set(index)' prefix method for other methods
        func.set = function (index) {
            current_index = index;
            return set_methods;
        };


        // Create methods for object 'o' to write values to arrays
        (function (o) {
            var key;
            var array_set = function (key) {
                return function (value) {
                    arrays[key].set(current_index, value);
                    return o;
                };
            };

            for (key in arrays) {
                if (arrays.hasOwnProperty(key)) {
                    o[key] = array_set(key);
                }
            }
        }(set_methods));


        return func;
    };



    module.indexed_property = indexed_property;



}(this.jA));
