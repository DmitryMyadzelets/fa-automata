'use strict'

class @Undo
	stack = []
	ix = 0
	transaction = false

	put : (redo_func, redo_vals, undo_func, undo_vals) ->
		# If index ix is not equal to the length of stack, it implies
		# that user did "undo". Then new command cancels all the
		# values in stack below the index.
		if ix < stack.length
			stack.length = ix
		stack.push {
			redo_func: redo_func
			redo_vals: redo_vals
			undo_func: undo_func
			undo_vals: undo_vals
		}
		ix = stack.length
		null

	undo : () ->
		ret = false
		if ix > 0
			while ix > 0
				cmd = stack[--ix]
				cmd.undo_func.apply(@, cmd.undo_vals)
				break if not transaction
			ret = true
		ret

	redo : () ->
		ret = false
		if ix < stack.length
			while ix < stack.length
				cmd = stack[ix++]
				cmd.redo_func.apply(@, cmd.redo_vals)
				break if not transaction
			ret = true
		ret

	reset : () -> 
		stack.length = 0
		ix = 0; 

	set_transaction : (state) -> transaction = state
	start_transaction : () -> @put(@set_transaction, [true], @set_transaction, [false])
	stop_transaction : () -> @put(@set_transaction, [false], @set_transaction, [true])

