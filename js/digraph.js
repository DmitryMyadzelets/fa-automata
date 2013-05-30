// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';  this.digraph = (function() {
    var change_nodes, del, for_arrays_of, get_arrays, ins, _this;

    ins = function(arr, i, val) {
      if (i < arr.length) {
        arr.push(arr[i]);
        arr[i] = val;
      } else {
        arr.push(val);
      }
      return i;
    };
    del = function(arr, i) {
      var last, ret;

      ret = -1;
      if (i >= 0) {
        last = arr.length - 1;
        if (i < last) {
          arr[i] = arr.pop();
          ret = i;
        } else if (i === last) {
          arr.pop();
          ret = i;
        }
      }
      return ret;
    };
    get_arrays = function(obj) {
      var key, keys;

      keys = [];
      for (key in obj) {
        if (obj[key] instanceof Array) {
          keys.push(key);
        }
      }
      return keys;
    };
    for_arrays_of = function(obj, fnc, args) {
      var key, keys, ret, _i, _len;

      keys = get_arrays(obj);
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        ret = fnc(obj[key], args);
      }
      return ret;
    };
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
          nodes: {
            v: []
          },
          edges: {
            a: [],
            b: [],
            v: []
          }
        };
        Object.defineProperty(o.nodes, 'length', {
          get: function() {
            return o.nodes.v.length;
          }
        });
        Object.defineProperty(o.edges, 'length', {
          get: function() {
            return o.edges.v.length;
          }
        });
        return o;
      },
      edges: {
        add: function(G, a, b, i) {
          if (a < 0 || b < 0 || a >= G.nodes.length || b >= G.nodes.length) {
            return -1;
          }
          if (i == null) {
            i = for_arrays_of(G.edges, (function(arr) {
              return arr.push(null);
            })) - 1;
          } else {
            for_arrays_of(G.edges, (function(arr) {
              return ins(arr, i);
            }));
          }
          G.edges.a[i] = a;
          G.edges.b[i] = b;
          return i;
        },
        del: function(G, i) {
          if (i < 0 || i >= G.edges.length) {
            return -1;
          }
          return for_arrays_of(G.edges, del, i);
        },
        get: function(G, i) {
          return G.edges.v[i];
        },
        set: function(G, i, v) {
          return G.edges.v[i] = v;
        },
        out: function(G, from_node) {
          var b, i, _i, _len, _ref, _results;

          _ref = G.edges.b;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            b = _ref[i];
            if (G.edges.a[i] === from_node) {
              _results.push(i);
            }
          }
          return _results;
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
          if (i == null) {
            i = for_arrays_of(G.nodes, (function(arr) {
              return arr.push(null);
            })) - 1;
          } else {
            for_arrays_of(G.nodes, (function(arr) {
              return ins(arr, i);
            }));
          }
          return i;
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
                _this.edges.del(G, ix);
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
          return for_arrays_of(G.nodes, del, i);
        },
        get: function(G, i) {
          return G.nodes.v[i];
        },
        set: function(G, i, v) {
          return G.nodes.v[i] = v;
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
