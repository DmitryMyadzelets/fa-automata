// Generated by CoffeeScript 1.6.2
(function() {
  describe("Properties based on typed array", function() {
    it("Module 'jA' is defined", function() {
      return expect(jA).toBeDefined();
    });
    describe("Binary property", function() {
      var A, B;

      A = jA.binary();
      B = jA.binary();
      it("Create two binary properties 'A' and 'B'", function() {
        expect(A).toBeDefined();
        return expect(B).toBeDefined();
      });
      it("Add 20 elements to  'A'", function() {
        A.add(20);
        return expect(A.length).toBe(20);
      });
      it("Add 1 elements to property 'A' with value 'true'", function() {
        A.add(1, true);
        return expect(A.get(20)).toBe(true);
      });
      it("Property 5th element of 'A' with value 'true'", function() {
        A.set(5, true);
        return expect(A.get(5)).toBe(true);
      });
      it("Elements with index other then 5 and 20 are 'false'", function() {
        var n, _results;

        n = A.length;
        _results = [];
        while (n--) {
          switch (n) {
            case 5:
            case 20:
              _results.push(expect(A.get(n)).toBe(true));
              break;
            default:
              _results.push(expect(A.get(n)).toBe(false));
          }
        }
        return _results;
      });
      it("Property 'B' has no elements", function() {
        return expect(B.length).toBe(0);
      });
      return it("Property 'A' has 6 elements when 15 are deleted", function() {
        A.add(-15);
        expect(A.length).toBe(6);
        expect(A.get(5)).toBe(true);
        return expect(A.get(4)).toBe(false);
      });
    });
    return describe("Objects property", function() {
      var A, B;

      A = jA.objects();
      B = jA.objects();
      it("Add 5 undefined elements to 'A'", function() {
        A.add(5);
        expect(A.length).toBe(5);
        expect(A.get(4)).toBe(void 0);
        return expect(A.get(5)).toBe(void 0);
      });
      it("Add an object as 3 elements to 'A'. It's the same object, not 3 diffeent ones!", function() {
        var u, v;

        A.add(3, {
          name: "test"
        });
        expect(A.length).toBe(8);
        u = A.get(6);
        v = A.get(7);
        expect(u.name).toBe('test');
        expect(v.name).toBe('test');
        u.name = 'hello';
        expect(v.name).toBe('hello');
        A.set(7, {
          prop: 123
        });
        expect(A.get(7).prop).toBe(123);
        expect(A.get(7).name).toBe(void 0);
        expect(A.get(6).name).toBe('hello');
        A.set(9, {});
        return expect(A.length).toBe(8);
      });
      return it("Deletes elements while adding negative number of elements", function() {
        A.add(-1);
        return expect(A.length).toBe(7);
      });
    });
  });

  describe("A general set object", function() {
    return it("Can create a complex indexed property with binary and object subproperties", function() {
      var e, event;

      event = jA.indexed_property({
        observable: jA.binary(),
        name: jA.objects()
      });
      event.add(2);
      event.set(0).name('test').observable(true);
      event.set(1).name('hello');
      e = event(0);
      expect(e.observable).toBe(true);
      expect(e.name).toBe('test');
      e = event(1);
      expect(e.observable).toBe(false);
      return expect(e.name).toBe('hello');
    });
  });

}).call(this);
