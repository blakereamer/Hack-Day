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
  
  // Process each record (should be a single record with collections)
  records.forEach((record, recordIndex) => {
    // Debug first record in detail
    if (recordIndex === 0) {
      console.log('First record structure:', JSON.stringify(record).substring(0, 500));
    }
    
    // Each field in _fields is now an array of objects
    if (!record._fields || !Array.isArray(record._fields)) {
      console.warn('Record missing _fields array:', record);
      return;
    }
    
    // Process each field collection
    for (let i = 0; i < record._fields.length; i++) {
      const fieldCollection = record._fields[i];
      
      // Skip if not an array
      if (!Array.isArray(fieldCollection)) {
        console.warn(`Field at index ${i} is not an array:`, fieldCollection);
        continue;
      }
      
      // Process each item in the collection
      fieldCollection.forEach(item => {
        // Check if this item has segments (a path object)
        if (item && typeof item === 'object' && item.segments) {
          processPath(item);
        }
      });
    }
  });
  
  // Process a path object
  function processPath(path) {
    if (!path.segments || !Array.isArray(path.segments)) {
      console.warn('Path missing segments array:', path);
      return;
    }
    
    // Process each segment in the path
    path.segments.forEach(segment => {
      const { start, relationship, end } = segment;
      
      if (!start || !end) {
        return;
      }
      
      processNode(start);
      processNode(end);
      
      // Add edge if we have a relationship
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
  
  // Process and add a node if not already added
  function processNode(node) {
    if (node && node.elementId && !uniqueNodesMap[node.elementId]) {
      const nodePosition = calculatePosition(Object.keys(uniqueNodesMap).length);
      
      const newNode = {
        id: node.elementId,
        type: 'circle',
        position: nodePosition,
        data: { 
          label: node.properties?.name || 'Unnamed Node',
          category: node.labels && node.labels.length > 0 ? node.labels[0] : 'Unknown',
          alias: node.properties?.alias || '',
          description: node.properties?.desc || '',
          radius: 100,
          properties: node.properties || {}
        }
      };
      
      uniqueNodesMap[node.elementId] = newNode;
    }
  }
  
  // Convert the object of unique nodes to an array
  const nodesArray = Object.values(uniqueNodesMap);
  
  console.log(`Processed ${nodesArray.length} nodes and ${edges.length} edges from API data`);
  
  if (nodesArray.length === 0) {
    console.error("Failed to extract any nodes from the API response!");
    if (records.length > 0 && records[0]._fields.length > 0) {
      console.log("First field collection size:", records[0]._fields[0]?.length || 0);
      console.log("First item sample:", JSON.stringify(records[0]._fields[0]?.[0]).substring(0, 500));
    }
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
    const getAllNodes = `${baseUrl}api/get-home-optimized`;
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
            // Try to adapt the data structure if possible
            if (data.records) {
              data = { res: { records: data.records } };
            } else if (Array.isArray(data)) {
              data = { res: { records: [{ _fields: [data] }] } };
            } else {
              throw new Error('Unable to find records in API response');
            }
          }
          
          // Log structure for debugging
          console.log('API structure:', {
            hasMessage: !!data.message,
            hasRes: !!data.res,
            hasRecords: !!data.res?.records,
            recordsCount: data.res?.records?.length || 0,
            firstRecordStructure: data.res?.records?.length > 0 ? 
              `Contains ${data.res.records[0]._fields?.length || 0} field collections` : 'No records'
          });
          
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
