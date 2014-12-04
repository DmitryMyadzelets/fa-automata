

// Returns a [deep] copy of the given object
function clone(obj, deep) {
    if (obj === null || typeof(obj) !== 'object') {
        return obj;
    }
    var copy = obj.constructor();

    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deep ? clone(obj[key], true) : obj[key];
        }
    }
    return copy;
}



// Converts all numerical values of the object and its properties to integers
function float2int(obj) {
    for(var key in obj) {
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


