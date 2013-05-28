
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

faxy.create = () ->
	G = fa.create()
	faxy.extend(G)
	G

faxy.extend = (G) ->
	G.nodes.x = []
	G.nodes.y = []
	G.edges.curved = []
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
	i


faxy.edges.add = (G, a, b, args) ->
	return -1 if fa.edges.has(G, a, b) > -1
	eix = fa.edges.has(G, b, a)
	ix = fa.edges.add(G, a, b, args)
	if ix>=0 and eix>=0
		G.edges.curved[eix] = true
		G.edges.curved[ix] = true
	ix

faxy.edges.del = (G, i) ->
	# console.log arguments
	a = G.edges.a[i]
	b = G.edges.b[i]
	if (ix = fa.edges.del(G, i)) >= 0
		if (eix = fa.edges.has(G, b, a)) >= 0
			G.edges.curved[eix] = false
	ix




### TODO:
- Would be better if each module knows how to Undo/Redo its actions?
  Then we can have one Undo/Redo stack (or a few context-related), 
  and keep (Module, Undo-Redo couple). An Editor recieves all the 
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
	From Module side:
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
		Editor knows the module and it knows how to Undo-Redo couples.
	From Module side:
		Module has no clue about Undo/Redo.

	But in case if the module has transactions, it has to inform the editor
	about changes.

	So, either in (A) and (B) Editor and Modules are linked somehow.
	Those are kinde of Command pattern. 
	But there exists a Memento pattern also.

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
		http://stackoverflow.com/questions/1200562/difference-in-json-objects-using-javascript-jquery
		http://stackoverflow.com/questions/1029241/javascript-object-watch-for-all-browsers/1270182#1270182
		https://github.com/ArthurClemens/Javascript-Undo-Manager

	Also interesting:
		Saving files on client side
		http://eligrey.com/blog/post/saving-generated-files-on-the-client-side
###


# object.watch [eligrey / object-watch.js]
# https://gist.github.com/eligrey/384583
# if !Object.prototype.watch
# 	Object.defineProperty(Object.prototype, "watch", 
# 	{
# 		enumerable: false
# 		configurable: true
# 		writable: false
# 		value: (prop, handler) ->
# 			oldval = this[prop]
# 			newval = oldval
# 			getter = () -> return newval
# 			setter = (val) ->
# 				oldval = newval
# 				return newval = handler.call(@, prop, oldval, val)
# 			if (delete @[prop]) # can't watch constants
# 				Object.defineProperty(@, prop, 
# 				{
# 					get: getter
# 					set: setter
# 					enumerable: true
# 					configurable: true
# 				})
# 	})

# foo = { a : 0 }
# foo.watch("a", (prop, oldval, val) -> console.log "'a' is changed to", val)
# foo.a = 8

