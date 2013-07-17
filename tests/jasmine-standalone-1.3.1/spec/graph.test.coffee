

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

