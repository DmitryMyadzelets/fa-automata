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
@graph = faxy.create()
text_editor = null
label = -1 # index of edge label


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
	parsed = JSON.parse($.jStorage.get("graph")) ? {}
	# console.log "Loaded: ", parsed

	# graph.edges.a = parsed.edges.a.slice(0);
	# # graph.curved = parsed.curved ? []
	# graph.nodes = clone(parsed.nodes)
	# console.log graph.nodes
	# graph.nodes.x = parsed.nodes ?.x ? []
	# graph.nodes.y = parsed.nodes ?.y ? []
	graph.nodes.length > 0

###
===============================================================================
###
save_graph = (graph) ->
	if !($ && $.jStorage && $.jStorage.storageAvailable())
		return false
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
	for _x, index in graph.nodes.x
		###	Get coordinates of each node and calculate distance to 
			the point. If distance is less then radius of the node, then 
			the point in over the node. 
		###
		_y = graph.nodes.y[index]
		edit.dx = x - _x
		edit.dy = y - _y
		if (edit.dx * edit.dx) + (edit.dy * edit.dy) < (r*r)
			return index
	-1

###*
 * Checks if an edge's label is under the coordinates
 * @param  {[type]} graph [description]
 * @param  {int} x     
 * @param  {int} y     
 * @return {int}       index of edge, -1 if no edge found
###
labelByXY  = (graph, x, y) ->
	for e, index in graph.edges
		$ = graph.edges.$[index]
		# Width and hight should be based on the text of the label,
		# but lets do it simple for now.
		w = 20
		h = 10
		x1 = $.label[0][0] - w
		y1 = $.label[0][1] - h
		x2 = $.label[0][0] + w
		y2 = $.label[0][1] + h
		if x > x1 and x < x2 and y > y1 and y < y2
			# ctx.beginPath();
			# ctx.rect(x1, y1, x2-x1, y2-y1);
			# ctx.fillStyle = 'white';
			# ctx.fill();
			# ctx.strokeStyle = 'black';
			# ctx.stroke();
			return index
	-1


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

automaton = (eCode, ev) ->
	switch ost = st
		when 0 # Waiting for mouse down
			if 1 == eCode # down
				[x, y] = get_mouse_xy(ev)
				node_ix = nodeByXY(graph, x, y)
				if (node_ix >= 0)
					if not ev.shiftKey
						from.node_ix = node_ix
						# selected.nodes.length = 0
						# selected.nodes.push(node_ix)
						# ctx.clearRect(0, 0, canvas.width, canvas.height)
						# draw.automaton(ctx, graph)
						# draw_selected(ctx, graph, selected)
						st = 2
					else 
						from.x = graph.nodes.x[node_ix]
						from.y = graph.nodes.y[node_ix]
						st = 1

				else if labelByXY(graph, x, y) >= 0
					null
				else
					if ev.shiftKey
						from.x = x
						from.y = y
						st = 4
					else
						from.x = x
						from.y = y
						st = 5

			if 4 == eCode # double click
				# Display text editor for the label
				[x, y] = get_mouse_xy(ev)
				label = labelByXY(graph, x, y)
				if label >= 0
					if graph.edges.events[label]?
						vals = []
						vals.push(graph.events[event]) for event in graph.edges.events[label]
						text = vals.join(", ")
					else
						text = ""
					text_editor.value = text
					text_editor.style.width = "40px"
					text_editor.style.left = graph.edges.$[label].label[0][0]-20 + "px"
					text_editor.style.top = graph.edges.$[label].label[0][1]-10 + "px"
					text_editor.style.display = null
					text_editor.focus()
					st = 6

		when 1 # Moving selected node
			switch eCode
				when 2 # move
					[x, y] = get_mouse_xy(ev)
					x = 0 if (x -= edit.dx) < 0
					y = 0 if (y -= edit.dy) < 0
					editor.nodes.move(graph, node_ix, x, y)
				when 3 # up
					editor.nodes.move2(graph, node_ix, from.x, from.y, x, y)
					graph_is_changed = true
					st = 0
				else # cancel moving changes
					graph.nodes.x[node_ix] = from.x
					graph.nodes.y[node_ix] = from.y
					st = 0
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw.automaton(ctx, graph)

		when 2 # Going out of the "from" node
			switch eCode
				when 2 # move
					[x, y] = get_mouse_xy(ev)
					node_ix = nodeByXY(graph, x, y)
					if node_ix != from.node_ix
						from.x = graph.nodes.x[from.node_ix]
						from.y = graph.nodes.y[from.node_ix]
						st = 3
				else
					st = 0

		when 3 # Creating a new edge to ...
			[x, y] = get_mouse_xy(ev)
			node_ix = nodeByXY(graph, x, y)
			switch eCode
				when 2 # moving
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw.automaton(ctx, graph)
					draw.fake_edge(ctx, faxy.get_fake_edge(graph, from.node_ix, node_ix, x, y))
				when 3 # up
					if (node_ix < 0)
						# Create a new node
						editor.commands.start_transaction()
						node_ix = editor.nodes.add(graph, x, y)
						editor.edges.add(graph, from.node_ix, node_ix)
						editor.commands.stop_transaction()
					else
						editor.edges.add(graph, from.node_ix, node_ix)
					graph_is_changed = true
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw.automaton(ctx, graph)
					st = 0
				else
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw.automaton(ctx, graph)
					st = 0

		when 4 # Moving graph
			switch eCode
				when 2 # move
					[x, y] = get_mouse_xy(ev)
					ctx.save()
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					ctx.translate(x-from.x, y-from.y)
					draw.automaton(ctx, graph)
					ctx.restore()
				when 3 # up
					[x, y] = get_mouse_xy(ev)
					# editor.move_graph(from.x, from.y, x, y) TODO: fix! 
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw.automaton(ctx, graph)
					graph_is_changed = true
					st = 0
				else # cancel movement (should be one value for entire graph)
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw.automaton(ctx, graph)
					st = 0

		when 5 # Creating a new node
			switch eCode
				when 3 # up
					[x, y] = get_mouse_xy(ev)
					editor.nodes.add(graph, x, y)
					ctx.clearRect(0, 0, canvas.width, canvas.height)
					draw.automaton(ctx, graph)
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


		when 6 # Editing a label
			switch eCode
				when 5 # key pressed
					if 13 == ev.keyCode
						text_editor.style.display = "none"
						if label > -1
							event = automata.events.add(graph, text_editor.value)
							automata.edges.events.add(graph, label, event)
							ctx.clearRect(0, 0, canvas.width, canvas.height)
							draw.automaton(ctx, graph)
						canvas.focus()
						# st = 0
				when 6 # lost focus
					text_editor.style.display = "none"
					st = 0
				when 7 # key down
					if 27 == ev.keyCode 
						text_editor.style.display = "none"
						canvas.focus()
						# st = 0

	# If automation changes its state
	if (ost != st)
		console.log eCode + ": " + ost + "->" + st
		if 0 == st
			if graph_is_changed
				save_graph(graph)
				graph_is_changed = false
		if 6 == ost
			label = -1
	null



###
===============================================================================
###
init = () ->

	canvas = document.getElementById("myCanvas")
	# canvas = document.createElement('canvas')
	# document.body.appendChild(canvas)
	# canvas.width = window.innerWidth;
	# canvas.height = window.innerHeight;
	canvas.focus()
	#
	ctx = canvas.getContext("2d")
	ctx.fillStyle = "gray"
	ctx.lineWidth = 1.2
	ctx.strokeStyle = "rgba(0,0,255,0.5)"
	ctx.font = "12pt Tahoma"
	ctx.textAlign = "left"
	#
	canvas.addEventListener('mousemove', ev_mousemove, false)
	canvas.addEventListener('mousedown', ev_mousedown, false)
	canvas.addEventListener('mouseup', ev_mouseup, false)
	canvas.addEventListener('keypress', ev_keypress, false)
	canvas.addEventListener('keyup', ev_keyup, false)
	canvas.addEventListener('dblclick', ev_dblclick, false)
	# Disable Dragging effect of canvas
	canvas.addEventListener('dragstart', (e) -> e.preventDefault(); false)
	canvas.onselectstart = () -> false

	#Load graph from local storage
	if !load_graph(graph)
		node1 = editor.nodes.add(graph, -50 + canvas.width/2, canvas.height/2)
		node2 = editor.nodes.add(graph,  50 + canvas.width/2, canvas.height/2)
		editor.edges.add(graph, node1, node2)
		editor.edges.add(graph, node2, node2)
	draw.automaton(ctx, graph)

	# selected = new graph_create()

	text_editor = document.getElementById("label_editor")
	text_editor.style.display = "none"
	text_editor.addEventListener('keypress', ((ev) ->  automaton(5, ev)), false)
	text_editor.onblur = (ev) -> 
		automaton(6, ev)
		null
	text_editor.addEventListener('keydown', ((ev) ->  automaton(7, ev)), false)

	null


get_mouse_xy = (ev) ->
	rc = canvas.getBoundingClientRect()
	[ev.clientX - rc.left, ev.clientY - rc.top]


window.onload = () ->
	init()
	null

ev_mousedown = (ev) ->
	automaton(1, ev)
	null

ev_mousemove = (ev) ->
	automaton(2, ev)
	# document.getElementById("debug").innerHTML = "x, y = " + get_mouse_xy(ev)
	null

ev_mouseup = (ev) ->
	automaton(3, ev)
	null

ev_dblclick = (ev) ->
	automaton(4, ev)
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
				draw.automaton(ctx, graph)
				save_graph(graph)
			when 26 # Z
				editor.undo()
				ctx.clearRect(0, 0, canvas.width, canvas.height)
				draw.automaton(ctx, graph)
				save_graph(graph)

	null

ev_keyup = (ev) ->
	switch ev.keyCode
		when 46 # Delete ### Move it to the main automaton!
			editor.nodes.del(graph, graph.nodes.length-1)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw.automaton(ctx, graph)
			save_graph(graph)
		when 81 # Q
			# Testing edges deletion
			editor.edges.del(graph, graph.edges.length-1)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			draw.automaton(ctx, graph)
		else
			# console.log "keyCode: " + ev.keyCode
	null



(tout = ()  ->
	console.log "."
	setTimeout(tout, 1000)
)()

