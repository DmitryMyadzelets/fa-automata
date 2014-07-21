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
    faulty          : 'boolean'sdf
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
class @bitArray 
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
        len = b2i(bits) + 1|0
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
@intersection = (A, B) -> A.filter((x) -> B.indexOf(x) >= 0)



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
                callback_after(q, e, p) if has_callback_a
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
        # This double way of adding values is due to different implementations
        # of arrays. FIXIT
        # The idea was to make adding fields from outside forbiden, and allowed 
        # when adding an element to the whole object.
        for key of config
            if @[key] instanceof bitArray
                @[key].add()
            else
                @[key].add.apply(@)
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
    # Returns a module, result of the composition
    # sync = (start, T2, start2, common, callback) ->
    sync : (m1, m2, common) ->
        M = DES.create_module('sync('+m1.name+','+m2.name+')')
        T = M.T
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
        
        # Attach map to the module
        M.X.map = map

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
            M.X.marked.set(x) if (m1.X.marked.get(q1) and m2.X.marked.get(q2))
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
        @DFS(m, null, (q, e, p) -> m.X.marked.set(q) if m.X.marked.get(p))
        m


    # Subtracts language of module 2 from language of module 1
    subtract : (m1, m2) -> 
        events = []
        # get events from m1
        i = m1.T.size()
        while i-- >0
            e = m1.T.transitions.get(i)[1]
            events.push(e) if e not in events
        # get events from m1
        i = m2.T.size()
        while i-- >0
            e = m2.T.transitions.get(i)[1]
            events.push(e) if e not in events

        @intersection(m1, @complement(m2, events))



    # Returns 'true' if the language of the module is empty 
    # (i.e. no reachable marked states), 'false' otherwise.
    is_empty : (m) ->
        empty = true
        @BFS(m, (q, e, p) ->
            empty = false if m.X.marked.get(p)
            )
        empty



    # Returns a copy of module (not full copy, only some fields!)
    copy : (m) ->
        M = @create_module(m.name)
        T = M.T
        # copy transitions
        @BFS(m, (q, e, p) -> T.transitions.set(T.add(), q, e, p))
        # copy states, and [not]marked
        n = m.X.size()
        # make initial state at least
        i = 0
        while i < n
            x = M.X.add()
            M.X.marked.set(x) if m.X.marked.get(i)
            i++
        M.X.start = m.X.start
        M


    # Returns new module - projection to events
    projection : (m, events) ->
        M = @create_module('P('+m.name+')')
        T = M.T
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
                            break
                return
            )
        M


    # Returns complement of the language
    complement : (m, events) ->
        M = @copy(m)

        events = [] if not events?

        # index of new 'complement' state
        new_p = -1

        # Inverse state marking
        q = M.X.size()
        while q-- >0
            if M.X.marked.get(q)
                M.X.marked.clr(q)
            else
                M.X.marked.set(q)
            # get array of indexes of transition from state q
            arr_tix = m.T.transitions.out(q)
            # get array of events from state q
            q_events = arr_tix.map((t)->m.T.transitions.get(t)[1])
            # get events wich have no transitions for state q
            p_events = events.filter((e) -> q_events.indexOf(e) < 0)
            for e in p_events
                if new_p < 0
                    new_p = M.X.add()
                    M.X.marked.set(new_p)
                M.T.transitions.set(M.T.add(), q, e, new_p)
        # Create state if there is no states 
        M.X.marked.set(new_p = M.X.add()) if (new_p < 0) and events.length
        # Add loops to new event
        if new_p >= 0
            M.T.transitions.set(M.T.add(), new_p, e, new_p) for e in events
        M


    # Returns array of events common for two modules
    get_common_events : (m1, m2) ->
        common = []
        i = m1.T.size()
        # Iterate all the transition of the first module
        while i-- >0
            # Event index from the transtion
            e = m1.T.transitions.get(i)[1]
            continue if e in common
            # Iterate all the transition of the second module
            j = m2.T.size()
            while j-- >0
                e2 = m2.T.transitions.get(j)[1]
                if e2 == e
                    common.push(e)
                    break                
        common

}


@DES = DES


###############################################################################
# 
# How to use
# 


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




# m1 = DES.create_module('test')
# m2 = DES.create_module()
# Checking subtraction. It works !
# m1.T.transitions.set(m1.T.add(), 0, 0, 1)
# m1.T.transitions.set(m1.T.add(), 1, 0, 2)
# m1.T.transitions.set(m1.T.add(), 0, 0, 3)
# m1.X.add() # 0
# m1.X.marked.set(m1.X.add()) # 1
# m1.X.marked.set(m1.X.add()) # 2
# m1.X.marked.set(m1.X.add()) # 3

# m2.T.transitions.set(m2.T.add(), 0, 0, 1)
# m2.T.transitions.set(m2.T.add(), 1, 0, 2)
# m2.T.transitions.set(m2.T.add(), 2, 0, 3)
# m2.X.marked.set(m2.X.add()) # 0
# m2.X.marked.set(m2.X.add()) # 1
# m2.X.marked.set(m2.X.add()) # 2
# m2.X.marked.set(m2.X.add()) # 3

# console.log 'TEST'
# show_dfs(m1)
# show_states(m1)
# DES.subtract(m1, m2)
# show_states(m1)
