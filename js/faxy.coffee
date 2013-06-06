'use strict'

@r = 16 # Radius of circle for a node

# Some vector math is inspired by [http://media.tojicode.com/sfjs-vectors/]
vec = {

	create : () -> new Float32Array([0, 0])

	length : (v) ->	Math.sqrt(v[0]*v[0] + v[1]*v[1])

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

# 
#  Class for Automata extended for graphical representation
#
@.faxy = (($)->
	# 
	# Private methods
	#
	calc = {
		v : vec.create() # vector as a buffer for calculations

		stright : (v1, v2, norm) ->
			vec.subtract(v2, v1, @v)	# v = v2 - v1
			vec.normalize(@v, norm)		# norm = normalized v
			vec.scale(norm, r, @v)		# v = norm * r
			vec.add(v1, @v, v1)			# v1 = v1 + v
			vec.subtract(v2, @v, v2)	# v2 = v2 - v
			null

		arrow : (to, a, n) ->
			# 10 - length of the arrow
			# 8 - width of the arrow
			a[0] = to[0]
			a[1] = to[1]
			a[2] = a[0] - (10 * n[0]) + (4 * n[1])
			a[3] = a[1] - (10 * n[1]) - (4 * n[0])
			a[4] = a[2] - (8 * n[1])
			a[5] = a[3] + (8 * n[0])
			a

		curved : (v1, v2, norm, cv, _arrow) ->
			# Calc normalized vector
			vec.subtract(v2, v1, @v)	# v = v2 - v1
			vec.normalize(@v, norm)		# norm = normalized v
			# Control vector
			cv[0] = (v1[0] + v2[0])/2 + norm[1]*40
			cv[1] = (v1[1] + v2[1])/2 - norm[0]*40
			# 'From' vector
			vec.subtract(cv, v1, @v)	# v = cv - v1
			vec.normalize(@v, @v)		# v = normalized v
			vec.scale(@v, r, @v)		# v = v * r
			vec.add(v1, @v, v1)			# v1 = v1 + v
			# 'To' vector
			vec.subtract(v2, cv, @v)	# v = v2 - cv
			vec.normalize(@v, @v)		# v = normalized v
			vec.scale(@v, r, @v)		# v = v * r
			vec.subtract(v2, @v, v2)	# v2 = v2 - v
			# Calc arrow
			vec.normalize(@v, @v)
			@arrow(v2, _arrow, @v)
			null

		###*
		 * Constants for calculating a loop
		###
		K : ( () ->
			k = {
				ANGLE_FROM : Math.PI/3
				ANGLE_TO : Math.PI/12
			}
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
			@arrow($.v1, $.arrow, $.norm)
			null

		fake : (v1, v2, norm, is_new) ->
			vec.subtract(v2, v1, @v)	# v = v2 - v1
			vec.normalize(@v, norm)		# norm = normalized v
			vec.scale(norm, r, @v)		# v = norm * r
			vec.add(v1, @v, v1)			# v1 = v1 + v
			if not is_new
				vec.subtract(v2, @v, v2)# v2 = v2 - v
			null

		start : (v2, $) ->
			vec.copy(v2, $.v2)
			vec.subtract(v2, [4*r, 0], $.v1)
			@stright($.v1, $.v2, $.norm)
			@arrow($.v2, $.arrow, $.norm)
			null
	}


	# Updates coordinates related to the node 'a'
	update_node = (G, a) ->
		# Get edges outgoing of the node a
		inout = $.edges.out(G, a).concat($.edges.in(G, a))
		i = inout.length
		while i-- >0
			ix = inout[i]
			v1 = G.edges.a[ix]
			v2 = G.edges.b[ix]
			e = G.edges.$[ix]
			vec.copy([G.nodes.x[v1], G.nodes.y[v1]], e.v1)
			vec.copy([G.nodes.x[v2], G.nodes.y[v2]], e.v2)
			switch e.type
				when 0 # strigt
					calc.stright(e.v1, e.v2, e.norm)
					calc.arrow(e.v2, e.arrow, e.norm)
				when 1 # curved
					calc.curved(e.v1, e.v2, e.norm, e.cv, e.arrow)
				when 2 # loop
					calc.loop([G.nodes.x[v2], G.nodes.y[v2]], e)

		if a is G.start
			calc.start([G.nodes.x[a], G.nodes.y[a]], G.edges.start)
		null

	create_edge_data = () ->
		{
			type : 0				# Type of edge : 0 - stright, 1 - curved, 2 - loop
			v1 : vec.create()		# Vector 'from'
			v2 : vec.create()		# Vector 'to'
			cv : [ 					# Control vectors for curves
				vec.create()
				vec.create()]
			norm : vec.create()		# Normalized vector of the edge
			orth : vec.create()		# Orthogonal vector to the edge
			arrow : [
				vec.create()
				vec.create()
				vec.create()]		# Arrow coordinates 
		}

	# 
	# Private members
	#

	# This object is used for editor while creating a new edge
	fake_edge = create_edge_data()

	# 
	# Public metods
	# 
	_this = {
		# Creates a new graph	
	create : () ->
		G = $.create()
		_this.extend(G)
		G

	extend : (G) ->
		G.nodes.x = []
		G.nodes.y = []
		G.edges.$ = []	# Edge graphical extention
		G.edges.start = create_edge_data()

	# Create separete objects of nodes and edges.
	# Otherwise you would override methods 'fa.nodes.add' and etc.
	nodes : Object.create($.nodes)
	edges : Object.create($.edges)

	get_fake_edge : (x1, y1, x2, y2, is_new) ->
		vec.copy([x1, y1], fake_edge.v1)
		vec.copy([x2, y2], fake_edge.v2)
		calc.fake(fake_edge.v1, fake_edge.v2, fake_edge.norm, is_new)
		calc.arrow(fake_edge.v2, fake_edge.arrow, fake_edge.norm)
		fake_edge

	}

	_this.nodes.add = (G, x, y) ->
		i = $.nodes.add(G)
		G.nodes.x[i] = x
		G.nodes.y[i] = y
		i

	_this.nodes.move = (G, i, x, y) ->
		if i<G.nodes.length && i>-1
			G.nodes.x[i] = x
			G.nodes.y[i] = y
			update_node(G, i)
		i

	_this.edges.add = (G, a, b, args) ->
		return -1 if $.edges.has(G, a, b) > -1
		j = $.edges.has(G, b, a)
		i = $.edges.add(G, a, b, args)
		if i>=0
			G.edges.$[i] = create_edge_data()
			if a == b 
				G.edges.$[i].type = 2 # loop type
			else
				if j>=0
					G.edges.$[j].type = 1 # curved type
					G.edges.$[i].type = 1
				else
					G.edges.$[i].type = 0 # stright type
		update_node(G, a)
		i

	_this.edges.del = (G, i) ->
		a = G.edges.a[i]
		b = G.edges.b[i]
		if (ix = fa.edges.del(G, i)) >= 0
			if (eix = fa.edges.has(G, b, a)) >= 0
				G.edges.$[eix].type = 0
				update_node(G, a)
		ix

	_this # returns the object with public methods
)(fa)


