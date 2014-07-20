
describe "Basic sets (binary)", ->
    it "Module 'jA' is defined", ->
        expect(jA).toBeDefined()

    describe "Binary arrays", ->

        A = jA.binary_set()
        B = jA.binary_set()

        it "Create two binary sets 'A' and 'B'", ->
            expect(A).toBeDefined()
            expect(B).toBeDefined()

        it "Add 20 elements to set 'A'", ->
            A.add(20)
            expect(A.cardinality).toBe(20)

        it "Add 1 elements to set 'A' with value 'true'", ->
            A.add(1, true)
            expect(A.get(20)).toBe(true)

        it "Set 5th element of 'A' with value 'true'", ->
            A.set(5, true)
            expect(A.get(5)).toBe(true)

        it "Elements with index other then 5 and 20 are 'false'", ->
            n = A.cardinality
            while (n--)
                switch n
                    when 5, 20
                        expect(A.get(n)).toBe(true)
                    else
                        expect(A.get(n)).toBe(false)

        it "Set 'B' has no elements", ->
            expect(B.cardinality).toBe(0)

        it "Set 'A' has 6 elements when 15 are deleted", ->
            A.add(-15)
            expect(A.cardinality).toBe(6)
            expect(A.get(5)).toBe(true)
            expect(A.get(4)).toBe(false)