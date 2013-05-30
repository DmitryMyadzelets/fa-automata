
'use strict'


@.digraph = (()->

	# 
	# Private methods
	# 

	# Insert a value 'v' into position 'i' of array
	ins = (arr, i, val) ->
		if i < arr.length
			arr.push(arr[i])
			arr[i] = val
		else
			arr.push(val)
		i

	# Delete an element 'i' of the array
	del = (arr, i) ->
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
	get_arrays = (obj) ->
		keys = []
		keys.push(key) for key of obj when obj[key] instanceof Array
		keys

	# Execute the function 'fnc' over all arrays of the object
	for_arrays_of = (obj, fnc, args) ->
		keys = get_arrays(obj)
		ret = fnc(obj[key], args) for key in keys
		ret

	# Changes nodes to (a, b)
	# Returns array of old nodes [a, b]
	change_nodes = (G, i, a, b) ->
		ret = [G.edges.a[i], G.edges.b[i]]
		G.edges.a[i] = a
		G.edges.b[i] = b
		ret

	# 
	# Public metods
	# 
	_this = {
		# Creates a new graph
		create : () ->
			o = {
				nodes : {		# Nodes
					v : []		# Values
				}
				edges : {		# Edges
					a : []		# index of from-node
					b : []		# index of to-node
					v : []		# Values
				}
			}
			# 'length' property for use in cycles
			Object.defineProperty o.nodes, 'length', get: -> o.nodes.v.length
			Object.defineProperty o.edges, 'length', get: -> o.edges.v.length
			o

		edges : {
			# Add a new edge (a, b) or add an edge into position i
			# Returns the position of the added edge
			add : (G, a, b, i) ->
				return -1 if a<0 or b<0 or a>=G.nodes.length or b>=G.nodes.length
				if not i?
					i = for_arrays_of(G.edges, ((arr) -> arr.push(null)))-1
				else
					for_arrays_of(G.edges, ((arr) -> ins(arr, i)))
				G.edges.a[i] = a
				G.edges.b[i] = b
				i

			del : (G, i) ->
				return -1 if i<0 or i>=G.edges.length
				for_arrays_of(G.edges, del, i)

			# Returns value for the edge (i)
			get : (G, i) -> G.edges.v[i]

			# Set value for the edge (i)
			set : (G, i, v) -> G.edges.v[i] = v

			# Returns an array of edges such that (from_node, ?) in edges
			out : (G, from_node) ->
				i for b, i in G.edges.b when G.edges.a[i] is from_node

			# Returns its index if edge (a, b) exists
			has : (G, a, b) ->
				(return ix) for i, ix in G.edges.b when G.edges.a[ix] is a and i is b
				-1
		}

		nodes : {
			# Add a new node to the end or inserts into position 'i'
			# Returns the position the node has been added to
			add : (G, i) ->
				if not i?
					i = for_arrays_of(G.nodes, ((arr) -> arr.push(null)))-1
				else
					for_arrays_of(G.nodes, ((arr) -> ins(arr, i)))
				i

			# Delete a node 'i'
			del : (G, i, on_del_edge) ->
				# First delete ingoing and outgoing edges
				last_node = G.nodes.length-1
				ix = G.edges.length
				while ix-- >0
					a = G.edges.a[ix] 
					b = G.edges.b[ix]
					if (a == i) or (b == i)
						if typeof on_del_edge == "function"
							on_del_edge.apply(@, [G, ix])
						else 
							_this.edges.del(G, ix)
					else if i < last_node
					# If the node 'i' is not the last 
					# then the last node moves to the position of deleted one, and
					# hence we have to update the correspondent edges
						change = false
						if a == last_node then a = i; change = true
						if b == last_node then b = i; change = true
						change_nodes(G, ix, a, b) if change

				# Then delete the node itself
				for_arrays_of(G.nodes, del, i)

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
	}
)()

