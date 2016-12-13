/*** PRIM ALGORITHM FOR COLACULATING A MINIMUM SPANNING TREE ***/
spAlg.prim = {};

spAlg.prim.initialize = function() {
    spAlg.prim.runtime = {
        stepNumber: 0,
        visitedNodes: [],   // For visulization and to get the neighbors.
        remainingNodes: [], // To check whether all nodes are visited.
        visitedEdges: [],   // To calculate the total distance.
        remainingEdges: []  // To get the neighboring edges.
    };
}

spAlg.prim.prepareFirstStep = function() {
    // Copy all nodes and all edges from the existing graph
    spAlg.prim.runtime.remainingNodes = spAlg.graph.nodes.slice();
    spAlg.prim.runtime.remainingEdges = spAlg.graph.edges.slice();
    
    // Start with the first node from the list.
    // Which node is selected first doesn't matter for the Prim Alogrithm.
    
    // Create a list of visited nodes and add the first node to the list
    spAlg.prim.runtime.visitedNodes.push(spAlg.prim.runtime.remainingNodes[0]);
    
    // Remove the fist node
    spAlg.prim.runtime.remainingNodes.splice(0, 1);
};

spAlg.prim.nextStep = function() {
    if(spAlg.prim.runtime.stepNumber == 0) {
        spAlg.prim.prepareFirstStep();
    }
    
    spAlg.prim.runtime.stepNumber = spAlg.prim.runtime.stepNumber + 1;
    
    // get all edges that can be passed from the existing spanning tree
    var edgeOptions = spAlg.prim.getEdgeOptions();
    
    if(spAlg.prim.runtime.remainingNodes.length == 0) {
        var distance = 0;
        
        $.each(spAlg.prim.runtime.visitedEdges, function(index, edge){
            distance = distance + edge.distance;
        });
    
        alert("Done! The total distance of the minimum spanning tree is: " + distance);
    } else {
        if(edgeOptions.length == 0) {
            alert("No more edges available.");
            return
        }
        
        // Ascending order by distance
        edgeOptions.sort(function(x, y) {
            return x.distance < y.distance ? -1 : x.distance > y.distance ? 1 : 0;
        });
        
        // Get the edge with the lowest distance
        var edgeWithLowestDistance = edgeOptions[0];
        
        // Mark the new node as visited and remove it from the list of remaining nodes
        $.each(spAlg.prim.runtime.remainingNodes.slice(), function(index, node) {
            if(edgeWithLowestDistance.source == node.id
            || edgeWithLowestDistance.target == node.id) {
                spAlg.prim.runtime.remainingNodes.splice(index, 1);
                spAlg.prim.runtime.visitedNodes.push(node);
            }
        });
        
        // Mark the new edge as visited and remove it from the list of remaining edges
        $.each(spAlg.prim.runtime.remainingEdges.slice(), function(index, edge) {
            if(edgeWithLowestDistance.id == edge.id) {
                spAlg.prim.runtime.remainingEdges.splice(index, 1);
                spAlg.prim.runtime.visitedEdges.push(edge);
            }
        });
        
        // Paint the spanning tree and update the graph
        spAlg.visualizeSpanningTree(spAlg.prim.runtime.visitedNodes, spAlg.prim.runtime.visitedEdges);
        spAlg.updateVisualGraph();
    }
};

spAlg.prim.getEdgeOptions = function() {
    var neighboringEdges = [];
    
    $.each(spAlg.prim.runtime.remainingEdges, function(index, edge) {
        var visitedNodesOfCurrentEdge = $.grep(spAlg.prim.runtime.visitedNodes, function(node) {
            return edge.target === node.id || edge.source === node.id;
        });
        
        if(visitedNodesOfCurrentEdge.length == 1) {
            // The source or the target node of this edge is already visited.
            // So this edge is a neighbor of the existing spanning tree.
            neighboringEdges.push(edge);
        }
    });
    
    return neighboringEdges;
};