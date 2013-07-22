// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var PI2, cl_black, cl_edge, cl_node, cl_node_edge, cl_node_sel, cl_text, empty_string;

  this.r = 16;

  PI2 = Math.PI * 2;

  cl_black = 'rgba(0,0,0, 0.8)';

  cl_node = '#fec867';

  cl_text = cl_black;

  cl_edge = cl_black;

  cl_node_edge = cl_black;

  cl_node_sel = '#da5d00';

  empty_string = '\u03b5';

  /*
  ===============================================================================
  */


  /**
   * A wrapper (Module pattern) for drawing methods
   * @return {Object}
  */


  this.draw = (function() {
    var _this;

    _this = {
      /**
      		 * Draws a state of the automaton
      		 * @param  {canvas} ctx
      		 * @param  {Number} x
      		 * @param  {Number} y
      		 * @return {null}
      */

      state: function(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, PI2, true);
        ctx.fill();
        ctx.stroke();
        return null;
      },
      /**
      		 * Draws marked state
      		 * @param  {canvas} ctx
      		 * @param  {Number} x
      		 * @param  {Number} y
      		 * @return {null}
      */

      marked: function(ctx, x, y) {
        draw_state(ctx, x, y);
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, PI2, true);
        ctx.stroke();
        return null;
      },
      /**
      		 * Draws a line (edge) from vector v1 to vector v2
      		 * @param  {canvas} ctx
      		 * @param  {[Number, Number]} v1 Coordinates [x, y]
      		 * @param  {[Number, Number]} v2 Coordinates [x, y]
      		 * @return {null}
      */

      edge: function(ctx, v1, v2) {
        ctx.beginPath();
        ctx.moveTo(v1[0], v1[1]);
        ctx.lineTo(v2[0], v2[1]);
        ctx.stroke();
        return null;
      },
      /**
      		 * Draws a quadratic curve line from vector v1 to vector v2
      		 * @param  {canvas} ctx
      		 * @param  {[Number, Number]} v1 Coordinates
      		 * @param  {[Number, Number]} v2 Coordinates
      		 * @param  {[Number, Number]} cv Control vector
      		 * @return {null}
      */

      curved: function(ctx, v1, v2, cv) {
        ctx.beginPath();
        ctx.moveTo(v1[0], v1[1]);
        ctx.quadraticCurveTo(cv[0], cv[1], v2[0], v2[1]);
        ctx.stroke();
        return null;
      },
      /**
      		 * Draws an arrow
      		 * @param  {canvas} ctx
      		 * @param  {Number[6]} v Array of 3 vectors
      		 * @return {null}
      */

      arrow: function(ctx, v) {
        ctx.beginPath();
        ctx.lineTo(v[0], v[1]);
        ctx.lineTo(v[2], v[3]);
        ctx.lineTo(v[4], v[5]);
        ctx.stroke();
        ctx.fill();
        return null;
      },
      /**
      		 * Draws a loop edge
      		 * @param  {canvas} ctx
      		 * @param  {Number} x Coordinate of the node
      		 * @param  {Number} y Coordinate of the node
      		 * @return {null}
      */

      loop: function(ctx, v1, v2, cv) {
        ctx.beginPath();
        ctx.moveTo(v1[0], v1[1]);
        ctx.bezierCurveTo(cv[0], cv[1], cv[2], cv[3], v2[0], v2[1]);
        ctx.stroke();
        return null;
      },
      /**
      		 * The above functions are structure-independent.
      		 * The below functions are dependent on the automaton structure
      		 * described in the 'faxy.coffee' file
      */

      /**
      		 * Draws an edge
      		 * @param  {canvas} ctx
      		 * @param  {Object} o Parameters of the edge
      		 * @return {null}
      */

      any_edge: function(ctx, o) {
        switch (o.type) {
          case 0:
            _this.edge(ctx, o.v1, o.v2);
            _this.arrow(ctx, o.arrow);
            break;
          case 1:
            _this.curved(ctx, o.v1, o.v2, o.cv);
            _this.arrow(ctx, o.arrow);
            break;
          case 2:
            _this.loop(ctx, o.v1, o.v2, o.cv);
            _this.arrow(ctx, o.arrow);
        }
        return null;
      },
      /**
      		 * Draws a fake edge
      		 * @param  {canvas} ctx
      		 * @param  {Object} o Parameters of the edge
      		 * @return {null}
      */

      fake_edge: function(ctx, o) {
        ctx.save();
        ctx.fillStyle = cl_edge;
        ctx.strokeStyle = cl_edge;
        _this.any_edge(ctx, o);
        ctx.restore();
        return null;
      },
      /**
      		 * Draws automaton graph on canvas
      		 * @param  {canvas} ctx
      		 * @param  {faxy} G Automaton structure
      		 * @return {null}
      */

      automaton: function(ctx, G) {
        var $, event, ix, text, vals, x, y, _i, _len, _ref;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = cl_black;
        ctx.fillStyle = cl_edge;
        ctx.strokeStyle = cl_edge;
        text = '';
        _this.fake_edge(ctx, G.edges.start);
        ix = G.edges.length;
        while (ix-- > 0) {
          $ = G.edges.$[ix];
          _this.any_edge(ctx, $);
          if (G.edges.events[ix] != null) {
            vals = [];
            _ref = G.edges.events[ix];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              event = _ref[_i];
              vals.push(G.events[event]);
            }
            text = vals.join(', ');
          } else {
            text = empty_string;
          }
          ctx.save();
          ctx.strokeStyle = 'gray';
          ctx.lineWidth = 4;
          ctx.strokeText(text, $.label[0][0], $.label[0][1]);
          ctx.fillText(text, $.label[0][0], $.label[0][1]);
          ctx.restore();
        }
        ix = G.nodes.length;
        while (ix-- > 0) {
          x = G.nodes.x[ix];
          y = G.nodes.y[ix];
          ctx.fillStyle = cl_node;
          _this.state(ctx, x, y);
          text = ix.toString();
          ctx.fillStyle = cl_text;
          ctx.fillText(text, x, y);
        }
        ctx.restore();
        return null;
      }
    };
    return _this;
  })();

  /*
  ===============================================================================
  */


}).call(this);
