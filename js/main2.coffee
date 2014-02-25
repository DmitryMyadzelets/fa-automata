'use strict'

x = y = 0
ctx = null
canvas = null



###
===============================================================================
###


resizeCanvas = (w, h) ->
	if w != canvas.width or h != canvas.height
		canvas.width = w
		canvas.height = h
		# Canvas resets its values when resized, so we should set them again
		ctx.lineWidth = 1.2
		# draw.automaton(ctx, graph)
	null

updateCanvas = () ->
	ctx.save()
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.restore()
	# draw.automaton(ctx, graph)
	null

###
===============================================================================
###

getStyleProperty = (element, prop) ->
	if window.getComputedStyle
		return window.getComputedStyle(element)[prop]
	else if element.currentStyle
		return element.currentStyle[prop]
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

	# #
	# canvas.addEventListener('mousemove', ev_mousemove, false)
	# canvas.addEventListener('mousedown', ev_mousedown, false)
	# canvas.addEventListener('mouseup', ev_mouseup, false)
	# canvas.addEventListener('keydown', ev_keydown, false)
	# canvas.addEventListener('dblclick', ev_dblclick, false)
	# Disable Dragging effect of canvas
	canvas.addEventListener('dragstart', (e) -> e.preventDefault(); false)
	canvas.onselectstart = () -> false

	resizeCanvas(div.offsetWidth, div.offsetHeight)
	window.onresize = (ev) ->
		# console.log div.offsetHeight
		resizeCanvas(div.offsetWidth, div.offsetHeight)
		null


	# el.onclick = undo if (el = document.getElementById('btn_undo')) 
	# el.onclick = redo if (el = document.getElementById('btn_redo'))


	# draw.automaton(ctx, graph)

	null


get_mouse_xy = (ev) ->
	rc = canvas.getBoundingClientRect()
	[ev.clientX - rc.left, ev.clientY - rc.top]


# ev_mousedown = (ev) ->
# 	automaton(1, ev)
# 	null

# ev_mousemove = (ev) ->
# 	automaton(2, ev)
# 	null

# ev_mouseup = (ev) ->
# 	automaton(3, ev)
# 	null

# ev_dblclick = (ev) ->
# 	automaton(4, ev)
# 	null

# ev_keydown = (ev) ->
# 	if ev.ctrlKey
# 		# console.log ev.which
# 		# console.log ev.charCode
# 		switch ev.keyCode
# 			when 89 # Y
# 				redo()
# 			when 90 # Z
# 				undo()
# 	else
# 		switch ev.keyCode
# 			when 46 # Delete ### Move it to the main automaton!
# 				editor.nodes.del(graph, graph.nodes.v.length-1)
# 				updateCanvas()
# 				save_graph(graph)
# 			when 81 # Q
# 				# Testing edges deletion
# 				editor.edges.del(graph, graph.edges.v.length-1)
# 				updateCanvas()
# 			when 74 # J
# 				console.log  JSON.stringify(graph)

# 			else
# 				# console.log ev.keyCode
# 				null
# 	null


window.onload = () ->
	init("myCanvas")
	null


(tout = ()  ->
	console.log "."
	setTimeout(tout, 1000)
)()


# # // make a new graph
# graph = new Springy.Graph()

# # // make some nodes
# spruce = graph.newNode({label: 'Norway Spruce'})
# fir = graph.newNode({label: 'Sicilian Fir'})

# # // connect them with an edge
# graph.newEdge(spruce, fir)
# # 

# console.log  $('#myCanvas')
	# { graph: graph })