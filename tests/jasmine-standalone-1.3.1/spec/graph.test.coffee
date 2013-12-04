describe "Automaton graph, version 2", ->
	describe "Basic operations", ->
		it "Creates object", ->
			expect(typeof automata2.create()).toBe("object")

	describe "Transitions", ->
		g = automata2.create()

		it "Adds transition (0, 5, 1)", ->
			expect(automata2.trans.add(g, 0, 5, 1)).toBe(0)

		it "Inserts transition (1, 7, 1) to position 0", ->
			expect(automata2.trans.add(g, 1, 7, 1, 0)).toBe(0)

		it "Returns transition of position 1, and it is (0, 5, 1)", ->
			t = automata2.trans.get(g, 1)
			expect(t[0]).toBe(0)
			expect(t[1]).toBe(5)
			expect(t[2]).toBe(1)

		it "Does not add transitions with wrong indexes", ->
			expect(automata2.trans.add(g, 1, 7, 1, 3)).toBe(-1)
			expect(automata2.trans.add(g, 1, 7, 1, -1)).toBe(-1)
			expect(g.nT).toBe(2)

		it "Deletes transition from position 0",  ->
			expect(automata2.trans.del(g, 0)).toBe(1)

		it "Has one transitions left and it is (0, 5, 1)", ->
			expect(g.nT).toBe(1)
			t = automata2.trans.get(g, 0)
			expect(t[0]).toBe(0)
			expect(t[1]).toBe(5)
			expect(t[2]).toBe(1)

	describe "States", ->
		g = automata2.create()
		automata2.trans.add(g, 0, 5, 1)
		automata2.trans.add(g, 1, 7, 1)
		automata2.trans.add(g, 1, 8, 0)

		it "Automaton has 3 transitions (0, 5, 1), (1, 7, 1), (1, 8, 0)", ->
			expect(g.nT).toBe(3)

		it "Doesn't delete any transitions with wrong state index 2", ->
			expect(automata2.states.del(g, 2)).toBe(0)

		it "Deletes 2 transitions with state index 0", ->
			expect(automata2.states.del(g, 0)).toBe(2)

		it "Has 1 transitions ", ->
			expect(g.nT).toBe(1)

		it "Has initial state 1", ->
			expect(g.start).toBe(1)


	describe "Operations with automaton", ->
		g = automata2.create()

		automata2.trans.add(g, 0, 5, 1)
		automata2.trans.add(g, 1, 7, 1)
		automata2.trans.add(g, 1, 8, 0)

		g2 = automata2.create()
		automata2.trans.add(g2, 0, 3, 1)
		automata2.trans.add(g2, 1, 5, 1, 1)

		it "G1 has 3 transitions (0, 5, 1), (1, 7, 1), (1, 8, 0)",  ->
			expect(g.nT).toBe(3)

		it "G2 has 2 transitions (0, 3, 1), (1, 5, 1)",  ->
			expect(g2.nT).toBe(2)

		it ".trans.out(1) returns indexes 3 and 6",  ->
			t = automata2.trans.out(g, 1)
			expect(t[0]).toBe(3)
			expect(t[1]).toBe(6)
			expect(t.length).toBe(2)

		it ".trans.in(1) returns indexes 0 and 3",  ->
			t = automata2.trans.in(g, 1)
			expect(t[0]).toBe(0)
			expect(t[1]).toBe(3)
			expect(t.length).toBe(2)

		it ".trans.exists(1, 7, 1) returns index 3, .trans.exists(1, 7, 0) retruns -1",  ->
			expect(automata2.trans.exists(g, 1, 7, 1)).toBe(3)
			expect(automata2.trans.exists(g, 1, 7, 0)).toBe(-1)

		it ".BFS works (check the console)", ->
			console.log "BFS (Breadth-First Search):"
			automata2.BFS(g, (q, e, p) ->
				console.log q, e, p
				)
			console.log "And another BFS:"
			automata2.BFS(g2, (q, e, p) ->
				console.log q, e, p
				)

		it ".sync works (check the console)", ->
			console.log "sync (parallel composition):"
			h = automata2.create()
			# Preallocation impoves performance x10 times
			delete h.trans
			h.trans = new Uint32Array(g.nT * g2.nT * 3|0)
			automata2.sync(g, g2, [5], h)
			automata2.BFS(h, (q, e, p) ->
				console.log q, e, p
				)

	describe "System", ->
		S = null
		G1 = null
		it "Creates System object", ->
			expect(typeof (S = new DES)).toBe("object")

		it "Creates a module G1", ->
			expect(typeof (G1 = S.create_module("Valve"))).toBe("object")
			console.log S, G1

		it "Module G1 has set X of object type", ->
			expect(typeof (G1.X)).toBe("object")

		it "Module G1 has set E of object type", ->
			expect(typeof (G1.E)).toBe("object")

		it "Module G1 has set T of object type", ->
			expect(typeof (G1.T)).toBe("object")



describe "Directed graph, version 1", ->
	describe "Basic operations", ->
		it "Creates object", ->
			expect(typeof automata.create()).toBe("object")

		g = automata.create()

		it "Graph.nodes is object", ->
			expect(typeof g.nodes).toBe("object")

		it "Graph.edges is object", ->
			expect(typeof g.edges).toBe("object")

		it "Adds 1st node", ->
			automata.nodes.add(g)
			expect(automata.nodes.all(g)).toBe(1)

		it "Adds 2nd node", ->
			automata.nodes.add(g)
			expect(automata.nodes.all(g)).toBe(2)

	describe "When a node deleted", ->
		g = automata.create()
		automata.nodes.add(g)
		automata.nodes.add(g)

		it "Deletes with right index", ->
			automata.nodes.del(g, 0)
			expect(automata.nodes.all(g)).toBe(1)

		it "Does not deletes with wrong index", ->
			automata.nodes.del(g, -1)
			expect(automata.nodes.all(g)).toBe(1)
			
			automata.nodes.del(g, g.nodes.v.length)
			expect(automata.nodes.all(g)).toBe(1)

	describe "When adds edges", ->
		g = automata.create()
		automata.nodes.add(g)
		automata.nodes.add(g)

		it "Adds with right node indexes", ->
			automata.edges.add(g, 0, 1)
			expect(automata.edges.all(g)).toBe(1)

		it "Does not adds with wrong node indexes", ->
			automata.edges.add(g, -1, 1)
			expect(automata.edges.all(g)).toBe(1)

	describe "Has to remove ingoing and outhoing edges when a node removed", ->
		g = automata.create()
		it "Creates 2 nodes", ->
			automata.nodes.add(g)
			automata.nodes.add(g)
			expect(automata.nodes.all(g)).toBe(2)

		it "Adds 1 edge from node 0 to 1", ->
			automata.edges.add(g, 0, 1)
			expect(automata.edges.all(g)).toBe(1)

		it "Adds 1 edge-loop from node 1 to 1, and has 2 edges", ->
			automata.edges.add(g, 1, 1)
			expect(automata.edges.all(g)).toBe(2)

		it "Deletes node 0", ->
			automata.nodes.del(g, 0)
			expect(automata.nodes.all(g)).toBe(1)

		it "Has 1 edge", ->
			expect(automata.edges.all(g)).toBe(1)

		it "Edge is a loop", ->
			ix = automata.edges.all(g)
			expect(g.edges.a[ix] == g.edges.b[ix]).toBe(true)

		it "Deletes node. No nodes for now", ->
			automata.nodes.del(g, 0)
			expect(automata.nodes.all(g)).toBe(0)

		it "Has no edges", ->
			expect(automata.edges.all(g)).toBe(0)


	describe "When adds|delets events", ->
		g = automata.create()
		it "Has no events before", ->
			expect(g.events.length).toBe(0)

		it "Adds an event 'Start'. Has 1 event", ->
			automata.events.add(g, "Start")
			expect(g.events.length).toBe(1)

		it "And the event is 'Start'", ->
			expect(g.events[0]).toBe('Start')

		it "Adds 2nd event 'Stop'", ->
			automata.events.add(g, "Stop", 0)
			expect(g.events[0]).toBe('Stop')

		it "And the 2nd event is 'Start'", ->
			expect(g.events[1]).toBe('Start')

		it "Delets the 1st event", ->
			expect(automata.events.del(g, 0)).toBe(0)

		it "Has 1 event", ->
			expect(g.events.length).toBe(1)

		it "And the event is 'Start'", ->
			expect(g.events[0]).toBe('Start')

		it "Doesn't add an event with the same name", ->
			expect(automata.events.add(g, "Start", 5)).toBe(0)


	describe "When adds|delets events for edges", ->
		g = automata.create()
		a = automata.nodes.add(g)
		b = automata.nodes.add(g)
		e = automata.edges.add(g, a, b)
		ev = automata.events.add(g, "Start")

		it "Adds first event", ->
			expect(automata.edges.events.add(g, e, ev)).toBe(ev)

		it "Doesn't add the same event", ->
			expect(automata.edges.events.add(g, e, ev)).toBe(ev)

		it "Doesn't add non existing event", ->
			expect(automata.edges.events.add(g, e, ev+1)).toBe(-1) 

		it "Doesn't add the event to non existing edge", ->
			expect(automata.edges.events.add(g, e+1, ev)).toBe(-1)

		it "Doesn't delete the event from non existing edge", ->
			expect(automata.edges.events.del(g, e, ev+1)).toBe(-1) 

		it "Doesn't delete non existing event", ->
			expect(automata.edges.events.del(g, e+1, ev)).toBe(-1) 

		it "Deletes the event", ->
			expect(automata.edges.events.del(g, e, ev)).toBe(ev)
			expect(g.edges.events[e].length).toBe(0)

		it "Adds 2 events", ->
			ev2 = automata.events.add(g, "Stop")
			automata.edges.events.add(g, e, ev)
			automata.edges.events.add(g, e, ev2)
			expect(g.edges.events[e].length).toBe(2)

	describe "When delets a node", ->
		g = automata.create()
		a = automata.nodes.add(g)
		b = automata.nodes.add(g)
		e = automata.edges.add(g, a, b)
		ev = automata.events.add(g, "Start")

		it "Deletes the edge and edge's events", ->
			automata.nodes.del(g, a)
			expect(automata.edges.all(g)).toBe(0)
			expect(g.edges.events.length).toBe(0)


	describe "When delets an event from the alphabet", ->
		g = automata.create()
		a = automata.nodes.add(g)
		b = automata.nodes.add(g)
		e = automata.edges.add(g, a, b)
		ev = automata.events.add(g, "Start")
		automata.edges.events.add(g, e, ev)


		it "Deletes the event from edges", ->
			expect(g.edges.events[e].length).toBe(1)
			automata.events.del(g, ev)
			expect(g.edges.events[e].length).toBe(0)

