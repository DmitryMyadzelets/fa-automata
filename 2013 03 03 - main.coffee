###
Read introduction for CoffeeScript:
http://arcturo.github.com/library/coffeescript/
Usefull links:
	http://www.graphdracula.net/
	https://github.com/mauriciosantos/buckets/
###
'use strict'

x = y = 0
ctx = null
canvas = null
# selected = null

###
===============================================================================
Creates an object with variables:
	nodes: coordinates of nodes. Each node is two coordinates (x,y)
		packed in one number.
	edges: edges between two nodes, Each edge is two indexes of nodes
		packed in one number. So, limits the length of the array 
		of nodes to 2^16 = 65535.
###
@.graph = {
	nodes : []
	edges : []
}

###
===============================================================================
###
@.pack = (x, y) -> ((x & 0xFFFF) << 16) | (y & 0xFFFF)
@.unpack = (xy) -> [(xy >> 16) & 0xFFFF, xy & 0xFFFF]

###
===============================================================================
Loads nodes and edges from the local storage of the browser.
Nodes must be stored as a value of key "nodes".
Edges must be stored as a value of key "edges".
Returns false is the storage is not available with "jstorage.js" library, or
there are no keys; otherwise returns true.
###
load_graph = (graph) ->
	if !($ && $.jStorage && $.jStorage.storageAvailable() && JSON)
		return false

	# load_array = (name) ->
	# 	str = $.jStorage.get(name)
	# 	console.log str
	# 	if !!(str && !!str.split)
	# 		array = str.split(",")
	# 		return (a for a in array when typeof (a|=0) is "number")
	# 	[]
	# nodes = load_array("nodes")
	# edges = load_array("edges")

	parsed = JSON.parse($.jStorage.get("graph")) ? {}
	graph.nodes = parsed["nodes"] ? []
	graph.edges = parsed["edges"] ? []

	graph.nodes.length > 0

###
===============================================================================
###
save_graph = (graph) ->
	if !($ && $.jStorage && $.jStorage.storageAvailable())
		return false
	# $.jStorage.set("nodes", graph.nodes.join())
	# $.jStorage.set("edges", graph.edges.join())
	$.jStorage.set("graph", JSON.stringify(graph))

###
===============================================================================
Checks if xy coodinates are over a node.
	Returns index of a node in the nodes list, or -1.
###
edit = {
	dx: 0
	dy: 0
}
nodeByXY = (graph, x, y) ->
	for node, index in graph.nodes
		###	Get coordinates of each node and calculate distance to 
			the point. If distance is less then radius of the node, then 
			the point in over the node. 
		###
		[_x, _y] = unpack(node)
		edit.dx = x - _x
		edit.dy = y - _y
		if (edit.dx * edit.dx) + (edit.dy * edit.dy) < (r*r)
			return index
	-1

###
===============================================================================
###
edge_exists = (edges, from_node, to_node) ->
	for edge in edges
		[_from, _to] = unpack(edge)
		if _from == from_node && _to == to_node
			return true
	false


###
===============================================================================
###
st = ost = 0
node_ix = -1
graph_is_changed = false
from = {
	node_ix : 0
	x: 0
	y: 0
}

automata = (eCode, ev) ->
	switch ost = st
		when 0 # Waiting for mouse down
			if 1 == eCode # down
				[x, y] = get_mouse_xy(ev)
				node_ix = nodeByXY(graph, x, y)
				if (node_ix >= 0)
					[_x, _y] = unpack(graph.nodes[node_ix])
					if not ev.shiftKey
						from.node_ix = node_ix
						# selected.nodes.length = 0
						# selected.nodes.push(node_ix)
						ctx.clearRect(0, 0, canvas.width, canvas.height)
						draw_graph(ctx, graph)
						# draw_selected(ctx, graph, selected)
						st = 2
					else 
						from.x = _x
						from.y = _y
						st = 1
				else
					if ev.shiftKey
						from.x = x
						from.y = y
						st = 4
					else
						from.x = x
						from.y = y
						st = 5
		when 1 # Moving selected node
			switch eCode
				when 2 # move
					[x, y] = get_mouse_xy(ev)
					x = 0 if (x -= edit.dx) < 0
					y = 0 if (y -= edit.dy) < 0
					move_node(node_ix, x, y)
				when 3 # up
					# command("move_node", node_ix, from.x, from.y, x, y)
					editor.move_node(node_ix, from.x, from.y, x, y)
					graph_is_changed = true
					st = 0
				else # cancel moving changes
					graph.nodes[node_ix] = pack(from.x, from.y)
					st = 0
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw_graph(ctx, graph)

		when 2 # Going out of the "from" node
			switch eCode
				when 2 # move
					[x, y] = get_mouse_xy(ev)
					node_ix = nodeByXY(graph, x, y)
					if node_ix != from.node_ix
						[_x, _y] = unpack(graph.nodes[from.node_ix])
						from.x = _x
						from.y = _y
						st = 3
				else
					st = 0

		when 3 # Creating a new edge to ...
			[x, y] = get_mouse_xy(ev)
			switch eCode
				when 2 # moving
					node_ix = nodeByXY(graph, x, y)
					is_new_edge = node_ix < 0
					if (!is_new_edge)
						[x, y] = unpack(graph.nodes[node_ix])
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw_graph(ctx, graph)
					if node_ix == from.node_ix
						draw_loop(ctx, from.x, from.y)
					else
						draw_edge(ctx, from.x, from.y, x, y, is_new_edge)
				when 3 # up
					node_ix = nodeByXY(graph, x, y)
					if (node_ix < 0)
						# Create a new node
						editor.start_transaction()
						node_ix = editor.add_node(x, y)
						editor.add_edge(from.node_ix, node_ix)
						editor.stop_transaction()
					else
						if not edge_exists(graph.edges, from.node_ix, node_ix)
							editor.add_edge(from.node_ix, node_ix)
					graph_is_changed = true
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw_graph(ctx, graph)
					st = 0
				else
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw_graph(ctx, graph)
					st = 0

		when 4 # Moving graph
			switch eCode
				when 2 # move
					[x, y] = get_mouse_xy(ev)
					ctx.save()
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					ctx.translate(x-from.x, y-from.y)
					draw_graph(ctx, graph)
					ctx.restore()
				when 3 # up
					[x, y] = get_mouse_xy(ev)
					editor.move_graph(from.x, from.y, x, y)
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw_graph(ctx, graph)
					graph_is_changed = true
					st = 0
				else # cancel movement (should be one value for entire graph)
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw_graph(ctx, graph)
					st = 0

		when 5 # Creating a new node
			switch eCode
				when 3 # up
					[x, y] = get_mouse_xy(ev)
					editor.add_node(x, y)
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw_graph(ctx, graph)
					graph_is_changed = true
					st = 0
				when 2 # move
					# Protection from litle sliding of mouse
					[x, y] = get_mouse_xy(ev)
					dx = x - from.x
					dy = y - from.y
					# Just to get rid of negative values :)
					dx *= dx
					dy *= dy
					# Stay in the state if sliding is litle,
					# otherwise get out of it.
					if (dx > 4) or (dy > 4)
						st = 0
				else
					st = 0

	# If automation changes its state
	if (ost != st)
		console.log eCode + ": " + ost + "->" + st
		if 0 == st
			if graph_is_changed
				save_graph(graph)
				graph_is_changed = false
	null



###
===============================================================================
###
init = () ->

	return if not canvas = document.getElementById("myCanvas")

	# canvas = document.createElement('canvas')
	# document.body.appendChild(canvas)
	# canvas.width = window.innerWidth;
	# canvas.height = window.innerHeight;
	canvas.focus()
	#
	return if not ctx = canvas.getContext("2d")
	ctx.fillStyle = "gray"
	ctx.lineWidth = 1.2
	ctx.strokeStyle = "rgba(0,0,255,0.5)"
	ctx.font = "12pt Tahoma"
	ctx.textAlign = "left"
	#
	canvas.addEventListener('mousedown', ev_mousedown, false)
	canvas.addEventListener('mouseup', ev_mouseup, false)
	canvas.addEventListener('mousemove', ev_mousemove, false)
	canvas.addEventListener('keypress', ev_keypress, false)
	canvas.addEventListener('keyup', ev_keyup, false)
	# canvas.addEventListener('dragstart', ev_dragstart, false)
	#

	#Load graph from local storage
	if !load_graph(graph)
		node1 = editor.add_node(-50 + canvas.width/2, canvas.height/2)
		node2 = editor.add_node( 50 + canvas.width/2, canvas.height/2)
		editor.add_edge(node1, node2)
		editor.add_edge(node2, node2)
	draw_graph(ctx, graph)

	# selected = new graph_create()

	null


get_mouse_xy = (ev) ->
	rc = canvas.getBoundingClientRect()
	[ev.clientX - rc.left, ev.clientY - rc.top]


window.onload = () ->
	init()
	null

ev_mousedown = (ev) ->
	automata(1, ev)
	null

ev_mousemove = (ev) ->
	automata(2, ev)
	document.getElementById("debug").innerHTML = "x, y = " + get_mouse_xy(ev)
	null

ev_mouseup = (ev) ->
	automata(3, ev)
	null

ev_keypress = (ev) ->
	# Does not work on Firefox. I hate that browser already!
	if ev.ctrlKey
		# console.log ev.which
		# console.log ev.charCode
		switch ev.keyCode
			when 25 # Y
				editor.redo()
				ctx.clearRect(0, 0, canvas.width, canvas.height)
				draw_graph(ctx, graph)
				save_graph(graph)
			when 26 # Z
				editor.undo()
				ctx.clearRect(0, 0, canvas.width, canvas.height)
				draw_graph(ctx, graph)
				save_graph(graph)

	null

ev_keyup = (ev) ->
	switch ev.keyCode
		when 46 # Delete ### Move it to the main automaton!
			# for node in selected.nodes
			# 	editor.execute("del_node", node)
			editor.del_node(graph.nodes.length-1)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw_graph(ctx, graph)
			save_graph(graph)
		when 81 # Q
			# Testing edges deletion
			editor.del_edge(graph.edges.length-1)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw_graph(ctx, graph)
		else
			# console.log "keyCode: " + ev.keyCode
	null
