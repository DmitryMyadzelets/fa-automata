// JSLint options:
/*global editor, View, Graph, commands, wrap, after*/

var Instance = function (container) {

    this.view = new View(container);

    // Attach controller's handlers to the view
    this.view.controller().control_view();

    Instance.prototype.set_graph.call(this);
};


Instance.prototype.set_graph = function (graph) {
    // Create new graph
    this.graph = new Graph(graph);
    // Wrap graph methods with new methods which update the view
    wrap(this.graph, this.view);

    this.view.model = this.graph;
    this.view.graph(this.graph.object());
};


editor.Instance = Instance;
editor.Graph = Graph;
editor.commands = commands;

this.jas = this.jas || {};
this.jas.editor = editor;
this.jas.after = after;

}(window);