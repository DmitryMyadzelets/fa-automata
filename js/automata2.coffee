
'use strict'

# Returns bit state {true, false} of Uint32Array
get_bit = (arr, i) -> !!(arr[i>>5] & 1 << (i & 0x1F))
# Sets bit of Uint32Array
set_bit = (arr, i) -> arr[i>>5] |= 1 << (i & 0x1F)


@.automata2 = (()->

	DELTA_TRANS = 10 # Size of the increment for future transitions

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
			}				# Sorted list of nodes. 'nix' points to 'tix'.
				nix : new Uint32Array() 



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
	stack = [G.start]

	# Maximum index of state
	max = 0
	max = G.trans[G.tix[G.nT-1]] if G.nT > 0
	visited = new Uint32Array((max >> 5)+1)
	set_bit(visited, G.start)
	while stack.length
		q = stack.pop()
		j = G.nix[q] 
		# 'j' point to the position in 'tix'
		# 'i' points to the fist transition of state 'q'
		while (j<G.nT) and (q == G.trans[i = G.tix[j++]])
			e = G.trans[++i]
			p = G.trans[++i]
			if !get_bit(visited, p)
				set_bit(visited, p)
				stack.push(p)
			fnc(q, e, p) if call_fnc
	visited = null
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


# console.time("BFS execution time")
automata2.BFS(C, (q,e,p) -> 
	# console.log [q, e, p]
	null
	)
# console.timeEnd("BFS execution time")




# =============================================================================

###*
 * Creates object-function 'name' with correspondent methods
 * to work with Uint32Array.
 * The methods are:
 * name.set(i,...,n)	// Sets bits
 * name.get(i)			// Returns state of bit {true\false}
 * name.clr(i,...,n)	// Clears bits
 * name.resize(len)		// Changes size of array
 * The object-function returns all the indexes if bits which are 'true'
###
make_binary_set = (name, arr) ->
	# Helper functions to deal with bits of Uint32Array
	get_bit = (arr, i) -> !!(arr[i>>5] & 1 << (i & 0x1F))
	set_bit = (arr, i) -> arr[i>>5] |= 1 << (i & 0x1F)
	clr_bit = (arr, i) -> arr[i>>5] &= ~(1 << (i & 0x1F))

	# Returns an array of indexs of the array wich are true
	get_default = (arr) ->
		ret = []
		for i, index in arr
			n = index * 32|0
			m = 0
			while i
				ret.push(n + m) if (i & 1)
				i >>= 1
				m++
		ret

	# Creates Uint32Array array with new length, copies data from source array.
	resize = (src, len) ->
		l = src.length
		if len > l
			ret = new Uint32Array(len)
			ret.set(src)
		else
			ret = new Uint32Array(src.subarray(0, len))
		ret

	@[name] = () -> get_default(arr)
	@[name].set = (i) -> set_bit(arr, i) for i in arguments
	@[name].get = (i) -> get_bit(arr, i)
	@[name].clr = (i) -> clr_bit(arr, i) for i in arguments
	@[name].resize = (len) -> resize(arr, len)




# Helper functions to deal with bits of Uint32Array
getUint32ArrayBit = (arr, i) -> !!(arr[i>>5] & 1 << (i & 0x1F))
setUint32ArrayBit = (arr, i) -> arr[i>>5] |= 1 << (i & 0x1F)
clrUint32ArrayBit = (arr, i) -> arr[i>>5] &= ~(1 << (i & 0x1F))
# Creates Uint32Array array with new length, copies data from source array.
# Don't foget to delete the source array, if necessary!
resizeUint32Array = (arr, len) ->
	if len > arr.length
		ret = new Uint32Array(len)
		ret.set(arr)
	else # len < arr.length
		ret = new Uint32Array(arr.subarray(0, len))
	ret

# Delets a bit of the array and puts the last bit to the vacant position
delUint32ArrayBit = (arr, i, bits_len) ->
	bits_len -= 1 # Index of the last element
	if i != bits_len # Do only if it makes sense
		if getUint32ArrayBit(arr, bits_len)
			setUint32ArrayBit(arr, i)
		else
			clrUint32ArrayBit(arr, i)
	bits_len # Return new size of the array (always old length -1)



delUint32ArrayValue = (arr, i, len) ->
	len -= 1 # Index of the last element
	if i != len # Do only if it makes sense
		arr[i] = arr[len]
	len # Return new size of the array (always old length -1)



delObjectArrayValue = (arr, i, len) ->
	len -= 1 # Index of the last element
	if i != len # Do only if it makes sense
		delete arr[i]
		arr[i] = arr[len]
	len # Return new size of the array (always old length -1)



# Adds a bit (no value) to the end of the array; resizes the array if necessary
# Returns a new length of bits
addUint32ArrayBit = (arr, old_bit_len) ->
	len = old_bit_len +1 # new length in bits
	ret = len
	len >>= 5 # index of Uint32
	old_bit_len >>= 5 # old index of Uint32
	if (old_bit_len|0) ^ (len|0)
		len += 1
		arr = resizeUint32Array(arr, len)
	ret



# Returns an array of indexs of the array wich are true
enumUint32ArrayBit = (arr, len) ->
	ret = []
	for i, index in arr
		n = index * 32|0
		m = 0
		while i
			ret.push(n + m) if (i & 1)
			i >>= 1
			m++
	ret


DELTA_UINT_ARRAY = 10|0 # size of increment
# Adds a new element (no value) to the end of array; resizes array if necessary
addUint32ArrayValue = (arr, old_len) ->
	len = old_len +1
	if len >= arr.length
		arr = resizeUint32Array(arr, len)
	len



# Creates binary type keys for the given object
create_binary_keys = (obj, names) ->
	i = names.length
	while i--
		obj[names[i]] = new Uint32Array(1)
		obj[names[i]]['type'] = 'b'
	obj



# Creates integer type keys for the given object
create_integer_keys = (obj, names) ->
	i = names.length
	while i--
		obj[names[i]] = new Uint32Array(1)
		obj[names[i]]['type'] = 'i'
	obj



# Creates object type keys for the given object
create_object_keys = (obj, names) ->
	i = names.length
	while i--
		obj[names[i]] = []
		obj[names[i]]['type'] = 'o'
	obj



add_binary_method = (obj, set, name) ->
	o = obj[name] = () -> enumUint32ArrayBit(set.subsets[name], obj.size())
	o.set = () -> setUint32ArrayBit(set.subsets[name], i) for i in arguments
	o.get = () -> getUint32ArrayBit(set.subsets[name], i) for i in arguments
	o.clr = () -> clrUint32ArrayBit(set.subsets[name], i) for i in arguments
	null


add_binary_methods = (obj, set, names) ->
	i = names.length
	while i--
		add_binary_method(obj, set, names[i])
	null



# add_binary_properties = (obj, names) ->
# 	i = names.length
# 	while i--
# 		name = names[i]
# 		o = obj[name] = () -> enumUint32ArrayBit.apply(o, [arr, o.len])
# 		arr = obj.subsets[names[i]] = new Uint32Array(1)
# 		add_binary_methods.apply(obj[name], [arr])
# 		o.len = 0
# 		# arr.resize = (len) -> resizeUint32Array(arr, len)
# 		# arr.del = () -> 
# 		# 	arr.len = delUint32ArrayBit(arr, i, arr.len) for i in arguments
# 		# 	null
# 		# arr.add = () -> 
# 		# 	arr.len = addUint32ArrayBit(arr, arr.len)
# 		# 	null
# 	obj


# DES.X.marked.set(G1, [5]) -> set(G1.X.marked) 
# DES.module(G1).X.marked.set(3, 5) or
# DES.module(G1.X).marked.set(3, 5) or
# G = DES.module(G1).
# G.X.marked.set(3, 5) ----> setUint32ArrayBit(G1.X, 3); setUint32ArrayBit(G1.X, 5)


# # General mathematical set object with methods stabs
# SET = {
# 	add : () -> null
# 	get : () -> null
# 	set : () -> null
# 	resize : (len) -> 0
# }

# BITSET = Object.create(SET)
# BITSET.resize = (len) -> resizeUint32Array(len)
# BITSET.set = (i) -> setUint32ArrayBit()


###*
 * Object-function representing a set of elements
 * Given a set of indexes (0,...,n) as arguments, it returns 
 * an array of correspondent objects with their properties filled.
###
Set = () ->
	size = 0
	ret = () ->
	# ret = () -> 
	# 	arr = []
	# 	for i in arguments
	# 		obj = {}
	# 		obj[name] = ret[name].get(i) for name of ret.subsets
	# 		arr.push(obj)
	# 	arr

	ret.subsets = []
	ret.size = () -> size
	# ret.length = () -> length
	# ret.resize = (len) -> @[name].resize(len) for name in @subsets
	# ret.add_binary_subsets = () ->
	# 	for name in arguments
	# 		arr = @subsets[name] = new Uint32Array(1)
	# 		make_binary_set.apply(@, [name, arr])
	# 	null
	ret



BINARY_SUBSET = (name) ->
	@name = name


BINARY_SUBSET.prototype.foo = () -> console.log @name
BINARY_SUBSET.prototype.set = () -> console.log @subsets


# ADD = (obj, names) ->
# 	i = names.length
# 	while i--
# 		name = names[i]
# 		o = obj[name] = () -> 'im a function'
# 		o.set = () -> 
# 			console.log @
# 			# setUint32ArrayBit(obj.subsets[name], i) for i in arguments
# 	null


# ADD(BINARY_SUBSET.prototype, ['observable'])


SET = () ->
	subsets = {}
	subsets.controllable = new BINARY_SUBSET('controllable')
	ret = () -> console.log subsets
	ret.prototype = SET
	ret

SET.prototype.set = () -> console.log @subsets


a = new BINARY_SUBSET("A")
b = new BINARY_SUBSET("B")
a.foo()
b.foo()
c = new SET()
# console.log c






###*
 * Object representing a Discrete-Event System (DES)
###
DES = () ->

	@current_module = new G('stab')

	self = {
		# Modules of DES, i.e. automata
		modules : []
		# Set of events. It's shared by all automata
		E : new Set()
		X : new Set()
	}

	add_binary_methods(self.E, ['controllable', 'observable'])
	# add_binary_methods.apply(@, [self.E, self.E, ['controllable', 'observable']])
	# Make namespace for access to methods
	# self.E.observable = {}
	# self.E.controllable = {}
	# Make methods
	# self.E.observable.set = () ->  setUint32ArrayBit(self.E.subsets.observable, i) for i in arguments
	# self.E.controllable.set = () -> setUint32ArrayBit(self.E.subsets.controllable, i) for i in arguments
	# Make structure for data
	
	create_binary_keys(self.E.subsets, ['observable', 'controllable'])
	# 
	# self.X.faulty = () -> enumUint32ArrayBit(current_module.X.subsets.faulty, self.X.size())
	# self.X.faulty.set = () -> setUint32ArrayBit(current_module.X.subsets.faulty, i) for i in arguments
	# self.X.faulty.clr = () -> clrUint32ArrayBit(current_module.X.subsets.faulty, i) for i in arguments
	self.current_module = () -> @current_module
	add_binary_methods(self.X, @current_module.X, ['faulty'])

	self.create_module = (name) ->
		@modules.push(g = new G(name))
		create_binary_keys(g.X.subsets, ['marked', 'faulty'])
		g.a = new BINARY_SUBSET()
		g.a.foo()
		g

	self.module = (aModule) -> 
		@current_module = aModule
		@
	self

# Add necessary subsets. In Control Theory the common subsets are 
# 'controllable' and 'observable'. In fault diagnosis - 'fault'.
# DES.E.add_binary_subsets('observable', 'controllable', 'fault')
# create_binary_keys(DES.E.subsets, ['observable', 'controllable', 'fault'])
# add_binary_methods(DES.E, ['observable', 'controllable', 'fault'])
# console.log '>>>', DES.E
# create_object_keys(DES.E, ['label'])
# create_binary_keys(DES.E.subsets, ['marked', 'faulty'])

# add_binary_properties(DES.E, ['observable', 'controllable', 'fault'])

# DES.add_binary_methods('E', ['observable', 'controllable', 'fault'])

# console.log DES


###*
 * Class representing a Module of a DES
###
G = (name) ->
	ret = {
		name : name
		X : new Set()
		T : new Set()
	}
	# Add necessary subsets
	# ret.X.add_binary_subsets('marked', 'faulty')
	# @X.object_subsets('x', 'y', 'label')
	ret
	


# Let it access from a global namespace
# @DES = DES

# S = new DES()


# @g = S
# # debugger

# Working with System
# 
# Create a Discrete-Event System
# des = new DES()
# 
# Events set belongs to the System, and used by all the modules
# des.E.add_binay_subsets('contollable', 'observable')
# 
# Add a new event
# e = des.E.add()
# des.E.observable.set(e)
# des.E.label(e)
#  
# des.E.add()

# Working with Modules
# 
# Access to an array of the System's modules
# des.modules	
# 
# Creates and returns new module, puts it into array.
# G1 = des.create_module('Valve')
# 
# Returns an array of objects for specified events,
# des.E(5, 0, 87)
# where each object is:
# {
# 	label : 'Command Open'
# 	contollable : false
# 	observable : true
# 	...
# }


