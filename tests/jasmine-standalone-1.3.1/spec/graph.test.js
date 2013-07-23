// Generated by CoffeeScript 1.6.2
(function() {
  describe("Directed graph", function() {
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
