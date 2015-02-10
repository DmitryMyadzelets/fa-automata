'use strict'



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
    

    M = DES.create_module('NF('+m.name+')')
    T = M.T

    # T = create_general_set(T_CONFIG) # Transitions for new module
    # M = DES.make_module_from_T(T, 'NF('+m.name+')') # Extended module

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
    # T = create_general_set(T_CONFIG)
    # M = DES.make_module_from_T(T, 'N('+m.name+')')
    M = DES.create_module('N('+m.name+')')
    T = M.T
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

    # T = create_general_set(T_CONFIG) # Transitions for new module
    # M = DES.make_module_from_T(T, 'F('+m.name+')') # Extended module
    M = DES.create_module('F('+m.name+')')
    T = M.T

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
    # T = create_general_set(T_CONFIG)
    # M = DES.make_module_from_T(T, 'P('+m.name+')')
    M = DES.create_module('P('+m.name+')')
    T = M.T

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

        m.F = DES.create_module('F')
        m.N = DES.create_module('N')
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
                j.F = DES.sync(j.F, Fj_) # Union
                j.N = DES.sync(j.N, Nj_) # Union
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
                NF_ = DES.sync(F_, N_, j.common) # Union
                DES.subtract(NF_, cap)
                # TODO: find events in the strings of NF_

                # show_dfs(NF_)
                # show_states(NF_)
                # show_states(NF_)
                

            break

        return

    propagate_FN(m, m.F, m.N)
)()