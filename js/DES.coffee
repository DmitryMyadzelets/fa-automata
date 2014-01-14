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



# Returns intersection of two arrays
intersection = (A, B) -> A.filter((x) -> B.indexOf(x) >= 0)



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


    # Returns array of indexes of 'q' for triples (q, e, p) in transitions
    # if 'p' matches
    o.in = (p) ->
        ret = []
        i = 3*self.size()|0
        i-=1 # Index of 'p' in the last triple
        while i >=0
            ret.push((i/3)|0) if arr[i] == p
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
                is_continue = true
                if has_callback_b
                    is_continue = !!callback_before(q, e, p) 
                process_state(p) if is_continue and !visited.get(p)
                if has_callback_a
                    is_continue &&= callback_after(q, e, p) 
                break if not is_continue
            return

        process_state(start)

        visited = null
        return



    # Returns array of states reachable from set of states 
    # by events not in 'events' array
    o.reach = (qq, events) ->
        reach = qq.slice()
        stack = []
        for q in qq
            stack.push(q)
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
        reach = o.reach([start], events)
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
        # Maps each event to array of states
        map = {}
        to_map = (e, p) ->
            if map[e]
                map[e].push(p) if p not in map[e]
            else
                map[e] = [p]
            return

        clear_map = () ->  delete map[e] for e of map; return

        # 
        while stack.length
            qq = stack.pop()
            qix = in_states(qq)
            clear_map()
            # Check every single state in the set of states
            for q in qq
                # Indexes of transitions from the state
                ii = o.out(q)
                for i in ii
                    t = o.get(i)
                    # Event and next state of the transition
                    e = t[1]
                    p = t[2]
                    continue if e not in events
                    # console.log '>', q, DES.E.labels.get(e), p
                    # Do this only if 'e' in 'events', since
                    # it will result in the same set of states
                    to_map(e, p)
            # Now we have determenistic (wrt events) map:
            # qq -> e1 -> pp
            #          -> pp
            #    -> e2 -> pp
            # Next step is to find reachable set for each event
            for e of map
                pp = o.reach(map[e], events)
                ix = in_states(pp)
                if ix < 0
                    pix = states.length
                    stack.push(pp)
                    states.push(pp)
                else
                    pix = ix
                callback(qix, e, pix, qq, pp) if has_callback

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
        @make_module_from_T(create_general_set(T_CONFIG), name)


    add_module : (name) ->
        @modules.push(module = @create_module(name))
        module


    # Breadth-First Search
    # Calls the callback function 'fnc' at each transition
    BFS : (module, callback) -> module.T.transitions.bfs(module.X.start, callback)

    # Depth-First Search
    # Calls the callback functions at each transition,
    # before and after the successor state processed
    DFS : (module, before, after) -> 
        module.T.transitions.dfs(module.X.start, before, after)

       
    # Makes parallel composition with another set of transitions
    # sync = (start, T2, start2, common, callback) ->
    sync : (m1, m2, common) ->
        T = create_general_set(T_CONFIG)
        M = DES.make_module_from_T(T, 'sync('+m1.name+','+m2.name+')')
        M.X.start = 0 # start state is always 0
        # has_callback = typeof callback == 'function'
        o = m1.T.transitions
        o2 = m2.T.transitions
        common = [] if not common
        stack = []
        # Map contains supporting triples (q1, q2), 
        # where q1 \in G1, q2 \in G2.
        map = []
        map_n = 0 # Number of items in the map
        to_map = (q1, q2) ->
            map.push(q1)
            map.push(q2)
            # Marking
            x = M.X.add()
            M.X.marked.set(x) if m1.X.marked.get(q1) or m2.X.marked.get(q2)
            # 
            stack.push(map_n++)
            map_n-1

        in_map = (q1, q2) ->
            i = 0
            n = map.length
            while i<n
                return (i|0)>>1 if map[i]==q1 and map[i+1]==q2
                i+=2
            -1

        to_map(m1.X.start, m2.X.start)

        # Adds transition to the new automaton.
        # a - state of T1, reached by event 'e'
        # b - state of T2, reached by event 'e'
        # Thus, (a, b) is the next composed state.
        add_transition = (e, a, b) ->
            # Search if the composed state is in the map
            # Calculate state 'p'
            p = to_map(a, b) if (p = in_map(a, b)) < 0
            # Note that 'q' is external w.r.t. this funcion
            # callback(q, e, p) if has_callback
            # console.log '>', q, e, p, map, e, a, b
            T.transitions.set(T.add(), q, e, p)
            return

        while stack.length
            q = stack.pop()
            q1 = map[q*2]
            q2 = map[q*2+1]

            I = o.out(q1)
            J = o2.out(q2)

            # Synchronous transition function
            # We have 5 states in BDD (binary decisision diagram) 
            # for transitions of G1 and G2:
            # 1 - none of the transition occures
            # 2 - G1 does transition, G2 doesn't
            # 3 - G2 does transition, G1 doesn't
            # 4 - G1 ang G2 do one transition together
            # 5 - G1 ang G2 do separate transitions

            for i in I
                t1 = o.get(i)
                e1 = t1[1]
                p1 = t1[2]
                if e1 not in common
                    add_transition(e1, p1, q2)
                else
                    for j in J
                        t2 = o2.get(j)
                        e2 = t2[1]
                        p2 = t2[2]
                        if e1 == e2
                            add_transition(e1, p1, p2)
            for j in J
                t2 = o2.get(j)
                e2 = t2[1]
                p2 = t2[2]
                if e2 not in common
                    add_transition(e2, q1, p2)

        return M



    intersection : (m1, m2) ->
        T = create_general_set(T_CONFIG)
        M = DES.make_module_from_T(T, 'cap('+m1.name+','+m2.name+')')
        o = m1.T.transitions
        o2 = m2.T.transitions
        o = m1.T.transitions
        o2 = m2.T.transitions
        stack = []
        # Map contains supporting triples (q1, q2), 
        # where q1 \in G1, q2 \in G2.
        map = []
        map_n = 0 # Number of items in the map
        to_map = (q1, q2) ->
            map.push(q1)
            map.push(q2)
            # Marking
            x = M.X.add()
            M.X.marked.set(x) if m1.X.marked.get(q1) or m2.X.marked.get(q2)
            # 
            stack.push(map_n++)
            map_n-1

        in_map = (q1, q2) ->
            i = 0
            n = map.length
            while i<n
                return (i|0)>>1 if map[i]==q1 and map[i+1]==q2
                i+=2
            -1

        to_map(m1.X.start, m2.X.start)

        # Adds transition to the new automaton.
        # a - state of T1, reached by event 'e'
        # b - state of T2, reached by event 'e'
        # Thus, (a, b) is the next composed state.
        add_transition = (e, a, b) ->
            # to_map(a, b)
            p = to_map(a, b) if (p = in_map(a, b)) < 0
            T.transitions.set(T.add(), q, e, p)
            # T.transitions.set(T.add(), q, e, a)
            return

        while stack.length
            q = stack.pop()
            q1 = map[q*2]
            q2 = map[q*2+1]

            I = o.out(q1)
            J = o2.out(q2)

            for i in I
                t1 = o.get(i)
                e1 = t1[1]
                p1 = t1[2]
                for j in J
                    t2 = o2.get(j)
                    e2 = t2[1]
                    p2 = t2[2]
                    if e1 == e2
                        add_transition(e1, p1, p2)

        return M


    # Performes Kleen closure on the module (marks all reachable states)
    closure : (m) ->
        @BFS(m, (q, e, p) -> m.X.marked.set(p))
        m



    # Subtracts language of module 2 from language of module 1
    subtract : (m1, m2) ->
        stack = [m2.X.start]
        @DFS(m1,
            (q, e, p) ->
                q2 = stack[stack.length-1]
                tt = m2.T.transitions.out(q2)
                # Check if transitions of m2 have the same event
                for i in tt
                    t2 = m2.T.transitions.get(i)
                    if e == t2[1]
                        q2 = t2[2]
                        stack.push(q2)
                        m1.X.marked.clr(p) if m2.X.marked.get(q2)
                        return true
                false
            (q, e, p) -> 
                stack.pop()
                false
            )
        return



    # Returns 'true' if the language of the module is empty 
    # (i.e. no reachable marked states), 'false' otherwise.
    is_empty : (m) ->
        @BFS(m, (q, e, p) ->
            return true if m.X.marked.get(p)
            )
        false



    # Returns a copy of module (not full copy, only some fields!)
    copy : (m) ->
        T = create_general_set(T_CONFIG)
        M = DES.make_module_from_T(T, m.name)
        # copy transitions
        @BFS(m, (q, e, p) -> T.transitions.set(T.add(), q, e, p))
        # copy states, and [not]marked
        n = m.X.size()
        i = 0
        while i < n
            x = M.X.add()
            M.X.marked.set(x) if m.X.marked.get(i)
            i++
        M.X.start = m.X.start
        M


}


@DES = DES


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
# m = DES.add_module('Motor')
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
#         module = DES.add_module(m.name)
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
    console.log 'Events:'
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



show_modules = () ->
    console.log 'Modules:'
    console.table(DES.modules)
    return



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
            true
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
m = DES.add_module('G1')
set_transitions(m, transitions)

transitions = [
    [0, 'a', 1]
    [1, 'd', 2]
    [2, 'c', 2]
    [0, 'c', 0]
]
m = DES.add_module('G2')
set_transitions(m, transitions)

transitions = [
    [0, 'b', 1]
    [1, 'e', 2]
    [2, 'c', 2]
    [0, 'c', 0]
]
m = DES.add_module('G3 Valve')
set_transitions(m, transitions)

transitions = [
    [0, 'e', 1]
    [1, 'o2', 2]
    [2, 'd', 3]
    [3, 'c', 3]
    [0, 'c', 0]
]
m = DES.add_module('G4 Motor')
set_transitions(m, transitions)

# This module is for partitioning to [non]faulty sublanguage
# transitions = [
#     [0, 'a', 1]
#     [1, 'b', 2]
#     [2, 'c', 2]
#     [2, 'f', 1]
#     [0, 'b', 3]
# ]
# m = DES.add_module('Test')
# set_transitions(m, transitions)

# 
# Assign the modules to events.
# 
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
        


# =============================================================================
# 
# Returns module such that it has deterministic faulty information w.r.t states
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



# =============================================================================
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
            M.X.marked.set(pp) # Mark reachabe state
            T.transitions.set(T.add(), qq, e, pp)
        qq

    process_state(m.X.start)
    return M



# =============================================================================
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
                x = M.X.add()
                M.X.faulty.set(x)
                M.X.marked.set(x) # Mark reachable faulty state
            true
                
        (q, e, p) ->
            # Record states co-reachable to fault
            if !faulty.get(q) and faulty.get(p)
                faulty.set(q)
                map.push(q)
                M.X.add()
            true
        )

    DES.DFS(m
        (q, e, p) ->
            if faulty.get(p)
                T.transitions.set(T.add(), in_map(q), e, in_map(p))
            true
        )

    M.X.start = in_map(m.X.start)
    return M



# =============================================================================
make_projection = (m, events) ->
    T = create_general_set(T_CONFIG)
    M = DES.make_module_from_T(T, 'P('+m.name+')')
    M.X.start = 0 # start state is always 0 for projection
    # 
    m.T.transitions.projection(m.X.start, events,
        (q, e, p, qq, pp) ->
            # console.log q, DES.E.labels.get(e), p, qq, pp
            T.transitions.set(T.add(), q, e, p)
            # Note! Due to implementation of projection algorithm for transitions,
            # q == M.X.add() always, so the following marking is valid.
            q = M.X.add() if q >= M.X.size()
            p = M.X.add() if p >= M.X.size()
            # Mark reachable state if at least one of source states is marked
            if not M.X.marked.get(p)
                for i in pp
                    if m.X.marked.get(i)
                        M.X.marked.set(p)
                        break;
            return
        )
    M



console.log '===================================================='
show_modules()
show_events()
# show_modules_transitions()
 
# 
# Make projection to common events for each module
# 
(() ->
    i = DES.modules.length
    while i-- >0
        m = DES.modules[i]
        # Find common events
        m.common = []
        j = DES.E.size()
        while j-- >0
            modules = DES.E.modules.get(j)
            # A module shares this event if this event is owned by more 
            # then one module, one of which is the current one.
            m.common.push(j) if (modules.length > 1)  and (i in modules)
        # Create projection
        m.C = make_projection(m, m.common)
    )()

# 
# Make empty faulty and non-faulty sub-languages
# 
(() ->
    for m in DES.modules
        m.F = DES.make_module_from_T(create_general_set(T_CONFIG), 'F')
        m.N = DES.make_module_from_T(create_general_set(T_CONFIG), 'N')
        m.subcommon = m.common.slice()
    )()



# 
# Fault propagation algorithm. Preparation steps

(() ->
    i = 0 # Index of faulty module
    m = DES.modules[i]
    # Extend module to determenistic wrt faulty states
    nf = make_NF_module(m)
    # Make faulty and non-faulty sublanguages
    n = make_N_module(nf)
    f = make_F_module(nf)
    # 
    m.N = make_projection(n, m.common)
    m.F = make_projection(f, m.common)
    #
    propagate_FN = (k, F, N) ->
        for j, index in DES.modules
            continue if index == i # Don't process the faulty module
            common = intersection(k.common, j.common)
            continue if common.length == 0
            continue if j.subcommon.length == 0
            Fc = DES.sync(F, j.C, common)
            Nc = DES.sync(N, j.C, common)
            Fj_ = make_projection(Fc, j.common)
            Nj_ = make_projection(Nc, j.common)
            K = DES.intersection(Fj_, Nj_)
            DES.closure(K)
            DES.subtract(Fj_, K)
            DES.subtract(Nj_, K)
            DES.subtract(Fj_, j.F)
            DES.subtract(Nj_, j.N)
            if !DES.is_empty(Fj_) or !DES.is_empty(Nj_)
                j.F = DES.sync(j.F, Fj_)
                j.N = DES.sync(j.N, Nj_)
                j.F.name = 'F'
                j.N.name = 'N'
                console.log 'updated', j.name
                F_ = DES.copy(j.F)
                N_ = DES.copy(j.N)
                DES.closure(F_)
                DES.closure(N_)
                cap = DES.intersection(F_, N_)
                DES.subtract(F_, j.F)
                DES.subtract(N_, j.N)
                NF_ = DES.sync(F_, N_, j.common)
                DES.subtract(NF_, cap)
                show_dfs(NF_)
                show_states(NF_)
                # show_states(NF_)
                

            break

        return

    propagate_FN(m, m.F, m.N)
)()
