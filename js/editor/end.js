
editor.Instance = function (container) {
    this.view = new View(container);
    this.set_graph = function (graph) {
        // this.graph = Graph.graph(graph);
        this.graph = new Graph(graph);
        this.view.model = this.graph;
        this.graph.view = this.view;
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