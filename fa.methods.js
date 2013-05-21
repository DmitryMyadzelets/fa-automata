// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.fa = {
    "new": function() {
      return {
        start: 0,
        nodes: {
          v: []
        },
        edges: {
          a: [],
          b: [],
          v: []
        }
      };
    },
    edges: {
      add: function(G, a, b, i) {
        if (i == null) {
          G.edges.a.push(a);
          return G.edges.b.push(b);
        } else {
          fa.ins(G.edges.a, i, a);
          return fa.ins(G.edges.b, i, b);
        }
      },
      del: function(G, i) {
        return fa.do_for_all(fa.del, G.edges, i);
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
            return true;
          }
        }
        return false;
      }
    },
    nodes: {
      add: function(G, v) {
        return G.nodes.v.push(v);
      },
      ins: function(G, i, v) {
        return fa.ins(G.nodes.v, i, v);
      },
      del: function(G, i) {
        return fa.do_for_all(fa.del, G.nodes, i);
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
    },
    /* 
    	# Helper methods
    	# =======================================================================
    */

    ins: function(arr, i, val) {
      if (i < arr.length) {
        arr.push(arr[i]);
        arr[i] = val;
      } else {
        arr.push(val);
      }
      return i;
    },
    del: function(arr, i) {
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
    },
    get_arrays: function(obj) {
      var key, keys;

      keys = [];
      for (key in obj) {
        if (obj[key] instanceof Array) {
          keys.push(key);
        }
      }
      return keys;
    },
    do_for_all: function(fnc, obj, args) {
      var key, keys, _i, _len, _results;

      keys = this.get_arrays(obj);
      console.log(keys);
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push(fnc(obj[key], args));
      }
      return _results;
    },
    /*
    	# Graph Methods
    	# =======================================================================
    */

    BFS: function(G) {
      var E, a, b, e, stack, visited, _i, _len;

      stack = [G.start];
      visited = [G.start];
      while (stack.length) {
        a = stack.pop();
        E = this.edges.out(G, a);
        for (_i = 0, _len = E.length; _i < _len; _i++) {
          e = E[_i];
          b = G.edges.b[e];
          if (__indexOf.call(visited, b) < 0) {
            visited.push(b);
            stack.push(b);
          }
          console.log(a, "->", b);
        }
      }
      return null;
    },
    /*
    	# Spring-electrical Model (SEM)
    	Input :
    		G = (V, E) - araph, (V,E) are sets of vertices and edges.
    		X - set of coordinates of vertices for each i in V.
    		tol - tolerance?
    	Force_Directed_Algorithm (G, X, tol)
    
    		Converged = false
    		Step = initial step length
    		Energy = Infinity
    		
    		while Converged is false
    			X0 = X
    			Energy0 = Energy
    			Energy = 0
    			
    			for i in V
    				f = 0
    				for e=(i,j) in E when e.i is i
    					f += f_a(i,j)*(xj - xi)/distance(xj - xi)
    				for j in V
    					f += f_r(i,j)*(xj - xi)/distance(xj - xi)
    				xi 		+= step * (f/|f|) wtf?
    				Energy 	+= |f|*|f|
    
    			step = update_step_length(step, Energy, Energy0)
    			if |X - X0| < (K * tol)
    				Converged = true
    		return X
    */

    FDA: function(G, X, Y) {
      var C, CKK, CKKK, FX, FY, J, K, X0, Y0, converged, de, dl, dl2, dx, dy, energy, energy0, fx, fy, i, iteration, j, progress, step, sumFX, sumFY, title, u, v, x, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;

      title = "Done in";
      console.time(title);
      converged = false;
      K = 100;
      C = 0.2;
      CKK = C * K * K;
      CKKK = C * K * K * K;
      step = K / 10;
      progress = 0;
      energy = Number.MAX_VALUE;
      FX = [];
      FY = [];
      iteration = 0;
      while (!converged) {
        ++iteration;
        energy0 = energy;
        energy = 0;
        X0 = X.slice(0);
        Y0 = Y.slice(0);
        _ref = G.nodes.v;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          v = _ref[i];
          FX[i] = FY[i] = 0;
        }
        _ref1 = G.nodes.v;
        for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
          v = _ref1[i];
          J = fa.nodes.out(G, i).concat(fa.nodes["in"](G, i));
          fx = 0;
          fy = 0;
          _ref2 = G.nodes.v;
          for (j = _k = 0, _len2 = _ref2.length; _k < _len2; j = ++_k) {
            u = _ref2[j];
            if (!(j !== i)) {
              continue;
            }
            dx = X[j] - X[i];
            dy = Y[j] - Y[i];
            if (dx === 0 && dy === 0) {
              dx = dy = Math.random();
            }
            dl2 = dx * dx + dy * dy;
            dl = Math.sqrt(dl2);
            if (__indexOf.call(J, j) >= 0) {
              fx += dx * (dl / K);
              fy += dy * (dl / K);
            }
            fx += dx * (-CKK / dl2);
            fy += dy * (-CKK / dl2);
          }
          FX[i] = fx;
          FY[i] = fy;
          energy += fx * fx + fy * fy;
        }
        if (energy < energy0) {
          if (++progress >= 5) {
            progress = 0;
            step /= 0.9;
          }
        } else {
          progress = 0;
          step *= 0.9;
        }
        de = energy0 - energy;
        de *= de;
        sumFX = 0;
        sumFY = 0;
        for (i = _l = 0, _len3 = FX.length; _l < _len3; i = ++_l) {
          fx = FX[i];
          fy = FY[i];
          sumFX += Math.sqrt(fx * fx);
          sumFY += Math.sqrt(fy * fy);
        }
        for (i = _m = 0, _len4 = X.length; _m < _len4; i = ++_m) {
          x = X[i];
          if (sumFX > 0) {
            X[i] += step * FX[i] / sumFX;
          }
          if (sumFY > 0) {
            Y[i] += step * FY[i] / sumFY;
          }
        }
        console.log(de);
        converged = (iteration >= 100) || (de < (K * 0.01));
      }
      console.log("Converged in", iteration, "steps");
      console.timeEnd(title);
      return null;
    }
  };

}).call(this);
