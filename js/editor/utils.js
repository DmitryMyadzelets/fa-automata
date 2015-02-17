/*jslint bitwise: true */
"use strict";

// Returns a [deep] copy of the given object
function clone(obj, deep) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var copy = obj.constructor();

    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deep ? clone(obj[key], true) : obj[key];
        }
    }
    return copy;
}



// Converts all numerical values of the object and its properties to integers
function float2int(obj) {
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            switch (typeof obj[key]) {
            case 'number':
                obj[key] |= 0;
                break;
            case 'object':
                float2int(obj[key]);
                break;
            }
        }
    }
}

// Simple observer of object's methods
// Sets a hook for the method call of the given object
function after(obj, method, hook) {
    var old = obj[method];
    if (typeof old !== 'function' || typeof hook !== 'function') {
        throw new Error('the parameters must be functions');
    }
    obj[method] = function () {
        var ret = old.apply(this, arguments);
        hook.apply(this, arguments);
        return ret;
    };
}
