// JSLint options:
/*jslint bitwise: true*/
/*global Uint16Array, Uint32Array*/

// This module implements:
// Abstract Set - Has common methods and properties for other sets.
// Set of binary elements - Set of binary elements stored in Uint16Array.
// 
// 'binary_set()' creates a set of binary elements. The set has methods:
//  .add(n, default) - adds 'n' elements with 'default' value.
//  .set(index, value) - sets the value of the element with given index.
//  .get(index) - returns a value of the element with given index.
//  


// Global variable (module) for access to the methods
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
            arr = null;
        } else if (len < arr.length) {
            ret = new Uint32Array(arr.subarray(0, len));
            arr = null;
        }
        return ret;
    };


    //-----------------------------------------------------------------------------
    // Abstract Set methods and properties
    // 

    // This object containes methods for a child object of the basic set.
    // Use o = Object.create(abstract_set_methods) to make a child object 
    // with these methods in prototype.
    // The use abstract_set_properties(o) to create correspondent properties of the 
    // object 'o'.
    // 
    var abstract_set_methods = {

        add : function (elements, func) {
            elements = this.adjust_increment(elements);
            var i = this.cardinality;
            this.cardinality += elements;
            if (func) {
                while (i < this.cardinality) {
                    func(i);
                    i += 1;
                }
            }
            return this;
        },


        set : function (index, func) {
            if (index >= 0 && index < this.cardinality && func) { func(index); }
            return this;
        },


        get : function (index, func) {
            if (index >= 0 && index < this.cardinality && func) { func(index); }
            return this;
        },


        // Check and change 'elements' if it is of a wrong size
        adjust_increment : function (elements) {
            elements = elements || 1;
            var len = this.cardinality + elements;
            if (len < 0) { elements -= len; }
            return elements;
        }
    };



    var abstract_set_properties = function (o) {
        o = o || {};
        o.cardinality = 0;
        return o;
    };



    //-----------------------------------------------------------------------------
    // Binary Set methods and properties.
    // Binary values (bits) are stored in the Uint16Array.
    // 



    // This object contains methods for a child object of the binary set.
    var binary_set_methods = Object.create(abstract_set_methods);



    // Changes size of the array for the given number of binary elements
    binary_set_methods.resizeArray = function (cardinality) {
        var length = 1 + (cardinality >> 4);
        if (length !== this.array.length) {
            this.array = resizeUint16Array(this.array, length);
        }
    };


    // Overrides the 'add' method of the basic set in order to store binary values 
    // in the Uint16Array array.
    // 'elements' [optional] - number of elements to add \ remove (if negative).
    // 'value' [optional] - value for new elements.
    // Returns the object itself.
    binary_set_methods.add = function (elements, value) {
        var self = this;

        // Check and change 'elements' if it is of a wrong size
        elements = abstract_set_methods.adjust_increment.call(this, elements);

        // Adjust array size for new elements
        this.resizeArray(this.cardinality + elements);

        // Call basic method for add
        // Note: we may skip setting value if the default value is not defined. 
        // This will make the creation faster.
        var forEach = value === undefined ? null : function (index) {
            self.set(index, value);
        };
        abstract_set_methods.add.call(this, elements, forEach);
        return this;
    };



    // Sets binary value for an element with the given index
    binary_set_methods.set = function (index, value) {
        var self = this;
        abstract_set_methods.set.call(this, index, function () {
            if (value) {
                setUint16ArrayBit(self.array, index);
            } else {
                clrUint16ArrayBit(self.array, index);
            }
        });
        return this;
    };



    // Gets binary value of the elemnt with the given index
    binary_set_methods.get = function (index) {
        var self = this;
        var value = null;
        abstract_set_methods.get.call(this, index, function () {
            value = getUint16ArrayBit(self.array, index);
        });
        return value;
    };



    // Creates properties of the binary set object
    var binary_set_properties = function (o) {
        o = o || {};
        o.array = new Uint16Array(1);
        return o;
    };



    // Returns new binary set object
    var binary_set = function () {
        var o = Object.create(binary_set_methods);
        abstract_set_properties(o);
        binary_set_properties(o);
        return o;
    };



    //-----------------------------------------------------------------------------
    // 
    // Public methods:
    // 
    module.binary_set = binary_set;

}(this.jA));
