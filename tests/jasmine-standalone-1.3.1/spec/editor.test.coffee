
describe "Graph Editor", ->
	it "Exists", ->
		expect(ged).toBeDefined

# 	it "Has method Execute", ->
# 		expect(ged.execute).toBeDefined

	it "Can create an instance of graph", ->
		expect(digraph.create()).toBeDefined

	describe "When works with nodes", ->
		g = digraph.create()

		it "Can add node 1", ->
			expect(ged.nodes.add(g)).toBe(0)

		it "Can add node 2", ->
			expect(ged.nodes.add(g)).toBe(1)

		it "Has 2 nodes", ->
			expect(g.nodes.length).toBe(2)

		it "Executes Undo", ->
			expect(ged.undo()).toBe(true)

		it "Has 1 nodes", ->
			expect(g.nodes.length).toBe(1)

		it "Executes Redo", ->
			expect(ged.redo()).toBe(true)

		it "Has 2 nodes", ->
			expect(g.nodes.length).toBe(2)

		it "Executes Undo", ->
			expect(ged.undo()).toBe(true)

		it "Has 1 nodes", ->
			expect(g.nodes.length).toBe(1)

		it "Executes Redo", ->
			expect(ged.redo()).toBe(true)

		it "Has 2 nodes", ->
			expect(g.nodes.length).toBe(2)

		it "Executes Redo - fails", ->
			expect(ged.redo()).toBe(false)

		it "Has 2 nodes", ->
			expect(g.nodes.length).toBe(2)

		it "2 times Undo - no fail", ->
			expect(ged.undo()).toBe(true)
			expect(ged.undo()).toBe(true)

		it "3d time Undo - fails", ->
			expect(ged.undo()).toBe(false)
