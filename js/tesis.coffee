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
    DES.modules.push(m1_2_3)
    # show_dfs(m1_2_3)

    # i = m1_2_3.X.size()
    # if m1_2_3.X.map?
    #     while i-- >0
    #         console.log  i, [ m1_2_3.X.map[i*2], m1_2_3.X.map[i*2+1] ]

)()



# ============================================================================
# 
# Drawing
# 
# 

@graph = {
    'nodes' : [
        # {'name':'A'}
        # {'name':'B'}
    ]
    'links' : [
        # {'source':0, 'target':1 }
    ]
}



bind_module = (m) ->
    graph.nodes.length = 0
    graph.links.length = 0
    i = m.X.size()
    while i-- >0
        node = {
            name : i
        }
        node.start = true if i == m.X.start
        graph.nodes.push(node)

    DES.BFS(m, (q, e, p) ->
        link = {
            source : q
            target : p
            label : DES.E.labels.get(e)
        }
        link.loop = true if q == p
        graph.links.push(link)
        )
    return



bind_module(DES.modules[DES.modules.length-1])


width = 600
height = 500
node_radius = 16


# 
# Good SVG examples:
# https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-force-layout-diagrams
# 

svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)


# Per-type markers, as they don't inherit styles.
svg.append("defs").selectAll("marker")
        .data(["arrow"])
    .enter().append("marker")
        .attr("id", (d) -> d)
        .attr("viewBox", "-10 -5 10 10")
        # .attr("refX", 15)
        # .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
    .append("path")
        .attr("d", "M-10,-5L0,0L-10,5 Z")
        .attr('fill', 'context-stroke')


force = d3.layout.force()
    .charge(-500)
    .gravity(.02)
    .linkDistance((d)-> 
        # return 0 if d.source == d.target
        100
        )
    .size([width, height])
    .nodes(graph.nodes)
    .links(graph.links)
    .start()


link = svg.selectAll('.link')
        .data(graph.links)
    # .enter().append('line')
    .enter().append('path')
    # .attr('class', 'link')
        .attr("marker-end", (d) -> "url(#arrow)" )


label = svg.selectAll('.label')
        .data(graph.links)
    .enter().append('g').append('text')
        .text((d)-> d.label)


node = svg.selectAll('.node')
        .data(graph.nodes)
    .enter().append('g')
        .attr('class', 'node')
        .call(force.drag)


# Add circle to each node
node.append('circle')
    .attr('r', node_radius)  


# Add text to each node
node.append('text')
    .attr('dy', '0.35em') # shifts text down (should be depended on the font size)
    .text((d)-> d.name)


# Add arrowed line to the initial state
node.filter((d)-> d.start?)
    .append('path')
        # This line appears always at the left side (have a better idea?)
        .attr('d', 'M'+ -2.5*node_radius + ',0L' + -node_radius + ',0')
        .attr('marker-end', (d) -> "url(#arrow)" )


force.on('tick', ()->
    # link.attr('x1', (d)-> d.source.x )
    #     .attr('y1', (d)-> d.source.y )
    #     .attr('x2', (d)-> d.target.x )
    #     .attr('y2', (d)-> d.target.y )

    link.attr('d', linkCurve)

    node.attr('transform', (d) -> 'translate('+ d.x + ','+ d.y + ')')

    label.attr('transform', (d) -> 
        if d.cv?
            'translate('+ 
            d.cv[0] + ','+ 
            d.cv[1] + ')'
    )
    
    # node.attr('cx', (d)-> d.x )
    #     .attr('cy', (d)-> d.y )

    # text.attr('x', (d)-> d.x|0 )
    #     .attr('y', (d)-> (d.y|0)-20 )

    return
    )


vec = {

    create : () -> new Array([0, 0])

    length : (v) -> Math.sqrt(v[0]*v[0] + v[1]*v[1])

    normalize : (v, out) ->
        len = vec.length(v)
        len = 1 / len
        out[0] = v[0] * len
        out[1] = v[1] * len
        out

    orthogonal : (v, out) ->
        out[0] =  v[1]
        out[1] = -v[0]
        out

    scale : (a, rate, out) ->
        out[0] = a[0] * rate
        out[1] = a[1] * rate
        out

    add : (a, b, out) ->
        out[0] = a[0] + b[0]
        out[1] = a[1] + b[1]
        out

    subtract : (a, b, out) ->
        out[0] = a[0] - b[0]
        out[1] = a[1] - b[1]
        out

    copy : (a, out) ->
        out[0] = a[0]
        out[1] = a[1]
        out
}



draw = {

    ###*
     * Constants for calculating a loop
    ###
    K : ( () ->
        k = {
            ANGLE_FROM : Math.PI/3
            ANGLE_TO : Math.PI/12
        }
        r = node_radius
        k.DX1 = r * Math.cos(k.ANGLE_FROM)
        k.DY1 = r * Math.sin(k.ANGLE_FROM)
        k.DX2 = r * 4 * Math.cos(k.ANGLE_FROM)
        k.DY2 = r * 4 * Math.sin(k.ANGLE_FROM)
        k.DX3 = r * 4 * Math.cos(k.ANGLE_TO)
        k.DY3 = r * 4 * Math.sin(k.ANGLE_TO)
        k.DX4 = r * Math.cos(k.ANGLE_TO)
        k.DY4 = r * Math.sin(k.ANGLE_TO)
        k.NX = Math.cos(k.ANGLE_FROM - Math.PI/24)
        k.NY = Math.sin(k.ANGLE_FROM - Math.PI/24)
        (name) -> k[name]
        )()


    ###*
     * Calculates coordinates for drawing a loop
     * @param  {[Number, Number]) v A node coordinates
     * @param  {Object) $ Object of faxy.create_edge_data()
     * @return {null}
    ###
    loop : (v, $) ->
        # Normalized vector for the first point
        # Update: it is not normalized. It should be like that the back of the arrow
        # be divided in half by the loop line. Then, it depends on the size of 
        # the arrow at least. Empirically:
        $.norm[0] = -@K('NX')
        $.norm[1] = @K('NY')
        # Some Bazier calc (http://www.moshplant.com/direct-or/bezier/math.html).
        #
        # Coordinates of the baizier curve (60 degrees angle)
        $.v1[0] = v[0] + @K('DX1')
        $.v1[1] = v[1] - @K('DY1')
        #
        $.cv[0] = v[0] + @K('DX2')
        $.cv[1] = v[1] - @K('DY2')
        #
        $.cv[2] = v[0] + @K('DX3') # 15 degrees
        $.cv[3] = v[1] - @K('DY3')
        #
        $.v2[0] = v[0] + @K('DX4')
        $.v2[1] = v[1] - @K('DY4')
        #
        # @arrow($.v1, $.arrow, $.norm)
        # Position of the label
        # x = x1 + 2*r
        # y = y1 - 3*r
        # $.label[0][0] = v[0] + 2*r
        # $.label[0][1] = v[1] - 2.6*r
        null


    curved : (v1, v2, norm, cv) ->
        v = [0, 0]
        r = node_radius
        # Calc normalized vector
        vec.subtract(v2, v1, v)    # v = v2 - v1
        vec.normalize(v, norm)     # norm = normalized v
        # Control vector
        cv[0] = (v1[0] + v2[0])/2 + norm[1]*30
        cv[1] = (v1[1] + v2[1])/2 - norm[0]*30
        # 'From' vector
        vec.subtract(cv, v1, v)    # v = cv - v1
        vec.normalize(v, v)       # v = normalized v
        vec.scale(v, r, v)        # v = v * r
        vec.add(v1, v, v1)         # v1 = v1 + v
        # 'To' vector
        vec.subtract(v2, cv, v)    # v = v2 - cv
        vec.normalize(v, v)       # v = normalized v
        vec.scale(v, r, v)        # v = v * r
        vec.subtract(v2, v, v2)    # v2 = v2 - v
        return

    }



linkCurve = (d) ->
    v1 = [d.source.x, d.source.y]
    v2 = [d.target.x, d.target.y]
    norm = [0, 0]
    d.cv = [0, 0] if not d.cv?

    if d.loop?
        $ = {
            v1 : []
            v2 : []
            cv : []
            norm : []
        }
        draw.loop([d.source.x, d.source.y], $)
        d.cv[0] = ($.cv[0] + $.cv[2])/2
        d.cv[1] = ($.cv[1] + $.cv[3])/2
        return 'M' + $.v1[0] + ',' + $.v1[1] + 
               'C' + $.cv[0] + ',' + $.cv[1] + 
               ' ' + $.cv[2] + ',' + $.cv[3] +
               ' ' + $.v2[0] + ',' + $.v2[1]
    else
        draw.curved(v1, v2, norm, d.cv)
        return 'M' + v1[0] + ',' + v1[1] + 
               'Q' + d.cv[0] + ',' + d.cv[1] + 
               ' ' + v2[0] + ',' + v2[1]
