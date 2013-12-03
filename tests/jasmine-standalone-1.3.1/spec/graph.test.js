// Generated by CoffeeScript 1.6.2
(function() {
  describe("Automaton graph, version 2", function() {
    describe("Basic operations", function() {
      return it("Creates object", function() {
        return expect(typeof automata2.create()).toBe("object");
      });
    });
    describe("Transitions", function() {
      var g;

      g = automata2.create();
      it("Adds transition (0, 5, 1)", function() {
        return expect(automata2.trans.add(g, 0, 5, 1)).toBe(0);
      });
      it("Inserts transition (1, 7, 1) to position 0", function() {
        return expect(automata2.trans.add(g, 1, 7, 1, 0)).toBe(0);
      });
      it("Returns transition of position 1, and it is (0, 5, 1)", function() {
        var t;

        t = automata2.trans.get(g, 1);
        expect(t[0]).toBe(0);
        expect(t[1]).toBe(5);
        return expect(t[2]).toBe(1);
      });
      it("Does not add transitions with wrong indexes", function() {
        expect(automata2.trans.add(g, 1, 7, 1, 3)).toBe(-1);
        expect(automata2.trans.add(g, 1, 7, 1, -1)).toBe(-1);
        return expect(g.nT).toBe(2);
      });
      it("Deletes transition from position 0", function() {
        return expect(automata2.trans.del(g, 0)).toBe(1);
      });
      return it("Has one transitions left and it is (0, 5, 1)", function() {
        var t;

        expect(g.nT).toBe(1);
        t = automata2.trans.get(g, 0);
        expect(t[0]).toBe(0);
        expect(t[1]).toBe(5);
        return expect(t[2]).toBe(1);
      });
    });
    describe("States", function() {
      var g;

      g = automata2.create();
      automata2.trans.add(g, 0, 5, 1);
      automata2.trans.add(g, 1, 7, 1);
      automata2.trans.add(g, 1, 8, 0);
      it("Automaton has 3 transitions (0, 5, 1), (1, 7, 1), (1, 8, 0)", function() {
        return expect(g.nT).toBe(3);
      });
      it("Doesn't delete any transitions with wrong state index 2", function() {
        return expect(automata2.states.del(g, 2)).toBe(0);
      });
      it("Deletes 2 transitions with state index 0", function() {
        return expect(automata2.states.del(g, 0)).toBe(2);
      });
      it("Has 1 transitions ", function() {
        return expect(g.nT).toBe(1);
      });
      return it("Has initial state 1", function() {
        return expect(g.start).toBe(1);
      });
    });
    describe("Operations with automaton", function() {
      var g, g2;

      g = automata2.create();
      automata2.trans.add(g, 0, 5, 1);
      automata2.trans.add(g, 1, 7, 1);
      automata2.trans.add(g, 1, 8, 0);
      g2 = automata2.create();
      automata2.trans.add(g2, 0, 3, 1);
      automata2.trans.add(g2, 1, 5, 1, 1);
      it("G1 has 3 transitions (0, 5, 1), (1, 7, 1), (1, 8, 0)", function() {
        return expect(g.nT).toBe(3);
      });
      it("G2 has 2 transitions (0, 3, 1), (1, 5, 1)", function() {
        return expect(g2.nT).toBe(2);
      });
      it(".trans.out(1) returns indexes 3 and 6", function() {
        var t;

        t = automata2.trans.out(g, 1);
        expect(t[0]).toBe(3);
        expect(t[1]).toBe(6);
        return expect(t.length).toBe(2);
      });
      it(".trans.in(1) returns indexes 0 and 3", function() {
        var t;

        t = automata2.trans["in"](g, 1);
        expect(t[0]).toBe(0);
        expect(t[1]).toBe(3);
        return expect(t.length).toBe(2);
      });
      it(".trans.exists(1, 7, 1) returns index 3, .trans.exists(1, 7, 0) retruns -1", function() {
        expect(automata2.trans.exists(g, 1, 7, 1)).toBe(3);
        return expect(automata2.trans.exists(g, 1, 7, 0)).toBe(-1);
      });
      it(".BFS works (check the console)", function() {
        console.log("BFS (Breadth-First Search):");
        automata2.BFS(g, function(q, e, p) {
          return console.log(q, e, p);
        });
        console.log("And another BFS:");
        return automata2.BFS(g2, function(q, e, p) {
          return console.log(q, e, p);
        });
      });
      return it(".sync works (check the console)", function() {
        var h;

        console.log("sync (parallel composition):");
        h = automata2.create();
        delete h.trans;
        h.trans = new Uint32Array(g.nT * g2.nT * 3 | 0);
        automata2.sync(g, g2, [5], h);
        return automata2.BFS(h, function(q, e, p) {
          return console.log(q, e, p);
        });
      });
    });
    return describe("System", function() {
      var G1, S;

      S = null;
      G1 = null;
      it("Creates System object", function() {
        return expect(typeof (S = new DES)).toBe("object");
      });
      it("Creates a module G1", function() {
        return expect(typeof (G1 = S.create_module())).toBe("object");
      });
      it("Module G1 has set X of object type", function() {
        return expect(typeof G1.X).toBe("object");
      });
      it("Module G1 has set E of object type", function() {
        return expect(typeof G1.E).toBe("object");
      });
      return it("Module G1 has set T of object type", function() {
        return expect(typeof G1.T).toBe("object");
      });
    });
  });

  describe("Directed graph, version 1", function() {
    describe("Basic operations", function() {
      var g;

      it("Creates object", function() {
        return expect(typeof automata.create()).toBe("object");
      });
      g = automata.create();
      it("Graph.nodes is object", function() {
        return expect(typeof g.nodes).toBe("object");
      });
      it("Graph.edges is object", function() {
        return expect(typeof g.edges).toBe("object");
      });
      it("Adds 1st node", function() {
        automata.nodes.add(g);
        return expect(automata.nodes.all(g)).toBe(1);
      });
      return it("Adds 2nd node", function() {
        automata.nodes.add(g);
        return expect(automata.nodes.all(g)).toBe(2);
      });
    });
    describe("When a node deleted", function() {
      var g;

      g = automata.create();
      automata.nodes.add(g);
      automata.nodes.add(g);
      it("Deletes with right index", function() {
        automata.nodes.del(g, 0);
        return expect(automata.nodes.all(g)).toBe(1);
      });
      return it("Does not deletes with wrong index", function() {
        automata.nodes.del(g, -1);
        expect(automata.nodes.all(g)).toBe(1);
        automata.nodes.del(g, g.nodes.v.length);
        return expect(automata.nodes.all(g)).toBe(1);
      });
    });
    describe("When adds edges", function() {
      var g;

      g = automata.create();
      automata.nodes.add(g);
      automata.nodes.add(g);
      it("Adds with right node indexes", function() {
        automata.edges.add(g, 0, 1);
        return expect(automata.edges.all(g)).toBe(1);
      });
      return it("Does not adds with wrong node indexes", function() {
        automata.edges.add(g, -1, 1);
        return expect(automata.edges.all(g)).toBe(1);
      });
    });
    describe("Has to remove ingoing and outhoing edges when a node removed", function() {
      var g;

      g = automata.create();
      it("Creates 2 nodes", function() {
        automata.nodes.add(g);
        automata.nodes.add(g);
        return expect(automata.nodes.all(g)).toBe(2);
      });
      it("Adds 1 edge from node 0 to 1", function() {
        automata.edges.add(g, 0, 1);
        return expect(automata.edges.all(g)).toBe(1);
      });
      it("Adds 1 edge-loop from node 1 to 1, and has 2 edges", function() {
        automata.edges.add(g, 1, 1);
        return expect(automata.edges.all(g)).toBe(2);
      });
      it("Deletes node 0", function() {
        automata.nodes.del(g, 0);
        return expect(automata.nodes.all(g)).toBe(1);
      });
      it("Has 1 edge", function() {
        return expect(automata.edges.all(g)).toBe(1);
      });
      it("Edge is a loop", function() {
        var ix;

        ix = automata.edges.all(g);
        return expect(g.edges.a[ix] === g.edges.b[ix]).toBe(true);
      });
      it("Deletes node. No nodes for now", function() {
        automata.nodes.del(g, 0);
        return expect(automata.nodes.all(g)).toBe(0);
      });
      return it("Has no edges", function() {
        return expect(automata.edges.all(g)).toBe(0);
      });
    });
    describe("When adds|delets events", function() {
      var g;

      g = automata.create();
      it("Has no events before", function() {
        return expect(g.events.length).toBe(0);
      });
      it("Adds an event 'Start'. Has 1 event", function() {
        automata.events.add(g, "Start");
        return expect(g.events.length).toBe(1);
      });
      it("And the event is 'Start'", function() {
        return expect(g.events[0]).toBe('Start');
      });
      it("Adds 2nd event 'Stop'", function() {
        automata.events.add(g, "Stop", 0);
        return expect(g.events[0]).toBe('Stop');
      });
      it("And the 2nd event is 'Start'", function() {
        return expect(g.events[1]).toBe('Start');
      });
      it("Delets the 1st event", function() {
        return expect(automata.events.del(g, 0)).toBe(0);
      });
      it("Has 1 event", function() {
        return expect(g.events.length).toBe(1);
      });
      it("And the event is 'Start'", function() {
        return expect(g.events[0]).toBe('Start');
      });
      return it("Doesn't add an event with the same name", function() {
        return expect(automata.events.add(g, "Start", 5)).toBe(0);
      });
    });
    describe("When adds|delets events for edges", function() {
      var a, b, e, ev, g;

      g = automata.create();
      a = automata.nodes.add(g);
      b = automata.nodes.add(g);
      e = automata.edges.add(g, a, b);
      ev = automata.events.add(g, "Start");
      it("Adds first event", function() {
        return expect(automata.edges.events.add(g, e, ev)).toBe(ev);
      });
      it("Doesn't add the same event", function() {
        return expect(automata.edges.events.add(g, e, ev)).toBe(ev);
      });
      it("Doesn't add non existing event", function() {
        return expect(automata.edges.events.add(g, e, ev + 1)).toBe(-1);
      });
      it("Doesn't add the event to non existing edge", function() {
        return expect(automata.edges.events.add(g, e + 1, ev)).toBe(-1);
      });
      it("Doesn't delete the event from non existing edge", function() {
        return expect(automata.edges.events.del(g, e, ev + 1)).toBe(-1);
      });
      it("Doesn't delete non existing event", function() {
        return expect(automata.edges.events.del(g, e + 1, ev)).toBe(-1);
      });
      it("Deletes the event", function() {
        expect(automata.edges.events.del(g, e, ev)).toBe(ev);
        return expect(g.edges.events[e].length).toBe(0);
      });
      return it("Adds 2 events", function() {
        var ev2;

        ev2 = automata.events.add(g, "Stop");
        automata.edges.events.add(g, e, ev);
        automata.edges.events.add(g, e, ev2);
        return expect(g.edges.events[e].length).toBe(2);
      });
    });
    describe("When delets a node", function() {
      var a, b, e, ev, g;

      g = automata.create();
      a = automata.nodes.add(g);
      b = automata.nodes.add(g);
      e = automata.edges.add(g, a, b);
      ev = automata.events.add(g, "Start");
      return it("Deletes the edge and edge's events", function() {
        automata.nodes.del(g, a);
        expect(automata.edges.all(g)).toBe(0);
        return expect(g.edges.events.length).toBe(0);
      });
    });
    return describe("When delets an event from the alphabet", function() {
      var a, b, e, ev, g;

      g = automata.create();
      a = automata.nodes.add(g);
      b = automata.nodes.add(g);
      e = automata.edges.add(g, a, b);
      ev = automata.events.add(g, "Start");
      automata.edges.events.add(g, e, ev);
      return it("Deletes the event from edges", function() {
        expect(g.edges.events[e].length).toBe(1);
        automata.events.del(g, ev);
        return expect(g.edges.events[e].length).toBe(0);
      });
    });
  });

}).call(this);
