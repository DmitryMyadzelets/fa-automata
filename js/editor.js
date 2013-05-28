// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  /*
  ===============================================================================
  The function deletes the elements of an array which have values ixDelete
  and change elements with values ixUpdate to ixDelete.
  */
  this.ged = {
    commands: new Undo(),
    reset: Undo.prototype.reset,
    undo: Undo.prototype.undo,
    redo: Undo.prototype.redo,
    edges: {
      add: function(G, a, b, i) {
        var ix;

        ix = faxy.edges.add(G, a, b, i);
        if (ix >= 0) {
          ged.commands.put(faxy.edges.add, arguments, faxy.edges.del, [G, ix]);
        }
        return ix;
      },
      del: function(G, i) {
        var a, b, ret;

        a = G.edges.a[i];
        b = G.edges.b[i];
        ret = faxy.edges.del(G, i);
        if (ret >= 0) {
          ged.commands.put(faxy.edges.del, arguments, faxy.edges.add, [G, a, b, i]);
        }
        return ret;
      },
      get: faxy.edges.get,
      set: faxy.edges.set,
      out: faxy.edges.out,
      has: faxy.edges.has
    },
    nodes: {
      add: function(G, x, y) {
        var ix;

        ix = faxy.nodes.add(G, x, y);
        ged.commands.put(faxy.nodes.add, arguments, faxy.nodes.del, [G, ix]);
        return ix;
      },
      del: function(G, i) {
        var args, ix, x, y;

        ged.commands.start_transaction();
        x = G.nodes.x[i];
        y = G.nodes.y[i];
        ix = faxy.nodes.del(G, i, function(G, i) {
          return ged.edges.del(G, i);
        });
        if (ix >= 0) {
          args = [G, x, y, i];
          ged.commands.put(faxy.nodes.del, arguments, faxy.nodes.add, args);
        }
        ged.commands.stop_transaction();
        return ix;
      },
      move2: function(G, i, old_x, old_y, x, y) {
        if (i >= 0 && i < G.nodes.length) {
          ged.commands.put(faxy.nodes.move, [G, i, x, y], faxy.nodes.move, [G, i, old_x, old_y]);
        }
        return i;
      },
      get: faxy.nodes.get,
      set: faxy.nodes.set,
      out: faxy.nodes.out,
      "in": faxy.nodes["in"],
      move: faxy.nodes.move
    }
  };

  this.editor = this.ged;

}).call(this);
