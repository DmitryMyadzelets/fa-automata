'use strict'


DES = {
    E : {
        size : 0
        label : []
        observable : []
        controllable : []
    }
    modules : [
        # Module G1
        {
            X : {
                start : 0
                size : 0
                x : []
                y : []
                label : []
                marked : []
                faulty : []
            },
            T : {
                size : 0
                sorted : true/false 
            }
        }
        # Module G2
        {
            X : {}
            T : {}
        }
    ]
    
    create_module : () ->
}
        
# Keep configuration of sets and subsets! You can use it to distinguish arrays!
E_CONFIG = {
    label           : 'object'
    observable      : 'boolean'
    controllable    : 'boolean'
}

X_CONFIG = {
    x               : 'integer'
    y               : 'integer'
    label           : 'object'
    marked          : 'boolean'
    faulty          : 'boolean'
}

T_CONFIG = {
    trans           : 'integer_triple'
    bends           : 'boolean'
}

###############################################################################
# 
# Helper functions to deal with bits of Uint16Array
# 
# 
getUint16ArrayBit = (arr, i) -> !!(arr[i>>4] & 1 << (i & 0xF))
setUint16ArrayBit = (arr, i) -> arr[i>>4] |= 1 << (i & 0xF)
clrUint16ArrayBit = (arr, i) -> arr[i>>4] &= ~(1 << (i & 0xF))



# Creates Uint16Array array with new length, copies data from source array.
# Don't foget to delete the source array, if necessary!
resizeUint16Array = (arr, len) ->
    if len > arr.length
        ret = new Uint16Array(len)
        ret.set(arr)
    else # len < arr.length
        ret = new Uint16Array(arr.subarray(0, len))
    ret


# Delets a bit of the array and puts the last bit to the vacant position
delUint16ArrayBit = (arr, i, bits_len) ->
    bits_len -= 1 # Index of the last element
    if i != bits_len # Do only if it makes sense
        if getUint16ArrayBit(arr, bits_len)
            setUint16ArrayBit(arr, i)
        else
            clrUint16ArrayBit(arr, i)
    bits_len # Return new size of the array (always old length -1)



# Returns an array of indexs of the array wich are true
enumUint16ArrayBit = (arr, len) ->
    ret = []
    i = 0
    l = arr.length
    while (i < l)
        v = arr[i]
        m = 0
        n = i*16
        while v and n+m < len
            ret.push(n+m) if (v & 1)
            v >>= 1
            m++
        i++
    ret


###############################################################################
# 
# Helper functions to deal with integers of Uint16Array
# 
# 

DELTA_UINT_ARRAY = 10|0 # size of increment
# Adds a new element (no value) to the end of array; resizes array if necessary
addUint16ArrayValue = (arr, old_len) ->
    len = old_len +1
    if len >= arr.length
        arr = resizeUint16Array(arr, len)
    len



###############################################################################

BINARY_SUBSET = () -> 
    arr = new Uint16Array(1)
    self = @
    o = () -> enumUint16ArrayBit(arr, self.size())
    o.get = (i) -> getUint16ArrayBit(arr, i) if i < self.size()
    o.set = (i) -> setUint16ArrayBit(arr, i) if i < self.size()
    o.clr = (i) -> clrUint16ArrayBit(arr, i) if i < self.size()
    # Works only when called by a parent, not user
    o.add = () -> 
        if @ == self
            if (arr.length<<4) <= self.size()
                arr = resizeUint16Array(arr, arr.length+1)
        null
    o



OBJECT_SUBSET = () ->
    arr = []
    self = @
    o = () -> null
    o.get = (i) -> arr[i] if i < self.size()
    o.set = (i, v) -> arr[i] = v if i < self.size()
    o.add = () -> arr.push(null) if @ == self
    o



NUMBER_SUBSET = () ->
    arr = new Uint16Array(1)
    self = @
    o = () ->
    o.get = (i) -> arr[i] if i < self.size()
    o.set = (i, v) -> arr[i] = v if i < self.size()
    o.add = () -> addUint16ArrayValue(arr, self.size()) if @ == self
    o



###############################################################################

create_general_set = (config) ->
    size = 0
    config = config


    # Returns array of objects
    o = () ->
        if arguments.length and 'number' is typeof (i = arguments[0]|0)
            obj = {}
            obj[key] = o[key].get(i) for key of config
            return obj

        ret = []
        i = size
        while i--
            obj = {}
            obj[key] = o[key].get(i) for key of config
            ret[i] = obj
        ret


    o.size = () -> size
    o.add = () ->
        @[key].add.apply(@) for key of config
        size++

    for key of config
        switch config[key]
            when 'boolean'
                o[key] = BINARY_SUBSET.apply(o)
            when 'integer'
                o[key] = new Uint16Array(1)
            when 'object'
                o[key] = OBJECT_SUBSET.apply(o)
            when 'integer_triple'
                null
    o



# DES.foo = () ->
#     G1
#     G2

#     DES.E.label.set(i, 'open valve')
    
#     # Methods of the object
#     i = G.X.add()
#     G.X.set(i, {x:87, y:15, label:'NF'}) 
#     # Methods of arrays
#     G.X.x.set(i, 87)
#     G.X.y.set(i, 15)
#     G.X.label.set(i, 'NF')
#     G.X.marked.set(i)
#     G.X.faulty.clr(i)
    
    
#     # Search for a value
#     idx = -1 
#     G.X.x.enumerate((i, x) ->
#         if x > 100
#             idx = i
#             return false
#         true
#     )
    
    
#     G.X()
#     G.X.marked()
#     G.X.marked.set(1, 5, 4)


console.clear()

o = create_general_set(E_CONFIG)

i = 33
while i--
    o.add()

o.observable.set(0)
o.controllable.set(32)
o.label.set(0, 'test')

console.log o.size(), o.observable(), o.controllable(), o.label.get(0)
console.log o(32)

