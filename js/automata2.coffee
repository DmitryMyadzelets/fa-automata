
'use strict'


@.automata2 = (()->

	DELTA_TRANS = 10 # Size of the increment for future transitions

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
					return -1 if i<0 or i>G.nT
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
				return -1 if i<0 or i>=G.nT
				G.trans.subarray(i*=3, i+3)

		}

	}
)()

g = automata2.create()
g.nN = 10
g.nE = 10
automata2.trans.add(g, 0, 1, 2)
automata2.trans.add(g, 3, 4, 5)
automata2.trans.add(g, 6, 7, 8, 1)

console.log g.trans

automata2.trans.del(g, 1)
console.log g.trans

# console.log g.trans
console.log f = automata2.trans.get(g, 1)
