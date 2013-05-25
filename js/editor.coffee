
'use strict'
###
===============================================================================
The function deletes the elements of an array which have values ixDelete
and change elements with values ixUpdate to ixDelete.
###
# update_on_delete = (arr, ixDelete, ixUpdate) ->
# 	# console.log "del:" + ixDelete + ", upd:" + ixUpdate
# 	i = arr.length
# 	while i-- >0
# 		if arr[i] == ixDelete
# 			arr.splice(i, 1)
# 			# console.log "splice"
# 		else
# 			if arr[i] == ixUpdate
# 				arr[i] = ixDelete
# 				# console.log "exchange"
# 	null

###
===============================================================================
Returns the position in the array nodes which the node has been put to.
###
add_node = (x, y) ->
	graph.nodes.x.push(x)
	graph.nodes.y.push(y) - 1

ins_node = (x, y, ix) ->
	if ix < graph.nodes.x.length
		graph.nodes.x.push(graph.nodes.x[ix])
		graph.nodes.y.push(graph.nodes.y[ix])
	graph.nodes.x[ix] = x
	graph.nodes.y[ix] = y
	ix

###
We delete an element [ix] of an array as follows:
1. Copy the last element to the position ix.
2. Remove the last element.
Returns the value at deleted position
###
del_node = (ix) ->
	ret = null
	if (ix < len = graph.nodes.x.length) && (ix > -1)
		if ix == len-1
			ret = [graph.nodes.x.pop(), graph.nodes.y.pop()]
		else
			ret = [graph.nodes.x[ix], graph.nodes.y[ix]]
			graph.nodes.x[ix] = graph.nodes.x.pop()
			graph.nodes.y[ix] = graph.nodes.y.pop()
			# graph.nodes[ix] = graph.nodes.pop()
	ret

@.move_node = (ix, x, y) ->
	graph.nodes.x[ix] = x
	graph.nodes.y[ix] = y
	null

###
===============================================================================
###
# add([graph.edges.a, graph.edges.b], [val])
# add = (arrs, vals) ->
# 	if arrs.length = vals.length
# 		for arr, index in arrs
# 			arr.push(vals[index])
# 	null

add_edge = (node_ix1, node_ix2) ->
	eix = has_edge(node_ix2, node_ix1)
	ret = graph.edges.push(pack(node_ix1, node_ix2)) - 1
	if (graph.curved[ret] = (eix >= 0))
		graph.curved[eix] = true
	ret

###
===============================================================================
###
ins_edge = (node_ix1, node_ix2, ix)	->
	eix = has_edge(node_ix2, node_ix1)
	#
	if ix < graph.edges.length
		graph.edges.push(graph.edges[ix])
		graph.curved.push(graph.curved[ix])
	graph.edges[ix] = pack(node_ix1, node_ix2)
	if eix < 0
		graph.curved[ix] = false
	else
		eix = graph.edges.length - 1 if (eix == ix)
		graph.curved[ix] = graph.curved[eix] = true
	ix

###
===============================================================================
###
del_edge = (ix) ->
	ret = null
	if (ix < len = graph.edges.length) && (ix > -1)
		[a, b] = unpack(graph.edges[ix])
		if ix == len-1
			ret = graph.edges.pop()
			graph.curved.pop()
		else
			ret = graph.edges[ix]
			graph.edges[ix] = graph.edges.pop()
			graph.curved[ix] = graph.curved.pop()
		if (eix = has_edge(b, a)) >= 0
			graph.curved[eix] = false
	ret

###
===============================================================================
###
has_edge = (from_node, to_node) ->
	packed = pack(from_node, to_node)
	for edge, index in graph.edges
		return index if edge == packed
	-1

upd_edge = (ix, val) ->
	graph.edges[ix] = val
	null

###
===============================================================================
###
move_graph = (dx, dy) ->
	for x, index in graph.nodes.x
		# [x, y] = unpack(node)
		graph.nodes.x[index] += dx
		graph.nodes.y[index] += dy
	null

###
===============================================================================
###
@.editor = {
	stack : []
	ix : 0
	transaction : false

	execute : () ->
		name = arguments[0]
		args = Array.prototype.slice.call(arguments).splice(1)
		if !!@[name]# != undefined
			return @[name].apply(@, args)
		console.log "Command not found: " + name + " (" + args + ")"
		null

	undo : () ->
		ret = false
		if @.ix > 0
			while @.ix > 0
				cmd = @.stack[--@.ix]
				cmd.undo_func.apply(@, cmd.undo_vals)
				break if not @.transaction
			ret = true
		ret

	redo : () ->
		ret = false
		if @.ix < @.stack.length
			while @.ix < @.stack.length
				cmd = @.stack[@.ix++]
				cmd.redo_func.apply(@, cmd.redo_vals)
				break if not @.transaction
			ret = true
		ret

	to_stack : (redo_func, redo_vals, undo_func, undo_vals) ->
		# If index ix is not equal to the length of stack, it implies
		# that user did "undo". Then new command cancels all the
		# values in stack below the index.
		if @.ix < @.stack.length
			@.stack.length = @.ix
		@.stack.push {
			redo_func: redo_func
			redo_vals: redo_vals
			undo_func: undo_func
			undo_vals: undo_vals
		}
		@.ix = @.stack.length
		null

	set_transaction : (state) -> @.transaction = state
	start_transaction : () ->	@.to_stack(@.set_transaction, [true], @.set_transaction, [false])
	stop_transaction : () -> @.to_stack(@.set_transaction, [false], @.set_transaction, [true])

	add_node : (x, y) ->
		ix = add_node(x, y)
		@.to_stack(add_node, arguments, del_node, [ix])
		ix

	del_node : (ix) ->
		x = graph.nodes.x[ix]
		y = graph.nodes.y[ix]
		last = graph.nodes.length-1
		del_node(ix)
		@.start_transaction()
		@.to_stack(del_node, [ix], ins_node, [x, y, ix])
		# Delete ingoing and outgoing edges
		i = graph.edges.length
		while i-- >0
			[v1, v2] = unpack(graph.edges[i])
			if (v1 == ix) or (v2 == ix) 
				@.del_edge(i)
			else if ix < last
			# If the deleted node was not the last 
			# then the last node moves to the position of deleted one, and
			# hence we have to update values of some edges.
				v_old = graph.edges[i]
				if v1 == last then v1 = ix
				if v2 == last then v2 = ix
				if (v1 == ix) or (v2 == ix)
					upd_edge(i, pack(v1, v2))
					@.to_stack(upd_edge, [i, graph.edges[i]], upd_edge, [i, v_old])
		@.stop_transaction()
		null

	move_node : (ix, x1, y1, x2, y2) ->
		@.to_stack(move_node, [ix, x2, y2], move_node, [ix, x1, y1])
		null

	add_edge : (node_ix1, node_ix2) ->
		ix = add_edge(node_ix1, node_ix2)
		@.to_stack(add_edge, [node_ix1, node_ix2], del_edge, [ix])
		ix

	del_edge : (ix) ->
		nodes = del_edge(ix)
		[v1, v2] = unpack(nodes)
		@.to_stack(del_edge, [ix], ins_edge, [v1, v2, ix])
		null

	move_graph : (x1, y1, x2, y2) ->
		dx = x2-x1
		dy = y2-y1
		if dx || dy # log only if there are changes
			move_graph(dx, dy)
			@.to_stack(move_graph, [dx, dy], move_graph, [-dx, -dy])
		null

}
