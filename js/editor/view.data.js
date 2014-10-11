
// JSLint options:
/*global View*/
"use strict";

View.prototype.nodes = (function () {
    var view;
    var methods = {};
    var last = [];
    var data;

    function cache (d) {
    	if (d instanceof Array) {
    		last = d.slice(0);
    	} else {
    		last.lenth = 0;
    		last.push(d);
    	}
    }

    methods.add = function (d) {
        last.length = 0;
        cache(d);
        data.push(d);
        view.update();
        return methods;
    };

    function remove(d) {
        var i = data.indexOf(d);
        if (i >= 0) {
            data.splice(i, 1);
        }
    }

    methods.remove = function (d) {
    	cache(d);
        if (d instanceof Array) {
            d.forEach(function (d) { remove(d); });
        } else {
            remove(d);
        }
        view.update();
        return methods;
    };

    methods.select = function (d) {
        if (!arguments.length) {
            if (last.length) {
                view.select().node(last[0]);
            }
        } else if (!d) {
            view.select().nothing();
        } else {
            view.select().node(d);
        }
        return methods;
    };

    // Returns incominng and outgoing edges of last nodes
    methods.edges = function () {
    	var ret = [];
    	view.graph().edges.forEach(function (d) {
    		if (last.indexOf(d.source) >= 0 || last.indexOf(d.target) >= 0) {
    			if (ret.indexOf(d) < 0) {
    				ret.push(d);
    			}
    		}
    	});
    	return ret;
    }

    return function (d) {
        view = this;
        data = view.graph().nodes;
        if (arguments.length) {
        	cache(d);
        }
        return methods;
    }
}())



View.prototype.edges = (function () {
    var view;
    var methods = {};
    var last = [];
    var data;

    methods.add = function (d) {
        last.length = 0;
        last.push(d);
        data.push(d);
        view.update();
        return methods;
    };

    function remove(d) {
        var i = data.indexOf(d);
        if (i >= 0) {
            data.splice(i, 1);
        }
    }

    methods.remove = function (d) {
        if (d instanceof Array) {
            d.forEach(function (d) { remove(d); });
        } else {
            remove(d);
        }
        view.update();
        return methods;
    };

    methods.select = function (d) {
        if (!arguments.length) {
            if (last.length) {
                view.select().edge(last[0]);
            }
        } else if (!d) {
            view.select().nothing();
        } else {
            view.select().edge(d);
        }
        return methods;
    };

    return function (d) {
        view = this;
        data = view.graph().edges;
        if (arguments.length) {
        	cache(d);
        }
        return methods;
    }
}())