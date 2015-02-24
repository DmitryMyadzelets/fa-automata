// JSLint options:
/*global editor, View, Graph, Commands, wrap, after, Controller*/


var Instance = function (container) {
    this.view = new View(container);
    this.commands = new Commands();
    this.controller = new Controller(this.view, this.commands);

    Instance.prototype.set_graph.call(this);
};


Instance.prototype.set_graph = function (graph) {
    // Create new graph
    this.graph = new Graph(graph);
    this.commands.set_graph(this.graph);
    // Wrap graph methods with new methods which update the view
    wrap(this.graph, this.view);

    this.view.model = graph;
    this.view.graph(this.graph.object());
};


editor.Instance = Instance;
editor.Graph = Graph;

this.jas = this.jas || {};
this.jas.editor = editor;
this.jas.after = after;

}(window);
