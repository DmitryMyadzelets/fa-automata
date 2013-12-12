'use strict'

# Configuration of sets

# Events
E_CONFIG = {
    label           : 'object'
    observable      : 'boolean'
    controllable    : 'boolean'
}

# States
X_CONFIG = {
    x               : 'integer'
    y               : 'integer'
    label           : 'object'
    marked          : 'boolean'
    faulty          : 'boolean'
}

# Transitions
T_CONFIG = {
    transition      : 'integer_triple'
    bends           : 'boolean'
}



###############################################################################
# 
# Helper functions to deal with bits of Uint16Array
# 
# 

ARRAY_INCREMENT = 10|0 # size of increment


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


# The same as above for Uint32Array
resizeUint32Array = (arr, len) ->
    if len > arr.length
        ret = new Uint32Array(len)
        ret.set(arr)
    else # len < arr.length
        ret = new Uint32Array(arr.subarray(0, len))
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



# Returns an array of values
enumArray = (arr, len) ->
    ret = []
    i = 0
    l = arr.length
    l = len if len < l
    while (i < l)
        ret.push(arr[i])
        i++
    ret



###############################################################################
#
# Methods for a set of triples if integers
# 
# 
resizeTripleArray = (arr, len) ->
    if len*3 > arr.length # make a bigger array
        ret = new Uint32Array(len*3)
        ret.set(arr)
    else # make a smaller array
        ret = new Uint32Array(arr.subarray(0, len*3))
    ret



# Returns an array of triples
enumTripleArray = (arr, len) ->
    ret = []
    i = 0
    l = arr.length
    l = len*3 if len*3 < l
    while (i < l)
        ret.push(arr.subarray(i, i+=3))
    ret



###############################################################################

BINARY_SUBSET = () -> 
    arr = new Uint16Array(1)
    self = @
    o = () -> enumUint16ArrayBit(arr, self.size())
    o.get = (i) -> getUint16ArrayBit(arr, i) if i < self.size()
    o.set = (i) -> setUint16ArrayBit(arr, i) if i < self.size(); self
    o.clr = (i) -> clrUint16ArrayBit(arr, i) if i < self.size(); self
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
    o = () -> enumArray(arr, self.size())
    o.get = (i) -> arr[i] if i < self.size()
    o.set = (i, v) -> arr[i] = v if i < self.size(); self
    o.add = () -> arr.push(null) if @ == self
    o



NUMBER_SUBSET = () ->
    arr = new Uint16Array(ARRAY_INCREMENT)
    self = @
    o = () -> enumArray(arr, self.size())
    o.get = (i) -> arr[i] if i < self.size()
    o.set = (i, v) -> arr[i] = v if i < self.size(); self
    o.add = () ->
        if @ == self
            if arr.length < self.size() + 1
                arr = resizeUint16Array(arr, arr.length + ARRAY_INCREMENT)
        null
    o



TRIPLE_SUBSET = () ->
    arr = new Uint32Array(ARRAY_INCREMENT*3)
    # Sorted transitions. 'tix' points to 'arr'
    tix = new Uint32Array(ARRAY_INCREMENT)
    # Sorted list of nodes. 'nix' points to 'tix'.
    nix = new Uint32Array()
    self = @
    sorted = false
    o = () -> enumTripleArray(arr, self.size())
    o.get = (i) -> arr.subarray(i*=3, i+3) if i < self.size()
    o.set = (i, q, e, p) -> 
        i *= 3
        if i < arr.length-2
            arr[i++] = q|0
            arr[i++] = e|0
            arr[i  ] = p|0
            sorted = false
        self
    o.add = () -> 
        if @ == self
            if arr.length < (self.size() + 1)*3
                arr = resizeTripleArray(arr, (self.size()+ARRAY_INCREMENT)*3)
                tix = resizeUint32Array(tix, (self.size()+ARRAY_INCREMENT))
        null
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
                o[key] = NUMBER_SUBSET.apply(o)
            when 'object'
                o[key] = OBJECT_SUBSET.apply(o)
            when 'integer_triple'
                o[key] = TRIPLE_SUBSET.apply(o)
            else
                console.log 'Uknown configuration value'
    o



###############################################################################
# 
# Discret-Event System
# 
# 
DES = {
    # Events events
    E : create_general_set(E_CONFIG)

    modules : [
        # Module G1
        # {
        #     X : {
        #         start : 0
        #         size : 0
        #         x : []
        #         y : []
        #         label : []
        #         marked : []
        #         faulty : []
        #     },
        #     T : {
        #         size : 0
        #         sorted : true/false 
        #     }
        # }
        # # Module G2
        # {
        #     X : {}
        #     T : {}
        # }
    ]
    
    create_module : (name) ->
        module = {
            name : name
            X : create_general_set(X_CONFIG)
            T : create_general_set(T_CONFIG)
        }
        @modules.push(module)
        module
}


   
    
#     # Search for a value
#     idx = -1 
#     G.X.x.enumerate((i, x) ->
#         if x > 100
#             idx = i
#             return false
#         true
#     )
    
    
#     G.X.marked.set(1, 5, 4)



###############################################################################
# 
# How to use
# 
console.clear()


# Events
# 
e = DES.E # just shortcut
# Add new event and set its label
e.label.set(e.add(), 'open')
# Add another event
e.label.set(i = e.add(), 'close')
# The event is observable
e.observable.set(i)
# Show events in console of your browser (Chrome)
console.log 'Events'
console.table(e())


# Modules
# 
# Create new module
m = DES.create_module('Motor')
console.log 'Modules'
console.table(DES.modules)


# States
# 
# Create new state
i = m.X.add()
# Define values
m.X.x.set(i, 12).y.set(i, 57).label.set(i, 'Initial').marked.set(i)
# Add another state and define values
i = m.X.add()
m.X.label.set(i, 'NF')
m.X.faulty.set(i, 'F')
# 
console.log 'States'
console.table(m.X())
console.log 'Marked states'
console.table([m.X.marked()])


# Transitions
# 
# Create new transition
i = m.T.add()
# Set transition's data (state, event, state)
m.T.transition.set(i, 0, 0, 1)
i = m.T.add()
m.T.transition.set(i, 1, 2, 1)
m.T.bends.set(i)
# 
console.log 'Transitions'
console.table(m.T.transition())