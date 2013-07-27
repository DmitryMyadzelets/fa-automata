
'use strict'


@.automata = (()->

	# Adds null to the array into position 'i', returns the position
	add = (arr, i) ->
		ret = -1
		if not i? or i==arr.length
			arr.push(null)
			ret = arr.length-1
		else
			if i>=0 and i<arr.length
				arr.push(arr[i])
				arr[i] = null
				ret = i
		ret

	# Deletes an element 'i' of the array and returns the deleted element
	del = (arr, i) ->
		return -1 if i<0 or i>=arr.length or isNaN(i) or not (arr instanceof Array)
		if i< arr.length-1
			arr.splice(i, 1, arr.pop())
		else
			arr.splice(i, 1)
		i


	# Returns object's keys wich have the Array type
	get_arrays = (o) ->
		keys = []
		keys.push(key) for key of o when o.hasOwnProperty(key) and o[key] instanceof Array
		keys


	# Execute the function 'fnc' over all the object's properties of Array type
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

		# Empty string symbol - Epsilon:
		empty_string : '\u03b5'

		# Creates a new graph
		create : () ->
			{
				start : 0 		# Initial state
				# nodes : new Nodes
				nodes : {
					v : []
				}
				# edges : new Edges
				edges : {
					v : []
					a : []
					b : []
					events : []
				}
				events : []
			}

		all : (o, key, fnc) ->
			i = 0
			len = o[key].length
			if typeof fnc == 'function'
				while i < len
					fnc(o, i++)
			len



		edges : {
			# Add a new edge (a, b) or add an edge into position i
			# Returns the position of the added edge
			add : (G, a, b, i) ->
				return -1 if a<0 or b<0 or a>=G.nodes.length or b>=G.nodes.length
				i = for_arrays_of(G.edges, add, i)
				if i>=0
					G.edges.a[i] = a
					G.edges.b[i] = b
				i

			del : (G, i) ->  for_arrays_of(G.edges, del, i)


			# Returns an array of edges such that (from_node, ?) in edges
			out : (G, from_node) ->
				ret = []
				_this.edges.all(G, (edge, i)-> ret.push(i) if edge.a[i] == from_node)
				ret

			# Returns an array of edges such that (?, to_node) in edges
			in : (G, to_node) ->
				ret = []
				_this.edges.all(G, (edge, i)-> ret.push(i) if edge.b[i] == to_node)
				ret

			# Returns its index if edge (a, b) exists
			has : (G, a, b) ->
				(return ix) for i, ix in G.edges.b when G.edges.a[ix] is a and i is b
				-1
			
			# Iterates over each edge and calls the function
			all : (G, fnc) -> _this.all(G.edges, 'v', fnc)

			events : {
				# Adds an index of the event from the alphabet. 
				add : (G, edge, event) -> 
					return -1 if edge<0 or edge>=_this.edges.all(G)
					return -1 if event<0 or event>=G.events.length
					# We want many events for one edge, so we store it in array
					if G.edges.events[edge] not instanceof Array
						G.edges.events[edge] = new Array
					# Add only unigue indexes
					if G.edges.events[edge].indexOf(event) == -1
						G.edges.events[edge].push(event)
					event

				del : (G, edge, event) ->
					return -1 if edge<0 or edge>=_this.edges.all(G)
					ix = G.edges.events[edge].indexOf(event)
					return -1 if ix == -1
					G.edges.events[edge].splice(event, 1)
					ix

				# Returns event's labels of the edge i
				labels : (G, i) ->
					ret = []
					if G? and i?
						if G.edges.events[i]? and G.edges.events[i].length != 0
							ret.push(G.events[event]) for event in G.edges.events[i]
						else
							ret.push(automata.empty_string)
					ret
			}

		}

		nodes : {
			# Add a new node to the end or inserts into position 'i'
			# Returns the position the node has been added to
			add : (G, i) -> 
				# G.nodes.add(i)
				for_arrays_of(G.nodes, add, i)

			# Delete a node 'i'
			del : (G, i, on_del_edge) ->
				# First delete ingoing and outgoing edges
				last_node = G.nodes.v.length-1

				ix = _this.edges.all(G)
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


			# Returns an array of nodes 'b' such that (from_node, b) in edges
			out : (G, from_node) ->
				b for b, i in G.edges.b when G.edges.a[i] is from_node

			# Returns an array of nodes 'a' such that (a, to_node) in edges
			in : (G, to_node) ->
				a for a, i in G.edges.a when G.edges.b[i] is to_node

			# Iterates over each edge and calls the function
			all : (G, fnc) -> _this.all(G.nodes, 'v', fnc)

		}

		events : {
			# Adds a new event 'v' to the alphabet
			add : (G, v, i) ->
				return ix if (ix = G.events.indexOf(v)) != -1
				# G.events.add(v, i)
				i = add(G.events, i)
				G.events[i] = v
				i

			del : (G, i) -> 
				# First delete the event from the edges
				for events in G.edges.events
					if events.indexOf(i) != -1
						events.splice(i, 1)
				# Then delete event itself
				del(G.events, i)

		}
	}
)()


###*
 * Breadth-first Search
 * @param {Automaton} G   
 * @param {function} fnc Callback function. Called with (node_from, label, node_to)
 * where:
 * node_from: index of the outgoing node
 * label: event label
 * node_to: index of the ingoing node
###
automata.BFS = (G, fnc) ->
	return null if not G?
	stack = [G.start]
	visited = [G.start]
	while stack.length
		a = stack.pop()
		# Get edges going out of the node 'a'
		E = @edges.out(G, a)
		for e in E
			# Get nodes reachabe by the edge 'e'
			b = G.edges.b[e]
			if b not in visited
				visited.push(b)
				stack.push(b)
			# Get all event labels for the edge
			labels = @edges.events.labels(G, e)
			fnc(a, l, b) for l in labels if typeof fnc == 'function'
	null