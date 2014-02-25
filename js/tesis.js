// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var bind_module, draw, find_common_events, force, get_event_by_labels, height, is_linked, label, link, linkCurve, node, node_radius, set_transitions, show_bfs, show_dfs, show_events, show_modules, show_modules_transitions, show_states, show_transitions, svg, vec, width,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

  show_bfs = function(m) {
    console.log('Breadth-First Search of module', m.name);
    DES.BFS(m, function(q, e, p) {
      console.log(q, DES.E.labels.get(e), p);
    });
  };

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

  find_common_events = function(m1, m2) {
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
  };

  (function() {
    var E, e, events, i, key, _i, _len;

    events = [
      {
        labels: 'do_hi',
        observable: true
      }, {
        labels: 'do_lo',
        observable: true
      }, {
        labels: 'r_hi'
      }, {
        labels: 'r_lo'
      }, {
        labels: 'r_f0',
        fault: true
      }
    ];
    E = DES.E;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      e = events[_i];
      i = E.add();
      for (key in e) {
        E[key].set(i, e[key]);
      }
    }
    set_transitions(DES.add_module('DO'), [[0, 'do_hi', 1], [0, 'do_lo', 0], [1, 'do_hi', 1], [1, 'do_lo', 0]]);
    set_transitions(DES.add_module('Relay'), [[0, 'r_hi', 1], [0, 'r_lo', 0], [1, 'r_hi', 1], [1, 'r_lo', 0], [0, 'r_f0', 2], [1, 'r_f0', 2]]);
    return set_transitions(DES.add_module('DO2Relay'), [[0, 'r_lo', 0], [0, 'do_lo', 0], [0, 'do_hi', 2], [2, 'r_hi', 1], [1, 'r_hi', 1], [1, 'do_hi', 1], [1, 'do_lo', 3], [3, 'r_lo', 0]]);
  })();

  show_events();

  (function() {
    var m1, m1_2, m1_2_3, m2, m3, sync;

    sync = function(m1, m2) {
      var common;

      common = find_common_events(m1, m2);
      return DES.sync(m1, m2, common);
    };
    m1 = DES.modules[0];
    m2 = DES.modules[1];
    m3 = DES.modules[2];
    m1_2 = sync(m1, m2);
    m1_2_3 = sync(m1_2, m3);
    return DES.modules.push(m1_2_3);
  })();

  this.graph = {
    'nodes': [],
    'links': []
  };

  is_linked = function(q, p) {
    var link, _i, _len, _ref;

    _ref = graph.links;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      link = _ref[_i];
      if ((link.source === q) && (link.target === p)) {
        return link;
      }
    }
    return null;
  };

  bind_module = function(m) {
    var i, node;

    graph.nodes.length = 0;
    graph.links.length = 0;
    i = m.X.size();
    while (i-- > 0) {
      node = {
        name: i
      };
      if (i === m.X.start) {
        node.start = true;
      }
      graph.nodes.push(node);
    }
    DES.BFS(m, function(q, e, p) {
      var link;

      link = is_linked(q, p);
      if (link != null) {
        return link.label += ', ' + DES.E.labels.get(e);
      } else {
        link = {
          source: q,
          target: p,
          label: DES.E.labels.get(e)
        };
        if (q === p) {
          link.loop = true;
        }
        return graph.links.push(link);
      }
    });
  };

  bind_module(DES.modules[DES.modules.length - 1]);

  width = 600;

  height = 500;

  node_radius = 16;

  svg = d3.select('body').append('svg').attr('width', width).attr('height', height);

  svg.append("defs").selectAll("marker").data(["arrow"]).enter().append("marker").attr("id", function(d) {
    return d;
  }).attr("viewBox", "-10 -5 10 10").attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M-10,-5L0,0L-10,5 Z").attr('fill', 'context-stroke');

  force = d3.layout.force().charge(-400).gravity(.02).linkDistance(function(d) {
    if (d.loop != null) {
      return 0;
    } else {
      return 100;
    }
  }).linkStrength(function(d) {
    if (d.loop != null) {
      return 0;
    } else {
      return 1;
    }
  }).size([width, height]).nodes(graph.nodes).links(graph.links).start();

  link = svg.selectAll('.link').data(graph.links).enter().append('path').attr("marker-end", function(d) {
    return "url(#arrow)";
  });

  label = svg.selectAll('.label').data(graph.links).enter().append('g').append('text').text(function(d) {
    return d.label;
  });

  node = svg.selectAll('.node').data(graph.nodes).enter().append('g').attr('class', 'node').call(force.drag);

  node.append('circle').attr('r', node_radius);

  node.append('text').attr('dy', '0.35em').text(function(d) {
    return d.name;
  });

  node.filter(function(d) {
    return d.start != null;
  }).append('path').attr('d', 'M' + -2.5 * node_radius + ',0L' + -node_radius + ',0').attr('marker-end', function(d) {
    return "url(#arrow)";
  });

  force.on('tick', function() {
    link.attr('d', linkCurve);
    node.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
    label.attr('transform', function(d) {
      if (d.cv != null) {
        return 'translate(' + d.cv[0] + ',' + d.cv[1] + ')';
      }
    });
  });

  vec = {
    create: function() {
      return new Array([0, 0]);
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

  draw = {
    /**
     * Constants for calculating a loop
    */

    K: (function() {
      var k, r;

      k = {
        ANGLE_FROM: Math.PI / 3,
        ANGLE_TO: Math.PI / 12
      };
      r = node_radius;
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
      return null;
    },
    curved: function(v1, v2, norm, cv) {
      var r, v;

      v = [0, 0];
      r = node_radius;
      vec.subtract(v2, v1, v);
      vec.normalize(v, norm);
      cv[0] = (v1[0] + v2[0]) / 2 + norm[1] * 30;
      cv[1] = (v1[1] + v2[1]) / 2 - norm[0] * 30;
      vec.subtract(cv, v1, v);
      vec.normalize(v, v);
      vec.scale(v, r, v);
      vec.add(v1, v, v1);
      vec.subtract(v2, cv, v);
      vec.normalize(v, v);
      vec.scale(v, r, v);
      vec.subtract(v2, v, v2);
    }
  };

  linkCurve = function(d) {
    var $, norm, v1, v2;

    v1 = [d.source.x, d.source.y];
    v2 = [d.target.x, d.target.y];
    norm = [0, 0];
    if (d.cv == null) {
      d.cv = [0, 0];
    }
    if (d.loop != null) {
      $ = {
        v1: [],
        v2: [],
        cv: [],
        norm: []
      };
      draw.loop([d.source.x, d.source.y], $);
      d.cv[0] = ($.cv[0] + $.cv[2]) / 2;
      d.cv[1] = ($.cv[1] + $.cv[3]) / 2;
      return 'M' + $.v1[0] + ',' + $.v1[1] + 'C' + $.cv[0] + ',' + $.cv[1] + ' ' + $.cv[2] + ',' + $.cv[3] + ' ' + $.v2[0] + ',' + $.v2[1];
    } else {
      draw.curved(v1, v2, norm, d.cv);
      return 'M' + v1[0] + ',' + v1[1] + 'Q' + d.cv[0] + ',' + d.cv[1] + ' ' + v2[0] + ',' + v2[1];
    }
  };

}).call(this);
