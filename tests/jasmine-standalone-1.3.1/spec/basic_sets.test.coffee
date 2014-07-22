
describe "Properties based on typed array", ->
    it "Module 'jA' is defined", ->
        expect(jA).toBeDefined()

    describe "Binary property", ->

        A = jA.binary()
        B = jA.binary()

        it "Create two binary properties 'A' and 'B'", ->
            expect(A).toBeDefined()
            expect(B).toBeDefined()

        it "Add 20 elements to  'A'", ->
            A.add(20)
            expect(A.length).toBe(20)

        it "Add 1 elements to property 'A' with value 'true'", ->
            A.add(1, true)
            expect(A.get(20)).toBe(true)

        it "Property 5th element of 'A' with value 'true'", ->
            A.set(5, true)
            expect(A.get(5)).toBe(true)

        it "Elements with index other then 5 and 20 are 'false'", ->
            n = A.length
            while (n--)
                switch n
                    when 5, 20
                        expect(A.get(n)).toBe(true)
                    else
                        expect(A.get(n)).toBe(false)

        it "Property 'B' has no elements", ->
            expect(B.length).toBe(0)

        it "Property 'A' has 6 elements when 15 are deleted", ->
            A.add(-15)
            expect(A.length).toBe(6)
            expect(A.get(5)).toBe(true)
            expect(A.get(4)).toBe(false)


describe "A general set object", ->

    it "Can acces to its binary property", ->

        jA.event.add(20)

        expect(jA.event(0).observable).toBe(false)