
'use strict'



	# Creates a new finite automata
@.digraph = {
	create : () ->
		{
			nodes : {		# Nodes
				v : []		# Values
			}
			edges : {		# Edges
				a : []		# index of from-node
				b : []		# index of to-node
				v : []		# Values
			}
		}

	edges : {
		# Add a new edge (a, b) or add an edge into position i
		# Returns the position of the added edge
		add : (G, a, b, i) ->
			if not i?
				i = digraph.for_arrays_of(G.edges, ((arr) -> arr.push(null)))-1
			else
				digraph.for_arrays_of(G.edges, ((arr) -> digraph.ins(arr, i)))
			G.edges.a[i] = a
			G.edges.b[i] = b
			i

		del : (G, i) ->
			digraph.for_arrays_of(G.edges, digraph.del, i)

		# Returns value for the edge (i)
		get : (G, i) -> G.edges.v[i]

		# Set value for the edge (i)
		set : (G, i, v) -> G.edges.v[i] = v

		# Returns an array of edges such that (from_node, ?) in edges
		out : (G, from_node) ->
			i for b, i in G.edges.b when G.edges.a[i] is from_node

		# Returns true if edge (a, b) exists
		has : (G, a, b) ->
			(return true) for i, ix in G.edges.b when G.edges.a[ix] is a and i is b
			false
	}

	nodes : {
		# Add a new node to the end or inserts into position 'i'
		# Returns the position the node has been added to
		add : (G, i) ->
			if not i?
				i = digraph.for_arrays_of(G.nodes, ((arr) -> arr.push(null)))-1
			else
				digraph.for_arrays_of(G.nodes, ((arr) -> digraph.ins(arr, i)))
			i

		# Delete a node 'i'
		del : (G, i) ->
			digraph.for_arrays_of(G.nodes, digraph.del, i)

		# Returns value for the node (i)
		get : (G, i) -> G.nodes.v[i]

		# Set value for the node (i)
		set : (G, i, v) -> G.nodes.v[i] = v

		# Returns an array of nodes 'b' such that (from_node, b) in edges
		out : (G, from_node) ->
			b for b, i in G.edges.b when G.edges.a[i] is from_node

		# Returns an array of nodes 'a' such that (a, to_node) in edges
		in : (G, to_node) ->
			a for a, i in G.edges.a when G.edges.b[i] is to_node
	}

	### 
	# Helper methods
	# =======================================================================
	###

	# Insert a value 'v' into position 'i' of array
	ins : (arr, i, val) ->
		if i < arr.length
			arr.push(arr[i])
			arr[i] = val
		else
			arr.push(val)
		i

	# Delete an element 'i' of the array
	del : (arr, i) ->
		ret = -1
		if i >= 0
			last = arr.length-1
			if i < last
				arr[i] = arr.pop()
				ret = i
			else if i == last
				arr.pop()
				ret = i
		ret

	# Returns keys of the object wich have array type
	get_arrays : (obj) ->
		keys = []
		keys.push(key) for key of obj when obj[key] instanceof Array
		keys

	# Execute the function 'fnc' over all arrays of the object
	for_arrays_of : (obj, fnc, args) ->
		keys = @.get_arrays(obj)
		ret = fnc(obj[key], args) for key in keys
		ret

	###
	# digraph Methods
	# =======================================================================
	###

	# Breadth-first Search
	BFS : (G) ->
		stack = [G.start]
		visited = [G.start]
		while stack.length
			a = stack.pop()
			# Get edges going out of the node 'a'
			E = @.edges.out(G, a)
			for e in E
				# Get nodes reachabe by the edge 'e'
				b = G.edges.b[e]
				if b not in visited
					visited.push(b)
					stack.push(b)
				# Do something here
				# G.edges.v[e]
				console.log a,"->", b
		null

	###
	# Spring-electrical Model (SEM)
	Input :
		G = (V, E) - araph, (V,E) are sets of vertices and edges.
		X - set of coordinates of vertices for each i in V.
		tol - tolerance?
	Force_Directed_Algorithm (G, X, tol)

		Converged = false
		Step = initial step length
		Energy = Infinity
		
		while Converged is false
			X0 = X
			Energy0 = Energy
			Energy = 0
			
			for i in V
				f = 0
				for e=(i,j) in E when e.i is i
					f += f_a(i,j)*(xj - xi)/distance(xj - xi)
				for j in V
					f += f_r(i,j)*(xj - xi)/distance(xj - xi)
				xi 		+= step * (f/|f|) wtf?
				Energy 	+= |f|*|f|

			step = update_step_length(step, Energy, Energy0)
			if |X - X0| < (K * tol)
				Converged = true
		return X
	###
	# 
	# The algorithm is based on the article:
	# [1] http://www.mathematica-journal.com/issue/v10i1/graph_draw.html
	# 
	FDA : (G, X, Y) ->
		title = "Done in"
		console.time(title)

		converged = false
		K = 100
		C = 0.2
		CKK = C*K*K
		CKKK = C*K*K*K
		step = K / 10
		progress = 0
		energy = Number.MAX_VALUE
		FX = []
		FY = []
		iteration = 0


		while not converged
			++iteration
			energy0 = energy
			energy = 0
			X0 = X.slice(0)
			Y0 = Y.slice(0)

			(FX[i] = FY[i] = 0) for v, i in G.nodes.v

			# We iterate over all vertices
			for v, i in G.nodes.v
				# Get in/out vetices to 'i'
				J = digraph.nodes.out(G, i).concat digraph.nodes.in(G, i)
				fx = 0
				fy = 0
				# Enumerate all adjacent vertices (skip self-loop)
				for u, j in G.nodes.v when j isnt i
					# Vector from i to j = j-i
					dx = X[j] - X[i]
					dy = Y[j] - Y[i]
					# Trick if coordinates overlappe
					if dx == 0 and dy == 0
						dx = dy = Math.random()
					# Square of the length = |i->j|^2
					dl2 = dx*dx + dy*dy
					# Length of i->j
					dl = Math.sqrt(dl2)
					# Atractive force
					# _fa = dl^2/K
					if j in J
						fx += dx * (dl / K)
						fy += dy * (dl / K)
					# Repulsive force
					# _fr = -C * K^2/ dl
					# _fr = -C * K^3 / dl^2
					fx += dx * (-CKK / dl2)
					fy += dy * (-CKK / dl2)

				FX[i] = fx
				FY[i] = fy
				# energy += Math.sqrt(fx*fx + fy*fy)
				energy += (fx*fx + fy*fy)
			
			# Update of the step, refined "cooling schedule" from [1]
			if energy < energy0
				if ++progress >= 5
					progress = 0
					step /= 0.9
			else
				progress = 0
				step *= 0.9
			de = energy0 - energy
			# de = Math.sqrt(de*de)
			de *= de
			# Combined forces on vertices
			sumFX = 0
			sumFY = 0
			for fx, i in FX
				fy = FY[i]
				sumFX += Math.sqrt(fx*fx) 
				sumFY += Math.sqrt(fy*fy) 
			# Update coordinates
			for x, i in X
				(X[i] += step * FX[i]/sumFX) if sumFX > 0
				(Y[i] += step * FY[i]/sumFY) if sumFY > 0

			# Debug info
			# sx = []
			# sx.push(v.toFixed(2)) for v in X
			# console.log "X:", sx, energy.toFixed(2), de.toFixed(2)

			# Decision if we have done
			# sumXY = 0
			# for x, i in X
			# 	dx = X0[i]-X[i]
			# 	dy = Y0[i]-Y[i]
			# 	dl2 = dx*dx + dy*dy
			# 	sumXY += Math.sqrt(dl2)
			# console.log sumXY
			console.log de
			converged = (iteration >= 100) or (de < (K*0.01))
			# converged = (de < (K*0.01))

		# console.log "X:", JSON.stringify(X)
		console.log "Converged in", iteration, "steps"
		console.timeEnd(title)
		null
}

# 
#  Class for Finite Automata
# 
@.fa = Object.create(digraph)

fa.extend = (G) ->
	G.start = 0 	# Initial state
	G.events = {	# Events
		v : []
	}	
	G

fa.create = () ->
	G = digraph.create()
	fa.extend(G)

fa.events = {
	add : (G, v, i) ->
		return -1 if not v?
		return ix if (ix = G.events.v.indexOf(v)) >= 0
		if not i?
			i = fa.for_arrays_of(G.events, ((arr) -> arr.push(null)))-1
		else
			fa.for_arrays_of(G.events, ((arr) -> fa.ins(arr, i)))
		G.events.v[i] = v
		i

	del : (G, i) ->
		fa.for_arrays_of(G.events, fa.del, i)
}


# 
#  Class for Automata extended for graphical representation
# 
@.faxy = Object.create(fa)

faxy.extend = (G) ->
	G.nodes.x = []
	G.nodes.y = []
	G

faxy.create = () ->
	G = fa.create()
	faxy.extend(G)


# Example of extending automaton
# Create new object
@.g = faxy.create()
# Add new properties to nodes
# Add a new node. Note that new properties have beed added as well 
console.log a = faxy.nodes.add(g)
console.log b = faxy.nodes.add(g)
console.log faxy.edges.add(g, a, b)
console.log faxy.edges.add(g, a, a)
console.log faxy.edges.add(g, b, b)
console.log "Nodes: ", g.nodes
console.log "Edges: ", g.edges

