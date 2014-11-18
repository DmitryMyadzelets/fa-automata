
ed.instance = function (container) {
	var o = {};
	o.graph = Model.graph();
	o.view = new View(container, o.graph.object());
	o.view.model = o.graph;
	o.graph.view = o.view;
	o.view.controller().control_view();
	return o;
};


this.jA = this.jA || {};
this.jA.editor = ed;
this.jA.model = Model;

}(window);