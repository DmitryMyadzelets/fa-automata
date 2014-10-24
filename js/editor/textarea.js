

/**
 * Textarea control element with auto-resize.
 * Inspired from:
 * http://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
 * http://jsfiddle.net/CbqFv/
*/


var textarea = function() {
    var delayedResize, hook, keydown, offocus, resize, shown, _onCancel, _onEnter, _text;

    _text = null;
    _onEnter = null;
    _onCancel = null;
    shown = false;

    if (window.attachEvent) {
        hook = function(element, event, handler) {
            element.attachEvent('on' + event, handler);
            return null;
        };
    } else {
        hook = function(element, event, handler) {
            element.addEventListener(event, handler, false);
            return null;
        };
    }

    resize = function() {
        _text.style.height = 'auto';
        _text.style.height = _text.scrollHeight + 'px';
        return null;
    };

    delayedResize = function(ev) {
        window.setTimeout(resize, 0);
        return null;
    };

    keydown = function(ev) {
        switch (ev.keyCode) {
            case 13: // Enter
                _text.style.display = "none";
                shown = false;
                if (typeof _onEnter === "function") {
                    _onEnter(ev);
                }
                break;
            case 27: // Escape
                _text.style.display = "none";
                shown = false;
                if (typeof _onCancel === "function") {
                    _onCancel(ev);
                }
                break;
            default:
                delayedResize();
        }
        return null;
    };

    offocus = function() {
        _text.style.display = "none";
        if (shown) {
            shown = false;
            if (typeof _onCancel === "function") {
                _onCancel();
            }
        }
        return null;
    };

    return {
        attach: function(id, onEnter, onCancel) {
            _text = document.getElementById(id);
            hook(_text, 'keydown', keydown);
            hook(_text, 'blur', offocus);
            hook(_text, 'input', delayedResize);
            _onEnter = onEnter;
            _onCancel = onCancel;
            _text.style.font = "0.8em Verdana 'Courier New'";
            return null;
        },
        show: function(text, x, y) {
            // _text.value = text;
            // _text.style.width = "4em";
            // _text.style.left = x + "px";
            // _text.style.top = y + "px";
            // _text.style.display = null;
            _text.focus();
            resize();
            shown = true;
            return null;
        },
        text: function() {
            return _text.value;
        }
    };
};


// Creates <input> HTML object with unique ID and attach it to the textarea object
var textarea = (function () {
    var UID = 'c88d9c30-5871-11e4-8ed6-0800200c9a66';
    var editor = null;
    var parent = null;
    _enter = null;
    _cancel = null;



    function cancel() {
        if (typeof _cancel === 'function') { _cancel.apply(this, arguments); }
        editor.remove();
    }


    function enter() {
        if (typeof _enter === 'function') { _enter.apply(this, arguments); }
        editor.remove();
    }


    function keydown() {
        switch (d3.event.keyCode) {
        case 13: // Enter
            enter.apply(this, arguments);
            break;
        case 27: // Escape
            cancel.apply(this, arguments);
            break;
        default:
            d3.event.stopPropagation();
            delayedResize();
        }
        return null;
    };

    function resize() {
        editor.each(function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    };

    function delayedResize(ev) {
        window.setTimeout(resize, 0);
    }

    return function (d3selection, text, x, y, onEnter, onCancel) {
        if (editor) {
            editor.remove();
        }
        parent = d3selection;
        x = x || 0;
        y = y || 0;
        _enter = onEnter;
        _cancel = onCancel;

        editor = parent.append('textarea')
            .attr('id', UID)
            .attr('rows', 1)
            .style('position', 'absolute')
            // .style('width', '4em')
            .style('height', '1em')
            .style('left', x + 'px')
            .style('top', y + 'px')
            .attr('placeholder', 'Type here...')
            .attr('value', text)
            .on('blur', cancel)
            // .on('blur', function () { console.log('blur', this, arguments); cancel.apply(this, arguments); })
            .on('change', resize)
            .on('keydown', keydown)
            .on('cut', delayedResize)
            .on('drop', delayedResize)
            .on('paste', delayedResize);

        editor.each(function() {
            this.focus();
            this.select();
        });

        resize();
    };
}());


window.textarea = textarea;