
editor.Instance = function (container) {
    this.view = new View(container);
    this.set_graph = function (graph) {
        // Create new graph
        this.graph = new Graph(graph);
        // Create wrapper to link the graph to the view
        wrap(this.graph, this.view);

        this.view.model = this.graph;
        this.view.graph(this.graph.object());
    };

    this.view.controller().control_view(); // Attaches controller's handlers to the view
    this.set_graph();
};


editor.commands = commands;
editor.Graph = Graph;

this.jas = this.jas || {};
this.jas.editor = editor;

}(window);