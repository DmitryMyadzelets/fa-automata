
'use strict'

# This approach of Array extention is taken from:
# http://stackoverflow.com/questions/13081379/javascript-extending-array-class
extArray = () -> null
extArray.prototype = Object.create(Array.prototype)
extArray.prototype.constructor = extArray


# Returns object's keys wich have the Array type
extArray.prototype.get_arrays = (o) ->
	keys = []
	keys.push(key) for key of o when o[key] instanceof Array
	keys


# Execute the function 'fnc' over all the object's properties of Array type
extArray.prototype.for_arrays_of = (obj, fnc, args) ->
	keys = @get_arrays(obj)
	ret = fnc(obj[key], args) for key in keys
	ret

# Adds value to the array into position 'i', returns the position
extArray.prototype.add = (v, i) ->
	ret = -1
	if i? 
		if i>=0 and i<@length
			@push(@[i])
			@[i] = v
			@for_arrays_of(@, (o) -> o.push(o[i]); o[i]=null)
			ret = i
	else
		@push(v)
		@for_arrays_of(@, (o) -> o.push(null))
		ret = @length-1
	ret


# Deletes an element 'i' of the array and returns the deleted element
extArray.prototype.del = (i) ->
	if i< @length-1
		ret = @splice(i, 1, @pop())
		@for_arrays_of(@, (o) -> o.splice(i, 1, o.pop()))
	else
		ret = @splice(i, 1)
		@for_arrays_of(@, (o) -> o.splice(i, 1))

	# Notify the dependent arrays
	# @for_arrays_of(@dependent, (o) -> o.on_delParent(i))

	ret


Nodes = () -> null
Nodes.prototype = Object.create(extArray.prototype)
Nodes.prototype.constructor = Nodes


Edges = () -> null
Edges.prototype = Object.create(extArray.prototype)
Edges.prototype.constructor = Edges



@.digraph = (()->

	# 
	# Private methods
	# 

	# Insert a value 'v' into position 'i' of array
	# ins = (arr, i, val) ->
	# 	if i < arr.length
	# 		arr.push(arr[i])
	# 		arr[i] = val
	# 	else
	# 		arr.push(val)
	# 	i

	# Delete an element 'i' of the array
	# del = (arr, i) ->
	# 	ret = -1
	# 	if i >= 0
	# 		last = arr.length-1
	# 		if i < last
	# 			arr[i] = null
	# 			delete arr[i]
	# 			arr[i] = arr.pop()
	# 			ret = i
	# 		else if i == last
	# 			arr.pop()
	# 			ret = i
	# 	ret

	# Returns keys of the object wich have array type
	# get_arrays = (obj) ->
	# 	keys = []
	# 	keys.push(key) for key of obj when obj[key] instanceof Array
	# 	keys


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
				nodes : new Nodes
				# nodes.v : []
				# nodes : {		# Nodes
				# 	v : []		# Values
				# }
				edges : new Edges
				# edges : {		# Edges
				# 	a : []		# index of 'from' in nodes.v[]
				# 	b : []		# index of 'to' in nodes.v[]
				# 	v : []		# Values
			}
			o.edges.a = []
			o.edges.b = []
			o

		# Execute the function 'fnc' over all arrays of the object
		# for_arrays_of : (obj, fnc, args) ->
		# 	keys = get_arrays(obj)
		# 	ret = fnc(obj[key], args) for key in keys
		# 	ret


		edges : {
			# Add a new edge (a, b) or add an edge into position i
			# Returns the position of the added edge
			add : (G, a, b, i) ->
				i = G.edges.add(null, i)
				if i>=0
					G.edges.a[i] = a
					G.edges.b[i] = b
				i

			del : (G, i) ->  G.edges.del(i)
				# _this.for_arrays_of(G.edges, del, i)

			# Returns an array of edges such that (from_node, ?) in edges
			out : (G, from_node) ->
				i = G.edges.length
				ret = []
				while i-- >0 
					ret.push(i) if G.edges.a[i] is from_node
				ret

			# Returns an array of edges such that (?, to_node) in edges
			in : (G, to_node) ->
				i = G.edges.length
				ret = []
				while i-- >0 
					ret.push(i) if G.edges.b[i] is to_node
				ret

			# Returns its index if edge (a, b) exists
			has : (G, a, b) ->
				(return ix) for i, ix in G.edges.b when G.edges.a[ix] is a and i is b
				-1
		}

		nodes : {
			# Add a new node to the end or inserts into position 'i'
			# Returns the position the node has been added to
			add : (G, i) -> G.nodes.add(i)

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
							# _this.edges.del(G, ix)
							G.edges.del(i)
					else if i < last_node
					# If the node 'i' is not the last 
					# then the last node moves to the position of deleted one, and
					# hence we have to update the correspondent edges
						change = false
						if a == last_node then a = i; change = true
						if b == last_node then b = i; change = true
						change_nodes(G, ix, a, b) if change

				# Then delete the node itself
				# _this.for_arrays_of(G.nodes, del, i)
				G.nodes.del(i)


			# Returns an array of nodes 'b' such that (from_node, b) in edges
			out : (G, from_node) ->
				b for b, i in G.edges.b when G.edges.a[i] is from_node

			# Returns an array of nodes 'a' such that (a, to_node) in edges
			in : (G, to_node) ->
				a for a, i in G.edges.a when G.edges.b[i] is to_node
		}
	}
)()

