###
The functions here assume that there are global variables:
	array of automations "automata",
	array of graphics "graphics",
	radius of states "r",
	half radian "PI2".
###
'use strict'

@.r = 16 # Radius of circle for a node
PI2 = Math.PI * 2

# The first colors:
# cl_node = "rgba(0,0,255,0.2)"

# Colors taken from Haiku OS:
cl_black = "rgba(0,0,0, 0.8)"
cl_node = "#fec867" #(254, 200, 103)
cl_text = cl_black
cl_edge = cl_black
cl_node_edge = cl_black
cl_node_sel = "#da5d00" #(218, 93, 0) # color for selected nodes


###
===============================================================================
###
@.draw_state = (ctx, x, y) ->
	ctx.beginPath()
	ctx.arc(x, y, r, 0, PI2, true)
	ctx.fill()
	ctx.stroke()
	null

###
===============================================================================
###
draw_markedState = (ctx, x, y) ->
	ctx.save()
	ctx.fillStyle = "rgba(0,0,255,0.2)"
	ctx.beginPath()
	ctx.arc(x, y, r, 0, PI2, true)
	ctx.fill()
	ctx.stroke()
	ctx.beginPath()
	ctx.arc(x, y, r+4, 0, PI2, true)
	ctx.stroke()
	ctx.restore()
	null

###
===============================================================================
The functions draws stright directed edge from coordinates (x1, y1) to (x2, y2).
###
@.draw_edge = (ctx, x1, y1, x2, y2, fake_edge = false) ->
	dx = x2-x1
	dy = y2-y1
	# Length of vector 1->2
	dl = Math.sqrt(dx*dx + dy*dy)
	if (dl == 0)
		return
	# Normalized vector 1->2
	nx = dx / dl
	ny = dy / dl
	# Orthogonal vector
	ox =  ny
	oy = -nx
	# Edge coordinates
	x1 = x1 + r*nx
	y1 = y1 + r*ny
	if fake_edge == false
		x2 = x2 - r*nx
		y2 = y2 - r*ny
	# Arrow coordinates 
	# 10 - length of the arrow
	# 8 - width of the arrow
	x3 = x2 - (10 * nx) + (4 * ox)
	y3 = y2 - (10 * ny) + (4 * oy)
	x4 = x3 - (8 * ox)
	y4 = y3 - (8 * oy)
	#
	ctx.save()
	ctx.fillStyle = cl_edge
	ctx.strokeStyle = cl_edge
	# Edge
	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.lineTo(x2, y2)
	ctx.stroke()
	# Arrow
	ctx.beginPath()
	ctx.lineTo(x3, y3)
	ctx.lineTo(x4, y4)
	ctx.lineTo(x2, y2)
	ctx.stroke()
	ctx.fill()
	ctx.restore()
	null

###
===============================================================================
The functions draws edges.curved directed edge from (x1, y1) to (x2, y2).
###
@.draw_cured_edge = (ctx, x1, y1, x2, y2, fake_edge = false) ->
	dx = x2-x1
	dy = y2-y1
	# Length of vector 1->2
	dl = Math.sqrt(dx*dx + dy*dy)
	if (dl == 0)
		return
	# Normalized vector 1->2
	nx = dx / dl
	ny = dy / dl
	# Orthogonal vector. Goes left at the end: ____|
	ox =  ny
	oy = -nx
	# Control point of a quadratic curve
	cx = (x1 + x2)/2 + ox*dl/6 # you can pick any number looking nicer
	cy = (y1 + y2)/2 + oy*dl/6
	# The same calculations for the new vector
	dx = cx - x1
	dy = cy - y1
	dl = Math.sqrt(dx*dx + dy*dy)
	nx = dx / dl
	ny = dy / dl
	# Edge coordinates
	x1 = x1 + r*nx
	y1 = y1 + r*ny
	if fake_edge == false
		dx = x2 - cx
		dy = y2 - cy
		# dl is just the same
		nx = dx / dl
		ny = dy / dl
		ox =  ny
		oy = -nx
		x2 = x2 - r*nx
		y2 = y2 - r*ny
	# Arrow coordinates 
	# 10 - length of the arrow
	# 8 - width of the arrow
	x3 = x2 - (10 * nx) + (4 * ox)
	y3 = y2 - (10 * ny) + (4 * oy)
	x4 = x3 - (8 * ox)
	y4 = y3 - (8 * oy)
	#
	ctx.save()
	ctx.fillStyle = cl_edge
	ctx.strokeStyle = cl_edge
	# Edge
	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.quadraticCurveTo(cx, cy, x2, y2)
	ctx.stroke()
	# Arrow
	ctx.beginPath()
	ctx.lineTo(x3, y3)
	ctx.lineTo(x4, y4)
	ctx.lineTo(x2, y2)
	ctx.stroke()
	ctx.fill()
	ctx.restore()
	null

###
===============================================================================
###
angle_from = Math.PI/3
angle_to = Math.PI/12
loop_k = {
	dx1: r * Math.cos(angle_from)
	dy1: r * Math.sin(angle_from)
	dx2: r * 4 * Math.cos(angle_from)
	dy2: r * 4 * Math.sin(angle_from)
	dx3: r * 4 * Math.cos(angle_to)
	dy3: r * 4 * Math.sin(angle_to)
	dx4: r * Math.cos(angle_to)
	dy4: r * Math.sin(angle_to)
	nx: Math.cos(angle_from - Math.PI/24)
	ny: Math.sin(angle_from - Math.PI/24)
}
###
===============================================================================
###
@.draw_loop = (ctx, x, y) ->
	# Normalized vector for the first point
	# Fix: it is not normalized. It should be like that the back of the arrow
	# be divided in half by the loop line. Then, it depends on the size of 
	# the arrow at least. Empirically:
	nx = -loop_k.nx
	ny = loop_k.ny
	# Some Bazier calc (http://www.moshplant.com/direct-or/bezier/math.html).
	#
	# Orthogonal vector
	ox =  ny
	oy = -nx
	# Coordinates of the baizier curve (60 degrees angle)
	# x1 = x + r*0.5
	# y1 = y - r*0.87
	x1 = x + loop_k.dx1
	y1 = y - loop_k.dy1
	#
	k = 4*r
	x2 = x + loop_k.dx2
	y2 = y - loop_k.dy2
	#
	x3 = x + loop_k.dx3 # 15 degrees
	y3 = y - loop_k.dy3
	#
	x4 = x + loop_k.dx4
	y4 = y - loop_k.dy4
	# Arrow coordinates 
	# 10 - length of the arrow
	# 8 - width of the arrow
	#
	x5 = x1 - (10 * nx) + (4 * ox)
	y5 = y1 - (10 * ny) + (4 * oy)
	x6 = x5 - (8 * ox)
	y6 = y5 - (8 * oy)
	#
	ctx.save()
	ctx.fillStyle = cl_edge
	ctx.strokeStyle = cl_edge
	# Loop
	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4)
	ctx.stroke()
	# Arrow
	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.lineTo(x5, y5)
	ctx.lineTo(x6, y6)
	ctx.lineTo(x1, y1)
	ctx.stroke()
	ctx.fill()
	ctx.restore()
	null

###
===============================================================================
###
# draw_automation = (XY, T) ->
# 	#Draw states
# 	for xy in XY
# 		draw_state(xy[0], xy[1])
# 	#Draw transitions
# 	for t in T
# 		v1 = XY[t[0]]
# 		v2 = XY[t[2]]
# 		draw_edge(v1[0], v1[1], v2[0], v2[1])
# 	null


###
===============================================================================
###
# draw_automata = () ->
# 	for g in graphics
# 		draw_automation(
# 			g.xy, 
# 			automata[i].T #FIXIT: Bad design .)
# 			)
# 	null

###
===============================================================================
###
@.draw_graph = (ctx, G) ->
	# ctx.clearRect(0, 0, canvas.width, canvas.height)
	#Draw nodes
	ctx.save()
	# ctx.font = "12pt Calibri"
	ctx.textAlign = "center"
	ctx.strokeStyle = cl_node_edge
	dy = 12/2 # half of the font.size for text
	for x, index in G.nodes.x
		y = G.nodes.y[index]
		ctx.fillStyle = cl_node
		draw_state(ctx, x, y)
		# Draw text
		text = index.toString()
		# metrics = ctx.measureText(text)
		# width = metrics.width
		ctx.fillStyle = cl_text
		ctx.fillText(text, x, y+dy)
	#
	#Draw edges
	ix = G.edges.length
	while ix-- >0
		v1 = G.edges.a[ix]
		v2 = G.edges.b[ix]
		x1 = G.nodes.x[v1]
		y1 = G.nodes.y[v1]
		x2 = G.nodes.x[v2]
		y2 = G.nodes.y[v2]
		if v1 != v2
			if G.edges.curved[ix]
				draw_cured_edge(ctx, x1, y1, x2, y2)
			else							
				draw_edge(ctx, x1, y1, x2, y2)
			
		else
			draw_loop(ctx, x1, y1)
	ctx.restore()
	null

###
===============================================================================
###
@.draw_selected = (ctx, graph, selected) ->
	ctx.save()
	ctx.textAlign = "center"
	ctx.fillStyle = "rgba(0,0,255,0.2)"
	dy = 12/2 # half of the font.size for text
	for node in selected.nodes
		[x, y] = unpack(graph.nodes[node])
		draw_state(ctx, x, y)
		# Draw text
		text = node.toString()
		# metrics = ctx.measureText(text)
		# width = metrics.width
		ctx.fillText(text, x, y+dy)
	ctx.restore()
	null


@.draw_new = (ctx, X, Y) ->
	# ctx.clearRect(0, 0, canvas.width, canvas.height)
	#Draw nodes
	ctx.save()
	# ctx.font = "12pt Calibri"
	ctx.textAlign = "center"
	ctx.strokeStyle = cl_node_edge
	
	for i, ix in X
		j = Y[ix]
		ctx.beginPath()
		ctx.moveTo(G.nodes.x[i], y1)
		ctx.lineTo(x5, y5)
		ctx.stroke()
	ctx.restore()
	null

@.draw_automaton = (ctx, G) ->
	draw_graph(ctx, G)
	# Arrow to initial state
	x = G.nodes.x[G.start] - 4*r
	y = G.nodes.y[G.start]
	draw_edge(ctx, x, y, G.nodes.x[G.start], G.nodes.y[G.start])
	null
