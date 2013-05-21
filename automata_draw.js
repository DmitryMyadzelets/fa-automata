// Generated by CoffeeScript 1.6.2
/*
The functions here assume that there are global variables:
	array of automations "automata",
	array of graphics "graphics",
	radius of states "r",
	half radian "PI2".
*/


(function() {
  'use strict';
  var PI2, angle_from, angle_to, cl_black, cl_edge, cl_node, cl_node_edge, cl_node_sel, cl_text, draw_markedState, loop_k;

  this.r = 16;

  PI2 = Math.PI * 2;

  cl_black = "rgba(0,0,0, 0.8)";

  cl_node = "#fec867";

  cl_text = cl_black;

  cl_edge = cl_black;

  cl_node_edge = cl_black;

  cl_node_sel = "#da5d00";

  /*
  ===============================================================================
  */


  this.draw_state = function(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI2, true);
    ctx.fill();
    ctx.stroke();
    return null;
  };

  /*
  ===============================================================================
  */


  draw_markedState = function(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,255,0.2)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI2, true);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, PI2, true);
    ctx.stroke();
    ctx.restore();
    return null;
  };

  /*
  ===============================================================================
  The functions draws stright directed edge from coordinates (x1, y1) to (x2, y2).
  */


  this.draw_edge = function(ctx, x1, y1, x2, y2, fake_edge) {
    var dl, dx, dy, nx, ny, ox, oy, x3, x4, y3, y4;

    if (fake_edge == null) {
      fake_edge = false;
    }
    dx = x2 - x1;
    dy = y2 - y1;
    dl = Math.sqrt(dx * dx + dy * dy);
    if (dl === 0) {
      return;
    }
    nx = dx / dl;
    ny = dy / dl;
    ox = ny;
    oy = -nx;
    x1 = x1 + r * nx;
    y1 = y1 + r * ny;
    if (fake_edge === false) {
      x2 = x2 - r * nx;
      y2 = y2 - r * ny;
    }
    x3 = x2 - (10 * nx) + (4 * ox);
    y3 = y2 - (10 * ny) + (4 * oy);
    x4 = x3 - (8 * ox);
    y4 = y3 - (8 * oy);
    ctx.save();
    ctx.fillStyle = cl_edge;
    ctx.strokeStyle = cl_edge;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    return null;
  };

  /*
  ===============================================================================
  The functions draws curved directed edge from (x1, y1) to (x2, y2).
  */


  this.draw_cured_edge = function(ctx, x1, y1, x2, y2, fake_edge) {
    var cx, cy, dl, dx, dy, nx, ny, ox, oy, x3, x4, y3, y4;

    if (fake_edge == null) {
      fake_edge = false;
    }
    dx = x2 - x1;
    dy = y2 - y1;
    dl = Math.sqrt(dx * dx + dy * dy);
    if (dl === 0) {
      return;
    }
    nx = dx / dl;
    ny = dy / dl;
    ox = ny;
    oy = -nx;
    cx = (x1 + x2) / 2 + ox * dl / 6;
    cy = (y1 + y2) / 2 + oy * dl / 6;
    dx = cx - x1;
    dy = cy - y1;
    dl = Math.sqrt(dx * dx + dy * dy);
    nx = dx / dl;
    ny = dy / dl;
    x1 = x1 + r * nx;
    y1 = y1 + r * ny;
    if (fake_edge === false) {
      dx = x2 - cx;
      dy = y2 - cy;
      nx = dx / dl;
      ny = dy / dl;
      ox = ny;
      oy = -nx;
      x2 = x2 - r * nx;
      y2 = y2 - r * ny;
    }
    x3 = x2 - (10 * nx) + (4 * ox);
    y3 = y2 - (10 * ny) + (4 * oy);
    x4 = x3 - (8 * ox);
    y4 = y3 - (8 * oy);
    ctx.save();
    ctx.fillStyle = cl_edge;
    ctx.strokeStyle = cl_edge;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    return null;
  };

  /*
  ===============================================================================
  */


  angle_from = Math.PI / 3;

  angle_to = Math.PI / 12;

  loop_k = {
    dx1: r * Math.cos(angle_from),
    dy1: r * Math.sin(angle_from),
    dx2: r * 4 * Math.cos(angle_from),
    dy2: r * 4 * Math.sin(angle_from),
    dx3: r * 4 * Math.cos(angle_to),
    dy3: r * 4 * Math.sin(angle_to),
    dx4: r * Math.cos(angle_to),
    dy4: r * Math.sin(angle_to),
    nx: Math.cos(angle_from - Math.PI / 24),
    ny: Math.sin(angle_from - Math.PI / 24)
  };

  /*
  ===============================================================================
  */


  this.draw_loop = function(ctx, x, y) {
    var k, nx, ny, ox, oy, x1, x2, x3, x4, x5, x6, y1, y2, y3, y4, y5, y6;

    nx = -loop_k.nx;
    ny = loop_k.ny;
    ox = ny;
    oy = -nx;
    x1 = x + loop_k.dx1;
    y1 = y - loop_k.dy1;
    k = 4 * r;
    x2 = x + loop_k.dx2;
    y2 = y - loop_k.dy2;
    x3 = x + loop_k.dx3;
    y3 = y - loop_k.dy3;
    x4 = x + loop_k.dx4;
    y4 = y - loop_k.dy4;
    x5 = x1 - (10 * nx) + (4 * ox);
    y5 = y1 - (10 * ny) + (4 * oy);
    x6 = x5 - (8 * ox);
    y6 = y5 - (8 * oy);
    ctx.save();
    ctx.fillStyle = cl_edge;
    ctx.strokeStyle = cl_edge;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x5, y5);
    ctx.lineTo(x6, y6);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    return null;
  };

  /*
  ===============================================================================
  */


  /*
  ===============================================================================
  */


  /*
  ===============================================================================
  */


  this.draw_graph = function(ctx, graph) {
    var dy, edge, index, text, v1, v2, x, x1, x2, y, y1, y2, _i, _j, _len, _len1, _ref, _ref1, _ref2;

    ctx.save();
    ctx.textAlign = "center";
    ctx.strokeStyle = cl_node_edge;
    dy = 12 / 2;
    _ref = graph.nodes.x;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      x = _ref[index];
      y = graph.nodes.y[index];
      ctx.fillStyle = cl_node;
      draw_state(ctx, x, y);
      text = index.toString();
      ctx.fillStyle = cl_text;
      ctx.fillText(text, x, y + dy);
    }
    _ref1 = graph.edges;
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      edge = _ref1[index];
      _ref2 = unpack(edge), v1 = _ref2[0], v2 = _ref2[1];
      x1 = graph.nodes.x[v1];
      y1 = graph.nodes.y[v1];
      x2 = graph.nodes.x[v2];
      y2 = graph.nodes.y[v2];
      if (v1 !== v2) {
        if (graph.curved[index]) {
          draw_cured_edge(ctx, x1, y1, x2, y2);
        } else {
          draw_edge(ctx, x1, y1, x2, y2);
        }
      } else {
        draw_loop(ctx, x1, y1);
      }
    }
    ctx.restore();
    return null;
  };

  /*
  ===============================================================================
  */


  this.draw_selected = function(ctx, graph, selected) {
    var dy, node, text, x, y, _i, _len, _ref, _ref1;

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,255,0.2)";
    dy = 12 / 2;
    _ref = selected.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _ref1 = unpack(graph.nodes[node]), x = _ref1[0], y = _ref1[1];
      draw_state(ctx, x, y);
      text = node.toString();
      ctx.fillText(text, x, y + dy);
    }
    ctx.restore();
    return null;
  };

  this.draw_new = function(ctx, G) {
    var dy, index, text, x, y, _i, _len, _ref;

    ctx.save();
    ctx.textAlign = "center";
    ctx.strokeStyle = cl_node_edge;
    dy = 12 / 2;
    _ref = graph.nodes.x;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      x = _ref[index];
      y = graph.nodes.y[index];
      ctx.fillStyle = cl_node;
      draw_state(ctx, x, y);
      text = index.toString();
      ctx.fillStyle = cl_text;
      ctx.fillText(text, x, y + dy);
    }
    ctx.restore();
    return null;
  };

}).call(this);