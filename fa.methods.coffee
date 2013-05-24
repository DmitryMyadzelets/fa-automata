
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

# Breadth-first Search
fa.BFS = (G) ->
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

### TODO:
- Make dependence consistency (nodes <- edges) for deletion 
  and (events to edges) update.
###