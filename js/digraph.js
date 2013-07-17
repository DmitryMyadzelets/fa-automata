// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var Edges, Nodes, extArray;

  extArray = function() {
    return null;
  };

  extArray.prototype = Object.create(Array.prototype);

  extArray.prototype.constructor = extArray;

  extArray.prototype.get_arrays = function(o) {
    var key, keys;

    keys = [];
    for (key in o) {
      if (o[key] instanceof Array) {
        keys.push(key);
      }
    }
    return keys;
  };

  extArray.prototype.for_arrays_of = function(obj, fnc, args) {
    var key, keys, ret, _i, _len;

    keys = this.get_arrays(obj);
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      ret = fnc(obj[key], args);
    }
    return ret;
  };

  extArray.prototype.add = function(v, i) {
    var ret;

    ret = -1;
    if (i != null) {
      if (i >= 0 && i < this.length) {
        this.push(this[i]);
        this[i] = v;
        this.for_arrays_of(this, function(o) {
          o.push(o[i]);
          return o[i] = null;
        });
        ret = i;
      }
    } else {
      this.push(v);
      this.for_arrays_of(this, function(o) {
        return o.push(null);
      });
      ret = this.length - 1;
    }
    return ret;
  };

  extArray.prototype.del = function(i) {
    var ret;

    if (i < this.length - 1) {
      ret = this.splice(i, 1, this.pop());
      this.for_arrays_of(this, function(o) {
        return o.splice(i, 1, o.pop());
      });
    } else {
      ret = this.splice(i, 1);
      this.for_arrays_of(this, function(o) {
        return o.splice(i, 1);
      });
    }
    return ret;
  };

  Nodes = function() {
    return null;
  };

  Nodes.prototype = Object.create(extArray.prototype);

  Nodes.prototype.constructor = Nodes;

  Edges = function() {
    return null;
  };

  Edges.prototype = Object.create(extArray.prototype);

  Edges.prototype.constructor = Edges;

  this.digraph = (function() {
    var change_nodes, _this;

    change_nodes = function(G, i, a, b) {
      var ret;

      ret = [G.edges.a[i], G.edges.b[i]];
      G.edges.a[i] = a;
      G.edges.b[i] = b;
      return ret;
    };
    return _this = {
      create: function() {
        var o;

        o = {
          nodes: new Nodes,
          edges: new Edges
        };
        o.edges.a = [];
        o.edges.b = [];
        return o;
      },
      edges: {
        add: function(G, a, b, i) {
          i = G.edges.add(null, i);
          if (i >= 0) {
            G.edges.a[i] = a;
            G.edges.b[i] = b;
          }
          return i;
        },
        del: function(G, i) {
          return G.edges.del(i);
        },
        out: function(G, from_node) {
          var i, ret;

          i = G.edges.length;
          ret = [];
          while (i-- > 0) {
            if (G.edges.a[i] === from_node) {
              ret.push(i);
            }
          }
          return ret;
        },
        "in": function(G, to_node) {
          var i, ret;

          i = G.edges.length;
          ret = [];
          while (i-- > 0) {
            if (G.edges.b[i] === to_node) {
              ret.push(i);
            }
          }
          return ret;
        },
        has: function(G, a, b) {
          var i, ix, _i, _len, _ref;

          _ref = G.edges.b;
          for (ix = _i = 0, _len = _ref.length; _i < _len; ix = ++_i) {
            i = _ref[ix];
            if (G.edges.a[ix] === a && i === b) {
              return ix;
            }
          }
          return -1;
        }
      },
      nodes: {
        add: function(G, i) {
          return G.nodes.add(i);
        },
        del: function(G, i, on_del_edge) {
          var a, b, change, ix, last_node;

          last_node = G.nodes.length - 1;
          ix = G.edges.length;
          while (ix-- > 0) {
            a = G.edges.a[ix];
            b = G.edges.b[ix];
            if ((a === i) || (b === i)) {
              if (typeof on_del_edge === "function") {
                on_del_edge.apply(this, [G, ix]);
              } else {
                G.edges.del(i);
              }
            } else if (i < last_node) {
              change = false;
              if (a === last_node) {
                a = i;
                change = true;
              }
              if (b === last_node) {
                b = i;
                change = true;
              }
              if (change) {
                change_nodes(G, ix, a, b);
              }
            }
          }
          return G.nodes.del(i);
        },
        out: function(G, from_node) {
          var b, i, _i, _len, _ref, _results;

          _ref = G.edges.b;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            b = _ref[i];
            if (G.edges.a[i] === from_node) {
              _results.push(b);
            }
          }
          return _results;
        },
        "in": function(G, to_node) {
          var a, i, _i, _len, _ref, _results;

          _ref = G.edges.a;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            a = _ref[i];
            if (G.edges.b[i] === to_node) {
              _results.push(a);
            }
          }
          return _results;
        }
      }
    };
  })();

}).call(this);