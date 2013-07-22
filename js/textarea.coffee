###*
 * Textarea control element with auto-resize.
 * Inspired from:
 * http://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
###

@textarea = () ->
	_text = null

	_onEnter = null
	_onCancel = null

	shown = false

	if window.attachEent
		hook = (element, event, handler) ->
			element.attachEvent('on'+event, handler)
			null
	else
		hook = (element, event, handler) ->
			element.addEventListener(event, handler, false)
			null

	resize = () ->
		_text.style.height = 'auto'
		_text.style.height = _text.scrollHeight+'px'
		null

	delayedResize = (ev) -> 
		window.setTimeout(resize, 0)
		null

	keydown = (ev) ->
		switch ev.keyCode 
			when 13 # Enter
				_text.style.display = "none"
				shown = false
				_onEnter?(ev)
			when 27 # ESC
				_text.style.display = "none"
				shown = false
				_onCancel?(ev)
		delayedResize()

	offocus = () -> 
		_text.style.display = "none"
		if shown
			shown = false
			_onCancel?()
		null

	{
		attach : (id, onEnter, onCancel) ->
			_text = document.getElementById(id)
			hook(_text, 'change',	resize)
			hook(_text, 'cut', 		delayedResize)
			hook(_text, 'paste', 	delayedResize)
			hook(_text, 'drop', 	delayedResize)
			hook(_text, 'keydown', 	keydown)
			hook(_text, 'blur',		offocus)

			_onEnter = onEnter
			_onCancel = onCancel

			_text.style.display = "none"
			null

		show : (x, y, text) ->
			_text
			_text.value = text
			_text.style.width = "40px"
			_text.style.left = x + "px"
			_text.style.top = y + "px"
			_text.style.display = null
			_text.focus()
			_text.select()
			resize()
			shown = true

		text : () -> _text.value

	}