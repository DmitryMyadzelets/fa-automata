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


###
===============================================================================
###
@.pack = (x, y) -> ((x & 0xFFFF) << 16) | (y & 0xFFFF)
@.unpack = (xy) -> [(xy >> 16) & 0xFFFF, xy & 0xFFFF]

###
===============================================================================
###

###*
 * Converts a commma separated string to array of strings.
 * Cuts whitespaces in the beginnig and the end of each string.
 * @param  {string} s Any string
 * @return {Array[string]}   Array of strings
###
csv2array = (s) ->
	len = s.length
	ret = []
	st = 0
	i = 0
	while i < len
		c = s.charCodeAt(i)
		switch st
			when 0 # wait for not space and not comma
				if c != 32 and c !=  44
					start = i
					end = i
					st = 1
			when 1 #wait for space, comma or EOL
				if c == 44
					ret.push(s.substr(start, end-start+1))
					st = 0
				else if c != 32
					end = i

		if ++i == len and 1 == st
			ret.push(s.substr(start, end-start+1))
	ret

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
	parsed = JSON.parse($.jStorage.get("graph")) ? null
	parsed

###
===============================================================================
###
save_graph = (graph) ->
	# $.jStorage.flush() # Clean the storage
	if !($ && $.jStorage && $.jStorage.storageAvailable())
		return false
	$.jStorage.set("graph", JSON.stringify(graph))
	null

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
edgeByXY  = (graph, x, y) ->
	for $, index in graph.edges.$
		# Width and hight should be based on the text of the edge,
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


resizeCanvas = (w, h) ->
	if w != canvas.width or h != canvas.height
		canvas.width = w
		canvas.height = h
		# Canvas resets its values when resized, so we should set them again
		ctx.lineWidth = 1.2
		draw.automaton(ctx, graph)
	null

updateCanvas = () ->
	ctx.save()
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.restore()
	draw.automaton(ctx, graph)
	null

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
edge_ix = -1 # index of edge label


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
						# updateCanvas()
						# draw_selected(ctx, graph, selected)
						st = 2
					else 
						from.x = graph.nodes.x[node_ix]
						from.y = graph.nodes.y[node_ix]
						st = 1

				else if edgeByXY(graph, x, y) >= 0
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
				edge_ix = edgeByXY(graph, x, y)
				if edge_ix >= 0
					if graph.edges.events[edge_ix]?
						vals = []
						vals.push(graph.events[event]) for event in graph.edges.events[edge_ix]
						text = vals.join(", ")
					else
						text = ""
					text_editor.show(
						graph.edges.$[edge_ix].label[0][0]-20
						graph.edges.$[edge_ix].label[0][1]-10
						text)
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
			updateCanvas()

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
					updateCanvas()
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
					updateCanvas()
					st = 0
				else
					updateCanvas()
					st = 0

		when 4 # Moving graph
			switch eCode
				when 2 # move
					[x, y] = get_mouse_xy(ev)
					ctx.save()
					ctx.translate(x-from.x, y-from.y)
					updateCanvas()
					ctx.restore()
				when 3 # up
					[x, y] = get_mouse_xy(ev)
					# editor.move_graph(from.x, from.y, x, y) TODO: fix! 
					updateCanvas()
					graph_is_changed = true
					st = 0
				else # cancel movement (should be one value for entire graph)
					updateCanvas()
					st = 0

		when 5 # Creating a new node
			switch eCode
				when 3 # up
					[x, y] = get_mouse_xy(ev)
					editor.nodes.add(graph, x, y)
					updateCanvas()
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
				when 5 # Enter key pressed
					if edge_ix > -1
						arr = csv2array(text_editor.text())
						# Clear old events
						if graph.edges.events[edge_ix]?
							graph.edges.events[edge_ix].length = 0
						for v in arr
							event = automata.events.add(graph, v)
							automata.edges.events.add(graph, edge_ix, event)
						updateCanvas()
						graph_is_changed = true

					canvas.focus()
					st = 0
				when 6 # lost focus (cansel)
					canvas.focus()
					st = 0

	# If automation changes its state
	if (ost != st)
		console.log eCode + ": " + ost + "->" + st
		if 0 == st
			if graph_is_changed
				save_graph(graph)
				graph_is_changed = false
		if 6 == ost
			edge_ix = -1
	null


getStyleProperty = (element, prop) ->
	if window.getComputedStyle
		return window.getComputedStyle(element)[prop]
	else if element.currentStyle
		return element.currentStyle[prop]
	null


undo = () ->
	editor.undo()
	updateCanvas()
	save_graph(graph)
	null

redo = () ->
	editor.redo()
	updateCanvas()
	save_graph(graph)
	null

###
===============================================================================
###
init = (elementName) ->


	div = document.getElementById('container')
	canvas = document.getElementById(elementName)
	canvas.focus()
	#
	ctx = canvas.getContext("2d")
	ctx.lineWidth = 1.2

	# 
	# Set style properties for drawing
	# 
	draw.backgroundColor = v if (v = getStyleProperty(canvas, 'backgroundColor'))
	draw.font = v if (v = getStyleProperty(canvas, 'font'))
	draw.fontColor = v if (v = getStyleProperty(canvas, 'color'))
	# 
	if (node_style = document.getElementById('automaton-node'))
		draw.nodeBackgroundColor = v if (v = getStyleProperty(node_style, 'backgroundColor'))
		draw.nodeColor = v if (v = getStyleProperty(node_style, 'color'))
		draw.nodeFontColor = v if (v = getStyleProperty(node_style, 'color'))
	# 
	if (edge_style = document.getElementById('automaton-edge'))
		draw.edgeColor = v if (v = getStyleProperty(edge_style, 'backgroundColor'))
		draw.edgeFontColor = v if (v = getStyleProperty(edge_style, 'color'))

	#
	canvas.addEventListener('mousemove', ev_mousemove, false)
	canvas.addEventListener('mousedown', ev_mousedown, false)
	canvas.addEventListener('mouseup', ev_mouseup, false)
	# canvas.addEventListener('keypress', ev_keypress, false)
	# canvas.addEventListener('keyup', ev_keyup, false)
	canvas.addEventListener('keydown', ev_keydown, false)
	canvas.addEventListener('dblclick', ev_dblclick, false)
	# Disable Dragging effect of canvas
	canvas.addEventListener('dragstart', (e) -> e.preventDefault(); false)
	canvas.onselectstart = () -> false

	resizeCanvas(div.offsetWidth, div.offsetHeight)
	window.onresize = (ev) ->
		# console.log div.offsetHeight
		resizeCanvas(div.offsetWidth, div.offsetHeight)
		null


	el.onclick = undo if (el = document.getElementById('btn_undo')) 
	el.onclick = redo if (el = document.getElementById('btn_redo'))

	#Load graph from local storage
	g = load_graph(graph)
	if g == null
		console.log "default"
		node1 = editor.nodes.add(graph, -50 + canvas.width/2, canvas.height/2)
		node2 = editor.nodes.add(graph,  50 + canvas.width/2, canvas.height/2)
		editor.edges.add(graph, node1, node2)
		editor.edges.add(graph, node2, node2)
	else
		window.graph = g

	draw.automaton(ctx, graph)


	text_editor = new textarea
	text_editor.attach('label_editor'
		((ev)->automaton(5, ev)) # on Enter event
		((ev)->automaton(6, ev)) # on Cancel event
		)

	null


get_mouse_xy = (ev) ->
	rc = canvas.getBoundingClientRect()
	[ev.clientX - rc.left, ev.clientY - rc.top]


ev_mousedown = (ev) ->
	automaton(1, ev)
	null

ev_mousemove = (ev) ->
	automaton(2, ev)
	null

ev_mouseup = (ev) ->
	automaton(3, ev)
	null

ev_dblclick = (ev) ->
	automaton(4, ev)
	null

ev_keydown = (ev) ->
	if ev.ctrlKey
		# console.log ev.which
		# console.log ev.charCode
		switch ev.keyCode
			when 89 # Y
				redo()
			when 90 # Z
				undo()
	else
		switch ev.keyCode
			when 46 # Delete ### Move it to the main automaton!
				editor.nodes.del(graph, graph.nodes.v.length-1)
				updateCanvas()
				save_graph(graph)
			when 81 # Q
				# Testing edges deletion
				editor.edges.del(graph, graph.edges.v.length-1)
				updateCanvas()
			when 74 # J
				console.log  JSON.stringify(graph)

			else
				# console.log ev.keyCode
				null
	null


window.onload = () ->
	init("myCanvas")
	null


(tout = ()  ->
	console.log "."
	setTimeout(tout, 1000)
)()


@foo = () ->
	canvas.width = 1000
	null
