// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.automata2 = (function() {
    var DELTA_TRANS, getBit, setBit, _this;

    DELTA_TRANS = 10;
    setBit = function(arr, i) {
      arr[i >> 5] |= 1 << (i & 0x1F);
      return null;
    };
    getBit = function(arr, i) {
      return arr[i >> 5] & 1 << (i & 0x1F) && 1;
    };
    return _this = {
      create: function() {
        return {
          start: 0 | 0,
          trans: new Uint32Array(3 * DELTA_TRANS),
          nN: 0 | 0,
          nE: 0 | 0,
          nT: 0 | 0
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
          }
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
      edges: {}
      /**
      		 * Breadth-first Search
      		 * @param {Automaton} G   
      		 * @param {function} fnc Callback function. Called with (node_from, label, node_to)
      		 * where:
      		 * node_from: index of the outgoing node
      		 * label: event label
      		 * node_to: index of the ingoing node
      */

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
    var I, e, i, p, q, stack, visited, _i, _len;

    if (G == null) {
      return;
    }
    stack = [G.start];
    visited = [G.start];
    while (stack.length) {
      q = stack.pop();
      I = this.trans.out(G, q);
      for (_i = 0, _len = I.length; _i < _len; _i++) {
        i = I[_i];
        e = G.trans[i + 1];
        p = G.trans[i + 2];
        if (__indexOf.call(visited, p) < 0) {
          visited.push(p);
          stack.push(p);
        }
        if (typeof fnc === 'function') {
          fnc(q, e, p);
        }
      }
    }
    return null;
  };

  /**
   * Parallel composition ('sync' name is taken from RW (Ramage & Wonham) theory)
   * @param  {automaton} G1
   * @param  {automaton} G2
   * @return {automaton} G
  */


  automata2.sync = function(G1, G2) {
    var G, I, J, a, b, common, e1, e2, i, inMap, j, k, map, p, p1, p2, q, q1, q2, stack, _i, _j, _len, _len1, _t1, _t2;

    G = this.create();
    if ((G1 == null) || (G2 == null)) {
      return G;
    }
    map = [[G1.start, G2.start, G.start = 0]];
    stack = [0];
    common = [5];
    inMap = function(q1, q2) {
      var index, m, _i, _len;

      for (index = _i = 0, _len = map.length; _i < _len; index = ++_i) {
        m = map[index];
        if (m[0] === q1 && m[1] === q2) {
          return index;
        }
      }
      return -1;
    };
    while (stack.length) {
      q = stack.pop();
      I = this.trans.out(G1, map[q][0]);
      J = this.trans.out(G2, map[q][1]);
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
          a = p1;
          b = p2;
          _t1 = true;
          _t2 = true;
          if (__indexOf.call(common, e1) >= 0) {
            if (__indexOf.call(common, e2) >= 0) {
              if (e1 !== e2) {
                continue;
              }
            } else {
              a = q1;
              _t1 = false;
            }
          } else {
            if (__indexOf.call(common, e2) >= 0) {
              b = q1;
              _t2 = false;
            }
          }
          k = inMap(a, b);
          if (k < 0) {
            p = q + 1;
            stack.push(p);
            map.push([a, b, p]);
          } else {
            p = k;
          }
          if (_t1) {
            this.trans.add(G, q, e1, p);
          }
          if (_t2 && e1 !== e2) {
            this.trans.add(G, q, e2, p);
          }
        }
      }
    }
    return G;
  };

}).call(this);
