// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var G, NUM_STATES, make_G,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.automata2 = (function() {
    var DELTA_TRANS, getBit, setBit, sort, _this;

    DELTA_TRANS = 10;
    setBit = function(arr, i) {
      arr[i >> 5] |= 1 << (i & 0x1F);
      return null;
    };
    getBit = function(arr, i) {
      return arr[i >> 5] & 1 << (i & 0x1F) && 1;
    };
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
          nN: 0 | 0,
          nE: 0 | 0,
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
        },
        sort: function(G) {
          var i, len, m, max, n;

          i = G.nT;
          while (i-- > 0) {
            G.tix[i] = i * 3;
          }
          sort(G.trans, G.tix, G.nT);
          delete G.nix;
          max = 0;
          if (G.nT > 0) {
            max = G.trans[G.tix[G.nT - 1]];
          }
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
        }
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
    var call_fnc, e, i, j, p, q, stack, visited;

    if (G == null) {
      return;
    }
    if (!G.sorted) {
      automata2.trans.sort(G);
    }
    call_fnc = typeof fnc === 'function';
    stack = [G.start];
    visited = [G.start];
    while (stack.length) {
      q = stack.pop();
      j = G.nix[q];
      while ((j < G.nT) && (q === G.trans[i = G.tix[j++]])) {
        e = G.trans[++i];
        p = G.trans[++i];
        if (__indexOf.call(visited, p) < 0) {
          visited.push(p);
          stack.push(p);
        }
        if (call_fnc) {
          fnc(q, e, p);
        }
      }
    }
  };

  /**
   * Parallel composition ('sync' name is taken from RW (Ramage & Wonham) theory)
   * @param  {automaton} G1
   * @param  {automaton} G2
   * @param  {array} common [Common events]
   * @return {automaton} G
  */


  automata2.sync = function(G1, G2, common) {
    var G, I, J, add_transition, e1, e2, i, inMap, j, map, p1, p2, q, q1, q2, stack, t, _i, _j, _len, _len1;

    G = this.create();
    if ((G1 == null) || (G2 == null)) {
      return G;
    }
    map = [G1.start, G2.start, G.start = 0];
    stack = [0];
    if (!G1.sorted) {
      automata2.trans.sort(G1);
    }
    if (!G2.sorted) {
      automata2.trans.sort(G2);
    }
    t = new Uint32Array(G1.nT * G2.nT * 3 | 0);
    delete G.trans;
    G.trans = t;
    inMap = function(q1, q2) {
      var i, n;

      i = 2;
      n = map.length;
      while (i < n) {
        if (map[i - 2] === q1 && map[i - 1] === q2) {
          return map[i];
        }
        i += 3;
      }
      return -1;
    };
    add_transition = function(a, e, b) {
      var k, p;

      k = inMap(a, b);
      if (k < 0) {
        p = q + 1;
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
      I = this.trans.out(G1, map[q * 3]);
      J = this.trans.out(G2, map[q * 3 + 1]);
      for (_i = 0, _len = I.length; _i < _len; _i++) {
        i = I[_i];
        q1 = G1.trans[i];
        e1 = G1.trans[i + 1];
        p1 = G1.trans[i + 2];
        for (_j = 0, _len1 = J.length; _j < _len1; _j++) {
          j = J[_j];
          q2 = G2.trans[j];
          e2 = G2.trans[j + 1];
          p2 = G2.trans[j + 2];
          if (__indexOf.call(common, e1) < 0) {
            if (__indexOf.call(common, e2) < 0) {
              add_transition(p1, e1, q2);
              add_transition(q1, e2, p2);
            } else {
              add_transition(p1, e1, q2);
            }
          } else {
            if (__indexOf.call(common, e2) < 0) {
              add_transition(q1, e2, p2);
            } else {
              if (e1 === e2) {
                add_transition(p1, e1, p2);
              }
            }
          }
        }
      }
    }
    return G;
  };

  G = automata2.create();

  NUM_STATES = 2;

  make_G = function(G) {
    var p, q, _results;

    q = 0;
    _results = [];
    while (q < NUM_STATES) {
      p = 0;
      while (p < NUM_STATES) {
        automata2.trans.add(G, q, p, p);
        p++;
      }
      _results.push(q++);
    }
    return _results;
  };

  make_G(G);

}).call(this);
