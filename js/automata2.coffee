
'use strict'

# class Name
# 	constructor: (@name) ->
# 		# ...
	



@.automata2 = (()->

	DELTA_TRANS = 10 # Size of the increment for future transitions

	# Set the value to 1 in a binary array
	# Returns null
	setBit = (arr, i) ->
		arr[i>>5] |= 1 << (i & 0x1F)
		null


	# Returns value 1/0 of the bit i
	getBit = (arr, i) ->
		arr[i>>5] & 1 << (i & 0x1F) && 1


	###*
	 * [Optimized bubble sort (http://en.wikipedia.org/wiki/Bubble_sort). 
	 * Sorts the index array instead of the array itself.]
	 * @param  {[Array]} a   [Array with data]
	 * @param  {[Array]} ix  [Index array to be sorted]
	 * @param  {[int]} len [Length of the index array]
	 * @param  {[int]} step [Step for items in the data array]
	 * @return {[null]}
	###
	sort = (a, ix, len) ->
		n = len
		while n
			m = 0
			j = 0
			i = 1
			while i<n
				if a[ix[j]] > a[ix[i]]
					temp = ix[j]
					ix[j] = ix[i]
					ix[i] = temp
					m = i
				j = i
				i++
			n = m
		return


	# 
	# Public metods
	# 
	_this = {


		# Creates a new transition function
		create : () ->
			{
				start : 0|0 # Initial node
				trans : new Uint32Array(3*DELTA_TRANS) # Transition's triples
				# nN : 0|0 # Number of Nodes/States
				# nE : 0|0 # Number of Events
				nT : 0|0 # Number of Transitions
				sorted : false
				# Sorted transitions. 'tix' points to 'trans'.
				tix : new Uint32Array(DELTA_TRANS)
				# Sorted list of nodes. 'nix' points to 'tix'.
				nix : new Uint32Array() 
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
					# Updgrade sorted array for transitions
					delete G.tix
					G.tix = new Uint32Array(G.trans.length/3)


				G.sorted = false

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

				G.sorted = false

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
					# Updgrade sorted array for transitions
					delete G.tix
					G.tix = new Uint32Array(G.trans.length/3)
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


		states : {
			# Deletes states by means of deleting 
			# transitions wich have states q or p.
			# Returns number of deleted transitions
			del : (G, qp) ->
				ret = 0|0
				i = G.nT*3|0
				while (i-=3) >= 0
					if (G.trans[i] == qp) or (G.trans[i+2] == qp)
						t = (i/3)|0
						ret++ if _this.trans.del(G, t) > -1
						
				# If the initial state was deleted, then
				# move it to the state of the first transitions
				if qp == G.start
					if G.nT > 0
						G.start = G.trans[0]
					else # if no tranitions left
						G.start = 0
				ret

			} # states


		sort : (G) ->
			# Reset array of sorted transitions
			i = G.nT
			while i-- >0
				G.tix[i] = i*3
			# Sort transitions
			sort(G.trans, G.tix, G.nT)

			# Sort states
			# The last record contains the maximal state number
			max = 0
			max = G.trans[G.tix[G.nT-1]] if G.nT > 0
			# Upgrade array of states 'nix'
			delete G.nix
			G.nix = new Uint32Array(max + 1)
			# ... and fill it.
			n = -1
			i = 0
			len = G.nT
			while i < len 			# Enumerate sorted transitions
				m = G.trans[G.tix[i]]
				if m ^ n 			# When number of state 'q' changes,
					G.nix[m] = i 	# rember its position.
					n = m
				i++

			G.sorted = true
			return


		edges : {



			} # edges

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
#  A template for using bits. May be usefull in future.
# 	N = G.nN | 0
# 	# Size of a binary array presented as Uint32Array
# 	M = (N >> 5) + ((N & 0x1F) && 1)
# 	visited = new Uint32Array(M)
# 	setBit(visited, G.start)
automata2.BFS = (G, fnc) ->
	return if not G?

	automata2.sort(G) if not G.sorted

	call_fnc = typeof fnc == 'function'
	stack 	= [G.start]
	visited = [G.start]
	while stack.length
		q = stack.pop()
		j = G.nix[q] 
		# 'j' point to the position in 'tix'
		# 'i' points to the fist transition of state 'q'
		while (j<G.nT) and (q == G.trans[i = G.tix[j++]])
			e = G.trans[++i]
			p = G.trans[++i]
			if p not in visited
				visited.push(p)
				stack.push(p)
			fnc(q, e, p) if call_fnc
	return


###*
 * Parallel composition ('sync' name is taken from RW (Ramage & Wonham) theory)
 * @param  {automaton} G1
 * @param  {automaton} G2
 * @param  {array} common [Common events]
 * @param  {automaton} G [Resulting automata. Should be allocated before]
 * @return {automaton} G
###
# Preallocation impoves performance x10 times
# t = new Uint32Array(G1.nT * G2.nT * 3|0)
# delete G.trans
# G.trans = t
automata2.sync = (G1, G2, common, G) ->
	return if not G1? or not G2?
	common = [] if not common
	G = automata2.create() if not G?
	G.nT = 0 # Cancel all transitions (doesn't release memory)
	# Sorting improves the performance x2 times
	automata2.sort(G1) if not G1.sorted
	automata2.sort(G2) if not G2.sorted

	# Map contains supporting triples (q1, q2, q), 
	# where q1 \in G1, q2 \in G2, q \in G.
	map = [G1.start, G2.start, G.start = 0]
	map_n = 1|0 # Number of items in the map
	stack = [0]
	# map = new Uint32Array(3*10)
	# map_ix = 0

	# add_map = (p, e, q) ->
	# 	len = map.length
	# 	if (map_ix + 3) * 3|0 < len
	# 		len+=3*10
	# 		m = new Uint32Array(len)
	# 		m.set(map)
	# 		# delete map
	# 		map = null
	# 		map = m
	# 	map[map_ix++] = p
	# 	map[map_ix++] = e
	# 	map[map_ix++] = q
	# 	return

	# Adds transition to the new automaton.
	# a - state of G1, reached by event 'e'
	# b - state of G2, reached by event 'e'
	# Thus, (a, b) is the next composed state.
	add_transition = (e, a, b) ->
		# Search if the composed state is in the map
		i = 2
		k = -1 # index in the map
		n = map.length
		while i<n
			if map[i-2]==a and map[i-1]==b
				k = map[i]
				break
			i+=3
		# Calculate state 'p'
		if k < 0
			p = map_n++ # Note that 'q' is external w.r.t. this funcion
			stack.push(p)
			# add_map(a, b, p)
			map.push(a)
			map.push(b)
			map.push(p)
		else
			p = k
		# Add transition to the new automaton
		# console.log [a, b], [q, e, p], k, stack, map
		automata2.trans.add(G, q, e, p)
		return

	while stack.length
		q = stack.pop()
		q1 = map[q*3]
		q2 = map[q*3+1]

		I = @trans.out(G1, q1)
		J = @trans.out(G2, q2)

		# Synchronous transition function
		# We have 5 states in BDD for transitions of G1 and G2:
		# 1 - none of the transition occures
		# 2 - G1 does transition, G2 doesn't
		# 3 - G2 does transition, G1 doesn't
		# 4 - G1 ang G2 do one transition together
		# 5 - G1 ang G2 do separate transitions

		for i in I
			e1 = G1.trans[i+1]
			p1 = G1.trans[i+2]
			if e1 not in common
				add_transition(e1, p1, q2)
			else
				for j in J
					e2 = G2.trans[j+1]
					p2 = G2.trans[j+2]
					if e1 == e2
						add_transition(e1, p1, p2)
		for j in J
			e2 = G2.trans[j+1]
			p2 = G2.trans[j+2]
			if e2 not in common
				add_transition(e2, q1, p2)
		
	G.nN = map_n
	G


NUM_STATES = 10

make_G = (G) ->
	q = 0
	while q <NUM_STATES
		p = 0
		while p <NUM_STATES
			automata2.trans.add(G, q, p, p)
			p++
		q++
	return

G = automata2.create()
make_G(G)

A = automata2.create()
# automata2.trans.add(A, 0, 0, 1)
# automata2.trans.add(A, 1, 0, 3)
# automata2.trans.add(A, 1, 1, 2)
# automata2.trans.add(A, 2, 2, 2)
# automata2.trans.add(A, 3, 3, 4)
# automata2.trans.add(A, 4, 2, 4)

B = automata2.create()
# automata2.trans.add(B, 0, 4, 1)
# automata2.trans.add(B, 1, 2, 1)
# automata2.trans.add(B, 0, 3, 2)
# automata2.trans.add(B, 1, 3, 2)
# automata2.trans.add(B, 2, 2, 2)
# 
make_G(A)
make_G(B)

C = automata2.sync(A, B, [1, 5])
console.log "Transitions:", C.nT
automata2.BFS(C, (q,e,p) -> 
	# console.log [q, e, p]
	null
	)
