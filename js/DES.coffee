'use strict'

# Configuration of sets

# Events
E_CONFIG = {
    labels          : 'object'
    observable      : 'boolean'
    fault           : 'boolean'
    # controllable    : 'boolean'
    modules         : 'object'
}

# States
X_CONFIG = {
    # x               : 'integer'
    # y               : 'integer'
    labels          : 'object'
    marked          : 'boolean'
    faulty          : 'boolean'
}

# Transitions
T_CONFIG = {
    transitions     : 'integer_triple'
    bends           : 'boolean'
}


###############################################################################
# 
# Set of bits - array implmentation
# 
# 
class bitArray 
    constructor : (bits) -> 
        # Privat mebers of the instance
        # 
        # 
        o = {}
        # Number of bits
        o.num_bits = if bits then bits else 0
        # Number of items in array
        o.num_items = 1 + b2i(@num_bits) 
        o.array = new Uint16Array(o.num_items)
        # Public members of the instance
        # 
        # Returns privat object if called from prototype.
        # This way we protect access to privat members by user, and
        # can access to privat members from prototype.
        @privat = () -> o if @ is bitArray.prototype

    # Prototype privat members (common for all instances)
    # 
    # 
    privat = null
    # bit to item calculation for Uint16
    b2i = (bit) -> (bit >> 4)|0
    # Risizes array its size is not small or small
    resize = (bits) ->
        len = 1|0 + b2i(bits)
        if len ^ @array.length
            if len > @array.length
                tmp = new Uint16Array(len)
                tmp.set(@array)
            else # len < arraylength
                tmp = new Uint16Array(@array.subarray(0, len))
            @array = tmp
        bits


    # Prototype public members (common for all instances)
    # 
    # 
    add : (num = 1) -> 
        privat = @privat.apply(@__proto__)
        resize.apply(privat, [privat.num_bits+=num])

    set : (i) -> 
        privat = @privat.apply(@__proto__)
        privat.array[i>>4] |= 1 << (i & 0xF) if i<privat.num_bits
        return

    clr : (i) -> 
        privat = @privat.apply(@__proto__)
        privat.array[i>>4] &= ~(1 << (i & 0xF)) if i<privat.num_bits
        return


    get : (i) -> 
        privat = @privat.apply(@__proto__)
        !!(privat.array[i>>4] & 1 << (i & 0xF)) if i<privat.num_bits

    length : () -> @privat.apply(@__proto__).num_bits



###############################################################################
# 
# Helper functions to deal with bits of Uint16Array
# 
# 

ARRAY_INCREMENT = 10|0 # size of increment


# getUint16ArrayBit = (arr, i) -> !!(arr[i>>4] & 1 << (i & 0xF))
# setUint16ArrayBit = (arr, i) -> arr[i>>4] |= 1 << (i & 0xF)
# clrUint16ArrayBit = (arr, i) -> arr[i>>4] &= ~(1 << (i & 0xF))



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
    ret = arr
    if len ^ arr.length
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
# enumUint16ArrayBit = (arr, len) ->
#     ret = []
#     i = 0
#     l = arr.length
#     while (i < l)
#         v = arr[i]
#         m = 0
#         n = i*16
#         while v and n+m < len
#             ret.push(n+m) if (v & 1)
#             v >>= 1
#             m++
#         i++
#     ret



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


# Compares two arrays
equal_arrays = (a, b) ->
    i = a.length
    return false if i != b.length
    while i-- >0
        return false if a[i] != b[i]
    return true




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



###*
 * [Optimized bubble sort (http://en.wikipedia.org/wiki/Bubble_sort). 
 * Sorts the index array instead of the array itself.]
 * @param  {[Array]} a   [Array with data]
 * @param  {[Array]} ix  [Index array to be sorted]
 * @param  {[int]} len [Length of the index array]
 ###
sortIndexArray = (a, ix, len) ->
    n = len
    while n
        m = 0
        j = 0
        i = 1
        while i<n
            if a[ix[j]] > a[ix[i]]
                temp = ix[j]
                ix[j] = ix[i]
                ix[i] = temp
                m = i
            j = i
            i++
        n = m
    return



###############################################################################

# BINARY_SUBSET = () -> 
#     arr = new Uint16Array(1)
#     self = @
#     o = () -> enumUint16ArrayBit(arr, self.size())
#     o.get = (i) -> getUint16ArrayBit(arr, i) if i < self.size()
#     o.set = (i) -> setUint16ArrayBit(arr, i) if i < self.size(); self
#     o.clr = (i) -> clrUint16ArrayBit(arr, i) if i < self.size(); self
#     # Works only when called by a parent, not user
#     o.add = () -> 
#         if @ == self
#             if (arr.length<<4) <= self.size()
#                 arr = resizeUint16Array(arr, arr.length+1)
#         null
#     o



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
                arr = resizeUint16Array(arr, self.size() + ARRAY_INCREMENT)
        null
    o



TRIPLE_SUBSET = () ->
    arr = new Uint32Array(ARRAY_INCREMENT*3)
    # Array of indexes of transitions, sorted wrt 'from' state
    # 'tix' points to 'arr'
    tix = new Uint32Array(ARRAY_INCREMENT)
    # Sorted list of nodes. 'nix' points to 'tix'
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
                arr = resizeTripleArray(arr, self.size() + ARRAY_INCREMENT)
                tix = resizeUint32Array(tix, self.size() + ARRAY_INCREMENT)
        null

    o.sort = () ->
        # Reset array of sorted transitions
        return sorted if sorted
        i = self.size()
        tix[i] = i*3|0 while i-- >0
        # Sort transitions
        sortIndexArray(arr, tix, self.size())
        sorted = true


    # Returns the maximal state stored in transition triples
    o.max_state = () ->
        i = 3*self.size()|0
        max = -1
        while i-- >0
            max = arr[i] if arr[i] > max
            i-=2
            max = arr[i] if arr[i] > max
        max


    # Returns array of indexes of 'q' for triples (q, e, p) in transitions
    # if 'q' matches
    o.out = (q) ->
        ret = []
        i = 3*self.size()|0
        i-=3 # Index of 'q' in the last triple
        while i >=0
            ret.push((i/3)|0) if arr[i] == q
            i-=3
        ret


    # Breadth-First Search
    # start - initial state
    o.bfs = (start, fnc) ->
        o.sort()
        has_callback = typeof fnc == 'function'

        # Maximal state index
        max = o.max_state()
        visited = new bitArray(1+max)
        visited.set(start)

        stack = [start]

        while stack.length
            q = stack.pop()
            # array of transitions' indexes with 'q' out state
            ii = o.out(q) #TODO : improve the speed
            for i in ii
                t = o.get(i) #TODO : improve the speed
                e = t[1]
                p = t[2]
                if !visited.get(p)
                    visited.set(p)
                    stack.push(p)
                fnc(q, e, p) if has_callback

        visited = null
        return



    # Depth-First Search
    # start - initial state
    # callback_before - called before successor states processed
    # callback_after - called after successor states processed
    o.dfs = (start, callback_before, callback_after) ->
        o.sort()
        has_callback_b = typeof callback_before == 'function'
        has_callback_a = typeof callback_after == 'function'
        visited = new bitArray(1 + o.max_state())

        process_state = (q) ->
            visited.set(q)
            # array of transitions' indexes with 'q' out state
            ii = o.out(q) #TODO : improve the speed
            for i in ii
                t = o.get(i) #TODO : improve the speed
                e = t[1]
                p = t[2]
                callback_before(q, e, p) if has_callback_b
                process_state(p) if !visited.get(p)
                callback_after(q, e, p) if has_callback_a
            return

        process_state(start)

        visited = null
        return



    # Returns array of states reachable from state 'start', 
    # by events not in 'events' array
    o.reach = (start, events) ->
        stack = [start]
        reach = [start]
        while stack.length
            q = stack.pop()
            ii = o.out(q)
            for i in ii
                t = o.get(i)
                e = t[1]
                p = t[2]
                if e not in events
                    if p not in reach
                        stack.push(p)
                        reach.push(p)
        reach.sort()


    # Makes a projection to 'events'
    o.projection = (start, events, callback) ->
        has_callback = typeof callback == 'function'
        # Initial reachable set of states
        reach = o.reach(start, events)
        # 
        stack = [reach]
        states = [reach]
        # Indexes of states in the projection
        qix = 0 # from
        pix = 0 # to
        # Returns index of state in 'states', -1 otherwise
        in_states = (state) ->
            i = states.length
            while --i >=0
                break if equal_arrays(states[i], state)
            i
        # 
        while stack.length
            reach = stack.pop()
            qix = in_states(reach)
            # Check every single state in the set of states
            for q in reach
                # Indexes of transitions from the state
                ii = o.out(q)
                for i in ii
                    t = o.get(i)
                    # Event and next state of the transition
                    e = t[1]
                    p = t[2]
                    continue if e not in events
                    # Do this only if 'e' in 'events', since
                    # it will result in the same set of states
                    next = o.reach(p, events)
                    # Check if 'next' is in 'states' already
                    ix = in_states(next)
                    if ix < 0
                        pix = states.length
                        stack.push(next)
                        states.push(next)
                    else
                        pix = ix
                    callback(qix, e, pix, reach, next) if has_callback
            qix++
        states



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
    o.add = (n=1) ->
        # @[key].add.apply(@) for key of config
        @[key].add() for key of config
        size++

    for key of config
        switch config[key]
            when 'boolean'
                # o[key] = BINARY_SUBSET.apply(o)
                o[key] = new bitArray()
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

    modules : []

    make_module_from_T : (T, name) ->
        module = {
            T : T
            X : create_general_set(X_CONFIG)
        }
        module.name = name
        # Add states from information of transitions
        i = 1 + T.transitions.max_state()
        module.X.add() while i-- >0
        # Inital state
        module.X.start = 0
        module
    
    create_module : (name) ->
        module = @make_module_from_T(create_general_set(T_CONFIG), name)
        @modules.push(module)
        module

    # Breadth-First Search
    # Calls the callback function 'fnc' at each transition
    BFS : (module, callback) -> module.T.transitions.bfs(module.X.start, callback)

    # Depth-First Search
    # Calls the callback functions at each transition,
    # before and after the successor state processed
    DFS : (module, before, after) -> 
        module.T.transitions.dfs(module.X.start, before, after)

    # Returns a projection of the module (set of transitions only)
    # Events which are not in 'events' are replaced with '0'
    # Projection : (module, events) -> 
    #     T = create_general_set(T_CONFIG)
    #     @BFS(module, (q, e, p) ->
    #         e = 0 if events.indexOf(e) < 0
    #         T.transitions.set(T.add(), q, e, p)
    #         )
    #     T

}


@DES = DES

    
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


# # Events
# # 
# e = DES.E # just shortcut
# # Add new event and set its labels
# e.labels.set(e.add(), 'open')
# # Add another event
# e.labels.set(i = e.add(), 'close')
# # The event is observable
# e.observable.set(i)
# # Show events in console of your browser (Chrome)
# console.log 'Events'
# console.table(e())


# # Modules
# # 
# # Create new module
# m = DES.create_module('Motor')
# console.log 'Modules'
# console.table(DES.modules)


# # States
# # 
# # Create new state
# i = m.X.add()
# # Define values
# m.X.x.set(i, 12).y.set(i, 57).labels.set(i, 'Initial').marked.set(i)
# # Add another state and define values
# i = m.X.add()
# m.X.labels.set(i, 'NF')
# m.X.faulty.set(i, 'F')
# # 
# console.log 'States'
# console.table(m.X())
# console.log 'Marked states'
# console.table([m.X.marked()])


# # Transitions
# # 
# # Create new transition
# i = m.T.add()
# # Set transition's data (state, event, state)
# m.T.transitions.set(i, 0, 0, 1)
# i = m.T.add()
# m.T.transitions.set(i, 1, 2, 1)
# m.T.bends.set(i)
# m.T.transitions.set(m.T.add(), 1, 3, 2)
# m.T.transitions.set(m.T.add(), 0, 0, 0)


# # 
# console.log 'Transitions'
# # Raw data of transitions
# console.table(m.T.transitions())
# # Replace indexes by names
# console.table(m.T.transitions().map(
#     (v) -> {
#         from : m.X.labels.get(v[0])
#         event : DES.E.labels.get(v[1])
#         to : m.X.labels.get(v[2])
#         }
#     ))


# # Breadth-First Search
# console.log 'Breadth-First Search'
# console.log '( X E X )', m.name
# DES.BFS(m, (q, e, p) ->
#     console.log '(', q, e, p, ')'
#     )


# # Projection
# console.log 'Projection'
# m.projection = DES.Projection(m, [2, 3])
# m.projection.transitions.bfs(m.X.start, (q, e, p) ->
#     console.log '(', q, e, p, ')'
#     )


# # Reachable set of states
# console.log 'Reachable set of states. From state 0, by events not [2, 3]'
# reach = m.T.transitions.reach(0, [2, 3])
# console.log reach


# # Projection
# console.log 'Projection'
# # Create new object to store result of projection
# T = create_general_set(T_CONFIG)
# XX = [] # Array of composed states
# m.T.transitions.projection(m.X.start, [2, 3], (q, e, p, qq, pp) ->
#     T.transitions.set(T.add(), q, e, p)
#     XX[q] = qq if not XX[q]
#     XX[p] = pp if not XX[p]
#     # console.log q, e, p, qq, pp
#     )
# # States of each transition in T have mapping to non-determenistic member of XX
# m = DES.make_module_from_T(T)
# console.log '( X E X )'
# DES.BFS(m, (q, e, p) ->
#     console.log '(', q, e, p, ')'
#     )
# console.log 'Projection with mapped states'
# DES.BFS(m, (q, e, p) ->
#     console.log '(', XX[q], e, XX[p], ')'
#     )



# serialize = () ->
#     modules = []
#     for module in DES.modules
#         m = {}
#         m.name = module.name
#         m.T = module.T()
#         m.X = module.X()
#         modules.push(m)
#     JSON.stringify(modules)



# deserialize = (str) ->
#     # Delete modules of DES
#     i = DES.modules.length
#     while i-- >0
#         delete DES.modules[i]
#         DES.modules[i] = null
#     DES.modules.length = 0
#     # 
#     o = JSON.parse(str)
#     i = o.length
#     while i-- >0
#         m = o[i]
#         module = DES.create_module(m.name)
#         # 
#         T = m.T.length
#         for T in m.T
#             ix = module.T.add()
#             module.T.bends.set(ix, T.bends)
#             module.T.transitions.set(ix, 
#                 T.transitions[0], T.transitions[1], T.transitions[2])
        
#         # 
#         console.log m.X
#         X = m.X.length
#         for X in m.X
#             ix = module.X.add()
#             module.X.x.set(ix, X.x)
#             module.X.y.set(ix, X.y)
#             module.X.labels.set(ix, X.labels)
#             module.X.marked.set(ix) if X.marked
#             module.X.faulty.set(ix) if X.faulty
#     null




# o = {
#     name : m.name
#     T : {
#         transitions : m.T.transitions()
#     }
# }

# str = serialize()
# deserialize(str)


# for m in DES.modules
#     console.log '( X E X )', m.name
#     DES.BFS(m, (q, e, p) ->
#         console.log '(', q, e, p, ')'
#         )
#     # 
#     console.log 'States'
#     console.table(m.X())
#     console.log 'Marked states'
#     console.table([m.X.marked()])


# console.table(m.T.transitions().map(
#     (v) -> {
#         from : m.X.labels.get(v[0])
#         event : DES.E.labels.get(v[1])
#         to : m.X.labels.get(v[2])
#         }
#     ))

console.clear()


# Events 
(() ->
    events = [
        { labels : 'a'}
        { labels : 'b'}
        { labels : 'c'}
        { labels : 'd'}
        { labels : 'e'}
        { labels : 'f',  fault: true }
        { labels : 'o1',  observable: true }
        { labels : 'o2',  observable: true }
    ]
    # 
    E = DES.E
    for e in events
        i = E.add()
        for key of e
            E[key].set(i, e[key])
    #

)()




# Helper function
get_event_by_labels = (labels) ->
    i = DES.E.size()
    while i-- >0
        break if DES.E.labels.get(i) == labels
    i

set_transitions = (m, transitions) ->
    for t in transitions
        if (eid = get_event_by_labels(t[1])) >= 0
            m.T.transitions.set(m.T.add(), t[0], eid, t[2])
        else
            console.log 'Error:', t[1], 'labels not found'
    # Define states
    i = 1 + m.T.transitions.max_state()
    m.X.add() while i-- >0
    null


show_events = () ->
    console.log 'Events' 
    console.table(DES.E())


show_states = (m) ->
    console.log 'States of module', m.name
    console.table(m.X())


show_transitions = (m) ->
    console.log 'Transitions of module', m.name
    # Raw data of transitions
    # console.table(m.T.transitions())
    # Replace indexes by names
    console.table(m.T.transitions().map(
        (v) -> {
            from : v[0] # m.X.labels.get(v[0])
            event : DES.E.labels.get(v[1])
            to : v[2]# m.X.labels.get(v[2])
            }
        ))


show_modules_transitions = () ->
    for m in DES.modules
        show_transitions(m)
    return



show_dfs = (m) ->
    console.log 'Depth-First Search of module', m.name
    DES.DFS(m 
    # m.T.transitions.dfs(, 
        (q, e, p)->
        # if m.X.in_nonfaulty.get(q) and m.X.in_nonfaulty.get(p)
            console.log q, DES.E.labels.get(e), p
        )
    return



# Transitions
transitions = [
    [0, 'f', 1]
    [1, 'a', 2]
    [2, 'o1', 3]
    [3, 'b', 4]
    [4, 'c', 4]
    [0, 'o1', 5]
    [5, 'c', 5]
]
m = DES.create_module('G1')
set_transitions(m, transitions)

transitions = [
    [0, 'a', 1]
    [1, 'd', 2]
    [2, 'c', 2]
    [0, 'c', 0]
]
m = DES.create_module('G2')
set_transitions(m, transitions)

transitions = [
    [0, 'b', 1]
    [1, 'e', 2]
    [2, 'c', 2]
    [0, 'c', 0]
]
m = DES.create_module('G3 Valve')
set_transitions(m, transitions)

transitions = [
    [0, 'e', 1]
    [1, 'o2', 2]
    [2, 'd', 3]
    [3, 'c', 3]
    [0, 'c', 0]
]
m = DES.create_module('G4 Motor')
set_transitions(m, transitions)

# This module is for partitioning to [non]faulty sublanguage
transitions = [
    [0, 'a', 1]
    [1, 'b', 2]
    [2, 'c', 2]
    [2, 'f', 1]
    [0, 'b', 3]
]
m = DES.create_module('[Non]faulty')
set_transitions(m, transitions)


# For each event define which modules use it
(() ->
    for m, index in DES.modules
        i = m.T.size()
        while i-- >0
            t = m.T.transitions.get(i)
            eid = t[1]
            modules = DES.E.modules.get(eid)
            modules = [] if not modules
            if index not in modules
                modules.push(index)
                DES.E.modules.set(eid, modules)
    )()
        

# console.log 'Events with modules'
# console.table(E())


# 
# Returns module such that it has determenistic faulty information w.r.t states
# 
make_NF_module = (m) ->
    tt = m.T.transitions # caching
    # Two arrays act as a set of tuples (state, fault)
    map = [] # Indexes of original states
    flt = [] # Flags of faulty
    

    T = create_general_set(T_CONFIG) # Transitions for new module
    M = DES.make_module_from_T(T, 'NF('+m.name+')') # Extended module

    in_map = (q, fault) ->
        i = map.length
        while i-- >0
            break if (map[i] == q) and (flt[i] == fault)
        i

    to_map = (q, fault) ->
        map.push(q)
        flt.push(fault)
        # Add states
        x = M.X.add()
        M.X.faulty.set(x) if fault
        # 
        map.length-1

    process_state = (q, fault) ->
        qq = to_map(q, fault) # index of new state
        fault = true if m.X.faulty.get(q)
        ii = tt.out(q) #TODO : improve the speed
        for i in ii
            t = tt.get(i) #TODO : improve the speed
            e = t[1]
            p = t[2]
            f = fault or DES.E.fault.get(e)
            pp = in_map(p, f)
            pp = process_state(p, f) if pp<0
            # 
            T.transitions.set(T.add(), qq, e, pp)
        qq

    process_state(m.X.start, false)
    return M



make_N_module = (m) ->
    tt = m.T.transitions # caching
    T = create_general_set(T_CONFIG)
    M = DES.make_module_from_T(T, 'N('+m.name+')')
    map = []

    in_map = (q) ->
        i = map.length
        while i-- >0
            break if map[i] == q
        i

    to_map = (q) ->
        map.push(q)
        x = M.X.add()
        map.length-1

    process_state = (q) ->
        qq = to_map(q)
        ii = tt.out(q) #TODO : improve the speed
        for i in ii
            t = tt.get(i) #TODO : improve the speed
            e = t[1]
            p = t[2]
            continue if DES.E.fault.get(e) or m.X.faulty.get(p)
            pp = in_map(p)
            pp = process_state(p) if pp<0
            T.transitions.set(T.add(), qq, e, pp)
        qq

    process_state(m.X.start)
    return M



make_F_module = (m) ->

    T = create_general_set(T_CONFIG) # Transitions for new module
    M = DES.make_module_from_T(T, 'F('+m.name+')') # Extended module

    map = [] # Indexes of original states
    faulty = new bitArray(m.X.size())

    in_map = (q) ->
        i = map.length
        while i-- >0
            break if (map[i] == q)
        i

    DES.DFS(m
        (q, e, p) ->
            # Record states reachable by fault
            if !faulty.get(p) and (m.X.faulty.get(q) or DES.E.fault.get(e))
                faulty.set(p)
                map.push(p)
                M.X.faulty.set(M.X.add())
            null
                
        (q, e, p) ->
            # Record states co-reachable to fault
            if !faulty.get(q) and faulty.get(p)
                faulty.set(q)
                map.push(q)
                M.X.add()
            null
        )

    DES.DFS(m
        (q, e, p) ->
            if faulty.get(p)
                T.transitions.set(T.add(), in_map(q), e, in_map(p))
        )

    M.X.start = in_map(m.X.start)
    return M



# Returns faulty projection
faulty_projection = (m, events) ->
    T = create_general_set(T_CONFIG)
    # Get transitons only of faulty language
    DES.BFS(m, (q, e, p) ->
        T.transitions.set(T.add(), q, e, p) if m.X.in_faulty.get(p)
        )

    # Transitons of projection
    PT = create_general_set(T_CONFIG)
    P = DES.make_module_from_T(PT, 'Faulty Projection')
    # 
    T.transitions.projection(m.X.start, events,
        # 'q' and 'p' refer to new states of projection
        # 'qq' and 'pp' refer to set of original states
        (q, e, p, qq, pp) ->
            # Enumerate composed successor state
            for i in pp
                # if it least one state is in faulty language
                if m.X.in_faulty.get(i)
                    PT.transitions.set(PT.add(), q, e, p)
                    # how many states are missing
                    n = p - P.X.size() + 1
                    # add states if necessary
                    P.X.add() while n-- >0
                    # Mark state as faulty parent's state is faulty
                    P.X.faulty.set(p) if m.X.faulty.get(i)
                    break
            return
        )
    P



show_events()
# show_modules_transitions()

(()->
    m = DES.modules[DES.modules.length-1]
    nf = make_NF_module(m)
    n = make_N_module(nf)
    f = make_F_module(nf)
    # show_states(m)
    # show_dfs(nf)
    # show_states(nf)
    show_dfs(n)
    show_states(n)
    show_dfs(f)
    show_states(f)
)()



# # Projection
# visible = [6, 7]
# console.log 'Projection of module', m.name, 'to events', visible.map((e)->DES.E.labels.get(e))
# # Create new object to store result of projection
# T = create_general_set(T_CONFIG)
# XX = [] # Array of composed states
# m.T.transitions.projection(m.X.start, visible, (q, e, p, qq, pp) ->
#     T.transitions.set(T.add(), q, e, p)
#     XX[q] = qq if not XX[q]
#     XX[p] = pp if not XX[p]
#     # console.log q, e, p, qq, pp
#     )
# # States of each transition in T have mapping to non-determenistic member of XX
# m = DES.make_module_from_T(T)
# console.log '( X E X )'
# DES.BFS(m, (q, e, p) ->
#     console.log '(', q, DES.E.labels.get(e), p, ')'
#     )
# console.log 'Projection with mapped states'
# DES.BFS(m, (q, e, p) ->
#     console.log XX[q], DES.E.labels.get(e), XX[p]
#     )

