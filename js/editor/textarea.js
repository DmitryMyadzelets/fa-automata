

/**
 * Textarea control element with auto-resize.
 * Inspired from:
 * http://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
*/


(function() {
    this.textarea = function() {
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
                _text.style.display = "none";
                _text.style.font = "0.8em Verdana 'Courier New'";
                return null;
            },
            show: function(x, y, text) {
                _text.value = text;
                _text.style.width = "4em";
                _text.style.left = x + "px";
                _text.style.top = y + "px";
                _text.style.display = null;
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

}).call(this);
