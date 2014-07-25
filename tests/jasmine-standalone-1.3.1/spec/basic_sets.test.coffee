
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


    describe "Objects property", ->

        A = jA.objects()
        B = jA.objects()

        it "Add 5 undefined elements to 'A'", ->
            A.add(5)
            expect(A.length).toBe(5)
            expect(A.get(4)).toBe(undefined)
            expect(A.get(5)).toBe(undefined)

        it "Add an object as 3 elements to 'A'. It's the same object, not 3 diffeent ones!", ->
            A.add(3, { name: "test"} )
            expect(A.length).toBe(8)
            u = A.get(6)
            v = A.get(7)
            expect(u.name).toBe('test')
            expect(v.name).toBe('test')
            u.name = 'hello'
            expect(v.name).toBe('hello')

            A.set(7, { prop : 123 })
            expect(A.get(7).prop).toBe(123)
            expect(A.get(7).name).toBe(undefined)
            expect(A.get(6).name).toBe('hello')

            A.set(9, {})
            expect(A.length).toBe(8)

        it "Deletes elements while adding negative number of elements", ->
            A.add(-1)
            expect(A.length).toBe(7)


describe "A general set object", ->

    it "Can create a complex indexed property with binary and object subproperties", ->
        event = jA.indexed_property({
            observable : jA.binary(),
            name : jA.objects()
        })
        event.add(2)

        event.set(0)
            .name('test')
            .observable(true)

        event.set(1)
            .name('hello')

        e = event(0)
        expect(e.observable).toBe(true)
        expect(e.name).toBe('test')
        e = event(1)
        expect(e.observable).toBe(false)
        expect(e.name).toBe('hello')
