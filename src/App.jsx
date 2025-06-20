import React, { useState, useEffect } from 'react'
import './App.css'
import Map from './components/Map'
import NodeInfoBox from './components/NodeInfoBox'

const baseUrl = "http://localhost:3000/";
//172.29.173.92

// Function to transform Neo4j API data into ReactFlow format
const transformApiResponseToFlowFormat = (apiData) => {
  console.log('Starting transformation of API data');

  // Initialize arrays for nodes and edges
  const nodes = [];
  const edges = [];
  const formBOutput = []; // Array to store Form B output

  // Track unique nodes by ID to avoid duplicates
  const uniqueNodesMap = {};

  // Return empty data if API response is not in the expected format
  if (!apiData || !apiData.res || !apiData.res.records) {
    console.warn('API data not in expected format:', apiData);
    return { nodes, edges, formBOutput };
  }

  // Process Neo4j records
  const records = apiData.res.records;
  console.log(`Processing ${records.length} records from API response`);

  // Process each record
  records.forEach((record) => {
    record._fields.forEach((field) => {
      if (field && typeof field === 'object' && Array.isArray(field.segments)) {
        field.segments.forEach((segment) => {
          const { start, relationship, end } = segment;

          if (start && relationship && end) {
            // Add to Form B output
            const formBEntry = `(:${start.labels[0]} ${JSON.stringify(start.properties).replace(/"([^"]+)":/g, '$1:')})-[:${relationship.type} ${JSON.stringify(relationship.properties).replace(/"([^"]+)":/g, '$1:')}]->(:${end.labels[0]} ${JSON.stringify(end.properties).replace(/"([^"]+)":/g, '$1:')})`;
            formBOutput.push(formBEntry);

            // Process start node
            if (!uniqueNodesMap[start.elementId]) {
              const nodePosition = calculatePosition(Object.keys(uniqueNodesMap).length);
              uniqueNodesMap[start.elementId] = {
                id: start.elementId,
                type: 'circle',
                position: nodePosition,
                data: {
                  label: start.properties?.name || 'Unnamed Node',
                  category: start.labels[0] || 'Unknown',
                  alias: start.properties?.alias || '',
                  description: start.properties?.desc || '',
                  radius: 100,
                  properties: start.properties || {},
                },
              };
            }

            // Process end node
            if (!uniqueNodesMap[end.elementId]) {
              const nodePosition = calculatePosition(Object.keys(uniqueNodesMap).length);
              uniqueNodesMap[end.elementId] = {
                id: end.elementId,
                type: 'circle',
                position: nodePosition,
                data: {
                  label: end.properties?.name || 'Unnamed Node',
                  category: end.labels[0] || 'Unknown',
                  alias: end.properties?.alias || '',
                  description: end.properties?.desc || '',
                  radius: 100,
                  properties: end.properties || {},
                },
              };
            }

            // Add edge
            const edgeId = `e-${start.elementId}-${end.elementId}-${relationship.elementId}`;
            if (!edges.some((e) => e.id === edgeId)) {
              edges.push({
                id: edgeId,
                source: start.elementId,
                target: end.elementId,
                data: {
                  type: relationship.type || '',
                  properties: relationship.properties || {},
                },
              });
            }
          }
        });
      }
    });
  });

  // Convert the object of unique nodes to an array
  const nodesArray = Object.values(uniqueNodesMap);

  console.log(`Processed ${nodesArray.length} nodes and ${edges.length} edges from API data`);
  console.log('Form B Output:', formBOutput);

  return { nodes: nodesArray, edges, formBOutput };
};

// Helper function to calculate node positions in a grid layout
const calculatePosition = (index) => {
  const rowSize = 40; // nodes per row
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
        position={{ top: '70px', left: '20px' }}
        data={selectedNode.data}
      />
    )}
     
    <div 
      className="App" 
      style={{ 
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
      }}
      onClick={(e) => {
        // Close NodeInfoBox when clicking on the background
        // Only close if clicking on the ReactFlow pane background (not on nodes, controls, etc.)
        if (e.target.classList.contains('react-flow__pane') || 
            e.target.classList.contains('react-flow__renderer')) {
          setSelectedNode(null);
        }
      }}
    >
      <Map 
        nodeData={nodeData} 
        onNodeSelect={setSelectedNode}
      />
    </div>
    </>
  )
}

export default App
