
'use strict'

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
- Structure of the application:
	/css
	/img
	/js
		/lib
		graph.js	# Basic structures and functions
		nfa.js 		# Non-determenistic atomaton structres and functions
		dfa.js 		# Determenistic atomaton structres and functions
		editor.js 	# Editor functionality
		main.js		# Just an entry point
	index.html
###