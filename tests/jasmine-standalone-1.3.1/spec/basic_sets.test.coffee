
describe "Properties based on typed array", ->
    it "Module 'jA' is defined", ->
        expect(jA).toBeDefined()

    describe "Binary property", ->

        A = jA.uniproperties.binary()
        B = jA.uniproperties.binary()

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

        A = jA.uniproperties.objects()
        B = jA.uniproperties.objects()

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


    describe "Indexes property", ->

        A = jA.uniproperties.indexes()

        it "Add 5 elements to 'A' when no value is given. The elements are equal to 0", ->
            A.add(5)
            expect(A.length).toBe(5)
            expect(A.get(0)).toBe(0)
            expect(A.get(5)).toBe(undefined)

        it "Add 1 element to 'A' when value is '123'. Sets value of index=0 as '456'", ->
            A.add(1, 123)
            A.set(1, 456)
            expect(A.get(5)).toBe(123)
            expect(A.get(1)).toBe(456)


        it "Deletes elements while adding negative number of elements, while old values are correct", ->
            A.add(-2)
            expect(A.length).toBe(4)
            expect(A.get(1)).toBe(456)
            A.add(100)
            expect(A.get(1)).toBe(456)


describe "An indexed complex property", ->

    it "Can create a complex indexed property with binary and object subproperties", ->
        event = jA.indexed_property({
            observable : 'binary',
            name : 'objects'
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
    
    it "Two indexed properties do not correlate", ->

        A = jA.indexed_property({
            name : 'objects'
            })

        B = jA.indexed_property({
            surname : 'objects'
            })

        A.add()
        B.add(2)

        A.set(0).name('Anna')
        B.set(0).surname('Ng')
        B.set(1).surname('Ivanov')

        expect(A.cardinality()).toBe(1)
        expect(B.cardinality()).toBe(2)

        a = A(0)
        b = B(0)
        expect(a.name).toBe('Anna')
        expect(b.name).toBe(undefined)
        expect(b.surname).toBe('Ng')
        b = B(1)
        expect(b.surname).toBe('Ivanov')


describe "Transitions", ->

    T = jA.transitions()

    it "Adds 3 transitions", ->

        expect(T.add(3).cardinality()).toBe(3)
        T.set(0).q(0).e(0).p(1)
        T.set(1).q(1).e(1).p(0)
        T.set(2).q(1).e(0).p(1)
        t = T(1)
        expect(t.q).toBe(1)
        expect(t.e).toBe(1)
        expect(t.p).toBe(0)
        t = T(2)
        expect(t.q).toBe(1)
        expect(t.e).toBe(0)
        expect(t.p).toBe(1)

    it "Method 'out' enumerates outgoing transitions", ->

        q = 0
        n = 0
        T.out(q, (index) -> 
            n++
            )
        expect(n).toBe(1)

        q = 1
        n = 0
        T.out(q, (index) -> 
            n++
            )
        expect(n).toBe(2)

    it "Method Depth-first search works", ->

        objects = [
            {q : 0, e : 0, p : 1},
            {q : 1, e : 0, p : 1},
            {q : 1, e : 1, p : 0}
        ]
        i = 0

        jA.dfs(T, 0, (t, index) ->
            o = objects[i++]
            # console.log index, t, o
            expect(t.q).toBe(o.q)
            expect(t.e).toBe(o.e)
            expect(t.p).toBe(o.p)
            false
            )
        expect(i).toBe(3)


describe "Conversions", ->

    automaton = {
        transitions : [
            {
                event : '0'
                from : '0'
                to : '1'
            },
            {
                event : '1'
                from : '1'
                to : '0'
            },
            {
                event : '0'
                from : '1'
                to : '1'
            }
        ]
    }

    str = '{"transitions":[{"event":"0","from":"0","to":"1"},{"event":"1","from":"1","to":"0"},{"event":"0","from":"1","to":"1"}]}'


    it "JSON.stringify and JSON.parse methods work", ->
        expect(JSON).toBeDefined()
        expect(str.localeCompare(JSON.stringify(automaton))).toBe(0)
        expect(JSON.stringify(JSON.parse(str)).localeCompare(JSON.stringify(automaton))).toBe(0)


    it "Converts JSON to transitions", ->

        T = jA.convert.object2transitions(automaton)
        expect(T).toBeDefined()

        objects = [
            {q : 0, e : 0, p : 1},
            {q : 1, e : 0, p : 1},
            {q : 1, e : 1, p : 0}
        ]
        i = 0

        jA.dfs(T, 0, (t, index) ->
            o = objects[i++]
            # console.log index, t, o
            false
            )
        expect(i).toBe(3)


