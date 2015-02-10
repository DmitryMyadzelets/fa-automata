
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
	# Equal creation
	people.push(1) # 1st person likes Orange
	people.push(3) # 2nd person likes Mango
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
	fruits[1] # Returns the fruit
	people[0] # Returns index of a fruit
	#Depended (tree) access
	v = fruits[people[0]]
	console.log v
	#
	null






# This approach of Array extention is taken from:
# http://stackoverflow.com/questions/13081379/javascript-extending-array-class
foo = () ->
foo.prototype = Object.create(Array.prototype)
foo.prototype.constructor = foo
foo.prototype.foo = () -> ":)"

# Returns object's keys wich have the Array type
foo.prototype.get_arrays = (o) ->
	keys = []
	keys.push(key) for key of o when o[key] instanceof Array
	keys

# Execute the function 'fnc' over all the object's properties of Array type
foo.prototype.for_arrays_of = (obj, fnc, args) ->
	keys = @get_arrays(obj)
	ret = fnc(obj[key], args) for key in keys
	ret


foo.prototype.add = (v, i) ->
	if i? 
		if i>-1 and i<@length
			@push(@[i])
			@[i] = v
			@for_arrays_of(@, (o) -> o.push(o[i]); o[i]=null)
	else
		@push(v)
		@for_arrays_of(@, (o) -> o.push(null))
	@length


# Deletes an element 'i' of the array and returns the deleted element
foo.prototype.del = (i) ->
	if i< @length-1
		ret = @splice(i, 1, @pop())
		@for_arrays_of(@, (o) -> o.splice(i, 1, o.pop()))
	else
		ret = @splice(i, 1)
		@for_arrays_of(@, (o) -> o.splice(i, 1))

	# Notify the dependent arrays
	@for_arrays_of(@dependent, (o) -> o.on_delParent(i))

	ret


@nodes = new foo
@edges = new foo
edges.a = []
edges.b = []


edges.add("one")
edges.a[0] = 5
edges.b[0] = 7

console.log edges
console.log edges.a, edges.b

edges.add("two", 0)

console.log edges
console.log edges.a, edges.b
