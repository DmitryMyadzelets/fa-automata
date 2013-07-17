
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
###*
 * A wrapper (Module pattern) for drawing methods
 * @return {Object}
###
@.draw = ( () ->
	_this = {
		###*
		 * Draws a state of the automaton
		 * @param  {canvas} ctx
		 * @param  {Number} x
		 * @param  {Number} y
		 * @return {null}
		###
		state : (ctx, x, y) ->
			ctx.beginPath()
			ctx.arc(x, y, r, 0, PI2, true)
			ctx.fill()
			ctx.stroke()
			null

		###*
		 * Draws marked state
		 * @param  {canvas} ctx
		 * @param  {Number} x
		 * @param  {Number} y
		 * @return {null}
		###
		marked : (ctx, x, y) ->
			draw_state(ctx, x, y)
			ctx.beginPath()
			ctx.arc(x, y, r+4, 0, PI2, true)
			ctx.stroke()
			null

		###*
		 * Draws a line (edge) from vector v1 to vector v2
		 * @param  {canvas} ctx
		 * @param  {[Number, Number]} v1 Coordinates [x, y]
		 * @param  {[Number, Number]} v2 Coordinates [x, y]
		 * @return {null}
		###
		edge : (ctx, v1, v2) ->
			ctx.beginPath()
			ctx.moveTo(v1[0], v1[1])
			ctx.lineTo(v2[0], v2[1])
			ctx.stroke()
			null

		###*
		 * Draws a quadratic curve line from vector v1 to vector v2
		 * @param  {canvas} ctx
		 * @param  {[Number, Number]} v1 Coordinates
		 * @param  {[Number, Number]} v2 Coordinates
		 * @param  {[Number, Number]} cv Control vector
		 * @return {null}
		###
		curved : (ctx, v1, v2, cv)	->
			ctx.beginPath()
			ctx.moveTo(v1[0], v1[1])
			ctx.quadraticCurveTo(cv[0], cv[1], v2[0], v2[1])
			ctx.stroke()
			null

		###*
		 * Draws an arrow
		 * @param  {canvas} ctx
		 * @param  {Number[6]} v Array of 3 vectors
		 * @return {null}
		###
		arrow : (ctx, v) ->
			ctx.beginPath()
			ctx.lineTo(v[0], v[1])
			ctx.lineTo(v[2], v[3])
			ctx.lineTo(v[4], v[5])
			ctx.stroke()
			ctx.fill()
			null


		###*
		 * Draws a loop edge
		 * @param  {canvas} ctx
		 * @param  {Number} x Coordinate of the node
		 * @param  {Number} y Coordinate of the node
		 * @return {null}
		###
		loop : (ctx, v1, v2, cv) ->
			ctx.beginPath()
			ctx.moveTo(v1[0], v1[1])
			ctx.bezierCurveTo(cv[0], cv[1], cv[2], cv[3], v2[0], v2[1])
			ctx.stroke()
			null


		###*
		 * The above functions are structure-independent.
		 * The below functions are dependent on the automaton structure
		 * described in the 'faxy.coffee' file
		###

		###*
		 * Draws an edge
		 * @param  {canvas} ctx
		 * @param  {Object} o Parameters of the edge
		 * @return {null}
		###
		any_edge : (ctx, o) ->
			switch o.type
				when 0 # stright 
					_this.edge(ctx, o.v1, o.v2)
					_this.arrow(ctx, o.arrow)
				when 1 # curved
					_this.curved(ctx, o.v1, o.v2, o.cv)
					_this.arrow(ctx, o.arrow)
				when 2 # loop
					_this.loop(ctx, o.v1, o.v2, o.cv)
					_this.arrow(ctx, o.arrow)

			null


		###*
		 * Draws a fake edge
		 * @param  {canvas} ctx
		 * @param  {Object} o Parameters of the edge
		 * @return {null}
		###
		fake_edge : (ctx, o) ->
			ctx.save()
			ctx.fillStyle = cl_edge
			ctx.strokeStyle = cl_edge
			_this.any_edge(ctx, o)
			ctx.restore()
			null


		###*
		 * Draws automaton graph on canvas
		 * @param  {canvas} ctx
		 * @param  {faxy} G Automaton structure
		 * @return {null}
		###
		automaton : (ctx, G) ->
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
			_this.fake_edge(ctx, G.edges.start)
			#
			ix = G.edges.length
			# console.log G.edges.a
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
				_this.any_edge(ctx, $)
				# Calculate the event label coordinates
				switch $.type
					when 0 # stright 
						x = x1 + (x2-x1)/2 + 0.5*r*$.norm[1]
						y = y1 + (y2-y1)/2 - 0.5*r*$.norm[0]
					when 1 # curved
						x = $.cv[0] + (-5)*$.norm[1]
						y = $.cv[1] - (-5)*$.norm[0]
					else # 2, loop
						x = x1 + 2*r
						y = y1 - 3*r

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
				_this.state(ctx, x, y)
				# Draw text
				text = ix.toString()
				# metrics = ctx.measureText(text)
				# width = metrics.width
				ctx.fillStyle = cl_text
				ctx.fillText(text, x, y)

			ctx.restore()
			null


	} # end of the object
	_this
)()

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
