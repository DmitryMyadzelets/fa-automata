'use strict'

# Some vector math is inspired by [http://media.tojicode.com/sfjs-vectors/]
vector = {

	create : () -> new Float32Array([0, 0])

	length : (v) ->	Math.sqrt(v[0]*v[0] + v[1]*v[1])

	normalize : (v, out) ->
		len = length(v)
		len = 1 / len
		out[0] = v[0] * len
		out[1] = v[1] * len
		out

	orthogonal : (v, out) ->
		out[0] =  v[1]
		out[1] = -v[0]
		out

	subtract : (a, b, out) ->
		out[0] = a[0] - b[0]
		out[1] = a[1] - b[1]
		out
}

# 
#  Class for Automata extended for graphical representation
#
@.faxyz = (($)->
	# 
	# Private methods
	# 

	arrow = (to, a, n) ->
		# 10 - length of the arrow
		# 8 - width of the arrow
		a[0] = to[0]
		a[1] = to[1]
		a[2] = a[0] - (10 * n[0]) + (4 * n[1])
		a[3] = a[1] - (10 * n[1]) - (4 * n[0])
		a[4] = a[2] - (8 * n[1])
		a[5] = a[3] + (8 * n[0])
		a

	curved = (v1, v2, norm, orth, cv, arrow) ->
		v = vector.create()
		vector.subtract(v2, v1, v)
		vector.normalize(v, norm)
		#
		cv[0] = (v1[0] + v2[0])/2 + norm[1]*40
		cv[1] = (v1[1] + v2[1])/2 - norm[0]*40
		n = vector() # Normal vector
		o = vector() # Orthogonal vector
		calc_norm_ort(v1, cv, n, o)
		normal(v1, n)
		calc_edge(v1, [], n)
		calc_norm_ort(cv, v2, n, o)
		calc_edge([], v2, n)
		calc_arrow(v2, n, o, arrow)
		null


	# Updates coordinates related to the node 'a'
	update_node = (G, a) ->
		# Get edges outgoing of the node a
		inout = $.edges.out(G, a).concat($.edges.in(G, a))
		i = inout.length
		while i-- >0
			ix = inout[i]
			v1 = G.edges.a[ix]
			v2 = G.edges.b[ix]
			# Coordinates of the nodes
			x1 = G.nodes.x[v1]
			y1 = G.nodes.y[v1]
			x2 = G.nodes.x[v2]
			y2 = G.nodes.y[v2]
			e = G.edges
			if v1 != v2 # not loop
				e.v1[ix][0] = x1
				e.v1[ix][1] = y1
				e.v2[ix][0] = x2
				e.v2[ix][1] = y2
				if e.curved[ix]
					window.calc_curved(e.v1[ix], e.v2[ix], e.norm[ix], e.orth[ix], e.cv[ix], e.arrow[ix])
				else
					window.calc_norm_ort(e.v1[ix], e.v2[ix], e.norm[ix], e.orth[ix])
					window.calc_edge(e.v1[ix], e.v2[ix], e.norm[ix])
					window.calc_arrow(e.v2[ix], e.norm[ix], e.orth[ix], e.arrow[ix])
			else # loop
				null
		null

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
		G.edges._ = []
		G

	# Create separete objects of nodes and edges.
	# Otherwise you would override methods 'fa.nodes.add' and etc.
	nodes : Object.create($.nodes)
	edges : Object.create($.edges)
	}

	_this.nodes.add = (G, x, y) ->
		ix = $.nodes.add(G)
		G.nodes.x[ix] = x
		G.nodes.y[ix] = y
		ix

	_this.nodes.move = (G, i, x, y) ->
		if i<G.nodes.length && i>-1
			G.nodes.x[i] = x
			G.nodes.y[i] = y
			# faxy.edges.update_xy(G, i)
		i

	_this.edges.add = (G, a, b, args) ->
		return -1 if $.edges.has(G, a, b) > -1
		eix = $.edges.has(G, b, a)
		ix = $.edges.add(G, a, b, args)
		if ix>=0 
			G.edges._[ix] = () -> {
				curved : false
				v1 : vector()		# Vector 'from'
				v2 : vector()		# Vector 'to'
				cv : vector()		# Control vector for curve
				norm : vector()		# Normalized vector of the edge
				orth : vector()		# Orthogonal vector to the edge
				arrow : [
					vector()
					vector()
					vector()]		# Arrow coordinates 
			}
			if eix>=0
				G.edges._[eix].curved = true
				G.edges._[ix].curved = true
				# faxy.edges.update_xy(G, b, a)
		# faxy.edges.update_xy(G, a, b)
		ix

	_this.edges.del = (G, i) ->
		a = G.edges.a[i]
		b = G.edges.b[i]
		if (ix = fa.edges.del(G, i)) >= 0
			if (eix = fa.edges.has(G, b, a)) >= 0
				G.edges._[eix].curved = false
		ix


	_this # return the object with public methods
)(fa)

@.faxy = Object.create(fa)  

faxy.create = () ->
	G = fa.create()
	faxy.extend(G)
	faxyz.extend(G)
	G


faxy.extend = (G) ->
	G.nodes.x = []
	G.nodes.y = []
	#
	vector = () -> new Float32Array([0, 0])
	#
	G.edges.curved = []
	G.edges.v1 = []		# Vector 'from'
	G.edges.v2 = []		# Vector 'to'
	G.edges.cv = []		# Control vector for curve
	G.edges.norm = []	# Normalized vector of the edge
	G.edges.orth = []	# Orthogonal vector to the edge
	G.edges.arrow = []	# Arrow coordinates 
	#
	G

# Create separete objects of nodes and edges.
# Otherwise you would override methods 'fa.nodes.add' and etc.
faxy.nodes = Object.create(fa.nodes)
faxy.edges = Object.create(fa.edges)

faxy.nodes.add = (G, x, y) ->
	ix = fa.nodes.add(G)
	G.nodes.x[ix] = x
	G.nodes.y[ix] = y
	ix

faxy.nodes.move = (G, i, x, y) ->
	if i<G.nodes.length && i>-1
		G.nodes.x[i] = x
		G.nodes.y[i] = y
		faxy.edges.update_xy(G, i)
	i


faxy.edges.add = (G, a, b, args) ->
	return -1 if fa.edges.has(G, a, b) > -1
	eix = fa.edges.has(G, b, a)
	ix = fa.edges.add(G, a, b, args)
	if ix>=0 
		G.edges.v1[ix] = []
		G.edges.v2[ix] = []
		G.edges.cv[ix] = []
		G.edges.norm[ix] = []
		G.edges.orth[ix] = []
		G.edges.arrow[ix] = []
		if eix>=0
			G.edges.curved[eix] = true
			G.edges.curved[ix] = true
			# faxy.edges.update_xy(G, b, a)
	faxy.edges.update_xy(G, a, b)
	ix

faxy.edges.del = (G, i) ->
	# console.log arguments
	a = G.edges.a[i]
	b = G.edges.b[i]
	if (ix = fa.edges.del(G, i)) >= 0
		if (eix = fa.edges.has(G, b, a)) >= 0
			G.edges.curved[eix] = false
	ix

# Updates coordinates related to the edge(a, b) representation
faxy.edges.update_xy = (G, a, b) ->
	# Get edges outgoing of the node a
	inout = faxy.edges.out(G, a).concat(faxy.edges.in(G, a))
	i = inout.length
	while i-- >0
		ix = inout[i]
		v1 = G.edges.a[ix]
		v2 = G.edges.b[ix]
		# Coordinates of the nodes
		x1 = G.nodes.x[v1]
		y1 = G.nodes.y[v1]
		x2 = G.nodes.x[v2]
		y2 = G.nodes.y[v2]
		e = G.edges
		if v1 != v2 # not loop
			e.v1[ix][0] = x1
			e.v1[ix][1] = y1
			e.v2[ix][0] = x2
			e.v2[ix][1] = y2
			if e.curved[ix]
				window.calc_curved(e.v1[ix], e.v2[ix], e.norm[ix], e.orth[ix], e.cv[ix], e.arrow[ix])
			else
				window.calc_norm_ort(e.v1[ix], e.v2[ix], e.norm[ix], e.orth[ix])
				window.calc_edge(e.v1[ix], e.v2[ix], e.norm[ix])
				window.calc_arrow(e.v2[ix], e.norm[ix], e.orth[ix], e.arrow[ix])
		else # loop
			null
	null