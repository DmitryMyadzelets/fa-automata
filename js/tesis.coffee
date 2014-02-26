'use strict'



# ============================================================================
# 
# Helper functions
# 
# 
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
        (q, e, p)->
            console.log q, DES.E.labels.get(e), p
            true
        )
    return



show_bfs = (m) ->
    console.log 'Breadth-First Search of module', m.name
    DES.BFS(m 
        (q, e, p)->
            console.log q, DES.E.labels.get(e), p
            return
        )
    return



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



# Returns array of events common for two modules
find_common_events = (m1, m2) ->
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


# ============================================================================
# 
# Data of the system
# 
# 
(() ->

	# Events 
	events = [
		# Digital output of PLC
	    { labels : 'do_hi',  observable: true }
	    { labels : 'do_lo',  observable: true }
	    # Relay
	    { labels : 'r_hi'}
	    { labels : 'r_lo'}
	    { labels : 'r_f0',  fault: true }
	]

	E = DES.E
	for e in events
	    i = E.add()
	    for key of e
	        E[key].set(i, e[key])


	# Transitions
	set_transitions(DES.add_module('DO'), [
	    [0, 'do_hi', 1]
	    [0, 'do_lo', 0]
	    [1, 'do_hi', 1]
	    [1, 'do_lo', 0]
	])

	set_transitions(DES.add_module('Relay'), [
	    [0, 'r_hi', 1]
	    [0, 'r_lo', 0]
	    [1, 'r_hi', 1]
	    [1, 'r_lo', 0]
        # to faulty state
        [0, 'r_f0', 2]
        [1, 'r_f0', 2]
        # [2, 'r_lo', 2]
	])

	set_transitions(DES.add_module('DO2Relay'), [
	    [0, 'r_lo', 0]
	    [0, 'do_lo', 0]
	    [0, 'do_hi', 2]
	    [2, 'r_hi', 1]
	    [1, 'r_hi', 1]
	    [1, 'do_hi', 1]
	    [1, 'do_lo', 3]
	    [3, 'r_lo', 0]
        # to faulty state
        # [1, 'r_lo', 4]
        # [4, 'r_lo', 4]
        # [4, 'r_hi', 4]
        # [4, 'do_lo', 4]
        # [4, 'do_hi', 4]
	])

)()


show_events()
# show_modules_transitions()
# show_dfs(DES.modules[2])
(() ->
    sync = (m1, m2) ->
        common = find_common_events(m1, m2)
        # console.log 'Common events:', common
        DES.sync(m1, m2, common)
    
    m1 = DES.modules[0]
    m2 = DES.modules[1]
    m3 = DES.modules[2]

    m1_2 = sync(m1, m2)
    # show_dfs(m3)
    m1_2_3 = sync(m1_2, m3)
    m1_2_3.X.marked.set(0)
    DES.modules.push(m1_2_3)
    # show_dfs(m1_2_3)

    # i = m1_2_3.X.size()
    # if m1_2_3.X.map?
    #     while i-- >0
    #         console.log  i, [ m1_2_3.X.map[i*2], m1_2_3.X.map[i*2+1] ]

)()



# ============================================================================
# 
# Showing
# 
# 

UI.show_module(DES.modules[DES.modules.length-1])
# UI.show_module(DES.modules[0])
# 
i_look = 0

@look = () ->
    i_look = 0 if i_look >= DES.modules.length
    if (i_look >=0) and (i_look < DES.modules.length)
        UI.show_module(DES.modules[i_look++])
    null





