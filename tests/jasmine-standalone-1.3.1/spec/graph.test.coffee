

describe "Directed graph", ->
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
			expect(g.nodes.length).toBe(1)

		it "Adds 2nd node", ->
			automata.nodes.add(g)
			expect(g.nodes.length).toBe(2)

	describe "When a node deleted", ->
		g = automata.create()
		automata.nodes.add(g)
		automata.nodes.add(g)

		it "Deletes with right index", ->
			automata.nodes.del(g, 0)
			expect(g.nodes.length).toBe(1)

		it "Does not deletes with wrong index", ->
			automata.nodes.del(g, -1)
			expect(g.nodes.length).toBe(1)
			
			automata.nodes.del(g, g.nodes.length)
			expect(g.nodes.length).toBe(1)

	describe "When adds edges", ->
		g = automata.create()
		automata.nodes.add(g)
		automata.nodes.add(g)

		it "Adds with right node indexes", ->
			automata.edges.add(g, 0, 1)
			expect(g.edges.length).toBe(1)

		it "Does not adds with wrong node indexes", ->
			automata.edges.add(g, -1, 1)
			expect(g.edges.length).toBe(1)

	describe "Has to remove ingoing and outhoing edges when a node removed", ->
		g = automata.create()
		it "Creates 2 nodes", ->
			automata.nodes.add(g)
			automata.nodes.add(g)
			expect(g.nodes.length).toBe(2)

		it "Adds 1 edge from node 0 to 1", ->
			automata.edges.add(g, 0, 1)
			expect(g.edges.length).toBe(1)

		it "Adds 1 edge-loop from node 1 to 1, and has 2 edges", ->
			automata.edges.add(g, 1, 1)
			expect(g.edges.length).toBe(2)

		it "Deletes node 0", ->
			automata.nodes.del(g, 0)
			expect(g.nodes.length).toBe(1)

		it "Has 1 edge", ->
			expect(g.edges.length).toBe(1)

		it "Edge is a loop", ->
			ix = g.edges.length
			expect(g.edges.a[ix] == g.edges.b[ix]).toBe(true)

		it "Deletes node. No nodes for now", ->
			automata.nodes.del(g, 0)
			expect(g.nodes.length).toBe(0)

		it "Has no edges", ->
			expect(g.edges.length).toBe(0)


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
			expect(g.edges.length).toBe(0)
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

