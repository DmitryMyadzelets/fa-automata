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
	# ctx.fillStyle = "rgba(0,0,255,0.2)"
	ctx.beginPath()
	ctx.arc(x, y, r, 0, PI2, true)
	ctx.fill()
	ctx.stroke()
	ctx.beginPath()
	ctx.arc(x, y, r+4, 0, PI2, true)
	ctx.stroke()
	null

###
===============================================================================
###

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

@.draw_fake_edge = (ctx, o) ->
	ctx.save()
	ctx.fillStyle = cl_edge
	ctx.strokeStyle = cl_edge
	draw_edge(ctx, o.v1, o.v2)
	draw_arrow(ctx, o.arrow)
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
@.draw_automaton = (ctx, G) ->
	ctx.save()
	# ctx.font = "12pt Calibri"
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.fillStyle = cl_black
	# 
	# Draw edges
	# 
	ctx.fillStyle = cl_edge
	ctx.strokeStyle = cl_edge
	text = ""
	# Arrow to initial state
	draw_fake_edge(ctx, G.edges.start)
	#
	ix = G.edges.length
	while ix-- >0
		# Indexes of the nodes
		v1 = G.edges.a[ix]
		v2 = G.edges.b[ix]
		# Coordinates of the nodes
		x1 = G.nodes.x[v1]
		y1 = G.nodes.y[v1]
		x2 = G.nodes.x[v2]
		y2 = G.nodes.y[v2]
		# Edge graphical info
		$ = G.edges.$[ix]
		if v1 == v2 # loop
			draw_loop(ctx, x1, y1)
			x = x1 + 2*r
			y = y1 - 3*r
		else
			if $.curved
				draw_curved(ctx, $.v1, $.v2, $.cv)
				draw_arrow(ctx, $.arrow)
				# Label coordinates
				x = $.cv[0] + (-5)*$.norm[1]
				y = $.cv[1] - (-5)*$.norm[0]
			else
				draw_edge(ctx, $.v1, $.v2)
				draw_arrow(ctx, $.arrow)
				x = x1 + (x2-x1)/2 + 0.5*r*$.norm[1]
				y = y1 + (y2-y1)/2 - 0.5*r*$.norm[0]

		if G.edges.event[ix]?
			text = empty_string
		else
			text = empty_string
		ctx.fillText(text, x, y)
	# 
	# Draw nodes
	# 
	ix = G.nodes.length
	while ix-- >0
		x = G.nodes.x[ix]
		y = G.nodes.y[ix]
		ctx.fillStyle = cl_node
		draw_state(ctx, x, y)
		# Draw text
		text = ix.toString()
		# metrics = ctx.measureText(text)
		# width = metrics.width
		ctx.fillStyle = cl_text
		ctx.fillText(text, x, y)

	ctx.restore()
	null
