
ed.instance = function (container) {
	var o = {
		view : new View(container),
		set_graph : function (graph) {
			this.graph = Model.graph(graph);
			this.view.model = this.graph;
			this.graph.view = this.view;
			this.view.graph(this.graph.object());
		}
	};

	o.view.controller().control_view(); // Attaches controller's handlers to the view
	o.set_graph();

	return o;
};


ed.commands = commands;

this.jA = this.jA || {};
this.jA.editor = ed;
this.jA.model = Model;

}(window);