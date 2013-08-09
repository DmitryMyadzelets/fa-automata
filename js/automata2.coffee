
'use strict'


@.automata2 = (()->

	# Adds null to the array into position 'i', returns the position
	add = (arr, i) ->
		ret = -1
		if not i? or i==arr.length
			arr.push(null)
			ret = arr.length-1
		else
			if i>=0 and i<arr.length
				arr.push(arr[i])
				arr[i] = null
				ret = i
		ret

	# Deletes an element 'i' of the array and returns the deleted element
	del = (arr, i) ->
		return -1 if i<0 or i>=arr.length or isNaN(i) or not (arr instanceof Array)
		if i< arr.length-1
			arr.splice(i, 1, arr.pop())
		else
			arr.splice(i, 1)
		i


	# 
	# Public metods
	# 
	_this = {

		# Creates a new transition function
		create : () ->
			{
				start : 0 # Initial node
				trans : new Uint32Array(3) # Transition's triples
				nN : 0 # Number of Nodes/States
				nE : 0 # Number of Events
				nT : 0 # Number of transitions
			}

		trans : {
			# Add a transition into position i if defined, or to the end
			add : (G, q, e, p, i) ->
				return -1 if q<0 or p<0 or q>=G.nN or p>=G.nN
				# Current length of the array
				len = G.trans.length|0
				# Current length occupied by transitions
				ix = G.nT * 3|0
				# Create a new bigger array if there is no enough space
				if ix+3 > len 
					# The size of the buffer created for future transitions
					# improves the performance x10 times, however it consumes
					# memory, especially in case of many small automaton.
					# The best way is to allocate just enough space 
					# before adding transitons.
					t = new Uint32Array(len+30|0) # space for 10 transitions
					t.set(G.trans)
					delete G.trans
					G.trans = t
				# Put the triple to the end of array
				G.trans[ix++] = q|0
				G.trans[ix++] = e|0
				G.trans[ix++] = p|0
				G.nT = (ix/3)|0

			del : (G, i) ->
				return -1 if i<0 or i>=G.nT
				G.nT -=1
				if i < G.nT
					i *= 3 # Index of triple deleted
					j = G.nT*3 # Index of the last triple
					G.trans[i++] = G.trans[j++]
					G.trans[i++] = G.trans[j++]
					G.trans[i] = G.trans[j]
				t = new Uint32Array(G.trans.subarray(0, G.nT*3))
				delete G.trans
				G.trans = t
				G.nT

			get : (G, i) ->
				return [] if i<0 or i>=G.nT
				G.trans.subarray(i*=3, i+3)

		}

	}
)()

g = automata2.create()
g.nN = 10
automata2.trans.add(g, 0, 1, 2)
automata2.trans.add(g, 3, 4, 5)
automata2.trans.add(g, 6, 7, 8)

console.log g.trans

automata2.trans.del(g, 1)

console.log g.trans
console.log f = automata2.trans.get(g, 0)
f.set([22,15,16])

console.log g.trans