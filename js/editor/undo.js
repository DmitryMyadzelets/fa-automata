
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



// 'Commands' class
// 
var Commands = function () {
    this.stack = [];
    this.macro = [];
    this.index = 0;
    // Index is equal to a number of commands which user can undo;
    // If index is not equal to the length of stack, it implies
    // that user did "undo". Then new command cancels all the
    // values in stack above the index.
};



// Starts new macro recording
Commands.prototype.start = function () {
    if (this.index < this.stack.length) { this.stack.length = this.index; }
    this.macro = [];
    this.stack.push(this.macro);
    this.index = this.stack.length;
    return this;
};



Commands.prototype.undo = function () {
    if (this.index > 0) {
        var macro = this.stack[--this.index];
        var i = macro.length;
        while (i-- > 0) {
            macro[i].undo();
        }
    }
};



Commands.prototype.redo = function () {
    if (this.index < this.stack.length) {
        var macro = this.stack[this.index++];
        var i, n = macro.length;
        for (i = 0; i < n; i++) {
            macro[i].redo();
        }
    }
};


// Creates new command-function as the key of a 'Commands' instance, i.e. it will be
// var command = new Commands();
// ...
// command
Commands.prototype.new = function (name, fun) {
    if (this[name] && console ) {
        console.error('Command', name, 'already exists' );
        return;
    }
    var self = this;
    if (name && typeof fun === 'function') {
        this[name] = function () {
            var command = new Command();
            fun.apply(command, arguments);
            self.macro.push(command);
            command.redo();
            return self;
        }
    }
};



var commands = new Commands();


commands.new('add_node', function (view, d) {
    this.redo = function () { view.nodes().add(d); };
    this.undo = function () { view.nodes().remove(d); };
});


commands.new('del_node', function (view, d) {
    this.redo = function () { view.nodes().remove(d); };
    this.undo = function () { view.nodes().add(d); };
});


commands.new('add_edge', function (view, d) {
    this.redo = function () { view.edges().add(d); };
    this.undo = function () { view.edges().remove(d); };
});


commands.new('del_edge', function (view, d) {
    this.redo = function () { view.edges().remove(d); };
    this.undo = function () { view.edges().add(d); };
});


commands.new('text', function (d, text) {
    var old_text = d.text;
    this.redo = function () { d.text = text; };
    this.undo = function () { d.text = old_text; }
});

