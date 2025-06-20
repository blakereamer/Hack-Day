import React, { useState, useEffect } from 'react'
import './App.css'
import Map from './components/map'
import NodeInfoBox from './components/NodeinfoBox'

const baseUrl = "http://172.29.173.92:3000/";

// Function to transform Neo4j API data into ReactFlow format
const transformApiResponseToFlowFormat = (apiData) => {
  console.log('Starting transformation of API data');
  
  // Initialize arrays for nodes and edges
  const nodes = [];
  const edges = [];
  
  // Track unique nodes by ID to avoid duplicates
  const uniqueNodesMap = {}; // Using a plain object instead of Map to avoid conflicts
  
  // Return empty data if API response is not in the expected format
  if (!apiData || !apiData.res || !apiData.res.records) {
    console.warn('API data not in expected format:', apiData);
    return { nodes, edges };
  }
  
  // Process Neo4j records
  const records = apiData.res.records;
  console.log(`Processing ${records.length} records from API response`);
  
  // Process each record
  records.forEach((record, recordIndex) => {
    // Debug first record in detail
    if (recordIndex === 0) {
      console.log('First record structure:', JSON.stringify(record).substring(0, 500));
    }
    
    // Process each field in the record that might be a path object
    for (let i = 0; i < record._fields.length; i++) {
      const field = record._fields[i];
      
      // Check if this field is a path object with segments
      if (field && typeof field === 'object') {
        // For direct segments array
        if (Array.isArray(field.segments)) {
          processSegments(field.segments);
        } 
        // For nested objects that might contain segments
        else if (field.start && field.end && field.segments) {
          processSegments(field.segments);
        }
      }
    }
  });
  
  function processSegments(segments) {
    segments.forEach(segment => {
      const { start, relationship, end } = segment;
      
      if (!start || !end) {
        return;
      }
      
      // Process start node
      if (start && start.elementId && !uniqueNodesMap[start.elementId]) {
        const nodePosition = calculatePosition(Object.keys(uniqueNodesMap).length);
        
        const newNode = {
          id: start.elementId,
          type: 'circle',
          position: nodePosition,
          data: { 
            label: start.properties?.name || 'Unnamed Node',
            category: start.labels && start.labels.length > 0 ? start.labels[0] : 'Unknown',
            alias: start.properties?.alias || '',
            description: start.properties?.desc || '',
            radius: 100,
            properties: start.properties || {}
          }
        };
        
        uniqueNodesMap[start.elementId] = newNode;
      }
      
      // Process end node
      if (end && end.elementId && !uniqueNodesMap[end.elementId]) {
        const nodePosition = calculatePosition(Object.keys(uniqueNodesMap).length);
        
        const newNode = {
          id: end.elementId,
          type: 'circle',
          position: nodePosition,
          data: { 
            label: end.properties?.name || 'Unnamed Node',
            category: end.labels && end.labels.length > 0 ? end.labels[0] : 'Unknown',
            alias: end.properties?.alias || '',
            description: end.properties?.desc || '',
            radius: 100,
            properties: end.properties || {}
          }
        };
        
        uniqueNodesMap[end.elementId] = newNode;
      }
      
      // Add edge
      if (relationship && relationship.elementId && start.elementId && end.elementId) {
        const edgeId = `e-${start.elementId}-${end.elementId}-${relationship.elementId}`;
        
        // Check if this edge already exists
        const edgeExists = edges.some(e => e.id === edgeId);
        
        if (!edgeExists) {
          edges.push({
            id: edgeId,
            source: start.elementId,
            target: end.elementId,
            label: relationship.type || '',
            data: {
              type: relationship.type || '',
              properties: relationship.properties || {}
            }
          });
        }
      }
    });
  }
  
  
  // Convert the object of unique nodes to an array
  const nodesArray = Object.values(uniqueNodesMap);
  
  console.log(`Processed ${nodesArray.length} nodes and ${edges.length} edges from API data`);
  
  if (nodesArray.length === 0) {
    console.error("Failed to extract any nodes from the API response!");
    console.log("API Records structure:", JSON.stringify(apiData.res.records[0]).substring(0, 1000));
  } else {
    console.log("Sample nodes:", nodesArray.slice(0, 2));
    console.log("Sample edges:", edges.slice(0, 2));
  }
  
  return { nodes: nodesArray, edges };
};

// Helper function to calculate node positions in a grid layout
const calculatePosition = (index) => {
  const rowSize = 20; // nodes per row
  const xPos = 200 + (index % rowSize) * 250;
  const yPos = 100 + Math.floor(index / rowSize) * 250;
  return { x: xPos, y: yPos };
};

// Default data to use if API fails
const initialNodes = [
  {
    id: '1',
    type: 'circle',
    position: { x: 250, y: 100 },
    data: { label: 'Default Node 1', category: 'Default', radius: 100 },
  },
  {
    id: '2',
    type: 'circle',
    position: { x: 100, y: 300 },
    data: { label: 'Default Node 2', category: 'Default', radius: 100 },
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' }
];

function App() {
  const [nodeData, setNodeData] = useState({ nodes: initialNodes, edges: initialEdges });
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => { 
    const getAllNodes = `${baseUrl}api/get-home-screen`;
    console.log("Fetching from:", getAllNodes);
    
    fetch(getAllNodes)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched data:", data);
        try {
          // Handle the case where the API might return { success: false } or similar
          if (!data || (data.hasOwnProperty('success') && !data.success)) {
            throw new Error('Invalid API response format');
          }
          
          // Check if we have the expected structure
          if (!data.message || !data.res || !data.res.records) {
            console.warn('API response missing expected structure:', data);
            // Try to use data directly if message/res structure is absent
            if (data.records) {
              data = { res: { records: data.records } };
            } else {
              throw new Error('Unable to find records in API response');
            }
          }
          
          const transformedData = transformApiResponseToFlowFormat(data);
          console.log("Transformed data:", transformedData);
          
          if (transformedData.nodes.length === 0) {
            console.warn("No nodes found in transformed data, using default nodes");
            setNodeData({ nodes: initialNodes, edges: initialEdges });
          } else {
            console.log(`Setting node data with ${transformedData.nodes.length} nodes and ${transformedData.edges.length} edges`);
            setNodeData(transformedData);
          }
        } catch (err) {
          console.error("Error transforming data:", err);
          // Use default data if transformation fails
          setNodeData({ nodes: initialNodes, edges: initialEdges });
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        // Use default data if fetch fails
        setNodeData({ nodes: initialNodes, edges: initialEdges });
      });
  }, [])

  return (
    <>
    {selectedNode && (
      <NodeInfoBox 
        title={selectedNode.data?.label || 'Node Details'} 
        category={selectedNode.data?.category || 'Unknown Type'}
        description={selectedNode.data?.description || 'No description available'}
        position={{ top: '70px', right: '20px' }}
        data={selectedNode.data}
      />
    )}
     
    <div className="App" style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <Map 
        nodeData={nodeData} 
        onNodeSelect={setSelectedNode}
      />
    </div>
    </>
  )
}

export default App
