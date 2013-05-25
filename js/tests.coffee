
###
===============================================================================
This is a test of working with two depended arrays of objects.
One array is independed (fruits) and second (people) keeps indexes of array 
in (fruits). Then if we delete a member in (fruits), we must delete 
depended records in (people). But since the indexes of (fruits) are changed, 
then whe should update them in depended arrays.
Here we can get dependency access fruit[people[i]].

The another way to work arround is to have unique keys for (fruits), and have 
those keys in (people). If we delete a member of (fruits) we must delete
depended records in (people). But now we do not need to update any indexes.
Here we can not get dependency access fruits[people[i]]. Instead, we should
first index=find_key(fruits, key), then acces fruits[index].
###
order_based_access = () ->
	fruits = []
	people = []

	update_on_delete = (arr, ixDelete, ixUpdate) ->
		i = arr.length
		while i-- >0
			if arr[i] == ixDelete
				arr.splice(i, 1)
			else
				if arr[i] == ixUpdate
					arr[i] = ixDelete
		null

	add = (v) ->
		fruits.push(v)

	del = (ix) ->
		if (ix < len = fruits.length) && (ix > -1)
			fruits[ix] = fruits.pop()
			# The following must be applied to all depended arrays
			update(people, ix, len-1)
		null

	get = (ix) ->
		fruits[ix]

	set = (ix, v) ->
		fruits[ix] = v

	# Creation
	add("Banana")
	add("Orange")
	add("Apple")
	add("Mango")
	# Eqaul creation
	people.push(1) # likes Orange
	people.push(3) # likes Mango
	# Logging helper
	log = () ->
		console.log fruits
		console.log people
		null
	#Delete
	log()
	del(1)
	log()
	#Access
	fruits[1]
	people[0]
	#Depended (tree) access
	v = fruits[people[0]]
	console.log v
	#
	null
