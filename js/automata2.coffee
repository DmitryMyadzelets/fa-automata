
'use strict'


@.automata2 = (()->

	DELTA_TRANS = 10 # Size of the increment for future transitions

	# Set the value to 1 in a  binary array
	# Returns null
	setBit = (arr, i) ->
		arr[i>>5] |= 1 << (i & 0x1F)
		null

	# Returns value 1/0 of the bit i
	getBit = (arr, i) ->
		arr[i>>5] & 1 << (i & 0x1F) && 1


	# 
	# Public metods
	# 
	_this = {


		# Creates a new transition function
		create : () ->
			{
				start : 0|0 # Initial node
				trans : new Uint32Array(3*DELTA_TRANS) # Transition's triples
				nN : 0|0 # Number of Nodes/States
				nE : 0|0 # Number of Events
				nT : 0|0 # Number of Transitions
			}


		trans : {


			# Adds a transition into position i if defined, or to the end
			# G - automaton structure
			# q - integer, state 'from'
			# e - integer, event
			# q - integer, state 'to'
			# i - integer, index of the transition [optional]
			# Returns index of the added transition, or -1 if the index is wrong.
			add : (G, q, e, p, i) ->
				# Fix: we do not need to control bounds of states and events,
				# since set of transitions has no clue about them
				# return -1 if q<0 or p<0 or e<0 or q>=G.nN or p>=G.nN or e>=g.nE
				# 
				# Number of items available
				len = G.trans.length|0
				# Number of items occupied by transitions
				j = G.nT * 3|0
				# Either we add a new to the end, or insert it we need new space
				# Create a new bigger array if there is no enough space
				if j+3 > len
					# The size of the buffer created for future transitions
					# improves the performance x10 times, however it consumes
					# memory, especially in case of many small automata.
					t = new Uint32Array(len+3*DELTA_TRANS)
					t.set(G.trans)
					delete G.trans
					G.trans = t

				if not i? or i==G.nT
					# Put the triple to the end of the array
					G.trans[j++] = q|0
					G.trans[j++] = e|0
					G.trans[j++] = p|0
					return G.nT++
				else
					return -1|0 if i<0 or i>G.nT
					# Put the triple to the required position, 
					# and triple from the position move to the end
					k = i*3|0
					G.trans[j++] = G.trans[k++]
					G.trans[j++] = G.trans[k++]
					G.trans[j++] = G.trans[k++]
					k-=3
					G.trans[k++] = q|0
					G.trans[k++] = e|0
					G.trans[k++] = p|0
					G.nT++
					return i|0


			# Deletes a transition from the position i
			# Returns amount of transitions or -1 if the position is wrong
			del : (G, i) ->
				return -1 if not i? or i<0 or i>=G.nT
				G.nT -=1
				if i < G.nT
					i *= 3 		# Index of triple we need to delete
					j = G.nT*3 	# Index of the last triple
					G.trans[i++] = G.trans[j++]
					G.trans[i++] = G.trans[j++]
					G.trans[i] = G.trans[j]
				# Note that if we delete the last triple, 
				# we do nothing with it, just decrease the counter.
				len = G.trans.length
				# Reduce array if we have too much space
				if (len - G.nT*3) > 3*DELTA_TRANS
					len-=3*DELTA_TRANS
					t = new Uint32Array(G.trans.subarray(0, len))
					delete G.trans
					G.trans = t
				G.nT


			# Returns a transitions triple (as array) from the position i, 
			# or -1 if the position is wrong.
			get : (G, i) ->
				return -1|0 if i<0 or i>=G.nT
				G.trans.subarray(i*=3, i+3)


			# Returns array of indexes of 'q' for triples (q, e, p) in transitions
			# if 'q' matches
			out : (G, q) ->
				ret = []
				n = G.nT*3|0
				i = 0|0
				while i<n
					ret.push(i) if G.trans[i] == q
					i+=3
				new Uint32Array(ret)


			# Returns array of indexes of 'q' for triples (q, e, p) in transitions
			# if 'p' matches
			in : (G, p) ->
				ret = []
				n = G.nT*3|0
				i = 2|0 # index of 'p' in (q, e, p)
				while i<n
					ret.push(i-2) if G.trans[i] == p
					i+=3
				new Uint32Array(ret)


			# Returns index if transition (p, e, q) exists, otherwise -1
			exists : (G, p, e, q) ->
				n = G.nT*3|0
				i = 0|0
				t = G.trans
				while i<n
					return i if t[i] == p and t[i+1] == e and t[i+2] == q
					i+=3
				-1|0


		} # trans


		edges : {



			} # edges

		###*
		 * Breadth-first Search
		 * @param {Automaton} G   
		 * @param {function} fnc Callback function. Called with (node_from, label, node_to)
		 * where:
		 * node_from: index of the outgoing node
		 * label: event label
		 * node_to: index of the ingoing node
		###
		# BFS : (G, fnc) ->
		# 	return null if not G?
		# 	stack = [G.start]
		# 	N = G.nN | 0
		# 	# Size of a binary array presented as Uint32Array
		# 	M = (N >> 5) + ((N & 0x1F) && 1)
		# 	visited = new Uint32Array(M)
		# 	setBit(visited, G.start)

		# 	return null

		# 	while stack.length
		# 		a = stack.pop()
		# 		# Get edges going out of the node 'a'
		# 		E = @edges.out(G, a)
		# 		for e in E
		# 			# Get nodes reachabe by the edge 'e'
		# 			b = G.edges.b[e]
		# 			if b not in visited
		# 				visited.push(b)
		# 				stack.push(b)
		# 			# Get all event labels for the edge
		# 			labels = @edges.events.labels(G, e)
		# 			fnc(a, l, b) for l in labels if typeof fnc == 'function'
		# 	null

	} # _this

)()


###*
 * Breadth-first Search
 * @param {Automaton} G   
 * @param {function} fnc Callback function. Called with (node_from, event, node_to)
 * where:
 * node_from: index of the outgoing node
 * event: index of event
 * node_to: index of the ingoing node
 * @return {null}
###
automata2.BFS = (G, fnc) ->
	return if not G?
	stack = [G.start]
	visited = [G.start]
	while stack.length
		q = stack.pop()
		# Get indexes of transitions going out of the node 'q'
		I = @trans.out(G, q)
		for i in I
			e = G.trans[i+1]
			p = G.trans[i+2]
			if p not in visited
				visited.push(p)
				stack.push(p)
			fnc(q, e, p) if typeof fnc == 'function'
	null

###*
 * Parallel composition ('sync' name is taken from RW (Ramage & Wonham) theory)
 * @param  {automaton} G1
 * @param  {automaton} G2
 * @return {automaton} G
###
automata2.sync = (G1, G2) ->
	G = @create()
	return G if not G1? or not G2?
	# Map contains supporting triples (q1, q2, q), 
	# where q1 \in G1, q2 \in G2, q \in G.
	map = [[G1.start, G2.start, G.start = 0]]
	stack = [0]
	common = [5]

	# Search if states are in the map
	inMap = (q1, q2) ->
		for m, index in map
			return index if m[0]==q1 and m[1]==q2
		-1

	while stack.length
		q = stack.pop()

		I = @trans.out(G1, map[q][0])
		J = @trans.out(G2, map[q][1])

		for i in I
			q1 = G1.trans[i]
			e1 = G1.trans[i+1]
			p1 = G1.trans[i+2]

			for j in J
				q2 = G2.trans[j]
				e2 = G2.trans[j+1]
				p2 = G2.trans[j+2]

				# console.log [q1, e1, p1], [q2, e2, p2]
				
				# Synchronous transition function
				a = p1
				b = p2
				_t1 = true
				_t2 = true
				if e1 in common 
					if e2 in common
						if e1 != e2
							continue
					else
						a = q1
						_t1 = false
				else
					if e2 in common
						b = q1
						_t2 = false

				k = inMap(a, b)
				if k < 0
					p = q+1
					stack.push(p)
					map.push([a, b, p])
				else
					p = k

				@trans.add(G, q, e1, p) if _t1
				@trans.add(G, q, e2, p) if _t2 and e1 != e2

	G

