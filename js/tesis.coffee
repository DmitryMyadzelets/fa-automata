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
get_event_by_label = (label) ->
    i = DES.E.size()
    while i-- >0
        break if DES.E.labels.get(i) == label
    i


get_events_by_labels = (labels) ->
    get_event_by_label(label) for label in labels


set_transitions = (m, transitions) ->
    for t in transitions
        if (eid = get_event_by_label(t[1])) >= 0
            m.T.transitions.set(m.T.add(), t[0], eid, t[2])
        else
            console.log 'Error:', t[1], 'labels not found'
    # Define states
    i = 1 + m.T.transitions.max_state()
    m.X.add() while i-- >0
    m



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
	    { labels : 'f0',  fault: true }
        # Contactor
        { labels : 'c_hi'}
        { labels : 'c_lo'}
        # Gate valve
        { labels : 'v_mo'} # moves to open
        { labels : 'v_mc'} # moves to closed
        { labels : 'v_op_hi'} # is open
        { labels : 'v_op_lo'} # is not open
        { labels : 'v_cl_hi'} # is closed
        { labels : 'v_cl_lo'} # is not closed
        

	]

	E = DES.E
	for e in events
	    i = E.add()
	    for key of e
	        E[key].set(i, e[key])


    # Transitions
    
    # Digital Output (DO) and Relay System
    # 
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
        [0, 'f0', 2]
        [1, 'f0', 2]
        [2, 'r_lo', 2]
    ])

    # set_transitions(module = DES.add_module('DO2Relay'), [
    #     [0, 'r_lo', 0]
    #     [0, 'do_lo', 0]
    #     [0, 'do_hi', 1]
    #     [1, 'r_hi', 1]
    #     [1, 'do_hi', 1]
    #     [1, 'do_lo', 0]
    #     # # to faulty state (Relay stacks to 0)
    #     # [1, 'r_lo', 2]
    #     # [2, 'r_lo', 2]
    #     # [2, 'do_lo', 2]
    #     # [2, 'do_hi', 2]
    #     # # # to faulty state (Relay stacks to 1)
    #     # [0, 'r_hi', 3]
    #     # [3, 'r_hi', 3]
    #     # [3, 'do_lo', 3]
    #     # [3, 'do_hi', 3]
    # ])

    # # Mark faulty states
    # module.X.marked.set(2)
    # module.X.marked.set(3)


    # # set_transitions(DES.add_module('Contactor'), [
    # #     [0, 'c_hi', 1]
    # #     [0, 'c_lo', 0]
    # #     [1, 'c_hi', 1]
    # #     [1, 'c_lo', 0]
    # # ])

    # # set_transitions(DES.add_module('Relay2Contactor'), [
    # #     [0, 'c_lo', 0]
    # #     [0, 'r_lo', 0]
    # #     [0, 'r_hi', 1]
    # #     [1, 'c_hi', 1]
    # #     [1, 'r_hi', 1]
    # #     [1, 'r_lo', 0]
    # # ])

)

# ============================================================================
# 
# For Appendix
# 
# 
(() ->

    # Events 
    events = [
        # Digital input output
        { labels : '1_hi'}
        { labels : '1_lo'}
        { labels : '1_f0'}
        { labels : '1_f1'}
        { labels : '2_hi'}
        { labels : '2_lo'}
    ]

    E = DES.E
    for e in events
        i = E.add()
        for key of e
            E[key].set(i, e[key])


    # Transitions
    
    # Digital Output
    # 
    set_transitions(m = DES.add_module('DO'), [
        [0, '1_hi', 1]
        [0, '1_lo', 0]
        [1, '1_hi', 1]
        [1, '1_lo', 0]
        # to faulty state
        # [0, '1_f0', 2]
        # [1, '1_f0', 2]
        # [0, '1_f1', 3]
        # [1, '1_f1', 3]
        # [2, '1_lo', 2]
        # [3, '1_hi', 3]

    ])
    # m.X.marked.set(2)
    # m.X.marked.set(3)

    set_transitions(m = DES.add_module('DO'), [
        [0, '2_hi', 1]
        [0, '2_lo', 0]
        [1, '2_hi', 1]
        [1, '2_lo', 0]
    ])

    set_transitions(m = DES.add_module('DO2DO'), [
        [0, '2_lo', 0]
        [0, '1_lo', 0]
        [0, '1_hi', 1]
        [1, '2_hi', 1]
        [1, '1_hi', 1]
        [1, '1_lo', 0]
        # to faulty state (Relay stacks to 0)
        [1, '2_lo', 2]
        [2, '2_lo', 2]
        [2, '1_lo', 2]
        [2, '1_hi', 2]
        # # to faulty state (Relay stacks to 1)
        [0, '2_hi', 3]
        [3, '2_hi', 3]
        [3, '1_lo', 3]
        [3, '1_hi', 3]
    ])
    m.X.marked.set(2)
    m.X.marked.set(3)


)

# ============================================================================
# WC light
# 
(() ->

    # Events 
    events = [
        # Door
        { labels : 'open'}
        { labels : 'close'}
        # Moving Sensor
        { labels : 'move'}
        { labels : 'reset'}
        { labels : 'tout'}
        # Light
        { labels : 'light_on'}
        { labels : 'light_of'}
        # Person
        { labels : 'enter'}
        { labels : 'exit'}
    ]

    E = DES.E
    for e in events
        i = E.add()
        for key of e
            E[key].set(i, e[key])


    # Transitions

    set_transitions(DES.add_module('Door'), [
        [0, 'open', 1]
        [1, 'close', 0]
    ])
    set_transitions(m = DES.add_module('Light'), [
        [0, 'light_on', 1]
        [1, 'tout', 2]
        [2, 'light_on', 1]
        [2, 'light_of', 0]
    ])
    m.X.marked.set(1)
    m.X.marked.set(2)
    # set_transitions(DES.add_module('Person'), [
    #     [0, 'enter', 1]
    #     [1, 'exit', 0]
    #     [1, 'move', 1]
    # ])
    # # Dependencies
    # set_transitions(DES.add_module('Person-Door'), [
    #     [0, 'open', 1]
    #     [1, 'close', 0]
    #     [1, 'enter', 2]
    #     [2, 'exit', 1]
    #     [2, 'close', 3]
    #     [3, 'open', 2]
    # ])
    # All these events couse switch the light on
    set_transitions(DES.add_module('Door-Sensor-Light'), [
        [0, 'open', 1]
        [0, 'close', 1]
        # [0, 'move', 1]
        [1, 'light_on', 0]
    ])
    # If move & close, do not switch the light
    # set_transitions(DES.add_module('Light Blocking'), [
    #     [0, 'light_of', 0]
    #     [0, 'close', 0]
    #     [0, 'open', 0]
    #     # 
    #     [0, 'move', 1]
    #     # 
    #     [1, 'move', 1]
    #     [1, 'open', 1]
    #     [1, 'light_of', 1]
    #     # 
    #     [1, 'close', 2]
    #     [2, 'move', 2]
    #     [2, 'open', 0]
    # ])

)

# ============================================================================
# 
# Dust Cleaning System
# 
# 
(() ->
    # Events 
    events = [
        # Digital output of PLC
        # { labels : 'do_hi',  observable: true }
        # { labels : 'do_lo',  observable: true }
        # Gate valve
        # { labels : 'open_ac'} # moves to open
        # { labels : 'open_de'} # moves to closed
        # { labels : 'close_ac'} # moves to open
        # { labels : 'close_de'} # moves to closed
        # { labels : 'open_hi'} # is open
        # { labels : 'open_lo'} # is not open
        # { labels : 'close_hi'} # is closed
        # { labels : 'close_lo'} # is not closed

        # # Valve 1
        # { labels : 'v1_open'}
        # { labels : 'v1_closed'}
        # { labels : 'v1_stoped'}
        # { labels : 'v1_opening'}
        # { labels : 'v1_closing'}

        # # Sensor 1
        # { labels : 's1_lo'  , observable: true }
        # { labels : 's1_hi'  , observable: true }

        # # Sensor 2
        # { labels : 's2_lo'  , observable: true }
        # { labels : 's2_hi'  , observable: true }

    ]

    put_events_to_system = (events) ->
        E = DES.E
        for e in events
            i = E.add()
            for key of e
                E[key].set(i, e[key])
        null

    put_events_to_system(events)

    make_valve_automaton = (name) ->
        events = [
            { labels : name+'_open'}
            { labels : name+'_closed'}
            { labels : name+'_stoped'}
            { labels : name+'_opening'}
            { labels : name+'_closing'}
        ]
        put_events_to_system(events)
        m = set_transitions(DES.add_module(name), [
            [0, name+'_opening', 1]
            [1, name+'_opening', 1]
            [1, name+'_open', 2]
            [2, name+'_open', 2]
            [2, name+'_closing', 3]
            [3, name+'_closing' , 3]
            [3, name+'_closed', 0]
            [0, name+'_closed', 0]
            [1, name+'_stoped', 4]
            [3, name+'_stoped', 4]
            [4, name+'_stoped', 4]
            [4, name+'_opening', 1]
            [4, name+'_closing', 3]
        ])
        m

    # DI/DO, sensor, relay, motor, etc.
    make_2states_automaton = (name) ->
        events = [
            { labels : name+'_lo'  , observable: true }
            { labels : name+'_hi'  , observable: true }
        ]
        put_events_to_system(events)
        m = set_transitions(DES.add_module(name), [
            [0, name+'_lo', 0]
            [0, name+'_hi', 1]
            [1, name+'_hi', 1]
            [1, name+'_lo', 0]
        ])
        m

    # Actuator
    make_3states_automaton = (name) ->
        events = [
            { labels : name+'a_lo'  , observable: true }
            { labels : name+'a_hi'  , observable: true }
            { labels : name+'b_lo'  , observable: true }
            { labels : name+'b_hi'  , observable: true }
        ]
        put_events_to_system(events)
        m = set_transitions(DES.add_module(name), [
            [0, name+'a_lo', 0]
            [0, name+'b_lo', 0]

            [0, name+'a_hi', 1]
            [1, name+'a_hi', 1]
            [1, name+'b_lo', 1]
            [1, name+'a_lo', 0]

            [0, name+'b_hi', 2]
            [2, name+'b_hi', 2]
            [2, name+'a_lo', 2]
            [2, name+'b_lo', 0]
        ])
        m


    # Names shoud be in the oder: Cause, Effect
    # Events should be in the order: [cause1, effect1, cause2, effect2]
    make_cause_effect_automaton = (name1, name2, events) ->
        return if events.length != 4
        m = set_transitions(DES.add_module(name1+'-'+name2), [
            [0, name2+'_'+events[3], 0]
            [1, name2+'_'+events[1], 1]
            [0, name1+'_'+events[0], 1]
            [1, name1+'_'+events[0], 1]
            [1, name1+'_'+events[2], 0]
            [0, name1+'_'+events[2], 0]
        ])
        m

    # make_valve_automaton('v1')
    # make_2states_automaton('v1sc')
    # make_2states_automaton('v1so')
    # make_cause_effect_automaton('v1', 'v1sc', ['closed', 'hi', 'opening', 'lo'])
    # make_cause_effect_automaton('v1', 'v1so', ['open', 'hi', 'closing', 'lo'])
    # 

    make_3states_automaton('')

    # make_valve_automaton('v2')
    # make_2states_automaton('v2sc')
    # make_2states_automaton('v2so')
    # make_cause_effect_automaton('v2', 'v2sc', ['closed', 'hi', 'opening', 'lo'])
    # make_cause_effect_automaton('v2', 'v2so', ['open', 'hi', 'closing', 'lo'])

    # Leave the code below as an example!
    
    # Sensor 1
    # set_transitions(DES.add_module('S1'), [
    #     [0, 's1_lo', 0]
    #     [0, 's1_hi', 1]
    #     [1, 's1_hi', 1]
    #     [1, 's1_lo', 0]
    # ])


    # Sensor.hi => Valve Closed
    # set_transitions(DES.add_module('S1-Valve'), [
    #     [0, 's1_lo', 0]
    #     [1, 's1_hi', 1]
    #     [0, 'v1_closed', 1]
    #     [1, 'v1_closed', 1]
    #     [1, 'v1_opening', 0]
    #     [0, 'v1_opening', 0]
    # ])

    # Sensor.hi => Valve Open
    # set_transitions(DES.add_module('S2-Valve'), [
    #     [0, 's2_lo', 0]
    #     [1, 's2_hi', 1]
    #     [0, 'v1_open', 1]
    #     [1, 'v1_open', 1]
    #     [1, 'v1_closing', 0]
    #     [0, 'v1_closing', 0]
    # ])


)()


show_events()
# show_modules_transitions()
# show_dfs(DES.modules[2])
# 

(() ->
    sync = (m1, m2) ->
        common = DES.get_common_events(m1, m2)
        # console.log 'Common events:', common
        DES.sync(m1, m2, common)

    # Parallel composition of all modules
    i = DES.modules.length-1
    return if i<0
    sys = DES.modules[i]
    while i-- >0
        sys = sync(DES.modules[i], sys)
    
    # sys = DES.projection(sys, get_events_by_labels([
    #     'open_ac', 
    #     'open_de', 
    #     'close_ac',
    #     'close_de',
    #     'open_hi', 
    #     'open_lo', 
    #     'close_hi',
    #     'close_lo'
    #     ]))

    DES.modules.push(sys)
        
    # m1 = DES.modules[0]
    # m2 = DES.modules[1]
    # m3 = DES.modules[2]

    # Maps
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

