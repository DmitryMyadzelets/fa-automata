
describe "Graph Editor", ->
	it "Exists", ->
		expect(ged).toBeDefined

# 	it "Has method Execute", ->
# 		expect(ged.execute).toBeDefined

	it "Can create an instance of graph", ->
		expect(automata.create()).toBeDefined

	describe "Undo|Redo when adds nodes", ->
		g = faxy.create()
		ged.reset()

		it "Can add node 1", ->
			expect(ged.nodes.add(g)).toBe(0)

		it "Adds 2nd node, has 2 nodes", ->
			expect(ged.nodes.add(g)).toBe(1)
			expect(g.nodes.length).toBe(2)

		it "Executes Undo, has 1 node", ->
			expect(ged.undo()).toBe(true)
			expect(g.nodes.length).toBe(1)

		it "Executes Redo, has 2 nodes", ->
			expect(ged.redo()).toBe(true)
			expect(g.nodes.length).toBe(2)

		it "Executes Redo - fails", ->
			expect(ged.redo()).toBe(false)

		it "2 times Undo - no fail", ->
			expect(ged.undo()).toBe(true)
			expect(ged.undo()).toBe(true)

		it "3d time Undo - fails", ->
			expect(ged.undo()).toBe(false)

	describe "Undo|Redo when adds edges", ->
		g = faxy.create()
		ged.reset()

		it "Adds 2 nodes, has 2 nodes", ->
			expect(ged.nodes.add(g)).toBe(0)
			expect(ged.nodes.add(g)).toBe(1)
			expect(g.nodes.length).toBe(2)

		it "Can add edge from 1 to 2", ->
			expect(ged.edges.add(g, 0, 1)).toBe(0)

		it "Can add edge from 2 to 2", ->
			expect(ged.edges.add(g, 1, 1)).toBe(1)

		it "Delets edge 1 to 2", ->
			expect(ged.edges.del(g, 0)).toBe(0)

		it "Has 1 edge", ->
			expect(g.edges.length).toBe(1)

		it "Executes Undo, has 2 edges", ->
			expect(ged.undo()).toBe(true)
			expect(g.edges.length).toBe(2)

		it "And the first edge is from 1 to 2", ->
			expect((g.edges.a[0] == 0) and (g.edges.b[0] == 1)).toBe(true)

	describe "Undo|Redo when deletes nodes", ->
		g = faxy.create()
		ged.reset()

		it "Adds 2 nodes, has 2 nodes", ->
			expect(ged.nodes.add(g)).toBe(0)
			expect(ged.nodes.add(g)).toBe(1)
			expect(g.nodes.length).toBe(2)

		it "Undo, has 1 node", ->
			expect(ged.undo()).toBe(true)
			expect(g.nodes.length).toBe(1)

		it "Redo, has 2 nodes", ->
			expect(ged.redo()).toBe(true)
			expect(g.nodes.length).toBe(2)

		it "Adds 1 edge, has 1 edge", ->
			expect(ged.edges.add(g, 0, 1)).toBe(0)
			expect(g.edges.length).toBe(1)

		it "Deletes 1 node, has no edges", ->
			expect(ged.nodes.del(g, 0)).toBe(0)
			expect(g.edges.length).toBe(0)

		it "Undo, has 2 nodes, 1 edge", ->
			expect(ged.undo()).toBe(true)
			expect(g.nodes.length).toBe(2)
			expect(g.edges.length).toBe(1)

		it "Redo, has 1 node, no edges", ->
			expect(ged.redo()).toBe(true)
			expect(g.nodes.length).toBe(1)
			expect(g.edges.length).toBe(0)

			
