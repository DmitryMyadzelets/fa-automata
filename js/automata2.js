// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var A, B, C, G, NUM_STATES, Set, get_bit, make_G, set_bit,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  get_bit = function(arr, i) {
    return !!(arr[i >> 5] & 1 << (i & 0x1F));
  };

  set_bit = function(arr, i) {
    return arr[i >> 5] |= 1 << (i & 0x1F);
  };

  this.automata2 = (function() {
    var DELTA_TRANS, sort, _this;

    DELTA_TRANS = 10;
    /**
    	 * [Optimized bubble sort (http://en.wikipedia.org/wiki/Bubble_sort). 
    	 * Sorts the index array instead of the array itself.]
    	 * @param  {[Array]} a   [Array with data]
    	 * @param  {[Array]} ix  [Index array to be sorted]
    	 * @param  {[int]} len [Length of the index array]
    	 * @param  {[int]} step [Step for items in the data array]
    	 * @return {[null]}
    */

    sort = function(a, ix, len) {
      var i, j, m, n, temp;

      n = len;
      while (n) {
        m = 0;
        j = 0;
        i = 1;
        while (i < n) {
          if (a[ix[j]] > a[ix[i]]) {
            temp = ix[j];
            ix[j] = ix[i];
            ix[i] = temp;
            m = i;
          }
          j = i;
          i++;
        }
        n = m;
      }
    };
    return _this = {
      create: function() {
        return {
          start: 0 | 0,
          trans: new Uint32Array(3 * DELTA_TRANS),
          nT: 0 | 0,
          sorted: false,
          tix: new Uint32Array(DELTA_TRANS),
          nix: new Uint32Array()
        };
      },
      trans: {
        add: function(G, q, e, p, i) {
          var j, k, len, t;

          len = G.trans.length | 0;
          j = G.nT * 3 | 0;
          if (j + 3 > len) {
            t = new Uint32Array(len + 3 * DELTA_TRANS);
            t.set(G.trans);
            delete G.trans;
            G.trans = t;
            delete G.tix;
            G.tix = new Uint32Array(G.trans.length / 3);
          }
          G.sorted = false;
          if ((i == null) || i === G.nT) {
            G.trans[j++] = q | 0;
            G.trans[j++] = e | 0;
            G.trans[j++] = p | 0;
            return G.nT++;
          } else {
            if (i < 0 || i > G.nT) {
              return -1 | 0;
            }
            k = i * 3 | 0;
            G.trans[j++] = G.trans[k++];
            G.trans[j++] = G.trans[k++];
            G.trans[j++] = G.trans[k++];
            k -= 3;
            G.trans[k++] = q | 0;
            G.trans[k++] = e | 0;
            G.trans[k++] = p | 0;
            G.nT++;
            return i | 0;
          }
        },
        del: function(G, i) {
          var j, len, t;

          if ((i == null) || i < 0 || i >= G.nT) {
            return -1;
          }
          G.sorted = false;
          G.nT -= 1;
          if (i < G.nT) {
            i *= 3;
            j = G.nT * 3;
            G.trans[i++] = G.trans[j++];
            G.trans[i++] = G.trans[j++];
            G.trans[i] = G.trans[j];
          }
          len = G.trans.length;
          if ((len - G.nT * 3) > 3 * DELTA_TRANS) {
            len -= 3 * DELTA_TRANS;
            t = new Uint32Array(G.trans.subarray(0, len));
            delete G.trans;
            G.trans = t;
            delete G.tix;
            G.tix = new Uint32Array(G.trans.length / 3);
          }
          return G.nT;
        },
        get: function(G, i) {
          if (i < 0 || i >= G.nT) {
            return -1 | 0;
          }
          return G.trans.subarray(i *= 3, i + 3);
        },
        out: function(G, q) {
          var i, n, ret;

          ret = [];
          n = G.nT * 3 | 0;
          i = 0 | 0;
          while (i < n) {
            if (G.trans[i] === q) {
              ret.push(i);
            }
            i += 3;
          }
          return new Uint32Array(ret);
        },
        "in": function(G, p) {
          var i, n, ret;

          ret = [];
          n = G.nT * 3 | 0;
          i = 2 | 0;
          while (i < n) {
            if (G.trans[i] === p) {
              ret.push(i - 2);
            }
            i += 3;
          }
          return new Uint32Array(ret);
        },
        exists: function(G, p, e, q) {
          var i, n, t;

          n = G.nT * 3 | 0;
          i = 0 | 0;
          t = G.trans;
          while (i < n) {
            if (t[i] === p && t[i + 1] === e && t[i + 2] === q) {
              return i;
            }
            i += 3;
          }
          return -1 | 0;
        }
      },
      states: {
        del: function(G, qp) {
          var i, ret, t;

          ret = 0 | 0;
          i = G.nT * 3 | 0;
          while ((i -= 3) >= 0) {
            if ((G.trans[i] === qp) || (G.trans[i + 2] === qp)) {
              t = (i / 3) | 0;
              if (_this.trans.del(G, t) > -1) {
                ret++;
              }
            }
          }
          if (qp === G.start) {
            if (G.nT > 0) {
              G.start = G.trans[0];
            } else {
              G.start = 0;
            }
          }
          return ret;
        }
      },
      sort: function(G) {
        var i, len, m, max, n;

        i = G.nT;
        while (i-- > 0) {
          G.tix[i] = i * 3;
        }
        sort(G.trans, G.tix, G.nT);
        max = 0;
        if (G.nT > 0) {
          max = G.trans[G.tix[G.nT - 1]];
        }
        delete G.nix;
        G.nix = new Uint32Array(max + 1);
        n = -1;
        i = 0;
        len = G.nT;
        while (i < len) {
          m = G.trans[G.tix[i]];
          if (m ^ n) {
            G.nix[m] = i;
            n = m;
          }
          i++;
        }
        G.sorted = true;
      },
      edges: {}
    };
  })();

  /**
   * Breadth-first Search
   * @param {Automaton} G
   * @param {function} fnc Callback function. Called with (node_from, event, node_to)
   * where:
   * node_from: index of the outgoing node
   * event: index of event
   * node_to: index of the ingoing node
   * @return {null}
  */


  automata2.BFS = function(G, fnc) {
    var call_fnc, e, i, j, max, p, q, stack, visited;

    if (G == null) {
      return;
    }
    if (!G.sorted) {
      automata2.sort(G);
    }
    call_fnc = typeof fnc === 'function';
    stack = [G.start];
    max = 0;
    if (G.nT > 0) {
      max = G.trans[G.tix[G.nT - 1]];
    }
    visited = new Uint32Array((max >> 5) + 1);
    set_bit(visited, G.start);
    while (stack.length) {
      q = stack.pop();
      j = G.nix[q];
      while ((j < G.nT) && (q === G.trans[i = G.tix[j++]])) {
        e = G.trans[++i];
        p = G.trans[++i];
        if (!get_bit(visited, p)) {
          set_bit(visited, p);
          stack.push(p);
        }
        if (call_fnc) {
          fnc(q, e, p);
        }
      }
    }
    visited = null;
  };

  /**
   * Parallel composition ('sync' name is taken from RW (Ramage & Wonham) theory)
   * @param  {automaton} G1
   * @param  {automaton} G2
   * @param  {array} common [Common events]
   * @param  {automaton} G [Resulting automata. Should be allocated before]
   * @return {automaton} G
  */


  automata2.sync = function(G1, G2, common, G) {
    var I, J, add_transition, e1, e2, i, j, map, map_n, p1, p2, q, q1, q2, stack, _i, _j, _k, _len, _len1, _len2;

    if ((G1 == null) || (G2 == null)) {
      return;
    }
    if (!common) {
      common = [];
    }
    if (G == null) {
      G = automata2.create();
    }
    G.nT = 0;
    if (!G1.sorted) {
      automata2.sort(G1);
    }
    if (!G2.sorted) {
      automata2.sort(G2);
    }
    map = [G1.start, G2.start, G.start = 0];
    map_n = 1 | 0;
    stack = [0];
    add_transition = function(e, a, b) {
      var i, k, n, p;

      i = 2;
      k = -1;
      n = map.length;
      while (i < n) {
        if (map[i - 2] === a && map[i - 1] === b) {
          k = map[i];
          break;
        }
        i += 3;
      }
      if (k < 0) {
        p = map_n++;
        stack.push(p);
        map.push(a);
        map.push(b);
        map.push(p);
      } else {
        p = k;
      }
      automata2.trans.add(G, q, e, p);
    };
    while (stack.length) {
      q = stack.pop();
      q1 = map[q * 3];
      q2 = map[q * 3 + 1];
      I = this.trans.out(G1, q1);
      J = this.trans.out(G2, q2);
      for (_i = 0, _len = I.length; _i < _len; _i++) {
        i = I[_i];
        e1 = G1.trans[i + 1];
        p1 = G1.trans[i + 2];
        if (__indexOf.call(common, e1) < 0) {
          add_transition(e1, p1, q2);
        } else {
          for (_j = 0, _len1 = J.length; _j < _len1; _j++) {
            j = J[_j];
            e2 = G2.trans[j + 1];
            p2 = G2.trans[j + 2];
            if (e1 === e2) {
              add_transition(e1, p1, p2);
            }
          }
        }
      }
      for (_k = 0, _len2 = J.length; _k < _len2; _k++) {
        j = J[_k];
        e2 = G2.trans[j + 1];
        p2 = G2.trans[j + 2];
        if (__indexOf.call(common, e2) < 0) {
          add_transition(e2, q1, p2);
        }
      }
    }
    G.nN = map_n;
    return G;
  };

  NUM_STATES = 10;

  make_G = function(G) {
    var p, q;

    q = 0;
    while (q < NUM_STATES) {
      p = 0;
      while (p < NUM_STATES) {
        automata2.trans.add(G, q, p, p);
        p++;
      }
      q++;
    }
  };

  G = automata2.create();

  make_G(G);

  A = automata2.create();

  B = automata2.create();

  make_G(A);

  make_G(B);

  C = automata2.sync(A, B, [1, 5]);

  console.log("Transitions:", C.nT);

  automata2.BFS(C, function(q, e, p) {
    return null;
  });

  Set = (function() {
    var change_length, change_subsets_size, get_default, self, subsets, unset_bit,
      _this = this;

    function Set() {}

    self = Set;

    get_bit = function(arr, i) {
      return !!(arr[i >> 5] & 1 << (i & 0x1F));
    };

    set_bit = function(arr, i) {
      return arr[i >> 5] |= 1 << (i & 0x1F);
    };

    unset_bit = function(arr, i) {
      return arr[i >> 5] &= ~(1 << (i & 0x1F));
    };

    subsets = [];

    /**
    	 * Creates Uint32Array array with new length, copies data from source array.
    	 * @param  {Uint32Array}	src
    	 * @param  {[int]} 			len [Length of the new array]
    	 * @return {[Uint32Array]}	[New array]
    */


    change_length = function(src, len) {
      var l, ret;

      l = src.length;
      if (len > l) {
        ret = new Uint32Array(len);
        ret.set(src);
      } else {
        ret = new Uint32Array(src.subarray(0, len));
      }
      return ret;
    };

    /**
    	 * Updates size of the binary subsets to a new one
    */


    change_subsets_size = function(len) {
      var a, key;

      for (key in subsets) {
        a = change_length(subsets[key], len);
        delete subsets[key];
        subsets[key] = a;
      }
      return null;
    };

    /**
    	 * Returns indexes of the Uint32Array which are '1'
    */


    get_default = function(arr) {
      var i, index, m, n, ret, _i, _len;

      ret = [];
      for (index = _i = 0, _len = arr.length; _i < _len; index = ++_i) {
        i = arr[index];
        n = index * 32 | 0;
        m = 0;
        while (i) {
          if (i & 1) {
            ret.push(n + m);
          }
          i >>= 1;
          m++;
        }
      }
      return ret;
    };

    Set.prototype.subsets = function() {
      var name, _i, _len;

      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        name = arguments[_i];
        /**
        			 * If no arguments, then returns indexes of the subset 'name' 
        			 * which are '1', else acts like .get() method
        */

        this[name] = function() {
          if (arguments.length) {
            return this[name].get.apply(this, arguments);
          } else {
            return get_default(subsets[name]);
          }
        };
        /**
        			 * Returns values of the members of the subset 'name' 
        			 * with indexes given as arguments
        */

        this[name].get = function() {
          var i, _j, _len1, _results;

          _results = [];
          for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
            i = arguments[_j];
            _results.push(get_bit(subsets[name], i));
          }
          return _results;
        };
        /**
        			 * Sets members of subset 'name' as '1'
        			 * Example: set(0, 1, 8, 5)
        */

        this[name].set = function() {
          var i, _j, _len1;

          for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
            i = arguments[_j];
            set_bit(subsets[name], i);
          }
          return null;
        };
        /**
        			 * Sets members of subset 'name' as '0'
        			 * Example: unset(2, 40)
        */

        this[name].unset = function() {
          var i, _j, _len1;

          for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
            i = arguments[_j];
            unset_bit(subsets[name], i);
          }
          return null;
        };
        subsets[name] = new Uint32Array(1);
      }
      return null;
    };

    Set.prototype.foo = function() {
      return change_subsets_size(1);
    };

    return Set;

  }).call(this);

}).call(this);
