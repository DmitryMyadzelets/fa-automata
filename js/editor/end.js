// JSLint options:
/*global editor, View, Graph, Commands, wrap, after, Controller*/

    /**
     * Creates a new instance of editor
     * @memberOf editor
     * @class
     * @param {Object} [container] HTML DOM element. If not given, the document body is used as a container.
     * @example var editor = new jas.editor.Instance(document.getElementById('id_editor'));
     */
    var Instance = function (container) {
        /**
         * The view (in terms of MVC) of the editor
         * @type {View}
         */
        this.view = new View(container);
        this.commands = new Commands();
        /**
         * The controller (in terms of MVC) of the editor
         * @type {Controller}
         */
        this.controller = new Controller(this.view, this.commands);

        this.set_graph();
    };

    /**
     * Attaches a graph object literal to the editor
     * @param {object} graph object literal
     */
    Instance.prototype.set_graph = function (json_graph) {
        /**
         * The data model (in terms of MVC) of the editor
         * @type {Graph}
         */
        this.graph = new Graph(json_graph);
        this.commands.set_graph(this.graph);
        // Wrap graph methods with new methods which update the view
        wrap(this.graph, this.view);

        this.view.model = this.graph; // FIXIT: redundent
        this.view.graph(this.graph.object());
    };


    editor.Instance = Instance;
    editor.Graph = Graph;

    jas.after = after;


}(window));
