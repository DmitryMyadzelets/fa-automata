// Generated by CoffeeScript 1.6.3
(function() {
  'use strict';
  var ARRAY_INCREMENT, DES, E_CONFIG, NUMBER_SUBSET, OBJECT_SUBSET, TRIPLE_SUBSET, T_CONFIG, X_CONFIG, bitArray, create_general_set, delUint16ArrayBit, enumArray, enumTripleArray, equal_arrays, get_event_by_labels, intersection, m, make_F_module, make_NF_module, make_N_module, make_projection, resizeTripleArray, resizeUint16Array, resizeUint32Array, set_transitions, show_dfs, show_events, show_modules, show_modules_transitions, show_states, show_transitions, sortIndexArray, transitions,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  E_CONFIG = {
    labels: 'object',
    observable: 'boolean',
    fault: 'boolean',
    modules: 'object'
  };

  X_CONFIG = {
    labels: 'object',
    marked: 'boolean',
    faulty: 'boolean'
  };

  T_CONFIG = {
    transitions: 'integer_triple',
    bends: 'boolean'
  };

  bitArray = (function() {
    var b2i, privat, resize;

    function bitArray(bits) {
      var o;
      o = {};
      o.num_bits = bits ? bits : 0;
      o.num_items = 1 + b2i(this.num_bits);
      o.array = new Uint16Array(o.num_items);
      this.privat = function() {
        if (this === bitArray.prototype) {
          return o;
        }
      };
    }

    privat = null;

    b2i = function(bit) {
      return (bit >> 4) | 0;
    };

    resize = function(bits) {
      var len, tmp;
      len = 1 | 0 + b2i(bits);
      if (len ^ this.array.length) {
        if (len > this.array.length) {
          tmp = new Uint16Array(len);
          tmp.set(this.array);
        } else {
          tmp = new Uint16Array(this.array.subarray(0, len));
        }
        this.array = tmp;
      }
      return bits;
    };

    bitArray.prototype.add = function(num) {
      if (num == null) {
        num = 1;
      }
      privat = this.privat.apply(this.__proto__);
      return resize.apply(privat, [privat.num_bits += num]);
    };

    bitArray.prototype.set = function(i) {
      privat = this.privat.apply(this.__proto__);
      if (i < privat.num_bits) {
        privat.array[i >> 4] |= 1 << (i & 0xF);
      }
    };

    bitArray.prototype.clr = function(i) {
      privat = this.privat.apply(this.__proto__);
      if (i < privat.num_bits) {
        privat.array[i >> 4] &= ~(1 << (i & 0xF));
      }
    };

    bitArray.prototype.get = function(i) {
      privat = this.privat.apply(this.__proto__);
      if (i < privat.num_bits) {
        return !!(privat.array[i >> 4] & 1 << (i & 0xF));
      }
    };

    bitArray.prototype.length = function() {
      return this.privat.apply(this.__proto__).num_bits;
    };

    return bitArray;

  })();

  ARRAY_INCREMENT = 10 | 0;

  resizeUint16Array = function(arr, len) {
    var ret;
    if (len > arr.length) {
      ret = new Uint16Array(len);
      ret.set(arr);
    } else {
      ret = new Uint16Array(arr.subarray(0, len));
    }
    return ret;
  };

  resizeUint32Array = function(arr, len) {
    var ret;
    ret = arr;
    if (len ^ arr.length) {
      if (len > arr.length) {
        ret = new Uint32Array(len);
        ret.set(arr);
      } else {
        ret = new Uint32Array(arr.subarray(0, len));
      }
    }
    return ret;
  };

  delUint16ArrayBit = function(arr, i, bits_len) {
    bits_len -= 1;
    if (i !== bits_len) {
      if (getUint16ArrayBit(arr, bits_len)) {
        setUint16ArrayBit(arr, i);
      } else {
        clrUint16ArrayBit(arr, i);
      }
    }
    return bits_len;
  };

  enumArray = function(arr, len) {
    var i, l, ret;
    ret = [];
    i = 0;
    l = arr.length;
    if (len < l) {
      l = len;
    }
    while (i < l) {
      ret.push(arr[i]);
      i++;
    }
    return ret;
  };

  equal_arrays = function(a, b) {
    var i;
    i = a.length;
    if (i !== b.length) {
      return false;
    }
    while (i-- > 0) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  };

  intersection = function(A, B) {
    return A.filter(function(x) {
      return B.indexOf(x) >= 0;
    });
  };

  resizeTripleArray = function(arr, len) {
    var ret;
    if (len * 3 > arr.length) {
      ret = new Uint32Array(len * 3);
      ret.set(arr);
    } else {
      ret = new Uint32Array(arr.subarray(0, len * 3));
    }
    return ret;
  };

  enumTripleArray = function(arr, len) {
    var i, l, ret;
    ret = [];
    i = 0;
    l = arr.length;
    if (len * 3 < l) {
      l = len * 3;
    }
    while (i < l) {
      ret.push(arr.subarray(i, i += 3));
    }
    return ret;
  };

  /**
   * [Optimized bubble sort (http://en.wikipedia.org/wiki/Bubble_sort). 
   * Sorts the index array instead of the array itself.]
   * @param  {[Array]} a   [Array with data]
   * @param  {[Array]} ix  [Index array to be sorted]
   * @param  {[int]} len [Length of the index array]
  */


  sortIndexArray = function(a, ix, len) {
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

  OBJECT_SUBSET = function() {
    var arr, o, self;
    arr = [];
    self = this;
    o = function() {
      return enumArray(arr, self.size());
    };
    o.get = function(i) {
      if (i < self.size()) {
        return arr[i];
      }
    };
    o.set = function(i, v) {
      if (i < self.size()) {
        arr[i] = v;
      }
      return self;
    };
    o.add = function() {
      if (this === self) {
        return arr.push(null);
      }
    };
    return o;
  };

  NUMBER_SUBSET = function() {
    var arr, o, self;
    arr = new Uint16Array(ARRAY_INCREMENT);
    self = this;
    o = function() {
      return enumArray(arr, self.size());
    };
    o.get = function(i) {
      if (i < self.size()) {
        return arr[i];
      }
    };
    o.set = function(i, v) {
      if (i < self.size()) {
        arr[i] = v;
      }
      return self;
    };
    o.add = function() {
      if (this === self) {
        if (arr.length < self.size() + 1) {
          arr = resizeUint16Array(arr, self.size() + ARRAY_INCREMENT);
        }
      }
      return null;
    };
    return o;
  };

  TRIPLE_SUBSET = function() {
    var arr, nix, o, self, sorted, tix;
    arr = new Uint32Array(ARRAY_INCREMENT * 3);
    tix = new Uint32Array(ARRAY_INCREMENT);
    nix = new Uint32Array();
    self = this;
    sorted = false;
    o = function() {
      return enumTripleArray(arr, self.size());
    };
    o.get = function(i) {
      if (i < self.size()) {
        return arr.subarray(i *= 3, i + 3);
      }
    };
    o.set = function(i, q, e, p) {
      i *= 3;
      if (i < arr.length - 2) {
        arr[i++] = q | 0;
        arr[i++] = e | 0;
        arr[i] = p | 0;
        sorted = false;
      }
      return self;
    };
    o.add = function() {
      if (this === self) {
        if (arr.length < (self.size() + 1) * 3) {
          arr = resizeTripleArray(arr, self.size() + ARRAY_INCREMENT);
          tix = resizeUint32Array(tix, self.size() + ARRAY_INCREMENT);
        }
      }
      return null;
    };
    o.sort = function() {
      var i;
      if (sorted) {
        return sorted;
      }
      i = self.size();
      while (i-- > 0) {
        tix[i] = i * 3 | 0;
      }
      sortIndexArray(arr, tix, self.size());
      return sorted = true;
    };
    o.max_state = function() {
      var i, max;
      i = 3 * self.size() | 0;
      max = -1;
      while (i-- > 0) {
        if (arr[i] > max) {
          max = arr[i];
        }
        i -= 2;
        if (arr[i] > max) {
          max = arr[i];
        }
      }
      return max;
    };
    o.out = function(q) {
      var i, ret;
      ret = [];
      i = 3 * self.size() | 0;
      i -= 3;
      while (i >= 0) {
        if (arr[i] === q) {
          ret.push((i / 3) | 0);
        }
        i -= 3;
      }
      return ret;
    };
    o["in"] = function(p) {
      var i, ret;
      ret = [];
      i = 3 * self.size() | 0;
      i -= 1;
      while (i >= 0) {
        if (arr[i] === p) {
          ret.push((i / 3) | 0);
        }
        i -= 3;
      }
      return ret;
    };
    o.bfs = function(start, fnc) {
      var e, has_callback, i, ii, max, p, q, stack, t, visited, _i, _len;
      o.sort();
      has_callback = typeof fnc === 'function';
      max = o.max_state();
      visited = new bitArray(1 + max);
      visited.set(start);
      stack = [start];
      while (stack.length) {
        q = stack.pop();
        ii = o.out(q);
        for (_i = 0, _len = ii.length; _i < _len; _i++) {
          i = ii[_i];
          t = o.get(i);
          e = t[1];
          p = t[2];
          if (!visited.get(p)) {
            visited.set(p);
            stack.push(p);
          }
          if (has_callback) {
            fnc(q, e, p);
          }
        }
      }
      visited = null;
    };
    o.dfs = function(start, callback_before, callback_after) {
      var has_callback_a, has_callback_b, process_state, visited;
      o.sort();
      has_callback_b = typeof callback_before === 'function';
      has_callback_a = typeof callback_after === 'function';
      visited = new bitArray(1 + o.max_state());
      process_state = function(q) {
        var e, i, ii, is_continue, p, t, _i, _len;
        visited.set(q);
        ii = o.out(q);
        for (_i = 0, _len = ii.length; _i < _len; _i++) {
          i = ii[_i];
          t = o.get(i);
          e = t[1];
          p = t[2];
          is_continue = true;
          if (has_callback_b) {
            is_continue = !!callback_before(q, e, p);
          }
          if (is_continue && !visited.get(p)) {
            process_state(p);
          }
          if (has_callback_a) {
            callback_after(q, e, p);
          }
        }
      };
      process_state(start);
      visited = null;
    };
    o.reach = function(qq, events) {
      var e, i, ii, p, q, reach, stack, t, _i, _j, _len, _len1;
      reach = qq.slice();
      stack = [];
      for (_i = 0, _len = qq.length; _i < _len; _i++) {
        q = qq[_i];
        stack.push(q);
        while (stack.length) {
          q = stack.pop();
          ii = o.out(q);
          for (_j = 0, _len1 = ii.length; _j < _len1; _j++) {
            i = ii[_j];
            t = o.get(i);
            e = t[1];
            p = t[2];
            if (__indexOf.call(events, e) < 0) {
              if (__indexOf.call(reach, p) < 0) {
                stack.push(p);
                reach.push(p);
              }
            }
          }
        }
      }
      return reach.sort();
    };
    o.projection = function(start, events, callback) {
      var clear_map, e, has_callback, i, ii, in_states, ix, map, p, pix, pp, q, qix, qq, reach, stack, states, t, to_map, _i, _j, _len, _len1;
      has_callback = typeof callback === 'function';
      reach = o.reach([start], events);
      stack = [reach];
      states = [reach];
      qix = 0;
      pix = 0;
      in_states = function(state) {
        var i;
        i = states.length;
        while (--i >= 0) {
          if (equal_arrays(states[i], state)) {
            break;
          }
        }
        return i;
      };
      map = {};
      to_map = function(e, p) {
        if (map[e]) {
          if (__indexOf.call(map[e], p) < 0) {
            map[e].push(p);
          }
        } else {
          map[e] = [p];
        }
      };
      clear_map = function() {
        var e;
        for (e in map) {
          delete map[e];
        }
      };
      while (stack.length) {
        qq = stack.pop();
        qix = in_states(qq);
        clear_map();
        for (_i = 0, _len = qq.length; _i < _len; _i++) {
          q = qq[_i];
          ii = o.out(q);
          for (_j = 0, _len1 = ii.length; _j < _len1; _j++) {
            i = ii[_j];
            t = o.get(i);
            e = t[1];
            p = t[2];
            if (__indexOf.call(events, e) < 0) {
              continue;
            }
            to_map(e, p);
          }
        }
        for (e in map) {
          pp = o.reach(map[e], events);
          ix = in_states(pp);
          if (ix < 0) {
            pix = states.length;
            stack.push(pp);
            states.push(pp);
          } else {
            pix = ix;
          }
          if (has_callback) {
            callback(qix, e, pix, qq, pp);
          }
        }
        qix++;
      }
      return states;
    };
    return o;
  };

  create_general_set = function(config) {
    var key, o, size;
    size = 0;
    config = config;
    o = function() {
      var i, key, obj, ret;
      if (arguments.length && 'number' === typeof (i = arguments[0] | 0)) {
        obj = {};
        for (key in config) {
          obj[key] = o[key].get(i);
        }
        return obj;
      }
      ret = [];
      i = size;
      while (i--) {
        obj = {};
        for (key in config) {
          obj[key] = o[key].get(i);
        }
        ret[i] = obj;
      }
      return ret;
    };
    o.size = function() {
      return size;
    };
    o.add = function(n) {
      var key;
      if (n == null) {
        n = 1;
      }
      for (key in config) {
        this[key].add();
      }
      return size++;
    };
    for (key in config) {
      switch (config[key]) {
        case 'boolean':
          o[key] = new bitArray();
          break;
        case 'integer':
          o[key] = NUMBER_SUBSET.apply(o);
          break;
        case 'object':
          o[key] = OBJECT_SUBSET.apply(o);
          break;
        case 'integer_triple':
          o[key] = TRIPLE_SUBSET.apply(o);
          break;
        default:
          console.log('Uknown configuration value');
      }
    }
    return o;
  };

  DES = {
    E: create_general_set(E_CONFIG),
    modules: [],
    make_module_from_T: function(T, name) {
      var i, module;
      module = {
        T: T,
        X: create_general_set(X_CONFIG)
      };
      module.name = name;
      i = 1 + T.transitions.max_state();
      while (i-- > 0) {
        module.X.add();
      }
      module.X.start = 0;
      return module;
    },
    create_module: function(name) {
      return this.make_module_from_T(create_general_set(T_CONFIG), name);
    },
    add_module: function(name) {
      var module;
      this.modules.push(module = this.create_module(name));
      return module;
    },
    BFS: function(module, callback) {
      return module.T.transitions.bfs(module.X.start, callback);
    },
    DFS: function(module, before, after) {
      return module.T.transitions.dfs(module.X.start, before, after);
    },
    sync: function(m1, m2, common) {
      var I, J, M, T, add_transition, e1, e2, i, in_map, j, map, map_n, o, o2, p1, p2, q, q1, q2, stack, t1, t2, to_map, _i, _j, _k, _len, _len1, _len2;
      T = create_general_set(T_CONFIG);
      M = DES.make_module_from_T(T, 'sync(' + m1.name + ',' + m2.name + ')');
      M.X.start = 0;
      o = m1.T.transitions;
      o2 = m2.T.transitions;
      if (!common) {
        common = [];
      }
      stack = [];
      map = [];
      map_n = 0;
      to_map = function(q1, q2) {
        var x;
        map.push(q1);
        map.push(q2);
        x = M.X.add();
        if (m1.X.marked.get(q1) || m2.X.marked.get(q2)) {
          M.X.marked.set(x);
        }
        stack.push(map_n++);
        return map_n - 1;
      };
      in_map = function(q1, q2) {
        var i, n;
        i = 0;
        n = map.length;
        while (i < n) {
          if (map[i] === q1 && map[i + 1] === q2) {
            return (i | 0) >> 1;
          }
          i += 2;
        }
        return -1;
      };
      to_map(m1.X.start, m2.X.start);
      add_transition = function(e, a, b) {
        var p;
        if ((p = in_map(a, b)) < 0) {
          p = to_map(a, b);
        }
        T.transitions.set(T.add(), q, e, p);
      };
      while (stack.length) {
        q = stack.pop();
        q1 = map[q * 2];
        q2 = map[q * 2 + 1];
        I = o.out(q1);
        J = o2.out(q2);
        for (_i = 0, _len = I.length; _i < _len; _i++) {
          i = I[_i];
          t1 = o.get(i);
          e1 = t1[1];
          p1 = t1[2];
          if (__indexOf.call(common, e1) < 0) {
            add_transition(e1, p1, q2);
          } else {
            for (_j = 0, _len1 = J.length; _j < _len1; _j++) {
              j = J[_j];
              t2 = o2.get(j);
              e2 = t2[1];
              p2 = t2[2];
              if (e1 === e2) {
                add_transition(e1, p1, p2);
              }
            }
          }
        }
        for (_k = 0, _len2 = J.length; _k < _len2; _k++) {
          j = J[_k];
          t2 = o2.get(j);
          e2 = t2[1];
          p2 = t2[2];
          if (__indexOf.call(common, e2) < 0) {
            add_transition(e2, q1, p2);
          }
        }
      }
      return M;
    },
    intersection: function(m1, m2) {
      var I, J, M, T, add_transition, e1, e2, i, in_map, j, map, map_n, o, o2, p1, p2, q, q1, q2, stack, t1, t2, to_map, _i, _j, _len, _len1;
      T = create_general_set(T_CONFIG);
      M = DES.make_module_from_T(T, 'cap(' + m1.name + ',' + m2.name + ')');
      o = m1.T.transitions;
      o2 = m2.T.transitions;
      o = m1.T.transitions;
      o2 = m2.T.transitions;
      stack = [];
      map = [];
      map_n = 0;
      to_map = function(q1, q2) {
        var x;
        map.push(q1);
        map.push(q2);
        x = M.X.add();
        if (m1.X.marked.get(q1) || m2.X.marked.get(q2)) {
          M.X.marked.set(x);
        }
        stack.push(map_n++);
        return map_n - 1;
      };
      in_map = function(q1, q2) {
        var i, n;
        i = 0;
        n = map.length;
        while (i < n) {
          if (map[i] === q1 && map[i + 1] === q2) {
            return (i | 0) >> 1;
          }
          i += 2;
        }
        return -1;
      };
      to_map(m1.X.start, m2.X.start);
      add_transition = function(e, a, b) {
        var p;
        if ((p = in_map(a, b)) < 0) {
          p = to_map(a, b);
        }
        T.transitions.set(T.add(), q, e, p);
      };
      while (stack.length) {
        q = stack.pop();
        q1 = map[q * 2];
        q2 = map[q * 2 + 1];
        I = o.out(q1);
        J = o2.out(q2);
        for (_i = 0, _len = I.length; _i < _len; _i++) {
          i = I[_i];
          t1 = o.get(i);
          e1 = t1[1];
          p1 = t1[2];
          for (_j = 0, _len1 = J.length; _j < _len1; _j++) {
            j = J[_j];
            t2 = o2.get(j);
            e2 = t2[1];
            p2 = t2[2];
            if (e1 === e2) {
              add_transition(e1, p1, p2);
            }
          }
        }
      }
      return M;
    },
    closure: function(m) {
      this.BFS(m, function(q, e, p) {
        return m.X.marked.set(p);
      });
      return m;
    },
    subtract: function(m1, m2) {
      var stack;
      stack = [m2.X.start];
      this.DFS(m1, function(q, e, p) {
        var i, q2, t2, tt, _i, _len;
        q2 = stack[stack.length - 1];
        tt = m2.T.transitions.out(q2);
        for (_i = 0, _len = tt.length; _i < _len; _i++) {
          i = tt[_i];
          t2 = m2.T.transitions.get(i);
          if (e === t2[1]) {
            q2 = t2[2];
            stack.push(q2);
            if (m2.X.marked.get(q2)) {
              m1.X.marked.clr(p);
            }
            return true;
          }
        }
        stack.push(null);
        return false;
      }, function(q, e, p) {
        stack.pop();
      });
    },
    is_empty: function(m) {
      this.BFS(m, function(q, e, p) {
        if (m.X.marked.get(p)) {
          return true;
        }
      });
      return false;
    },
    copy: function(m) {
      var M, T, i, n, x;
      T = create_general_set(T_CONFIG);
      M = DES.make_module_from_T(T, m.name);
      this.BFS(m, function(q, e, p) {
        return T.transitions.set(T.add(), q, e, p);
      });
      n = m.X.size();
      i = 0;
      while (i < n) {
        x = M.X.add();
        if (m.X.marked.get(i)) {
          M.X.marked.set(x);
        }
        i++;
      }
      M.X.start = m.X.start;
      return M;
    }
  };

  this.DES = DES;

  console.clear();

  console.clear();

  (function() {
    var E, e, events, i, key, _i, _len, _results;
    events = [
      {
        labels: 'a'
      }, {
        labels: 'b'
      }, {
        labels: 'c'
      }, {
        labels: 'd'
      }, {
        labels: 'e'
      }, {
        labels: 'f',
        fault: true
      }, {
        labels: 'o1',
        observable: true
      }, {
        labels: 'o2',
        observable: true
      }
    ];
    E = DES.E;
    _results = [];
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      e = events[_i];
      i = E.add();
      _results.push((function() {
        var _results1;
        _results1 = [];
        for (key in e) {
          _results1.push(E[key].set(i, e[key]));
        }
        return _results1;
      })());
    }
    return _results;
  })();

  get_event_by_labels = function(labels) {
    var i;
    i = DES.E.size();
    while (i-- > 0) {
      if (DES.E.labels.get(i) === labels) {
        break;
      }
    }
    return i;
  };

  set_transitions = function(m, transitions) {
    var eid, i, t, _i, _len;
    for (_i = 0, _len = transitions.length; _i < _len; _i++) {
      t = transitions[_i];
      if ((eid = get_event_by_labels(t[1])) >= 0) {
        m.T.transitions.set(m.T.add(), t[0], eid, t[2]);
      } else {
        console.log('Error:', t[1], 'labels not found');
      }
    }
    i = 1 + m.T.transitions.max_state();
    while (i-- > 0) {
      m.X.add();
    }
    return null;
  };

  show_events = function() {
    console.log('Events:');
    return console.table(DES.E());
  };

  show_states = function(m) {
    console.log('States of module', m.name);
    return console.table(m.X());
  };

  show_transitions = function(m) {
    console.log('Transitions of module', m.name);
    return console.table(m.T.transitions().map(function(v) {
      return {
        from: v[0],
        event: DES.E.labels.get(v[1]),
        to: v[2]
      };
    }));
  };

  show_modules = function() {
    console.log('Modules:');
    console.table(DES.modules);
  };

  show_modules_transitions = function() {
    var m, _i, _len, _ref;
    _ref = DES.modules;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      show_transitions(m);
    }
  };

  show_dfs = function(m) {
    console.log('Depth-First Search of module', m.name);
    DES.DFS(m, function(q, e, p) {
      console.log(q, DES.E.labels.get(e), p);
      return true;
    });
  };

  transitions = [[0, 'f', 1], [1, 'a', 2], [2, 'o1', 3], [3, 'b', 4], [4, 'c', 4], [0, 'o1', 5], [5, 'c', 5]];

  m = DES.add_module('G1');

  set_transitions(m, transitions);

  transitions = [[0, 'a', 1], [1, 'd', 2], [2, 'c', 2], [0, 'c', 0]];

  m = DES.add_module('G2');

  set_transitions(m, transitions);

  transitions = [[0, 'b', 1], [1, 'e', 2], [2, 'c', 2], [0, 'c', 0]];

  m = DES.add_module('G3 Valve');

  set_transitions(m, transitions);

  transitions = [[0, 'e', 1], [1, 'o2', 2], [2, 'd', 3], [3, 'c', 3], [0, 'c', 0]];

  m = DES.add_module('G4 Motor');

  set_transitions(m, transitions);

  (function() {
    var eid, i, index, modules, t, _i, _len, _ref, _results;
    _ref = DES.modules;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      m = _ref[index];
      i = m.T.size();
      _results.push((function() {
        var _results1;
        _results1 = [];
        while (i-- > 0) {
          t = m.T.transitions.get(i);
          eid = t[1];
          modules = DES.E.modules.get(eid);
          if (!modules) {
            modules = [];
          }
          if (__indexOf.call(modules, index) < 0) {
            modules.push(index);
            _results1.push(DES.E.modules.set(eid, modules));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  })();

  make_NF_module = function(m) {
    var M, T, flt, in_map, map, process_state, to_map, tt;
    tt = m.T.transitions;
    map = [];
    flt = [];
    T = create_general_set(T_CONFIG);
    M = DES.make_module_from_T(T, 'NF(' + m.name + ')');
    in_map = function(q, fault) {
      var i;
      i = map.length;
      while (i-- > 0) {
        if ((map[i] === q) && (flt[i] === fault)) {
          break;
        }
      }
      return i;
    };
    to_map = function(q, fault) {
      var x;
      map.push(q);
      flt.push(fault);
      x = M.X.add();
      if (fault) {
        M.X.faulty.set(x);
      }
      return map.length - 1;
    };
    process_state = function(q, fault) {
      var e, f, i, ii, p, pp, qq, t, _i, _len;
      qq = to_map(q, fault);
      if (m.X.faulty.get(q)) {
        fault = true;
      }
      ii = tt.out(q);
      for (_i = 0, _len = ii.length; _i < _len; _i++) {
        i = ii[_i];
        t = tt.get(i);
        e = t[1];
        p = t[2];
        f = fault || DES.E.fault.get(e);
        pp = in_map(p, f);
        if (pp < 0) {
          pp = process_state(p, f);
        }
        T.transitions.set(T.add(), qq, e, pp);
      }
      return qq;
    };
    process_state(m.X.start, false);
    return M;
  };

  make_N_module = function(m) {
    var M, T, in_map, map, process_state, to_map, tt;
    tt = m.T.transitions;
    T = create_general_set(T_CONFIG);
    M = DES.make_module_from_T(T, 'N(' + m.name + ')');
    map = [];
    in_map = function(q) {
      var i;
      i = map.length;
      while (i-- > 0) {
        if (map[i] === q) {
          break;
        }
      }
      return i;
    };
    to_map = function(q) {
      var x;
      map.push(q);
      x = M.X.add();
      return map.length - 1;
    };
    process_state = function(q) {
      var e, i, ii, p, pp, qq, t, _i, _len;
      qq = to_map(q);
      ii = tt.out(q);
      for (_i = 0, _len = ii.length; _i < _len; _i++) {
        i = ii[_i];
        t = tt.get(i);
        e = t[1];
        p = t[2];
        if (DES.E.fault.get(e) || m.X.faulty.get(p)) {
          continue;
        }
        pp = in_map(p);
        if (pp < 0) {
          pp = process_state(p);
        }
        M.X.marked.set(pp);
        T.transitions.set(T.add(), qq, e, pp);
      }
      return qq;
    };
    process_state(m.X.start);
    return M;
  };

  make_F_module = function(m) {
    var M, T, faulty, in_map, map;
    T = create_general_set(T_CONFIG);
    M = DES.make_module_from_T(T, 'F(' + m.name + ')');
    map = [];
    faulty = new bitArray(m.X.size());
    in_map = function(q) {
      var i;
      i = map.length;
      while (i-- > 0) {
        if (map[i] === q) {
          break;
        }
      }
      return i;
    };
    DES.DFS(m, function(q, e, p) {
      var x;
      if (!faulty.get(p) && (m.X.faulty.get(q) || DES.E.fault.get(e))) {
        faulty.set(p);
        map.push(p);
        x = M.X.add();
        M.X.faulty.set(x);
        M.X.marked.set(x);
      }
      return true;
    }, function(q, e, p) {
      if (!faulty.get(q) && faulty.get(p)) {
        faulty.set(q);
        map.push(q);
        M.X.add();
      }
      return true;
    });
    DES.DFS(m, function(q, e, p) {
      if (faulty.get(p)) {
        T.transitions.set(T.add(), in_map(q), e, in_map(p));
      }
      return true;
    });
    M.X.start = in_map(m.X.start);
    return M;
  };

  make_projection = function(m, events) {
    var M, T;
    T = create_general_set(T_CONFIG);
    M = DES.make_module_from_T(T, 'P(' + m.name + ')');
    M.X.start = 0;
    m.T.transitions.projection(m.X.start, events, function(q, e, p, qq, pp) {
      var i, _i, _len;
      T.transitions.set(T.add(), q, e, p);
      if (q >= M.X.size()) {
        q = M.X.add();
      }
      if (p >= M.X.size()) {
        p = M.X.add();
      }
      if (!M.X.marked.get(p)) {
        for (_i = 0, _len = pp.length; _i < _len; _i++) {
          i = pp[_i];
          if (m.X.marked.get(i)) {
            M.X.marked.set(p);
            break;
          }
        }
      }
    });
    return M;
  };

  console.log('====================================================');

  show_modules();

  show_events();

  (function() {
    var i, j, modules, _results;
    i = DES.modules.length;
    _results = [];
    while (i-- > 0) {
      m = DES.modules[i];
      m.common = [];
      j = DES.E.size();
      while (j-- > 0) {
        modules = DES.E.modules.get(j);
        if ((modules.length > 1) && (__indexOf.call(modules, i) >= 0)) {
          m.common.push(j);
        }
      }
      _results.push(m.C = make_projection(m, m.common));
    }
    return _results;
  })();

  (function() {
    var _i, _len, _ref, _results;
    _ref = DES.modules;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      m.F = DES.make_module_from_T(create_general_set(T_CONFIG), 'F');
      m.N = DES.make_module_from_T(create_general_set(T_CONFIG), 'N');
      _results.push(m.subcommon = m.common.slice());
    }
    return _results;
  })();

  (function() {
    var f, i, n, nf, propagate_FN;
    i = 0;
    m = DES.modules[i];
    nf = make_NF_module(m);
    n = make_N_module(nf);
    f = make_F_module(nf);
    m.N = make_projection(n, m.common);
    m.F = make_projection(f, m.common);
    propagate_FN = function(k, F, N) {
      var F_, Fc, Fj_, K, NF_, N_, Nc, Nj_, cap, common, index, j, _i, _len, _ref;
      _ref = DES.modules;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        j = _ref[index];
        if (index === i) {
          continue;
        }
        common = intersection(k.common, j.common);
        if (common.length === 0) {
          continue;
        }
        if (j.subcommon.length === 0) {
          continue;
        }
        Fc = DES.sync(F, j.C, common);
        Nc = DES.sync(N, j.C, common);
        Fj_ = make_projection(Fc, j.common);
        Nj_ = make_projection(Nc, j.common);
        K = DES.intersection(Fj_, Nj_);
        DES.closure(K);
        DES.subtract(Fj_, K);
        DES.subtract(Nj_, K);
        DES.subtract(Fj_, j.F);
        DES.subtract(Nj_, j.N);
        if (!DES.is_empty(Fj_) || !DES.is_empty(Nj_)) {
          j.F = DES.sync(j.F, Fj_);
          j.N = DES.sync(j.N, Nj_);
          j.F.name = 'F';
          j.N.name = 'N';
          console.log('updated', j.name);
          F_ = DES.copy(j.F);
          N_ = DES.copy(j.N);
          DES.closure(F_);
          DES.closure(N_);
          cap = DES.intersection(F_, N_);
          DES.subtract(F_, j.F);
          DES.subtract(N_, j.N);
          NF_ = DES.sync(F_, N_, j.common);
          DES.subtract(NF_, cap);
        }
        break;
      }
    };
    return propagate_FN(m, m.F, m.N);
  })();

}).call(this);
