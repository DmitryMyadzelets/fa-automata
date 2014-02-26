// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var force, friction, getLinkCurve, graph, height, is_linked, link_charge, link_charge_distance, link_distance, link_gravity, makeLink, node_radius, svg, svg_container_id, update_SVG, update_svg_size, vec, width;

  width = 600;

  height = 500;

  node_radius = 16;

  link_charge = -2000;

  link_charge_distance = 500;

  link_distance = 100;

  link_gravity = 0.05;

  friction = 0.9;

  svg_container_id = 'svg_container';

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

  makeLink = {
    v: [0, 0],
    r: node_radius,
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
      var v;

      v = [0, 0];
      vec.subtract(v2, v1, v);
      vec.normalize(v, norm);
      cv[0] = (v1[0] + v2[0]) / 2 + norm[1] * 30;
      cv[1] = (v1[1] + v2[1]) / 2 - norm[0] * 30;
      vec.subtract(cv, v1, v);
      vec.normalize(v, v);
      vec.scale(v, this.r, v);
      vec.add(v1, v, v1);
      vec.subtract(v2, cv, v);
      vec.normalize(v, v);
      vec.scale(v, this.r, v);
      vec.subtract(v2, v, v2);
    },
    stright: function(v1, v2, norm, cv, subtract) {
      if (subtract == null) {
        subtract = true;
      }
      vec.subtract(v2, v1, this.v);
      vec.normalize(this.v, norm);
      vec.scale(norm, this.r, this.v);
      vec.add(v1, this.v, v1);
      if (subtract) {
        vec.subtract(v2, this.v, v2);
      }
      cv[0] = (v1[0] + v2[0]) / 2;
      cv[1] = (v1[1] + v2[1]) / 2;
    }
  };

  graph = {
    'nodes': [],
    'links': []
  };

  is_linked = function(q, p, ptype) {
    var check_type, link, _i, _len, _ref;

    check_type = q ^ p;
    _ref = graph.links;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      link = _ref[_i];
      if (check_type) {
        if ((link.source === p) && (link.target === q)) {
          link.type = 2;
          ptype[0] = 2;
        }
      }
      if ((link.source === q) && (link.target === p)) {
        return link;
      }
    }
    return null;
  };

  getLinkCurve = function(d) {
    var $, norm, v1, v2;

    v1 = [d.source.x, d.source.y];
    v2 = [d.target.x, d.target.y];
    norm = [0, 0];
    if (d.cv == null) {
      d.cv = [0, 0];
    }
    if (d.type != null) {
      if (d.type === 1) {
        $ = {
          v1: [],
          v2: [],
          cv: [],
          norm: []
        };
        makeLink.loop([d.source.x, d.source.y], $);
        d.cv[0] = ($.cv[0] + $.cv[2]) / 2;
        d.cv[1] = ($.cv[1] + $.cv[3]) / 2;
        return 'M' + $.v1[0] + ',' + $.v1[1] + 'C' + $.cv[0] + ',' + $.cv[1] + ' ' + $.cv[2] + ',' + $.cv[3] + ' ' + $.v2[0] + ',' + $.v2[1];
      } else if (d.type === 0) {
        makeLink.stright(v1, v2, norm, d.cv);
        return 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1];
      }
    }
    makeLink.curved(v1, v2, norm, d.cv);
    return 'M' + v1[0] + ',' + v1[1] + 'Q' + d.cv[0] + ',' + d.cv[1] + ' ' + v2[0] + ',' + v2[1];
  };

  svg = d3.select('#' + svg_container_id).append('svg').attr('width', '100%').attr('height', '100%');

  svg.append("defs").selectAll("marker").data(["arrow"]).enter().append("marker").attr("id", function(d) {
    return d;
  }).attr("viewBox", "-12 -5 12 10").attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M-10,-5L0,0L-10,5 Z").attr('fill', 'context-stroke');

  force = d3.layout.force();

  update_SVG = function() {
    var label, link, node;

    update_svg_size();
    force.charge(link_charge).chargeDistance(link_charge_distance).gravity(link_gravity).friction(friction).linkDistance(function(d) {
      if (d.loop != null) {
        return 0;
      } else {
        return link_distance;
      }
    }).linkStrength(function(d) {
      if (d.loop != null) {
        return 0;
      } else {
        return 1;
      }
    }).size([width, height]).nodes(graph.nodes).links(graph.links).start();
    force.on('tick', function() {
      link.attr('d', getLinkCurve);
      node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
      label.attr('transform', function(d) {
        if (d.cv != null) {
          return 'translate(' + d.cv[0] + ',' + d.cv[1] + ')';
        }
      });
    });
    link = svg.selectAll('.link').data(graph.links).enter().append('path').attr("marker-end", function(d) {
      return "url(#arrow)";
    });
    label = svg.selectAll('.label').data(graph.links).enter().append('g').append('text').attr('class', 'label').text(function(d) {
      return d.label;
    });
    node = svg.selectAll('.node').data(graph.nodes).enter().append('g').attr('class', 'node').call(force.drag);
    node.append('circle').attr('r', node_radius);
    node.filter(function(d) {
      return d.marked != null;
    }).append('circle').attr('class', 'marked').attr('r', node_radius - 2);
    node.append('text').attr('dy', '0.35em').text(function(d) {
      return d.name;
    });
    return node.filter(function(d) {
      return d.start != null;
    }).append('path').attr('d', 'M' + -2.5 * node_radius + ',0L' + -node_radius + ',0').attr('marker-end', function(d) {
      return "url(#arrow)";
    });
  };

  this.UI = {
    show_module: function(m) {
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
        if (m.X.marked.get(i)) {
          node.marked = true;
        }
        graph.nodes.push(node);
      }
      DES.BFS(m, function(q, e, p) {
        var link, type;

        type = q === p ? 1 : 0;
        link = is_linked(q, p, [type]);
        if (link != null) {
          return link.label += ', ' + DES.E.labels.get(e);
        } else {
          link = {
            source: q,
            target: p,
            label: DES.E.labels.get(e),
            type: type
          };
          return graph.links.push(link);
        }
      });
      update_SVG();
    }
  };

  update_svg_size = function() {
    var div;

    div = document.getElementById(svg_container_id);
    width = div.offsetWidth;
    height = div.offsetHeight;
  };

  window.onload = function() {};

  window.onresize = function() {
    update_svg_size();
    svg.attr('width', width).attr('height', height);
    force.size([width, height]).resume();
  };

}).call(this);
