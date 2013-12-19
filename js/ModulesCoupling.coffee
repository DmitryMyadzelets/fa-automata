
# 
# 
# D3.js forse-directed graph
# 
# 
# 

graph = {
    # 'nodes' : [
    #     {'name':'A'}
    #     {'name':'B'}
    # ]
    'links' : [
        # {'source':0, 'target':1 }
    ]
}


set_links = () ->
    i = DES.E.size()
    while i-- >0
        # Indexes of modules for each event
        modules_ids = DES.E.modules.get(i)
        j = modules_ids.length
        while j-- >0
            k = j
            while k-- >0
                for link, index in graph.links
                    break if (link.source == j) and (link.target == k)
                if index == graph.links.length
                    o = {
                        'source': j
                        'target': k
                    }
                    graph.links.push(o)
    null

set_links()



width = 800
height = 500
node_radius = 15

force = d3.layout.force()
    .charge(-120)
    .linkDistance(200)
    .size([width, height])

svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)

# d3.json('modulesJson', (err, graph) ->
force
    # .nodes(graph.nodes)
    .nodes(DES.modules)
    .links(graph.links)
    .start()

link = svg.selectAll('.link')
    .data(graph.links)
    .enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', (d)-> 2)
    .style('stroke', (d)-> 'gray')

node = svg.selectAll('.node')
    # .data(graph.nodes)
    .data(DES.modules)
    .enter().append('circle')
    .attr('class', 'node')
    .attr('r', node_radius)  
    .style('fill', (d)-> 'red' )
    .call(force.drag)

text = svg.selectAll('.node_name')
    .data(DES.modules)
    .enter().append('text')
    .attr('text-anchor', 'middle')
    .attr('unselectable', 'on')
    .attr('class', 'unselectable')
    .text((d)-> d.name)

node.append('title')    
    .text((d)-> d.name)

force.on('tick', ()->
    link.attr('x1', (d)-> d.source.x )
        .attr('y1', (d)-> d.source.y )
        .attr('x2', (d)-> d.target.x )
        .attr('y2', (d)-> d.target.y )
    
    node.attr('cx', (d)-> d.x )
        .attr('cy', (d)-> d.y )

    text.attr('x', (d)-> d.x|0 )
        .attr('y', (d)-> (d.y|0)-20 )


    return
)
# )
