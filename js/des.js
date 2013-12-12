// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var ARRAY_INCREMENT, BINARY_SUBSET, DES, E_CONFIG, NUMBER_SUBSET, OBJECT_SUBSET, TRIPLE_SUBSET, T_CONFIG, X_CONFIG, clrUint16ArrayBit, create_general_set, delUint16ArrayBit, e, enumArray, enumTripleArray, enumUint16ArrayBit, getUint16ArrayBit, i, m, resizeTripleArray, resizeUint16Array, resizeUint32Array, setUint16ArrayBit;

  E_CONFIG = {
    label: 'object',
    observable: 'boolean',
    controllable: 'boolean'
  };

  X_CONFIG = {
    x: 'integer',
    y: 'integer',
    label: 'object',
    marked: 'boolean',
    faulty: 'boolean'
  };

  T_CONFIG = {
    transition: 'integer_triple',
    bends: 'boolean'
  };

  ARRAY_INCREMENT = 10 | 0;

  getUint16ArrayBit = function(arr, i) {
    return !!(arr[i >> 4] & 1 << (i & 0xF));
  };

  setUint16ArrayBit = function(arr, i) {
    return arr[i >> 4] |= 1 << (i & 0xF);
  };

  clrUint16ArrayBit = function(arr, i) {
    return arr[i >> 4] &= ~(1 << (i & 0xF));
  };

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

    if (len > arr.length) {
      ret = new Uint32Array(len);
      ret.set(arr);
    } else {
      ret = new Uint32Array(arr.subarray(0, len));
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

  enumUint16ArrayBit = function(arr, len) {
    var i, l, m, n, ret, v;

    ret = [];
    i = 0;
    l = arr.length;
    while (i < l) {
      v = arr[i];
      m = 0;
      n = i * 16;
      while (v && n + m < len) {
        if (v & 1) {
          ret.push(n + m);
        }
        v >>= 1;
        m++;
      }
      i++;
    }
    return ret;
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

  BINARY_SUBSET = function() {
    var arr, o, self;

    arr = new Uint16Array(1);
    self = this;
    o = function() {
      return enumUint16ArrayBit(arr, self.size());
    };
    o.get = function(i) {
      if (i < self.size()) {
        return getUint16ArrayBit(arr, i);
      }
    };
    o.set = function(i) {
      if (i < self.size()) {
        setUint16ArrayBit(arr, i);
      }
      return self;
    };
    o.clr = function(i) {
      if (i < self.size()) {
        clrUint16ArrayBit(arr, i);
      }
      return self;
    };
    o.add = function() {
      if (this === self) {
        if ((arr.length << 4) <= self.size()) {
          arr = resizeUint16Array(arr, arr.length + 1);
        }
      }
      return null;
    };
    return o;
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
    o.add = function() {
      var key;

      for (key in config) {
        this[key].add.apply(this);
      }
      return size++;
    };
    for (key in config) {
      switch (config[key]) {
        case 'boolean':
          o[key] = BINARY_SUBSET.apply(o);
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
    create_module: function(name) {
      var module;

      module = {
        name: name,
        X: create_general_set(X_CONFIG),
        T: create_general_set(T_CONFIG)
      };
      this.modules.push(module);
      return module;
    }
  };

  console.clear();

  e = DES.E;

  e.label.set(e.add(), 'open');

  e.label.set(i = e.add(), 'close');

  e.observable.set(i);

  console.log('Events');

  console.table(e());

  m = DES.create_module('Motor');

  console.log('Modules');

  console.table(DES.modules);

  i = m.X.add();

  m.X.x.set(i, 12).y.set(i, 57).label.set(i, 'Initial').marked.set(i);

  i = m.X.add();

  m.X.label.set(i, 'NF');

  m.X.faulty.set(i, 'F');

  console.log('States');

  console.table(m.X());

  console.log('Marked states');

  console.table([m.X.marked()]);

  i = m.T.add();

  m.T.transition.set(i, 0, 0, 1);

  i = m.T.add();

  m.T.transition.set(i, 1, 2, 1);

  m.T.bends.set(i);

  console.log('Transitions');

  console.table(m.T.transition());

  console.table(m.T.transition().map(function(v) {
    return {
      from: m.X.label.get(v[0]),
      event: DES.E.label.get(v[1]),
      to: m.X.label.get(v[2])
    };
  }));

}).call(this);
