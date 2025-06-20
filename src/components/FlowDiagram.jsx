import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from 'd3-force';

import CircleNode from './CircleNode';

// Define custom node types
const nodeTypes = {
  circle: CircleNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'circle',
    position: { x: 250, y: 100 },
    data: { label: 'Enterprise Technology', category: 'Department', radius: 100 },
  },
  {
    id: '2',
    type: 'circle',
    position: { x: 100, y: 300 },
    data: { label: 'P&C Auto/Fire', category: 'Area', radius: 100 },
  },
  {
    id: '3',
    type: 'circle',
    position: { x: 400, y: 300 },
    data: { label: 'Data & Platform Engineering', category: 'Area', radius: 100 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];


const FlowDiagram = ({ nodes: propNodes, edges: propEdges, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(propNodes?.length ? propNodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(propEdges?.length ? propEdges : initialEdges);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [anchorEnabled, setAnchorEnabled] = useState(true);
  
  // New states for filtering
  const [nodeFilters, setNodeFilters] = useState({
    categories: new Set(),
    searchText: ''
  });
  
  // Debug log for props
  useEffect(() => {
    console.log('FlowDiagram received props:', {
      propNodesLength: propNodes?.length || 0,
      propEdgesLength: propEdges?.length || 0,
      initialNodesLength: initialNodes.length,
      samplePropNodes: propNodes?.slice(0, 2) || []
    });
  }, [propNodes, propEdges]);
  
  // Update nodes and edges when props change
  useEffect(() => {
    if (propNodes?.length) {
      console.log(`Setting ${propNodes.length} nodes from props`);
      setNodes(propNodes);
      
      // Extract all node categories for filters
      const categories = new Set();
      propNodes.forEach(node => {
        if (node.data?.category) {
          categories.add(node.data.category);
        }
      });
      setNodeFilters(prev => ({...prev, categories}));
    } else {
      console.warn('No propNodes received, using initialNodes');
    }
    
    if (propEdges?.length) {
      console.log(`Setting ${propEdges.length} edges from props`);
      setEdges(propEdges);
    } else {
      console.warn('No propEdges received, using initialEdges');
    }
  }, [propNodes, propEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  // Physics simulation reference
  const simulationRef = useRef(null);
  
  // Force-directed layout with physics
  useEffect(() => {
    if (!nodes.length || !physicsEnabled) return;
    
    // Stop any existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    
    // Find central/anchor node (using the first node by default)
    const anchorNodeId = nodes[0]?.id;
    
    // Configure the physics simulation
    const simulation = forceSimulation()
      .nodes(nodes.map(node => ({
        ...node,
        x: node.position.x,
        y: node.position.y,
        // Fix the anchor node in place at the center if anchor is enabled
        fx: anchorEnabled && node.id === anchorNodeId ? window.innerWidth / 2 : undefined,
        fy: anchorEnabled && node.id === anchorNodeId ? window.innerHeight / 2 : undefined
      })))
      .force('charge', forceManyBody().strength(-5000)) // Significantly increased repulsion between nodes
      .force('center', forceCenter(window.innerWidth / 2, window.innerHeight / 2).strength(0.02)) // Further reduced center attraction
      .force('collision', forceCollide().radius(node => 200).strength(0.9)) // Increased collision radius and strength
      .force('link', forceLink(edges.map(edge => ({ 
        source: nodes.findIndex(node => node.id === edge.source),
        target: nodes.findIndex(node => node.id === edge.target)
      }))).id(d => d.index).distance(500).strength(0.2)) // Significantly increased distance, reduced strength
      .alphaDecay(0.008) // Slightly slowed cooling to allow nodes to find better positions
      .on('tick', () => {
        // Update node positions on each tick
        setNodes(currentNodes => 
          currentNodes.map((node, i) => {
            const simNode = simulation.nodes()[i];
            if (!simNode) return node;
            
            return {
              ...node,
              position: {
                x: simNode.x,
                y: simNode.y
              }
            };
          })
        );
      });
    
    // Store the simulation reference
    simulationRef.current = simulation;
    
    // Clean up
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodes.length, edges, physicsEnabled, anchorEnabled, setNodes]);
  
  // Filter nodes based on category and search text
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Skip filtering if no filters are active
      if (activeCategories.size === 0 && !searchText.trim()) {
        return true;
      }
      
      // Filter by category if categories are selected
      const categoryMatch = activeCategories.size === 0 || 
        activeCategories.has(node.data?.category || 'Unknown');
      
      // Filter by search text
      const searchMatch = !searchText.trim() || 
        node.data?.label?.toLowerCase().includes(searchText.toLowerCase()) ||
        node.data?.alias?.toLowerCase().includes(searchText.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }, [nodes, activeCategories, searchText]);
  
  // Filter edges to only include those connecting visible nodes
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(node => node.id));
    
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);
  
  // Toggle category filter
  const toggleCategoryFilter = (category) => {
    setActiveCategories(prev => {
      const newCategories = new Set(prev);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return newCategories;
    });
  };
  
  // Define zoom configuration for extreme zoom levels
  const zoomConfig = {
    minZoom: 0.05, // Allow zooming out much further (default is 0.5)
    maxZoom: 4,    // Allow zooming in 4x (default is 2)
    translateExtent: [[-100000, -100000], [100000, 100000]], // Allow panning in a much larger area
    preventScrolling: false, // Allow browser scrolling when over the canvas
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      overflow: 'hidden'
    }}>
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        minZoom={zoomConfig.minZoom}
        maxZoom={zoomConfig.maxZoom}
        translateExtent={zoomConfig.translateExtent}
        preventScrolling={zoomConfig.preventScrolling}
        fitView
      >
        {/* Controls Panel */}
        <Panel position="top-right" style={{ 
          background: 'white', 
          padding: '10px', 
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>
            <div style={{ 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px', 
              background: physicsEnabled ? '#e6f7ff' : '#f0f0f0',
              border: `1px solid ${physicsEnabled ? '#91d5ff' : '#d9d9d9'}`,
              marginBottom: '5px'
            }} 
            onClick={() => setPhysicsEnabled(!physicsEnabled)}>
              {physicsEnabled ? '🧲 Physics: ON' : '🧲 Physics: OFF'}
            </div>
            
            <div style={{ 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px', 
              background: anchorEnabled ? '#e6f7ff' : '#f0f0f0',
              border: `1px solid ${anchorEnabled ? '#91d5ff' : '#d9d9d9'}`
            }}
            onClick={() => setAnchorEnabled(!anchorEnabled)}>
              {anchorEnabled ? '📌 Anchor: ON' : '📌 Anchor: OFF'}
            </div>
          </div>
          
          <div style={{ marginTop: '5px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Search</div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search nodes..."
              style={{
                width: '100%',
                padding: '5px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                marginBottom: '10px'
              }}
            />
          </div>
          
          {nodeFilters.categories && nodeFilters.categories.size > 0 && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Filter by Category</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '200px', overflowY: 'auto' }}>
                {Array.from(nodeFilters.categories).map(category => (
                  <div 
                    key={category}
                    style={{ 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: activeCategories.has(category) ? '#e6f7ff' : '#f0f0f0',
                      border: `1px solid ${activeCategories.has(category) ? '#91d5ff' : '#d9d9d9'}`,
                      fontSize: '12px'
                    }}
                    onClick={() => toggleCategoryFilter(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
        
        <Controls showZoom={true} showFitView={true} />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default FlowDiagram;
