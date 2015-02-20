
// JSLint options:
/*global */
"use strict";



var Commands = (function () {

    var Command = function (redo, undo) {
        if (redo) { this.redo = redo; }
        if (undo) { this.undo = undo; }
    };

    function dummy() { return; }

    Command.prototype.redo = dummy;
    Command.prototype.undo = dummy;


    function prototype_methods() {

        // Starts new macro recording
        this.start = function () {
            if (this.index < this.stack.length) { this.stack.length = this.index; }
            this.macro = [];
            this.stack.push(this.macro);
            this.index = this.stack.length;
            return this;
        };

        this.undo = function () {
            if (this.index > 0) {
                var macro = this.stack[--this.index];
                var i = macro.length;
                while (i-- > 0) {
                    macro[i].undo();
                }
                this.update();
            }
        };

        this.redo = function () {
            if (this.index < this.stack.length) {
                var macro = this.stack[this.index++];
                var i, n = macro.length;
                for (i = 0; i < n; i++) {
                    macro[i].redo();
                }
                this.update();
            }
        };

        // Makes a copy of each item in arguments if it is an array
        function copy_arguments(args) {
            var i = args.length;
            while (i--) {
                if (args[i] instanceof Array) {
                    args[i] = args[i].slice(0);
                }
            }
        }

        // Creates new command-function as the key of a 'Command' instance
        this.new = function (name, fun) {
            if (this[name] && console) {
                console.error('Command', name, 'already exists');
                return;
            }
            var self = this;
            if (name && typeof fun === 'function') {
                this[name] = function () {
                    var command = new Command();
                    copy_arguments(arguments);
                    fun.apply(command, arguments);
                    self.macro.push(command);
                    command.redo();
                    this.update();
                    return self;
                };
            }
        };

        this.clean = function () {
            this.stack.length = 0;
            this.macro.length = 0;
        };
    }


    var instance = function () {
        this.stack = [];
        this.macro = [];
        // Index is equal to a number of commands which the user can undo;
        // If index is not equal to the length of stack, it implies
        // that user did "undo". Then new command cancels all the
        // values in stack above the index.
        this.index = 0;
        this.update = dummy;
    };

    prototype_methods.call(instance.prototype);
    return instance;

}());



var commands = new Commands();


commands.new('add_node', function (graph, d) {
    this.redo = function () { graph.node.add(d); };
    this.undo = function () { graph.node.remove(d); };
});


commands.new('del_node', function (graph, d) {
    this.redo = function () { graph.node.remove(d); };
    this.undo = function () { graph.node.add(d); };
});


commands.new('add_edge', function (graph, d) {
    this.redo = function () { graph.edge.add(d); };
    this.undo = function () { graph.edge.remove(d); };
});


commands.new('del_edge', function (graph, d) {
    this.redo = function () { graph.edge.remove(d); };
    this.undo = function () { graph.edge.add(d); };
});


commands.new('node_text', function (graph, d, text) {
    var old_text = d.text;
    this.redo = function () { graph.node.text(d, text); };
    this.undo = function () { graph.node.text(d, old_text); };
});

commands.new('edge_text', function (graph, d, text) {
    var old_text = d.text;
    this.redo = function () { graph.edge.text(d, text); };
    this.undo = function () { graph.edge.text(d, old_text); };
});

commands.new('move_node', function (graph, d, from, to) {
    this.redo = function () { graph.node.move(d, to); };
    this.undo = function () { graph.node.move(d, from); };
});

commands.new('mark_node', function (graph, d) {
    this.redo = function () { graph.node.mark(d); };
    this.undo = function () { graph.node.unmark(d); };
});

commands.new('unmark_node', function (graph, d) {
    this.redo = function () { graph.node.unmark(d); };
    this.undo = function () { graph.node.mark(d); };
});

commands.new('initial', function (graph, from, to) {
    this.redo = function () { graph.node.initial(to); };
    this.undo = function () { graph.node.initial(from); };
});

commands.new('move_edge', function (graph, d, from, to) {
    this.redo = function () { graph.edge.move(d, to[0], to[1]); };
    this.undo = function () { graph.edge.move(d, from[0], from[1]); };
});

commands.new('spring', function (view, graph) {
    var xy = [];
    var nodes =  graph.object().nodes;
    nodes.forEach(function (d) { xy.push(d.x, d.y); });
    this.redo = function () { view.spring(true); };
    this.undo = function () { view.spring(false); graph.node.move(nodes, xy); };
});


