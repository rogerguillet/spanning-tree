/*** DECLARE THE APP AND THE RUNTIME VARIABLES ***/

var spAlg = {
    // The instance of the sigma graph
    sigmaInstance: null,

    // The input data for rendering the graph
    graphJsonData: null,

    // The data of the graph
    graph: {
          nodes: [],
          edges: []
    },
};

/*** LOAD GRAPH DATA ***/
    
// Load the places from a JSON source
// On an environment with a server the json data should be loaded from an external file by using $.getJSON(...)
spAlg.graphJsonData = '[ { "id":"Genf", "label":"Genf", "x":0, "y":0, "size":1, "color":"#00F"}, { "id":"Basel", "label":"Basel", "x":110, "y":149, "size":1, "color":"#00F"}, { "id":"Bern", "label":"Bern", "x":99, "y":82, "size":1, "color":"#00F"}, { "id":"Zürich", "label":"Zürich", "x":183, "y":130, "size":1, "color":"#00F"}, { "id":"Luzern", "label":"Luzern", "x":167, "y":94, "size":1, "color":"#00F"}, { "id":"Zug", "label":"Zug", "x":182, "y":107, "size":1, "color":"#00F"} ]';

/*** HELPER FUNCTIONS ***/

// Loops through all the given nodes and creates an edge to each other node in the list (if not already exists).
spAlg.getEdgesBetweenAllNodes = function(listOfNodes) {
    var i, j, sourceNode, targetNode, distance;

    var listOfEdges = [];
    
    for(i = 0; i < listOfNodes.length; i++) {
        sourceNode = listOfNodes[i];

        for(j = i+1; j < listOfNodes.length; j++) {
            targetNode = listOfNodes[j];
            
            distance = spAlg.calculateDistance(sourceNode, targetNode);
            
            listOfEdges.push({id: sourceNode.id + targetNode.id, source: sourceNode.id, target: targetNode.id, distance: distance, label: 'd: ' + distance, size: Math.random(), type: 'curve', color: '#999', hover_color: '#000'});
        }
    }
    
    return listOfEdges;
};

spAlg.updateDistances = function() {
    $.each(spAlg.graph.edges, function(index, edge) {
        var sourceNode = $.grep(spAlg.graph.nodes, function(node) {
            return edge.source === node.id;
        });
        var targetNode = $.grep(spAlg.graph.nodes, function(node) {
            return edge.target === node.id;
        });
        
        var distance = spAlg.calculateDistance(sourceNode[0], targetNode[0]);
        
        spAlg.graph.edges[index].label = 'd: ' + distance;
        spAlg.graph.edges[index].distance = distance;
    });
}

// Calculates the distance between two nodes by using the x and y coordinates.
// The result is rounded to an integer.
spAlg.calculateDistance = function(nodeOne, nodeTwo) {
    var distance = Math.sqrt(
        Math.pow((nodeOne.x - nodeTwo.x), 2)
        +
        Math.pow((nodeOne.y - nodeTwo.y), 2)
    );
    
    distance = Math.round(distance);
    
    return distance;
};

spAlg.updateVisualGraph = function() {
    spAlg.sigmaInstance.graph.clear();
    spAlg.sigmaInstance.graph.read(spAlg.graph);
    spAlg.sigmaInstance.refresh();
};



/*** INITIALIZE GRAPH ***/

spAlg.initialize = function() {
    // Clear
    spAlg.graph = {
          nodes: [],
          edges: []
    };
    
    $('#graph').remove(); 
    $('#graph-container').html('<div id="graph"></div>'); 

    // Load the graph from JSON data
    spAlg.graph.nodes = $.parseJSON(spAlg.graphJsonData);
    spAlg.graph.edges = spAlg.getEdgesBetweenAllNodes(spAlg.graph.nodes);

    // Instantiate sigma:
    spAlg.sigmaInstance = new sigma({
      renderer: {
        container: document.getElementById('graph'),
        type: 'canvas'
      },
      settings: {
        edgeLabelSize: 'fixed',
        edgeLabelSizePowRatio: 20,
        edgeLabelThreshold: 0,
        labelThreshold: 0,
        defaultLabelSize: 26,
        defaultEdgeLabelSize: 20,
        enableEdgeHovering: true,
        edgeHoverColor: 'edge',
        defaultEdgeHoverColor: '#000'
      }
    });
    
    spAlg.sigmaInstance.camera.goTo({ ratio: 1.05});

    spAlg.updateVisualGraph();
    
    // Initialize the algorithms
    
    if(spAlg.prim !== undefined
    && typeof spAlg.prim.initialize === "function") {
        spAlg.prim.initialize();
    }
    
    if(spAlg.kruskal !== undefined
    && typeof spAlg.kruskal.initialize === "function") {
        spAlg.kruskal.initialize();
    }
    
    
    // Handle clicking an edge
    
    spAlg.sigmaInstance.bind("clickEdge", function (e) { 
        var selectedEdge = e.data.edge;
        
        spAlg.graph.edges = $.grep(spAlg.graph.edges, function(edge) {
            return selectedEdge.id != edge.id;
        });
        
        spAlg.updateVisualGraph();
    });
    
    // Handle drag&drop of nodes

    // Initialize the dragNodes plugin:
    var dragListener = sigma.plugins.dragNodes(spAlg.sigmaInstance, spAlg.sigmaInstance.renderers[0]);

    dragListener.bind('drop', function(event) {
      var draggedNode = event.data.node;
      
      // update node coordinates
      for(var i = 0; i < spAlg.graph.nodes.length; i++) {
        if(spAlg.graph.nodes[i].id === draggedNode.id) {
            spAlg.graph.nodes[i].x = draggedNode.x;
            spAlg.graph.nodes[i].y = draggedNode.y;
        }
      }
      
      spAlg.updateDistances();
      spAlg.updateVisualGraph();
    });

};