
	###
	# Spring-electrical Model (SEM)
	Input :
		G = (V, E) - araph, (V,E) are sets of vertices and edges.
		X - set of coordinates of vertices for each i in V.
		tol - tolerance?
	Force_Directed_Algorithm (G, X, tol)

		Converged = false
		Step = initial step length
		Energy = Infinity
		
		while Converged is false
			X0 = X
			Energy0 = Energy
			Energy = 0
			
			for i in V
				f = 0
				for e=(i,j) in E when e.i is i
					f += f_a(i,j)*(xj - xi)/distance(xj - xi)
				for j in V
					f += f_r(i,j)*(xj - xi)/distance(xj - xi)
				xi 		+= step * (f/|f|) wtf?
				Energy 	+= |f|*|f|

			step = update_step_length(step, Energy, Energy0)
			if |X - X0| < (K * tol)
				Converged = true
		return X
	###
	# 
	# The algorithm is based on the article:
	# [1] http://www.mathematica-journal.com/issue/v10i1/graph_draw.html
	# 
	FDA : (G, X, Y) ->
		title = "Done in"
		console.time(title)

		converged = false
		K = 100
		C = 0.2
		CKK = C*K*K
		CKKK = C*K*K*K
		step = K / 10
		progress = 0
		energy = Number.MAX_VALUE
		FX = []
		FY = []
		iteration = 0


		while not converged
			++iteration
			energy0 = energy
			energy = 0
			X0 = X.slice(0)
			Y0 = Y.slice(0)

			(FX[i] = FY[i] = 0) for v, i in G.nodes.v

			# We iterate over all vertices
			for v, i in G.nodes.v
				# Get in/out vetices to 'i'
				J = digraph.nodes.out(G, i).concat digraph.nodes.in(G, i)
				fx = 0
				fy = 0
				# Enumerate all adjacent vertices (skip self-loop)
				for u, j in G.nodes.v when j isnt i
					# Vector from i to j = j-i
					dx = X[j] - X[i]
					dy = Y[j] - Y[i]
					# Trick if coordinates overlappe
					if dx == 0 and dy == 0
						dx = dy = Math.random()
					# Square of the length = |i->j|^2
					dl2 = dx*dx + dy*dy
					# Length of i->j
					dl = Math.sqrt(dl2)
					# Atractive force
					# _fa = dl^2/K
					if j in J
						fx += dx * (dl / K)
						fy += dy * (dl / K)
					# Repulsive force
					# _fr = -C * K^2/ dl
					# _fr = -C * K^3 / dl^2
					fx += dx * (-CKK / dl2)
					fy += dy * (-CKK / dl2)

				FX[i] = fx
				FY[i] = fy
				# energy += Math.sqrt(fx*fx + fy*fy)
				energy += (fx*fx + fy*fy)
			
			# Update of the step, refined "cooling schedule" from [1]
			if energy < energy0
				if ++progress >= 5
					progress = 0
					step /= 0.9
			else
				progress = 0
				step *= 0.9
			de = energy0 - energy
			# de = Math.sqrt(de*de)
			de *= de
			# Combined forces on vertices
			sumFX = 0
			sumFY = 0
			for fx, i in FX
				fy = FY[i]
				sumFX += Math.sqrt(fx*fx) 
				sumFY += Math.sqrt(fy*fy) 
			# Update coordinates
			for x, i in X
				(X[i] += step * FX[i]/sumFX) if sumFX > 0
				(Y[i] += step * FY[i]/sumFY) if sumFY > 0

			# Debug info
			# sx = []
			# sx.push(v.toFixed(2)) for v in X
			# console.log "X:", sx, energy.toFixed(2), de.toFixed(2)

			# Decision if we have done
			# sumXY = 0
			# for x, i in X
			# 	dx = X0[i]-X[i]
			# 	dy = Y0[i]-Y[i]
			# 	dl2 = dx*dx + dy*dy
			# 	sumXY += Math.sqrt(dl2)
			# console.log sumXY
			console.log de
			converged = (iteration >= 100) or (de < (K*0.01))
			# converged = (de < (K*0.01))

		# console.log "X:", JSON.stringify(X)
		console.log "Converged in", iteration, "steps"
		console.timeEnd(title)
		null