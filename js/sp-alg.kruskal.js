
spAlg.kruskal = {};

spAlg.kruskal.initialize = function() {
    spAlg.kruskal.runtime = {
        stepNumber: 0,
        visitedNodes: [],
        visitedEdges: [],
        remainingEdges: [],
        existingPathsNodeIds: []
    };
}

spAlg.kruskal.prepareFirstStep = function() {
    spAlg.kruskal.runtime.remainingEdges = spAlg.graph.edges.slice();
};

spAlg.kruskal.nextStep = function() {
    if(spAlg.kruskal.runtime.stepNumber == 0) {
        spAlg.kruskal.prepareFirstStep();
    }
    
    spAlg.kruskal.runtime.stepNumber = spAlg.kruskal.runtime.stepNumber + 1;
    
    if(spAlg.kruskal.runtime.visitedNodes.length == spAlg.graph.nodes.length) {
        var distance = 0;
        
        $.each(spAlg.kruskal.runtime.visitedEdges, function(index, edge){
            distance = distance + edge.distance;
        });
    
        alert("Done! The total distance of the minimum spanning tree is: " + distance);
    } else {    
        // Order the remaining edges ascending by distance
        spAlg.kruskal.runtime.remainingEdges.sort(function(x, y) {
            return x.distance < y.distance ? -1 : x.distance > y.distance ? 1 : 0;
        });
        
        var isPathWithoutCircle = false;
        
        // Continue until a path without a circle is found.
        while(isPathWithoutCircle == false) {
            // Get the shortest edge and remove it from the list of remaining edges.
            var shortestEdge = spAlg.kruskal.runtime.remainingEdges.splice(0, 1)[0];
            
            // Check whether the edge would create a circle. If not add it to the spanning tree. 
            isPathWithoutCircle = spAlg.kruskal.processEdge(shortestEdge) == false;
            
            if(isPathWithoutCircle == false) {
                alert("The nodes '" + shortestEdge.source + "' and '" + shortestEdge.target 
                    + "' can not be connected. " + "This would create a circle. Continue...");
            }
        }
        
        // Paint the spanning tree and update the graph
        spAlg.visualizeSpanningTree(spAlg.kruskal.runtime.visitedNodes, spAlg.kruskal.runtime.visitedEdges);
        spAlg.updateVisualGraph();
    }
};

spAlg.kruskal.processEdge = function(shortestEdge) {
    var isCreatingCircle = false;
    var sourceNodePathIndex = -1;
    var targetNodePathIndex = -1;

    // Find the paths the source and the target node of this edge are part of.
    // A node can only be part of none or one path.
    $.each(spAlg.kruskal.runtime.existingPathsNodeIds, function(index, path) {
        var sourceNodeIndex = path.indexOf(shortestEdge.source);
        var targetNodeIndex = path.indexOf(shortestEdge.target);
        
        if(sourceNodeIndex != -1) sourceNodePathIndex = index;
        if(targetNodeIndex != -1) targetNodePathIndex = index;
    });
    
    if(sourceNodePathIndex == -1 && targetNodePathIndex == -1) {
        // Neither the source and the target node are part of a path.
        // Create a new path that contains both nodes.
        var newPath = [ shortestEdge.source, shortestEdge.target ];
        spAlg.kruskal.runtime.existingPathsNodeIds.push(newPath);
        
        // Add the nodes to the list of visited nodes
        spAlg.kruskal.addVisitedNodeById(shortestEdge.source);
        spAlg.kruskal.addVisitedNodeById(shortestEdge.target);
    } else if(sourceNodePathIndex == targetNodePathIndex) {
        // Both nodes are part of the same path.
        // Connecting these two nodes would create a circle.
        isCreatingCircle = true;
        
        // do nothing further
    } else if(sourceNodePathIndex != -1 && targetNodePathIndex != -1) {
        // Both nodes are part of two different existing paths.
        // The paths must be connected.
        
        // Get the path of the source node and remove it from the list of existing paths. 
        var sourcePath = spAlg.kruskal.runtime.existingPathsNodeIds.splice(sourceNodePathIndex, 1)[0];
        
        // Get the path of the target node and remove it from the list of existing paths.
        var targetPath = spAlg.kruskal.runtime.existingPathsNodeIds.splice(targetNodePathIndex, 1)[0];
        
        // Connect the two paths.
        var newPath = sourcePath.concat(targetPath);
        
        // Add the new path to the list of existing paths.
        spAlg.kruskal.runtime.existingPathsNodeIds.push(newPath);
    } else if(targetNodePathIndex != -1) {
        // The source node isn't part of a path yet. But the target node is.
        // Add it to the same path as the target node.
        spAlg.kruskal.runtime.existingPathsNodeIds[targetNodePathIndex].push(shortestEdge.source);
        
        // Add the node to the list of visited nodes
        spAlg.kruskal.addVisitedNodeById(shortestEdge.source);
    } else if(sourceNodePathIndex != -1) {
        // The target node isn't part of a path yet. But the source node is.
        // Add it to the same path as the source node.
        spAlg.kruskal.runtime.existingPathsNodeIds[sourceNodePathIndex].push(shortestEdge.target);
        
        // Add the node to the list of visited nodes
        spAlg.kruskal.addVisitedNodeById(shortestEdge.target);
    }
    
    if(isCreatingCircle == false) {
        spAlg.kruskal.runtime.visitedEdges.push(shortestEdge);
    }
    
    return isCreatingCircle;
};

spAlg.kruskal.addVisitedNodeById = function(id) {
    // Search the node
    var newNode = $.grep(spAlg.graph.nodes, function(node) {
        return node.id === id;
    })[0];
    
    spAlg.kruskal.runtime.visitedNodes.push(newNode);
};