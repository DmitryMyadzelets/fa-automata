
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


### TODO:
- Would be better if each module knows how to Undo/Redo its actions?
  Then we can have one Undo/Redo stack (or a few context-related), 
  and keep: (Module, Undo-Redo couple). An Editor recieves all the 
  user's commands, and sends them to a module. The editor knows if it 
  wants to undo module's actions or not. Then the editor askes the module
  to provide Undo-Redo action for a given command. The editor can:
  1. Tell to the module in advance what place (stack pointer) 
  to put Undo-Redo actions.
  2. Recieve Undo-Redo actions from the module as callbacks.
  The second option seems more relevant, since the editor knows 
  the context (an object) the actions are taken in. Then the editor can
  create an object along with the the stack of actions. Otherwise, 
  (the first option) the editor has to change the module's stack pointer.

  In the end it looks like:
  	A)
	From Editor side:
		Action with no recording: module[i].action(args)
		Action with recording: module[i].record(callback[i]).action(args)
	From  Module side:
		Action with no recording: module.action(args) { do...; ret }
		Action with recording:
		module.record(callback) ->
			fnc = callback
			return module
		module.action(args) ->
			do...
			call fnc if fnc #if matters
			fnc = null

	B)
	From Editor side:
		Action with no recording: module[i].action(args)
		Action with recording: module[i].action(args).record(callback[i])

	Memento pattern!? 
	Props:
		It stores the entire state of the object.
		Modules have no idea about Undo/Redo
		Editor has only 2 commands, Undo and Redo and should know the context.
	Cons:
		Memory consuming. But this can be solveed storing only difference
		of module's states.

	Read there:
		http://stackoverflow.com/questions/10552360/emberjs-history-undo
###