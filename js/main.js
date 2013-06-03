// Generated by CoffeeScript 1.6.2
/*
Read introduction for CoffeeScript:
http://arcturo.github.com/library/coffeescript/
Usefull links:
	http://www.graphdracula.net/
	https://github.com/mauriciosantos/buckets/
*/


(function() {
  'use strict';
  var automata, canvas, ctx, edit, ev_keypress, ev_keyup, ev_mousedown, ev_mousemove, ev_mouseup, from, get_mouse_xy, graph_is_changed, init, load_graph, nodeByXY, node_ix, ost, save_graph, st, tout, x, y;

  x = y = 0;

  ctx = null;

  canvas = null;

  this.graph = faxy.create();

  /*
  ===============================================================================
  */


  this.pack = function(x, y) {
    return ((x & 0xFFFF) << 16) | (y & 0xFFFF);
  };

  this.unpack = function(xy) {
    return [(xy >> 16) & 0xFFFF, xy & 0xFFFF];
  };

  /*
  ===============================================================================
  Loads nodes and edges from the local storage of the browser.
  Nodes must be stored as a value of key "nodes".
  Edges must be stored as a value of key "edges".
  Returns false is the storage is not available with "jstorage.js" library, or
  there are no keys; otherwise returns true.
  */


  load_graph = function(graph) {
    var parsed, _ref;

    if (!($ && $.jStorage && $.jStorage.storageAvailable() && JSON)) {
      return false;
    }
    parsed = (_ref = JSON.parse($.jStorage.get("graph"))) != null ? _ref : {};
    return graph.nodes.length > 0;
  };

  /*
  ===============================================================================
  */


  save_graph = function(graph) {
    if (!($ && $.jStorage && $.jStorage.storageAvailable())) {
      return false;
    }
    return $.jStorage.set("graph", JSON.stringify(graph));
  };

  /*
  ===============================================================================
  Checks if xy coodinates are over a node.
  	Returns index of a node in the nodes list, or -1.
  */


  edit = {
    dx: 0,
    dy: 0
  };

  nodeByXY = function(graph, x, y) {
    var index, _i, _len, _ref, _x, _y;

    _ref = graph.nodes.x;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      _x = _ref[index];
      /*	Get coordinates of each node and calculate distance to 
      			the point. If distance is less then radius of the node, then 
      			the point in over the node.
      */

      _y = graph.nodes.y[index];
      edit.dx = x - _x;
      edit.dy = y - _y;
      if ((edit.dx * edit.dx) + (edit.dy * edit.dy) < (r * r)) {
        return index;
      }
    }
    return -1;
  };

  /*
  ===============================================================================
  */


  st = ost = 0;

  node_ix = -1;

  graph_is_changed = false;

  from = {
    node_ix: 0,
    x: 0,
    y: 0
  };

  automata = function(eCode, ev) {
    var dx, dy, is_new_edge, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;

    switch (ost = st) {
      case 0:
        if (1 === eCode) {
          _ref = get_mouse_xy(ev), x = _ref[0], y = _ref[1];
          node_ix = nodeByXY(graph, x, y);
          if (node_ix >= 0) {
            if (!ev.shiftKey) {
              from.node_ix = node_ix;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              draw_automaton(ctx, graph);
              st = 2;
            } else {
              from.x = graph.nodes.x[node_ix];
              from.y = graph.nodes.y[node_ix];
              st = 1;
            }
          } else {
            if (ev.shiftKey) {
              from.x = x;
              from.y = y;
              st = 4;
            } else {
              from.x = x;
              from.y = y;
              st = 5;
            }
          }
        }
        break;
      case 1:
        switch (eCode) {
          case 2:
            _ref1 = get_mouse_xy(ev), x = _ref1[0], y = _ref1[1];
            if ((x -= edit.dx) < 0) {
              x = 0;
            }
            if ((y -= edit.dy) < 0) {
              y = 0;
            }
            editor.nodes.move(graph, node_ix, x, y);
            break;
          case 3:
            editor.nodes.move2(graph, node_ix, from.x, from.y, x, y);
            graph_is_changed = true;
            st = 0;
            break;
          default:
            graph.nodes.x[node_ix] = from.x;
            graph.nodes.y[node_ix] = from.y;
            st = 0;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_automaton(ctx, graph);
        break;
      case 2:
        switch (eCode) {
          case 2:
            _ref2 = get_mouse_xy(ev), x = _ref2[0], y = _ref2[1];
            node_ix = nodeByXY(graph, x, y);
            if (node_ix !== from.node_ix) {
              from.x = graph.nodes.x[from.node_ix];
              from.y = graph.nodes.y[from.node_ix];
              st = 3;
            }
            break;
          default:
            st = 0;
        }
        break;
      case 3:
        _ref3 = get_mouse_xy(ev), x = _ref3[0], y = _ref3[1];
        switch (eCode) {
          case 2:
            node_ix = nodeByXY(graph, x, y);
            is_new_edge = node_ix < 0;
            if (!is_new_edge) {
              x = graph.nodes.x[node_ix];
              y = graph.nodes.y[node_ix];
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_automaton(ctx, graph);
            if (node_ix === from.node_ix) {
              draw_loop(ctx, from.x, from.y);
            } else {
              draw_fake_edge(ctx, faxy.get_fake_edge(from.x, from.y, x, y, is_new_edge));
            }
            break;
          case 3:
            node_ix = nodeByXY(graph, x, y);
            if (node_ix < 0) {
              editor.commands.start_transaction();
              node_ix = editor.nodes.add(graph, x, y);
              editor.edges.add(graph, from.node_ix, node_ix);
              editor.commands.stop_transaction();
            } else {
              editor.edges.add(graph, from.node_ix, node_ix);
            }
            graph_is_changed = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_automaton(ctx, graph);
            st = 0;
            break;
          default:
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_automaton(ctx, graph);
            st = 0;
        }
        break;
      case 4:
        switch (eCode) {
          case 2:
            _ref4 = get_mouse_xy(ev), x = _ref4[0], y = _ref4[1];
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(x - from.x, y - from.y);
            draw_automaton(ctx, graph);
            ctx.restore();
            break;
          case 3:
            _ref5 = get_mouse_xy(ev), x = _ref5[0], y = _ref5[1];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_automaton(ctx, graph);
            graph_is_changed = true;
            st = 0;
            break;
          default:
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_automaton(ctx, graph);
            st = 0;
        }
        break;
      case 5:
        switch (eCode) {
          case 3:
            _ref6 = get_mouse_xy(ev), x = _ref6[0], y = _ref6[1];
            editor.nodes.add(graph, x, y);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_automaton(ctx, graph);
            graph_is_changed = true;
            st = 0;
            break;
          case 2:
            _ref7 = get_mouse_xy(ev), x = _ref7[0], y = _ref7[1];
            dx = x - from.x;
            dy = y - from.y;
            dx *= dx;
            dy *= dy;
            if ((dx > 4) || (dy > 4)) {
              st = 0;
            }
            break;
          default:
            st = 0;
        }
    }
    if (ost !== st) {
      console.log(eCode + ": " + ost + "->" + st);
      if (0 === st) {
        if (graph_is_changed) {
          save_graph(graph);
          graph_is_changed = false;
        }
      }
    }
    return null;
  };

  /*
  ===============================================================================
  */


  init = function() {
    var node1, node2;

    canvas = document.getElementById("myCanvas");
    canvas.focus();
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "gray";
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(0,0,255,0.5)";
    ctx.font = "12pt Tahoma";
    ctx.textAlign = "left";
    canvas.addEventListener('mousedown', ev_mousedown, false);
    canvas.addEventListener('mouseup', ev_mouseup, false);
    canvas.addEventListener('mousemove', ev_mousemove, false);
    canvas.addEventListener('keypress', ev_keypress, false);
    canvas.addEventListener('keyup', ev_keyup, false);
    canvas.addEventListener('dragstart', function(e) {
      return e.preventDefault();
    }, false);
    canvas.onselectstart = function() {
      return false;
    };
    if (!load_graph(graph)) {
      node1 = editor.nodes.add(graph, -50 + canvas.width / 2, canvas.height / 2);
      node2 = editor.nodes.add(graph, 50 + canvas.width / 2, canvas.height / 2);
      editor.edges.add(graph, node1, node2);
      editor.edges.add(graph, node2, node2);
    }
    draw_automaton(ctx, graph);
    return null;
  };

  get_mouse_xy = function(ev) {
    var rc;

    rc = canvas.getBoundingClientRect();
    return [ev.clientX - rc.left, ev.clientY - rc.top];
  };

  window.onload = function() {
    init();
    return null;
  };

  ev_mousedown = function(ev) {
    automata(1, ev);
    return null;
  };

  ev_mousemove = function(ev) {
    automata(2, ev);
    return null;
  };

  ev_mouseup = function(ev) {
    automata(3, ev);
    return null;
  };

  ev_keypress = function(ev) {
    if (ev.ctrlKey) {
      switch (ev.keyCode) {
        case 25:
          editor.redo();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          draw_automaton(ctx, graph);
          save_graph(graph);
          break;
        case 26:
          editor.undo();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          draw_automaton(ctx, graph);
          save_graph(graph);
      }
    }
    return null;
  };

  ev_keyup = function(ev) {
    switch (ev.keyCode) {
      case 46:
        editor.nodes.del(graph, graph.nodes.length - 1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_automaton(ctx, graph);
        save_graph(graph);
        break;
      case 81:
        editor.edges.del(graph, graph.edges.length - 1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_automaton(ctx, graph);
        break;
    }
    return null;
  };

  (tout = function() {
    console.log(".");
    return setTimeout(tout, 1000);
  })();

}).call(this);
