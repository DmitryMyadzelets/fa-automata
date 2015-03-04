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
         * The model (in terms of MVC) of the editor
         * @type {Graph}
         */
        this.graph = new Graph();
        /**
         * The view (in terms of MVC) of the editor
         * @type {View}
         */
        this.view = new View(container);
        // Wrap graph methods with new methods which update the view
        wrap(this.graph, this.view);
        this.view.model = this.graph; // FIXIT: redundant
        /**
         * Commands for undo\redo behaviour
         * @type {Commands}
         */
        this.commands = new Commands(this.graph);
        /**
         * The controller (in terms of MVC) of the editor
         * @type {Controller}
         */
        this.controller = new Controller(this.view, this.commands);

        function update() {
            this.commands.clear_history();
            this.view.graph(this.graph.object());
        }
        update.call(this);

        // Set callback, s.t. update view and commands when a new graph is set
        after(this.graph, 'json', update.bind(this));
    };

    editor.Instance = Instance;
    editor.Graph = Graph;

    jas.after = after;


}(window));
