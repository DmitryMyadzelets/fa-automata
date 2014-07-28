// JSLint options:
/*jslint bitwise: true*/
/*global Uint16Array, Uint32Array*/

// This module implements properties based on typed arrays.
// Abstract methods - Has common methods and properties for other sets.
// 
// 'binary()' creates a binary property. It has methods:
//  .add(n, default) - adds 'n' elements with 'default' value.
//  .set(index, value) - sets the value of the element with given index.
//  .get(index) - returns a value of the element with given index.
// Look [http://jsperf.com/binary-arrays] for a performance test
//  
//  'indexes()' creates a property with array of Uint32. 
//  It has the same methods as the 'binary()'.
//  
//  'objects()' creates a property with array of objects. 
//  It has the same methods as the 'binary()'.


// The global variable (module) to access to the methods
this.jA = this.jA || {};


(function (module) {

    "use strict";

    //-----------------------------------------------------------------------------
    // Helper functions

    // Creates Uint16Array array with new length, copies data from source array.
    var resizeUint16Array = function (arr, len) {
        var ret = arr;
        if (len > arr.length) {
            ret = new Uint16Array(len);
            ret.set(arr);
            arr = null;
        } else if (len < arr.length) {
            ret = new Uint16Array(arr.subarray(0, len));
            arr = null;
        }
        return ret;
    };


    var getUint16ArrayBit = function (arr, i) { return !!(arr[i >> 4] & 1 << (i & 0xF)); };
    var setUint16ArrayBit = function (arr, i) { arr[i >> 4] |= 1 << (i & 0xF); };
    var clrUint16ArrayBit = function (arr, i) { arr[i >> 4] &= ~(1 << (i & 0xF)); };


    // Creates Uint32Array array with new length, copies data from source array.
    var resizeUint32Array = function (arr, len) {
        var ret = arr;
        if (len > arr.length) {
            ret = new Uint32Array(len);
            ret.set(arr);
            // arr = null;
        } else if (len < arr.length) {
            ret = new Uint32Array(arr.subarray(0, len));
            // arr = null;
        }
        return ret;
    };


    //-----------------------------------------------------------------------------
    //
    // Abstract methods and properties
    //
    //  

    // This object containes methods for derivative (children) objects.
    // Use o = Object.create(abstract_methods) to make a child object 
    // with these methods in prototype.
    // The use abstract_properties(o) to create correspondent properties of the 
    // object 'o'.
    // 
    var abstract_methods = {

        add : function (elements, func) {
            elements = this.adjust_increment(elements);
            var i = this.length;
            this.length += elements;
            if (func) {
                while (i < this.length) {
                    func(i);
                    i += 1;
                }
            }
            return this;
        },


        set : function (index, func) {
            if (index >= 0 && index < this.length && func) { func(index); }
            return this;
        },


        get : function (index, func) {
            if (index >= 0 && index < this.length && func) { func(index); }
            return this;
        },


        // Check and change 'elements' if it is of a wrong size
        adjust_increment : function (elements) {
            elements = elements || 1;
            var len = this.length + elements;
            if (len < 0) { elements -= len; }
            return elements;
        }
    };



    var abstract_properties = function (o) {
        o = o || {};
        o.length = 0;
        return o;
    };



    //-----------------------------------------------------------------------------
    //
    // Binary array methods and properties.
    // Binary values (bits) are stored in the Uint16Array.
    // 



    // This object contains methods for a child object of the binary set.
    var binary_methods = Object.create(abstract_methods);



    // Changes size of the array for the given number of binary elements
    binary_methods.resizeArray = function (length) {
        length = 1 + (length >> 4);
        if (length !== this.array.length) {
            this.array = resizeUint16Array(this.array, length);
        }
    };



    // Overrides the 'add' method of the basic set in order to store binary values 
    // in the Uint16Array array.
    // 'elements' [optional] - number of elements to add \ remove (if negative).
    // 'value' [optional] - value for new elements.
    // Returns the object itself.
    binary_methods.add = function (elements, value) {
        var self = this;

        // Check and change 'elements' if it is of a wrong size
        elements = abstract_methods.adjust_increment.call(this, elements);

        // Adjust array size for new elements
        this.resizeArray(this.length + elements);

        // Call abstract 'add' method
        // We skip setting value if the default value is undefined. 
        // This will make the creation faster.
        var forEach = value === undefined ? null : function (index) {
            self.set(index, value);
        };
        abstract_methods.add.call(this, elements, forEach);
        return this;
    };



    // Sets binary value for an element with the given index
    binary_methods.set = function (index, value) {
        var self = this;
        abstract_methods.set.call(this, index, function () {
            if (value) {
                setUint16ArrayBit(self.array, index);
            } else {
                clrUint16ArrayBit(self.array, index);
            }
        });
        return this;
    };



    // Gets binary value of the element with the given index
    binary_methods.get = function (index) {
        var self = this;
        var value;
        abstract_methods.get.call(this, index, function () {
            value = getUint16ArrayBit(self.array, index);
        });
        return value;
    };



    // Creates properties of the binary object
    var binary_properties = function (o) {
        o = o || {};
        o.array = new Uint16Array(1);
        return o;
    };



    // Returns new binary set object
    var binary = function () {
        var o = Object.create(binary_methods);
        abstract_properties(o);
        binary_properties(o);
        return o;
    };



    //-----------------------------------------------------------------------------
    //
    // Indexes array methods and properties
    //
    //



    var indexes_methods = Object.create(abstract_methods);


    indexes_methods.INCREMENT = 10; // size of increment


    // Changes size of the array for the given number of elements
    indexes_methods.resizeArray = function (length) {
        // Length is 'n' times of INCREMENT, where n := [1..N)
        length = this.INCREMENT + this.INCREMENT * ((length - 1) / this.INCREMENT | 0);
        if (length !== this.array.length) {
            this.array = resizeUint32Array(this.array, length);
        }
    };



    // Overrides the 'add' method of the abstract set in order to store values .
    // 'elements' [optional] - number of elements to add \ remove (if negative).
    // 'value' [optional] - value for new elements.
    // Returns the object itself.
    indexes_methods.add = function (elements, value) {
        var self = this;

        // Check and change 'elements' if it is of a wrong size
        elements = abstract_methods.adjust_increment.call(this, elements);

        // Adjust array size for new elements
        this.resizeArray(this.length + elements);

        // Call abstract 'add' method
        // We skip setting value if the default value is undefined. 
        // This will make the creation faster.
        var forEach = value === undefined ? null : function (index) {
            self.set(index, value);
        };
        abstract_methods.add.call(this, elements, forEach);
        return this;
    };



    // Sets value for an element with the given index
    indexes_methods.set = function (index, value) {
        var self = this;
        abstract_methods.set.call(this, index, function () {
            self.array[index] = value;
        });
        return this;
    };



    // Gets value of the element with the given index
    indexes_methods.get = function (index) {
        var self = this;
        var value;
        abstract_methods.get.call(this, index, function () {
            value = self.array[index];
        });
        return value;
    };



    // Creates properties of the object
    var indexes_properties = function (o) {
        o = o || {};
        o.array = new Uint32Array(indexes_methods.INCREMENT);
        return o;
    };



    // Returns new indexes object
    var indexes = function () {
        var o = Object.create(indexes_methods);
        abstract_properties(o);
        indexes_properties(o);
        return o;
    };



    //-----------------------------------------------------------------------------
    //
    // Object array methods and properties
    //
    //



    var objects_methods = Object.create(abstract_methods);



    objects_methods.add = function (elements, value) {
        var self = this;

        // Check and change 'elements' if it is of a wrong size
        elements = abstract_methods.adjust_increment.call(this, elements);

        // Delete elements in case of negative increment
        if (elements < 0) {
            this.array.splice(this.length + elements);
        } else {
            this.array.length += elements;
        }

        // Call abstract 'add' method
        var forEach = value === undefined ? null : function (index) {
            self.set(index, value);
        };
        abstract_methods.add.call(this, elements, forEach);
        return this;
    };



    // Sets value for an element with the given index
    objects_methods.set = function (index, value) {
        var self = this;
        abstract_methods.set.call(this, index, function () {
            self.array[index] = value;
        });
        return this;
    };



    // Gets value of the element with the given index
    objects_methods.get = function (index) {
        var self = this;
        var value;
        abstract_methods.get.call(this, index, function () {
            value = self.array[index];
        });
        return value;
    };



    // Creates properties of the object
    var objects_properties = function (o) {
        o = o || {};
        o.array = [];
        return o;
    };



    // Returns new property of array of objects
    var objects = function () {
        var o = Object.create(objects_methods);
        abstract_properties(o);
        objects_properties(o);
        return o;
    };



    //-----------------------------------------------------------------------------
    // 
    // Public:
    // 
    module.uniproperties = {
        binary : binary,
        indexes : indexes,
        objects : objects
    };

    // Shortcut to create binary arrays
    module.binary = binary;


}(this.jA));


//
// This module implements a complex property based on arrays of the same size.
// Call 'indexed_property' function to create this property.
// The property can contain arrays of 3 types: binary, objects and indexes (uint32).
// 
// How to create the property:
// o = indexed_property({
//      name : 'objects', 
//      index : 'indexes', 
//      marked : 'binary'
// })
// 
// How to add new elements:
// o.add() - adds 1 element
// o.add(3) - adds 3 elements
// o.add(-1) - removes 1 element
// 
// How to write values:
// o.set(0).name('Alex')
// o.set(0).index(123)
// o.set(1).marked(true)
// or in chain:
// o.set(2).name('Bob').index(567)
// 
// How to read values:
// o(0).name // 'Alex'
// o(1).marked // true
// v = o(2)
// v.name // 'Bob'
// v.index // 567
// v.marked // false
// 
// How many elements in it:
// o.cardinality()



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


        // Creates methods for object 'o' to write values to arrays
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
                if (t.q === q) { func(t, i); }
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
            // Maximal index of ingoing nodes (property 'p') to make array 
            // of a correspondent size
            var max_p = max(o, 'p');
            var visited = module.binary().add(max_p + 1).set(start, true);

            var edge = function (t, index) {
                // Invoke callback function, and interrupt search if it returns 'true'
                if (func(t, index)) { return; }
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


