"use strict";

/*jslint bitwise: true*/
/*global Uint16Array*/



//-----------------------------------------------------------------------------
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



//-----------------------------------------------------------------------------
// Basic Set methods and properties
// 

// This object containes methods for a child object of the basic set.
// Use o = Object.create(basic_set_methods) to make a child object 
// with these methods in prototype.
// The use basic_set_properties(o) to create correspondent properties of the 
// object 'o'.
// 
var basic_set_methods = {

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



var basic_set_properties = function (o) {
    o = o || {};
    o.cardinality = 0;
    return o;
};



//-----------------------------------------------------------------------------
// Binary Set methods and properties.
// Binary values (bits) are stored in the Uint16Array.
// 



// This object contains methods for a child object of the binary set.
var binary_set_methods = Object.create(basic_set_methods);



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
// 'value' [optional] - value [0(default)\1] for new elements.
// Returns the object itself.
binary_set_methods.add = function (elements, value) {
    var self = this;

    // Check and change 'elements' if it is of a wrong size
    elements = basic_set_methods.adjust_increment.call(this, elements);

    // Adjust array size for new elements
    this.resizeArray(this.cardinality + elements);

    // Call basic method for add
    basic_set_methods.add.call(this, elements, function (index) {
        // Set value for each new element
        self.set(index, value);
    });
    return this;
};



// Sets binary value for an element with the given index
binary_set_methods.set = function (index, value) {
    var self = this;
    basic_set_methods.set.call(this, index, function () {
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
    basic_set_methods.get.call(this, index, function () {
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
    basic_set_properties(o);
    binary_set_properties(o);
    return o;
};



//-----------------------------------------------------------------------------
// Usage example:
// 
// Create new binary set object
var a = binary_set();
// Add one element (it has 'false' value by default)
a.add();
// Add some elements with 'true' value
a.add(7, true);
// Set value of the 5th element as 'false'
a.set(5, false);
// Add other 10 elements
a.add(10);

this.a = a;
