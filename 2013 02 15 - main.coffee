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
graph = null
selected = null

###
===============================================================================
Creates an object with variables:
	nodes: coordinates of nodes. Each node is two coordinates (x,y)
		packed in one number.
	edges: edges between two nodes, Each edge is two indexes of nodes
		packed in one number. So, limits the length of the array 
		of nodes to 2^16 = 65535.
###
graph_create = () ->
	@.nodes = []
	@.edges = []
	null

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
	if !($ && $.jStorage && $.jStorage.storageAvailable())
		return false

	load_array = (name) ->
		str = $.jStorage.get(name)
		if !!(str && !!str.split)
			array = str.split(",")
			return (a for a in array when typeof (a|=0) is "number")
		[]

	nodes = load_array("nodes")
	edges = load_array("edges")
	if !nodes
		return false

	# Arrangin xy minimal bounds of graph to zeroes
	# minx = 1000
	# for node, index in nodes
	# 	[x, y] = unpack(node)
	# 	if x < minx
	# 		minx = x
	# 	console.log [x, y]
	# console.log minx
	# for node, index in nodes
	# 	[x, y] = unpack(node)
	# 	x-=minx
	# 	nodes[index] = pack(x, y)
	# # do not foget to keep: graph.x += minx
	# return false

	graph.nodes = nodes
	graph.edges = edges

	true

###
===============================================================================
###
save_graph = (graph) ->
	if !($ && $.jStorage && $.jStorage.storageAvailable())
		return false
	$.jStorage.set("nodes", graph.nodes.join())
	$.jStorage.set("edges", graph.edges.join())

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
The function deletes the elements of an array which have values ixDelete
and change elements with values ixUpdate to ixDelete.
###
update_on_delete = (arr, ixDelete, ixUpdate) ->
	console.log "del:" + ixDelete + ", upd:" + ixUpdate
	i = arr.length
	while i-- >0
		if arr[i] == ixDelete
			arr.splice(i, 1)
			console.log "splice"
		else
			if arr[i] == ixUpdate
				arr[i] = ixDelete
				console.log "exchange"
	null

###
===============================================================================
###
add_node = (x, y) ->
	graph.nodes.push(pack(x, y)) - 1

###
===============================================================================
We delete an element [ix] of an array as follows:
1. Copy the last element to the position ix.
2. Remove the last element.
Returns the value at deleted position
###
del_node = (ix) ->
	if (ix < len = graph.nodes.length) && (ix > -1)
		if ix == len-1
			ret = graph.nodes.pop()
		else
			ret = graph.nodes[ix]
			graph.nodes[ix] = graph.nodes.pop()
		# The following must be applied to all depended arrays
		# update_on_delete(graph.edges, ix, len-1)
		# 
		# Since each element of the edges array is packed, we have to unpack it.
		i = graph.edges.length
		while i-- >0
			[from, to] = unpack(graph.edges[i])
			if (from == ix) or (to == ix)
				del_edge(i)
			else
				if ix != len-1 # update might be necessary if not the last node deleted
					_update = false
					if (from == len-1)
						from = ix
						_update = true
					if (to == len-1)
						to = ix
						_update = true
					if _update
						graph.edges[i] = pack(from, to)
		return ret
	null

###
===============================================================================
###
add_edge = (node_ix1, node_ix2) ->
	graph.edges.push(pack(node_ix1, node_ix2)) - 1

###
===============================================================================
###
del_edge = (ix) ->
	console.log ix
	if (ix < len = graph.edges.length) && (ix > -1)
		if ix == len-1
			ret = graph.edges.pop()
		else
			ret = graph.edges[ix]
			graph.edges[ix] = graph.edges.pop()
		return ret
	null

###
===============================================================================
###
move_node = (ix, x, y) ->
	graph.nodes[ix] = pack(x, y)
	null

###
===============================================================================
###
move_graph = (dx, dy) ->
	for node, index in graph.nodes
		[x, y] = unpack(node)
		graph.nodes[index] = pack(x+dx, y+dy)
	null

###
===============================================================================
###
command = () ->
	name = arguments[0]
	if undo[name] != undefined
		args = Array.prototype.slice.call(arguments).splice(1)
		return undo[name].apply(undo, args)
	console.log "Command not found: " + name
	null

undo_manager = () ->
	@.stack = []
	@.ix = 0
	@.transaction = false

	@.undo = () ->
		if @.ix > 0
			while @.ix > 0
				cmd = @.stack[--@.ix]
				cmd.undo_func.apply(@, cmd.undo_vals)
				break if not @.transaction
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw_graph(ctx, graph)
			save_graph(graph)
		null

	@.redo = () ->
		if @.ix < @.stack.length
			while @.ix < @.stack.length
				cmd = @.stack[@.ix++]
				cmd.redo_func.apply(@, cmd.redo_vals)
				break if not @.transaction
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw_graph(ctx, graph)
			save_graph(graph)
		null

	@.to_stack = (redo_func, redo_vals, undo_func, undo_vals) ->
		# If index is not equal to the length of stack, it implies
		# that user did "undo". Then new command cancels all the
		# values in stack below the index.
		if @.ix < @.stack.length
			@.stack.length = @.ix
		@.stack.push {
			redo_func: redo_func
			redo_vals: redo_vals
			undo_func: undo_func
			undo_vals: undo_vals
		}
		@.ix = @.stack.length
		null

	@.set_transaction = (state) -> @.transaction = state
	@.start_transaction = () ->	@.to_stack(@.set_transaction, [true], @.set_transaction, [false])
	@.stop_transaction = () -> @.to_stack(@.set_transaction, [false], @.set_transaction, [true])

	@.add_node = (x, y) ->
		ix = add_node(x, y)
		@.to_stack(add_node, arguments, del_node, [ix])
		ix

	@.del_node = (ix) ->
		xy = del_node(ix)
		if !!xy
			@.to_stack(del_node, [ix], add_node, unpack(xy))
		null

	@.move_node = (ix, x1, y1, x2, y2) ->
		@.to_stack(move_node, [ix, x2, y2], move_node, [ix, x1, y1])
		null

	@.add_edge = (node_ix1, node_ix2) ->
		ix = add_edge(node_ix1, node_ix2)
		@.to_stack(add_edge, [node_ix1, node_ix2], del_edge, [ix])
		ix

	@.del_edge = (ix) ->
		nodes = del_edge(ix)
		if !!nodes
			@.to_stack(del_edge, [ix], add_edge, unpack(nodes))
		null

	@.move_graph = (x1, y1, x2, y2) ->
		dx = x2-x1
		dy = y2-y1
		if dx || dy # log only if there are changes
			move_graph(dx, dy)
			@.to_stack(move_graph, [dx, dy], move_graph, [-dx, -dy])
		null

	return @
undo = new undo_manager()

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
						selected.nodes.length = 0
						selected.nodes.push(node_ix)
						ctx.clearRect(0, 0, canvas.width, canvas.height)
						draw_graph(ctx, graph)
						draw_selected(ctx, graph, selected)
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
					command("move_node", node_ix, from.x, from.y, x, y)
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
						command("start_transaction")
						node_ix = command("add_node", x, y)
						command("add_edge", from.node_ix, node_ix)
						command("stop_transaction")
					else
						if not edge_exists(graph.edges, from.node_ix, node_ix)
							command("add_edge", from.node_ix, node_ix)
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
					command("move_graph", from.x, from.y, x, y)
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
					command("add_node", x, y)
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

	canvas = document.getElementById("myCanvas")
	canvas.focus()
	ctx = canvas.getContext("2d")
	#
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

	graph = new graph_create()
	#Load graph from local storage
	if !load_graph(graph)
		node1 = command("add_node", -50 + canvas.width/2, canvas.height/2)
		node2 = command("add_node",  50 + canvas.width/2, canvas.height/2)
		command("add_edge", node1, node2)
		command("add_edge", node2, node2)
	draw_graph(ctx, graph)

	selected = new graph_create()

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
				undo.redo()
			when 26 # Z
				undo.undo()
	null

ev_keyup = (ev) ->
	switch ev.keyCode
		when 46 # Delete ### Move it to the main automaton!
			for node in selected.nodes
				command("del_node", node)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw_graph(ctx, graph)
			save_graph(graph)
		when 81 # Q
			# Testing edges deletion
			command("del_edge", graph.edges.length-1)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw_graph(ctx, graph)
		else
			# console.log ev.keyCode
	null
