
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
	if not i? or i==@length
		@push(v)
		@for_arrays_of(@, (o) -> o.push(null))
		ret = @length-1
	else
		if i>=0 and i<@length
			@push(@[i])
			@[i] = v
			@for_arrays_of(@, (o) -> o.push(o[i]); o[i]=null)
			ret = i
	ret


# Deletes an element 'i' of the array and returns the deleted element
extArray.prototype.del = (i) ->
	return -1 if i<0 or i>=@length
	if i< @length-1
		@splice(i, 1, @pop())
		@for_arrays_of(@, (o) -> o.splice(i, 1, o.pop()))
	else
		@splice(i, 1)
		@for_arrays_of(@, (o) -> o.splice(i, 1))

	# Notify the dependent arrays
	# @for_arrays_of(@dependent, (o) -> o.on_delParent(i))

	i


Nodes = () -> null
Nodes.prototype = Object.create(extArray.prototype)
Nodes.prototype.constructor = Nodes


Edges = () -> null
Edges.prototype = Object.create(extArray.prototype)
Edges.prototype.constructor = Edges


Events = () -> null
Events.prototype = Object.create(extArray.prototype)
Events.prototype.constructor = Events


@.automata = (()->

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
				start : 0 		# Initial state
				nodes : new Nodes
				edges : new Edges
				events : new Events
			}
			o.edges.a = []
			o.edges.b = []
			o.edges.events = []
			o


		edges : {
			# Add a new edge (a, b) or add an edge into position i
			# Returns the position of the added edge
			add : (G, a, b, i) ->
				return -1 if a<0 or b<0 or a>=G.nodes.length or b>=G.nodes.length
				i = G.edges.add(null, i)
				if i>=0
					G.edges.a[i] = a
					G.edges.b[i] = b
				i

			del : (G, i) ->  G.edges.del(i)


			# Returns an array of edges such that (from_node, ?) in edges
			out : (G, from_node) ->
				ret = []
				i = G.edges.length
				while i-- >0 
					ret.push(i) if G.edges.a[i] is from_node
				ret

			# Returns an array of edges such that (?, to_node) in edges
			in : (G, to_node) ->
				ret = []
				i = G.edges.length
				while i-- >0 
					ret.push(i) if G.edges.b[i] is to_node
				ret

			# Returns its index if edge (a, b) exists
			has : (G, a, b) ->
				(return ix) for i, ix in G.edges.b when G.edges.a[ix] is a and i is b
				-1

			events : {
				# Adds an index of the event from the alphabet. 
				add : (G, edge, event) -> 
					return -1 if edge<0 or edge>=G.edges.length
					return -1 if event<0 or event>=G.events.length
					# We want many events for one edge, so we store it in array
					if G.edges.events[edge] not instanceof Array
						G.edges.events[edge] = new Array
					# Add only unigue indexes
					if G.edges.events[edge].indexOf(event) == -1
						G.edges.events[edge].push(event)
					event

				del : (G, edge, event) ->
					return -1 if edge<0 or edge>=G.edges.length
					ix = G.edges.events[edge].indexOf(event)
					return -1 if ix == -1
					G.edges.events[edge].splice(event, 1)
					ix
			}
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
				G.nodes.del(i)


			# Returns an array of nodes 'b' such that (from_node, b) in edges
			out : (G, from_node) ->
				b for b, i in G.edges.b when G.edges.a[i] is from_node

			# Returns an array of nodes 'a' such that (a, to_node) in edges
			in : (G, to_node) ->
				a for a, i in G.edges.a when G.edges.b[i] is to_node
		}

		events : {
			# Adds a new event 'v' to the alphabet
			add : (G, v, i) ->
				return ix if (ix = G.events.indexOf(v)) != -1
				G.events.add(v, i)

			del : (G, i) -> 
				# First delete the event from the edges
				for events in G.edges.events
					if events.indexOf(i) != -1
						events.splice(i, 1)
				# Then delete event itself
				G.events.del(i)

		}
	}
)()

