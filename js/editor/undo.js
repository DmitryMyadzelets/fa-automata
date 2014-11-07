
// JSLint options:
/*global */
"use strict";


// 'Command' class
// 
var Command = function (redo, undo) {
    if (redo) { this.redo = redo; }
    if (undo) { this.undo = undo; }
};

Command.prototype.redo = function () {};
Command.prototype.undo = function () {};



// 'Commands' object
// 
var commands = {
    stack : [],
    macro : [],
    index : 0
    // Index is equal to a number of commands which the user can undo;
    // If index is not equal to the length of stack, it implies
    // that user did "undo". Then new command cancels all the
    // values in stack above the index.
};


function commands_methods() {

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
        }
    };


    this.redo = function () {
        if (this.index < this.stack.length) {
            var macro = this.stack[this.index++];
            var i, n = macro.length;
            for (i = 0; i < n; i++) {
                macro[i].redo();
            }
        }
    };


    // Makes a copy of each item of arguments if it is an array
    function copy_arguments() {
        var i = arguments.length;
        while (i--) {
            if (arguments[i] instanceof Array) {
                arguments[i] = arguments[i].slice(0);
            }
        }
    }


    // Creates new command-function as the key of a 'Commands' instance, i.e. it will be
    // var command = new Commands();
    // ...
    // command
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
                return self;
            };
        }
    };
}



commands_methods.call(commands);



commands.new('add_node', function (view, d) {
    this.redo = function () { view.model.node.add(d); };
    this.undo = function () { view.model.node.remove(d); };
});


commands.new('del_node', function (view, d) {
    this.redo = function () { view.model.node.remove(d); };
    this.undo = function () { view.model.node.add(d); };
});


commands.new('add_edge', function (view, d) {
    this.redo = function () { view.model.edge.add(d); };
    this.undo = function () { view.model.edge.remove(d); };
});


commands.new('del_edge', function (view, d) {
    this.redo = function () { view.model.edge.remove(d); };
    this.undo = function () { view.model.edge.add(d); };
});


commands.new('text', function (view, d, text) {
    var old_text = d.text;
    this.redo = function () { view.model.node.text(d, text); };
    this.undo = function () { view.model.node.text(d, old_text); };
});


commands.new('move_node', function (view, d, pxy, xy) {
    this.redo = function () { view.model.node.move(d, xy); };
    this.undo = function () { view.model.node.move(d, pxy); };
});


