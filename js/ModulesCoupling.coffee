'use strict'


# ============================================================================
# 
# User interface
# 
# 

# 
# Configurations constants 
# 
# 
width = 600
height = 500
node_radius = 24

link_distance = 100
link_charge = link_distance*-20 # How strong the nodes push each other away
link_charge_distance = link_distance*5 # Maximal distance where charge works
link_gravity = 0.05
friction = 0.9 # [0..1]

svg_container_id = 'svg_container'



# ============================================================================
# 
# Helper methods
# 
# 

# 
# 2D Vector Methods
# 
vec = {

    create : () -> new Array([0, 0])

    length : (v) -> Math.sqrt(v[0]*v[0] + v[1]*v[1])

    normalize : (v, out) ->
        len = vec.length(v)
        len = 1 / len
        out[0] = v[0] * len
        out[1] = v[1] * len
        out

    orthogonal : (v, out) ->
        out[0] =  v[1]
        out[1] = -v[0]
        out

    scale : (a, rate, out) ->
        out[0] = a[0] * rate
        out[1] = a[1] * rate
        out

    add : (a, b, out) ->
        out[0] = a[0] + b[0]
        out[1] = a[1] + b[1]
        out

    subtract : (a, b, out) ->
        out[0] = a[0] - b[0]
        out[1] = a[1] - b[1]
        out

    copy : (a, out) ->
        out[0] = a[0]
        out[1] = a[1]
        out
}




# 
# Methods to calculate loop, stright and curved lines for links
# 

makeLink = {

    v : [0, 0]
    r : node_radius

    ###*
     * Constants for calculating a loop
    ###
    K : ( () ->
        k = {
            ANGLE_FROM : Math.PI/3
            ANGLE_TO : Math.PI/12
        }
        r = node_radius
        k.DX1 = r * Math.cos(k.ANGLE_FROM)
        k.DY1 = r * Math.sin(k.ANGLE_FROM)
        k.DX2 = r * 4 * Math.cos(k.ANGLE_FROM)
        k.DY2 = r * 4 * Math.sin(k.ANGLE_FROM)
        k.DX3 = r * 4 * Math.cos(k.ANGLE_TO)
        k.DY3 = r * 4 * Math.sin(k.ANGLE_TO)
        k.DX4 = r * Math.cos(k.ANGLE_TO)
        k.DY4 = r * Math.sin(k.ANGLE_TO)
        k.NX = Math.cos(k.ANGLE_FROM - Math.PI/24)
        k.NY = Math.sin(k.ANGLE_FROM - Math.PI/24)
        (name) -> k[name]
        )()


    ###*
     * Calculates coordinates for drawing a loop
     * @param  {[Number, Number]) v A node coordinates
     * @param  {Object) $ Object of faxy.create_edge_data()
     * @return {null}
    ###
    loop : (v, $) ->
        # Normalized vector for the first point
        # Update: it is not normalized. It should be like that the back of the arrow
        # be divided in half by the loop line. Then, it depends on the size of 
        # the arrow at least. Empirically:
        $.norm[0] = -@K('NX')
        $.norm[1] = @K('NY')
        # Some Bazier calc (http://www.moshplant.com/direct-or/bezier/math.html).
        #
        # Coordinates of the baizier curve (60 degrees angle)
        $.v1[0] = v[0] + @K('DX1')
        $.v1[1] = v[1] - @K('DY1')
        #
        $.cv[0] = v[0] + @K('DX2')
        $.cv[1] = v[1] - @K('DY2')
        #
        $.cv[2] = v[0] + @K('DX3') # 15 degrees
        $.cv[3] = v[1] - @K('DY3')
        #
        $.v2[0] = v[0] + @K('DX4')
        $.v2[1] = v[1] - @K('DY4')
        #
        # @arrow($.v1, $.arrow, $.norm)
        # Position of the label
        # x = x1 + 2*r
        # y = y1 - 3*r
        # $.label[0][0] = v[0] + 2*r
        # $.label[0][1] = v[1] - 2.6*r
        null


    curved : (v1, v2, norm, cv) ->
        v = [0, 0]
        # Calc normalized vector
        vec.subtract(v2, v1, v)    # v = v2 - v1
        vec.normalize(v, norm)     # norm = normalized v
        # Control vector
        cv[0] = (v1[0] + v2[0])/2 + norm[1]*30
        cv[1] = (v1[1] + v2[1])/2 - norm[0]*30
        # 'From' vector
        vec.subtract(cv, v1, v)    # v = cv - v1
        vec.normalize(v, v)       # v = normalized v
        vec.scale(v, @r, v)        # v = v * r
        vec.add(v1, v, v1)         # v1 = v1 + v
        # 'To' vector
        vec.subtract(v2, cv, v)    # v = v2 - cv
        vec.normalize(v, v)       # v = normalized v
        vec.scale(v, @r, v)        # v = v * r
        vec.subtract(v2, v, v2)    # v2 = v2 - v
        return

    stright : (v1, v2, norm, cv, subtract=true) ->
        vec.subtract(v2, v1, @v)    # v = v2 - v1
        vec.normalize(@v, norm)     # norm = normalized v
        vec.scale(norm, @r, @v)      # v = norm * r
        vec.add(v1, @v, v1)         # v1 = v1 + v
        vec.subtract(v2, @v, v2) if subtract # v2 = v2 - v
        # Middle of the vector
        cv[0] = (v1[0] + v2[0])/2
        cv[1] = (v1[1] + v2[1])/2
        return

    }


# Graph object to store data for d3.js SVG representation
graph = {
    'nodes' : []
    'links' : []
}


# Checks if a link is already in the graph. Returns the link of null
is_linked = (q, p, ptype) ->
    check_type = q ^ p # check type if it's not a loop
    for link in graph.links
        if check_type
            if (link.source == p) and (link.target == q)
                link.type = 2
                ptype[0] = 2
        return link if (link.source == q) and (link.target == p)
    null


# Returns SVG string for a link curve
getLinkCurve = (d) ->
    v1 = [d.source.x, d.source.y]
    v2 = [d.target.x, d.target.y]
    norm = [0, 0]
    d.cv = [0, 0] if not d.cv?

    if d.type? 
        if d.type == 1 # loop
            $ = {
                v1 : []
                v2 : []
                cv : []
                norm : []
            }
            makeLink.loop([d.source.x, d.source.y], $)
            d.cv[0] = ($.cv[0] + $.cv[2])/2
            d.cv[1] = ($.cv[1] + $.cv[3])/2
            return 'M' + $.v1[0].toFixed(1) + ',' + $.v1[1].toFixed(1) + 
                   'C' + $.cv[0].toFixed(1) + ',' + $.cv[1].toFixed(1) + 
                   ' ' + $.cv[2].toFixed(1) + ',' + $.cv[3].toFixed(1) +
                   ' ' + $.v2[0].toFixed(1) + ',' + $.v2[1].toFixed(1)
        else if d.type == 0 # stright
            makeLink.stright(v1, v2, norm, d.cv)
            return 'M' + v1[0].toFixed(1) + ',' + v1[1].toFixed(1) + 
                   'L' + v2[0].toFixed(1) + ',' + v2[1].toFixed(1)

    makeLink.curved(v1, v2, norm, d.cv)
    return 'M' + v1[0].toFixed(1) + ',' + v1[1].toFixed(1) + 
           'Q' + d.cv[0].toFixed(1) + ',' + d.cv[1].toFixed(1) + 
           ' ' + v2[0].toFixed(1) + ',' + v2[1]



# ============================================================================
# 
# d3.js SVG part
# 
# 

# 
# Good SVG examples:
# https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-force-layout-diagrams
# 
# Description of how it works:
# https://github.com/mbostock/d3/wiki/Force-Layout
# 


update_svg_size = () ->
    div = document.getElementById(svg_container_id)
    width = div.offsetWidth
    height = div.offsetHeight
    return


update_SVG = () ->

    d3.select('#'+svg_container_id).select("svg").remove()

    svg = d3.select('#'+svg_container_id).append('svg')
        .attr('width', '100%')
        .attr('height', '100%')


    update_svg_size()

    if (width==0) or (height==0)
        console.log 'ahtung!'
        return

    force = d3.layout.force()    


    force
        .charge(link_charge)
        .chargeDistance(link_charge_distance)
        .gravity(link_gravity)
        .friction(friction) # range [0,1], 1 is frictioneless
        .size([width, height])
        .nodes(graph.nodes)
        .links(graph.links)
        .start()


    force.on('tick', ()->
        link.attr('d', getLinkCurve)
        node.attr('transform', (d) -> 
            'translate('+ 
            d.x.toFixed(2) + ','+ 
            d.y.toFixed(2) + ')')
        # label.attr('transform', (d) ->  
        #     if d.cv?
        #         'translate('+ 
        #         d.cv[0].toFixed(0) + ','+ 
        #         d.cv[1].toFixed(0) + ')'
        # )
        return
    )


    link = svg.selectAll('.link')
            .data(graph.links)
        # .enter().append('line')
        .enter().append('path')
        # .attr('class', 'link')
            .attr("style", "fill: none; stroke: #000000" )


    node = svg.selectAll('.node')
            .data(graph.nodes)
        .enter().append('g')
            .attr('class', 'node')
            .call(force.drag)


    # Add circle to each node
    node.append('circle')
        .attr('r', node_radius)  
        .attr("style", "fill: gray; stroke: #000000")
        .attr('fill-opacity', '0.5')




    # Add text to each node
    node.append('text')
        # .attr('dy', '0.35em') # shifts text down (should be depended on the font size)
        .text((d)-> d.name)
        .attr('text-anchor', 'middle')
        .attr('y', '4')




    # Browser events

    window.onresize = () ->
        update_svg_size()
        svg.attr('width', width).attr('height', height)
        force.size([width, height]).resume()
        return




set_links = () ->

    for m1, j in DES.modules
        node = {
            name : m1.name
        }
        graph.nodes.push(node)

        for m2, k in DES.modules
            continue if j == k
            continue if not DES.get_common_events(m1, m2).length

            
            for link, index in graph.links
                break if (link.source == j) and (link.target == k)
                break if (link.source == k) and (link.target == j)

            if index == graph.links.length
                console.log j, k
                o = {
                    source : j
                    target : k
                    type : 0
                }
                graph.links.push(o)


    # i = DES.E.size()
    # while i-- >0
    #     # Indexes of modules for each event
    #     modules_ids = DES.E.modules.get(i)
    #     j = modules_ids.length
    #     while j-- >0
    #         k = j
    #         while k-- >0
    #             for link, index in graph.links
    #                 break if (link.source == j) and (link.target == k)
    #             if index == graph.links.length
    #                 o = {
    #                     'source': j
    #                     'target': k
    #                 }
    #                 graph.links.push(o)
    null

set_links()
update_SVG()



# width = 600
# height = 500
# node_radius = 20

# force = d3.layout.force()
#     .charge(-120)
#     .linkDistance(200)
#     .size([width, height])

# svg = d3.select('body').append('svg')
#     .attr('width', width)
#     .attr('height', height)

# # d3.json('modulesJson', (err, graph) ->
# force
#     # .nodes(graph.nodes)
#     .nodes(DES.modules)
#     .links(graph.links)
#     .start()

# link = svg.selectAll('.link')
#     .data(graph.links)
#     .enter().append('line')
#     .attr('class', 'link')
#     .style('stroke-width', (d)-> 2)
#     .style('stroke', (d)-> 'gray')

# node = svg.selectAll('.node')
#     # .data(graph.nodes)
#     .data(DES.modules)
#     .enter().append('circle')
#     .attr('class', 'node')
#     .attr('r', node_radius)  
#     .style('fill', (d)-> 'gray' )
#     .call(force.drag)

# text = svg.selectAll('.node_name')
#     .data(DES.modules)
#     .enter().append('text')
#     .attr('text-anchor', 'middle')
#     .attr('unselectable', 'on')
#     .attr('class', 'unselectable')
#     .text((d)-> d.name)

# node.append('title')    
#     .text((d)-> d.name)

# force.on('tick', ()->
#     link.attr('x1', (d)-> d.source.x )
#         .attr('y1', (d)-> d.source.y )
#         .attr('x2', (d)-> d.target.x )
#         .attr('y2', (d)-> d.target.y )
    
#     node.attr('cx', (d)-> d.x )
#         .attr('cy', (d)-> d.y )

#     text.attr('x', (d)-> d.x|0 )
#         .attr('y', (d)-> (d.y|0)-20 )


#     return
# )
# # )
