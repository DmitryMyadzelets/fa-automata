// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var ARRAY_INCREMENT, DES, E_CONFIG, NUMBER_SUBSET, OBJECT_SUBSET, TRIPLE_SUBSET, T_CONFIG, X_CONFIG, create_general_set, delUint16ArrayBit, enumArray, enumTripleArray, equal_arrays, resizeTripleArray, resizeUint16Array, resizeUint32Array, sortIndexArray,
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

  this.bitArray = (function() {
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

      len = b2i(bits) + 1 | 0;
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

  this.intersection = function(A, B) {
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
        if (this[key] instanceof bitArray) {
          this[key].add();
        } else {
          this[key].add.apply(this);
        }
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

      M = DES.create_module('sync(' + m1.name + ',' + m2.name + ')');
      T = M.T;
      M.X.start = 0;
      o = m1.T.transitions;
      o2 = m2.T.transitions;
      if (!common) {
        common = [];
      }
      stack = [];
      map = [];
      map_n = 0;
      M.X.map = map;
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
        if (m1.X.marked.get(q1) && m2.X.marked.get(q2)) {
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
      this.DFS(m, null, function(q, e, p) {
        if (m.X.marked.get(p)) {
          return m.X.marked.set(q);
        }
      });
      return m;
    },
    subtract: function(m1, m2) {
      var e, events, i;

      events = [];
      i = m1.T.size();
      while (i-- > 0) {
        e = m1.T.transitions.get(i)[1];
        if (__indexOf.call(events, e) < 0) {
          events.push(e);
        }
      }
      i = m2.T.size();
      while (i-- > 0) {
        e = m2.T.transitions.get(i)[1];
        if (__indexOf.call(events, e) < 0) {
          events.push(e);
        }
      }
      return this.intersection(m1, this.complement(m2, events));
    },
    is_empty: function(m) {
      var empty;

      empty = true;
      this.BFS(m, function(q, e, p) {
        if (m.X.marked.get(p)) {
          return empty = false;
        }
      });
      return empty;
    },
    copy: function(m) {
      var M, T, i, n, x;

      M = this.create_module(m.name);
      T = M.T;
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
    },
    projection: function(m, events) {
      var M, T;

      M = this.create_module('P(' + m.name + ')');
      T = M.T;
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
    },
    complement: function(m, events) {
      var M, arr_tix, e, new_p, p_events, q, q_events, _i, _j, _len, _len1;

      M = this.copy(m);
      if (events == null) {
        events = [];
      }
      new_p = -1;
      q = M.X.size();
      while (q-- > 0) {
        if (M.X.marked.get(q)) {
          M.X.marked.clr(q);
        } else {
          M.X.marked.set(q);
        }
        arr_tix = m.T.transitions.out(q);
        q_events = arr_tix.map(function(t) {
          return m.T.transitions.get(t)[1];
        });
        p_events = events.filter(function(e) {
          return q_events.indexOf(e) < 0;
        });
        for (_i = 0, _len = p_events.length; _i < _len; _i++) {
          e = p_events[_i];
          if (new_p < 0) {
            new_p = M.X.add();
            M.X.marked.set(new_p);
          }
          M.T.transitions.set(M.T.add(), q, e, new_p);
        }
      }
      if ((new_p < 0) && events.length) {
        M.X.marked.set(new_p = M.X.add());
      }
      if (new_p >= 0) {
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          e = events[_j];
          M.T.transitions.set(M.T.add(), new_p, e, new_p);
        }
      }
      return M;
    },
    get_common_events: function(m1, m2) {
      var common, e, e2, i, j;

      common = [];
      i = m1.T.size();
      while (i-- > 0) {
        e = m1.T.transitions.get(i)[1];
        if (__indexOf.call(common, e) >= 0) {
          continue;
        }
        j = m2.T.size();
        while (j-- > 0) {
          e2 = m2.T.transitions.get(j)[1];
          if (e2 === e) {
            common.push(e);
            break;
          }
        }
      }
      return common;
    }
  };

  this.DES = DES;

}).call(this);
