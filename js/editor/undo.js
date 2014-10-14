
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
    this.index = 0;
    // Index is equal to a number of commands which user can undo;
    // If index is not equal to the length of stack, it implies
    // that user did "undo". Then new command cancels all the
    // values in stack above the index.
};



Commands.prototype.startMacro = function () {
    if (this.index < this.stack.length) { this.stack.length = this.index; }
    this.macro = [];
    this.stack.push(this.macro);
    this.index = this.stack.length;
    return this;
};



Commands.prototype.stopMacro = function () {
    if (this.macro) {
        delete this.macro;
    }
    return this;
};



Commands.prototype.exec = function (command) {
    if (this.macro) {
        this.macro.push(command);
    } else {
        if (this.index < this.stack.length) { this.stack.length = this.index; }
        this.stack.push(command);
        this.index = this.stack.length;
    }
    command.redo();
    return this;
};



Commands.prototype.undo = function () {
    if (this.index > 0) {
        this.stack[--this.index].undo();
    }
};


Commands.prototype.redo = function () {
    if (this.index < this.stack.length) {
        var command = this.stack[this.index++];
        command.redo();
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
            var cmd = new Command();
            fun.apply(cmd, arguments);
            self.exec(cmd);
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
    this.redo = function () { view.nodes().add(d); };
    this.undo = function () { view.nodes().remove(d); };
});

