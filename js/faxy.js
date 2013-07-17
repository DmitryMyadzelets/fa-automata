// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var vec;

  this.r = 16;

  vec = {
    create: function() {
      return new Float32Array([0, 0]);
    },
    length: function(v) {
      return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    },
    normalize: function(v, out) {
      var len;

      len = vec.length(v);
      len = 1 / len;
      out[0] = v[0] * len;
      out[1] = v[1] * len;
      return out;
    },
    orthogonal: function(v, out) {
      out[0] = v[1];
      out[1] = -v[0];
      return out;
    },
    scale: function(a, rate, out) {
      out[0] = a[0] * rate;
      out[1] = a[1] * rate;
      return out;
    },
    add: function(a, b, out) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      return out;
    },
    subtract: function(a, b, out) {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      return out;
    },
    copy: function(a, out) {
      out[0] = a[0];
      out[1] = a[1];
      return out;
    }
  };

  this.faxy = (function($) {
    var calc, create_edge_data, fake_edge, get_edge_type, update_node, _this;

    calc = {
      v: vec.create(),
      arrow: function(to, a, n) {
        a[0] = to[0];
        a[1] = to[1];
        a[2] = a[0] - (10 * n[0]) + (4 * n[1]);
        a[3] = a[1] - (10 * n[1]) - (4 * n[0]);
        a[4] = a[2] - (8 * n[1]);
        a[5] = a[3] + (8 * n[0]);
        return a;
      },
      /**
      		 * Calculates edge parameters
      		 * @param  {[vec]} v1       ['from' vector]
      		 * @param  {[vec]} v2       ['to' vector]
      		 * @param  {[vec]} norm     [normal vector]
      		 * @param  {boolean} subtract [True if need to substractthe second node radius]
      		 * @return {null}          []
      */

      stright: function(v1, v2, norm, $, subtract) {
        if (subtract == null) {
          subtract = true;
        }
        vec.subtract(v2, v1, this.v);
        vec.normalize(this.v, norm);
        vec.scale(norm, r, this.v);
        vec.add(v1, this.v, v1);
        if (subtract) {
          vec.subtract(v2, this.v, v2);
        }
        this.arrow(v2, $.arrow, norm);
        return null;
      },
      curved: function(v1, v2, norm, cv, _arrow) {
        vec.subtract(v2, v1, this.v);
        vec.normalize(this.v, norm);
        cv[0] = (v1[0] + v2[0]) / 2 + norm[1] * 40;
        cv[1] = (v1[1] + v2[1]) / 2 - norm[0] * 40;
        vec.subtract(cv, v1, this.v);
        vec.normalize(this.v, this.v);
        vec.scale(this.v, r, this.v);
        vec.add(v1, this.v, v1);
        vec.subtract(v2, cv, this.v);
        vec.normalize(this.v, this.v);
        vec.scale(this.v, r, this.v);
        vec.subtract(v2, this.v, v2);
        vec.normalize(this.v, this.v);
        this.arrow(v2, _arrow, this.v);
        return null;
      },
      /**
      		 * Constants for calculating a loop
      */

      K: (function() {
        var k;

        k = {
          ANGLE_FROM: Math.PI / 3,
          ANGLE_TO: Math.PI / 12
        };
        k.DX1 = r * Math.cos(k.ANGLE_FROM);
        k.DY1 = r * Math.sin(k.ANGLE_FROM);
        k.DX2 = r * 4 * Math.cos(k.ANGLE_FROM);
        k.DY2 = r * 4 * Math.sin(k.ANGLE_FROM);
        k.DX3 = r * 4 * Math.cos(k.ANGLE_TO);
        k.DY3 = r * 4 * Math.sin(k.ANGLE_TO);
        k.DX4 = r * Math.cos(k.ANGLE_TO);
        k.DY4 = r * Math.sin(k.ANGLE_TO);
        k.NX = Math.cos(k.ANGLE_FROM - Math.PI / 24);
        k.NY = Math.sin(k.ANGLE_FROM - Math.PI / 24);
        return function(name) {
          return k[name];
        };
      })(),
      /**
      		 * Calculates coordinates for drawing a loop
      		 * @param  {[Number, Number]) v A node coordinates
      		 * @param  {Object) $ Object of faxy.create_edge_data()
      		 * @return {null}
      */

      loop: function(v, $) {
        $.norm[0] = -this.K('NX');
        $.norm[1] = this.K('NY');
        $.v1[0] = v[0] + this.K('DX1');
        $.v1[1] = v[1] - this.K('DY1');
        $.cv[0] = v[0] + this.K('DX2');
        $.cv[1] = v[1] - this.K('DY2');
        $.cv[2] = v[0] + this.K('DX3');
        $.cv[3] = v[1] - this.K('DY3');
        $.v2[0] = v[0] + this.K('DX4');
        $.v2[1] = v[1] - this.K('DY4');
        this.arrow($.v1, $.arrow, $.norm);
        return null;
      },
      start: function(v2, $) {
        vec.copy(v2, $.v2);
        vec.subtract(v2, [4 * r, 0], $.v1);
        this.stright($.v1, $.v2, $.norm, $);
        this.arrow($.v2, $.arrow, $.norm);
        return null;
      }
    };
    update_node = function(G, a) {
      var e, i, inout, ix, v1, v2;

      inout = $.edges.out(G, a).concat($.edges["in"](G, a));
      i = inout.length;
      while (i-- > 0) {
        ix = inout[i];
        v1 = G.edges.a[ix];
        v2 = G.edges.b[ix];
        e = G.edges.$[ix];
        vec.copy([G.nodes.x[v1], G.nodes.y[v1]], e.v1);
        vec.copy([G.nodes.x[v2], G.nodes.y[v2]], e.v2);
        switch (e.type) {
          case 0:
            calc.stright(e.v1, e.v2, e.norm, e);
            break;
          case 1:
            calc.curved(e.v1, e.v2, e.norm, e.cv, e.arrow);
            break;
          case 2:
            calc.loop([G.nodes.x[v2], G.nodes.y[v2]], e);
        }
      }
      if (a === G.start) {
        calc.start([G.nodes.x[a], G.nodes.y[a]], G.edges.start);
      }
      return null;
    };
    create_edge_data = function() {
      return {
        type: 0,
        v1: vec.create(),
        v2: vec.create(),
        cv: [vec.create(), vec.create()],
        norm: vec.create(),
        orth: vec.create(),
        arrow: [vec.create(), vec.create(), vec.create()]
      };
    };
    /**
    	 * Calculates geometric type of the edge
    	 * @param  {Graph} G
    	 * @param  {int} a Index of "from" node
    	 * @param  {int} b Index of "to" node
    	 * @param  {boolean} b2a True if exists an edge from b to a
    	 * @return {int}   (0-straight, 1-curved, 2-loop)
    */

    get_edge_type = function(a, b, b2a) {
      var ret;

      ret = 0;
      if (a === b) {
        ret = 2;
      } else {
        if (b2a) {
          ret = 1;
        }
      }
      return ret;
    };
    fake_edge = create_edge_data();
    _this = {
      create: function() {
        var G;

        G = $.create();
        _this.extend(G);
        return G;
      },
      extend: function(G) {
        G.nodes.x = [];
        G.nodes.y = [];
        G.edges.$ = [];
        G.edges.start = create_edge_data();
        console.log(G.nodes);
        return null;
      },
      nodes: Object.create($.nodes),
      edges: Object.create($.edges),
      get_fake_edge: function(G, a, b, x, y) {
        var e;

        e = fake_edge;
        e.type = get_edge_type(a, b, false);
        vec.copy([G.nodes.x[a], G.nodes.y[a]], e.v1);
        if (b < 0) {
          vec.copy([x, y], e.v2);
          calc.stright(e.v1, e.v2, e.norm, e, false);
        } else {
          if (e.type === 2) {
            calc.loop([G.nodes.x[a], G.nodes.y[a]], e);
          } else {
            vec.copy([G.nodes.x[b], G.nodes.y[b]], e.v2);
            calc.stright(e.v1, e.v2, e.norm, e, true);
          }
        }
        return e;
      }
    };
    _this.nodes.add = function(G, x, y) {
      var i;

      i = $.nodes.add(G);
      G.nodes.x[i] = x;
      G.nodes.y[i] = y;
      return i;
    };
    _this.nodes.move = function(G, i, x, y) {
      if (i < G.nodes.length && i > -1) {
        G.nodes.x[i] = x;
        G.nodes.y[i] = y;
        update_node(G, i);
      }
      return i;
    };
    _this.edges.add = function(G, a, b, args) {
      var i, j, type;

      if ($.edges.has(G, a, b) > -1) {
        return -1;
      }
      j = $.edges.has(G, b, a);
      i = $.edges.add(G, a, b, args);
      if (i >= 0) {
        G.edges.$[i] = create_edge_data();
        type = get_edge_type(a, b, j >= 0);
        G.edges.$[i].type = type;
        if (j >= 0) {
          G.edges.$[j].type = type;
        }
      }
      update_node(G, a);
      return i;
    };
    _this.edges.del = function(G, i) {
      var a, b, eix, ix;

      a = G.edges.a[i];
      b = G.edges.b[i];
      if ((ix = fa.edges.del(G, i)) >= 0) {
        if ((eix = fa.edges.has(G, b, a)) >= 0) {
          G.edges.$[eix].type = 0;
          update_node(G, a);
        }
      }
      return ix;
    };
    return _this;
  })(fa);

}).call(this);
