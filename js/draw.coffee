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
# Empty string symbol - Epsilon:
empty_string = "\u03b5"


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
@.calc_arrow = (to, norm, orth, v) ->
	# Arrow coordinates 
	# 10 - length of the arrow
	# 8 - width of the arrow
	v[0] = to[0]
	v[1] = to[1]
	v[2] = v[0] - (10 * norm[0]) + (4 * norm[1])
	v[3] = v[1] - (10 * norm[1]) - (4 * norm[0])
	v[4] = v[2] - (8 * norm[1])
	v[5] = v[3] + (8 * norm[0])
	null

@.calc_norm_ort = (v1, v2, norm, orth) ->
	dx = v2[0]-v1[0]
	dy = v2[1]-v1[1]
	# Length of vector 1->2
	dl = Math.sqrt(dx*dx + dy*dy)
	return [] if (dl == 0)
	# Normalized vector 1->2
	norm[0] = dx / dl
	norm[1] = dy / dl
	# Orthogonal vector
	orth[0] =  norm[1]
	orth[1] = -norm[0]
	null


@.calc_edge = (v1, v2, norm) ->
	v1[0] += r*norm[0]
	v1[1] += r*norm[1]
	v2[0] -= r*norm[0]
	v2[1] -= r*norm[1]
	null

@.calc_curved = (v1, v2, norm, orth, cv, arrow) ->
	calc_norm_ort(v1, v2, norm, orth)
	# dl = Math.sqrt(dx*dx + dy*dy)
	# cv[0] = (v1[0] + v2[0])/2 + ox*dl/6 # you can pick any number looking nicer
	# cv[1] = (v1[1] + v2[1])/2 + oy*dl/6
	cv[0] = (v1[0] + v2[0])/2 + norm[1]*40
	cv[1] = (v1[1] + v2[1])/2 - norm[0]*40
	n = [] # Normal vector
	o = [] # Orthogonal vector
	calc_norm_ort(v1, cv, n, o)
	calc_edge(v1, [], n)
	calc_norm_ort(cv, v2, n, o)
	calc_edge([], v2, n)
	calc_arrow(v2, n, o, arrow)
	null

# Draws directed edge
# e - = G.edges
# ix - index of edge
@.draw_edge = (ctx, v1, v2) ->
	ctx.beginPath()
	ctx.moveTo(v1[0], v1[1])
	ctx.lineTo(v2[0], v2[1])
	ctx.stroke()
	null

# v1 - vector 'from'
# v2 - vector 'to'
# cv - control vector
@.draw_curved = (ctx, v1, v2, cv)	->
	ctx.beginPath()
	ctx.moveTo(v1[0], v1[1])
	ctx.quadraticCurveTo(cv[0], cv[1], v2[0], v2[1])
	ctx.stroke()
	null

@.draw_arrow = (ctx, v) ->
	ctx.beginPath()
	ctx.lineTo(v[0], v[1])
	ctx.lineTo(v[2], v[3])
	ctx.lineTo(v[4], v[5])
	ctx.stroke()
	ctx.fill()
	null

@.draw_fake_edge = (ctx, x1, y1, x2, y2, new_edge) ->
	# Edge coordinates
	norm = []
	orth = []
	calc_norm_ort([x1, y1], [x2, y2], norm, orth)
	x1 = x1 + r*norm[0]
	y1 = y1 + r*norm[1]
	if not new_edge
		x2 = x2 - r*norm[0]
		y2 = y2 - r*norm[1]
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
	v = []
	calc_arrow([x2, y2], norm, orth, v)
	draw_arrow(ctx, v)
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
	# #
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
# draw_automaton = (XY, T) ->
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
@.draw_graph = (ctx, G) ->
	# ctx.clearRect(0, 0, canvas.width, canvas.height)
	#Draw nodes
	ctx.save()
	# ctx.font = "12pt Calibri"
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.strokeStyle = cl_node_edge
	for x, index in G.nodes.x
		y = G.nodes.y[index]
		ctx.fillStyle = cl_node
		draw_state(ctx, x, y)
		# Draw text
		text = index.toString()
		# metrics = ctx.measureText(text)
		# width = metrics.width
		ctx.fillStyle = cl_text
		ctx.fillText(text, x, y)
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
				draw_curved(ctx, G.edges.v1[ix], G.edges.v2[ix], G.edges.cv[ix])
				draw_arrow(ctx, G.edges.arrow[ix])
			else
				ctx.fillStyle = cl_edge
				ctx.strokeStyle = cl_edge
				draw_edge(ctx, G.edges.v1[ix], G.edges.v2[ix])
				draw_arrow(ctx, G.edges.arrow[ix])
			
		else
			draw_loop(ctx, x1, y1)
	ctx.restore()
	null

###
===============================================================================
###
@.draw_automaton = (ctx, G) ->
	draw_graph(ctx, G)
	# Arrow to initial state
	x = G.nodes.x[G.start] - 4*r
	y = G.nodes.y[G.start]
	# draw_edge(ctx, [x, y], [G.nodes.x[G.start], G.nodes.y[G.start]]) FIXIT
	
	# Transition labels
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.fillStyle = cl_black
	ix = G.edges.length
	text = ""
	while ix-- >0
		v1 = G.edges.a[ix]
		v2 = G.edges.b[ix]
		x1 = G.nodes.x[v1]
		y1 = G.nodes.y[v1]
		x2 = G.nodes.x[v2]
		y2 = G.nodes.y[v2]
		if v1 != v2
			if G.edges.curved[ix]
				x = G.edges.cv[ix][0]
				y = G.edges.cv[ix][1]
			else
				x = x1 + (x2-x1)/2 + r*G.edges.orth[ix][0]
				y = y1 + (y2-y1)/2 + r*G.edges.orth[ix][1]
		else
			x = x1 + 2*r
			y = y1 - 3*r

		if G.edges.event[ix]?
			text = empty_string
		else
			text = empty_string
		ctx.fillText(text, x, y)

	null
