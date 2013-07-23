
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

@ged = {
 	commands : new Undo()
	reset : Undo.prototype.reset
	undo : Undo.prototype.undo
	redo : Undo.prototype.redo

	edges : {
		add : (G, a, b, i) ->
			ix = faxy.edges.add(G, a, b, i)
			if ix >= 0
				ged.commands.put(faxy.edges.add, arguments, faxy.edges.del, [G, ix])
			ix
		del : (G, i) ->
			a = G.edges.a[i]
			b = G.edges.b[i]
			ret = faxy.edges.del(G, i)
			if ret >= 0
				ged.commands.put(faxy.edges.del, arguments, faxy.edges.add, [G, a, b, i])
			ret
		get : faxy.edges.get
		set : faxy.edges.set
		out : faxy.edges.out
		has : faxy.edges.has
	}
	nodes : {
		add : (G, x, y) ->
			ix = faxy.nodes.add(G, x, y)
			ged.commands.put(faxy.nodes.add, arguments, faxy.nodes.del, [G, ix])
			ix

		del : (G, i) ->
			# Since when we delete a node in/out edges also deleted,
			# then start transacton
			ged.commands.start_transaction()
			# Pass callback of for an edge deleting,
			# so we can record it too, instead of deleting 'blindly'
			x = G.nodes.x[i]
			y = G.nodes.y[i]
			ix = faxy.nodes.del(G, i, (G, i) -> ged.edges.del(G, i))
			if ix >= 0
				args = [G, x, y, i]
				ged.commands.put(faxy.nodes.del, arguments, faxy.nodes.add, args)
			ged.commands.stop_transaction()
			ix

		move2 : (G, i, old_x, old_y, x, y) ->
			if i>=0 and i< G.nodes.v.length
				ged.commands.put(faxy.nodes.move, [G, i, x, y], faxy.nodes.move, [G, i, old_x, old_y])
			i

		get : faxy.nodes.get
		set : faxy.nodes.set
		out : faxy.nodes.out
		in : faxy.nodes.in

		move : faxy.nodes.move
	}

}

@.editor = @.ged