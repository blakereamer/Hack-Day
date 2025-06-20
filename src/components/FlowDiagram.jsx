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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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
      setNodes(initialNodes);
    }
    
    if (propEdges?.length) {
      console.log(`Setting ${propEdges.length} edges from props`);
      setEdges(propEdges);
    } else {
      console.warn('No propEdges received, using initialEdges');
      setEdges(initialEdges);
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
      }))).id(d => d.index).distance(100).strength(0.9)) // Significantly increased distance, reduced strength
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
    console.log('Filtering nodes:', { 
      totalNodes: nodes.length, 
      activeCategories: Array.from(activeCategories), 
      searchText 
    });
    
    const filtered = nodes.filter(node => {
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
    
    console.log('Filtered nodes result:', { 
      filteredCount: filtered.length, 
      sampleFiltered: filtered.slice(0, 2) 
    });
    
    return filtered;
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
    preventScrolling: true, // Allow browser scrolling when over the canvas
  };

  return (
    <>
      <style>
        {`
          .react-flow__controls {
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
          }
          
          .react-flow__controls-button {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            color: #374151 !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            width: 40px !important;
            height: 40px !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s ease !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .react-flow__controls-button:hover {
            background: rgba(255, 255, 255, 1) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
          }
          
          .react-flow__controls-button:disabled {
            background: rgba(255, 255, 255, 0.5) !important;
            color: #9ca3af !important;
            cursor: not-allowed !important;
          }
          
          .react-flow__controls-button svg {
            width: 16px !important;
            height: 16px !important;
          }
        `}
      </style>
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
        defaultViewport={{x:650,y:350,zoom:0.1}}
        defaultEdgeOptions={{
          type: 'straight'
        }}
        
      >
        {/* Controls Panel */}
        <Panel position="top-right" style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          padding: '16px', 
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '220px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{ 
              cursor: 'pointer',
              padding: '10px 16px',
              borderRadius: '8px', 
              background: physicsEnabled 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #9097a0 0%, #606770 100%)',
              border: 'none',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: physicsEnabled 
                ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                : '0 4px 15px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(0)',
              letterSpacing: '0.5px',
              outline: 'none'
            }} 
            onClick={() => setPhysicsEnabled(!physicsEnabled)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
              {physicsEnabled ? '🧲 Physics Enabled' : '🧲 Physics Disabled'}
            </button>
            
            <button style={{ 
              cursor: 'pointer',
              padding: '10px 16px',
              borderRadius: '8px', 
              background: anchorEnabled 
                ? 'linear-gradient(135deg, #7d52a9 0%, #667eea 100%)' 
                : 'linear-gradient(135deg, #606770 0%, #9097a0 100%)',
              border: 'none',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: anchorEnabled 
                ? '0 4px 15px rgba(102, 126, 234, 0.3)' 
                : '0 4px 15px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(0)',
              letterSpacing: '0.5px',
              outline: 'none'
            }}
            onClick={() => setAnchorEnabled(!anchorEnabled)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
              {anchorEnabled ? '📌 Anchor Enabled' : '📌 Anchor Disabled'}
            </button>
          </div>
          
          <div style={{ marginTop: '4px' }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '8px', 
              color: '#374151',
              fontSize: '14px',
              letterSpacing: '0.5px'
            }}>Search</div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search nodes..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '12px',
                color: '#9ca3af',
                fontSize: '16px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                height: '20px'
              }}>
                🔍
              </div>
            </div>
          </div>
          
          {nodeFilters.categories && nodeFilters.categories.size > 0 && (
            <div>
              <div style={{ 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#374151',
                fontSize: '14px',
                letterSpacing: '0.5px'
              }}>Filter by Category</div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {Array.from(nodeFilters.categories).map(category => (
                  <button 
                    key={category}
                    style={{ 
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: activeCategories.has(category) 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(255, 255, 255, 0.8)',
                      color: activeCategories.has(category) ? 'white' : '#374151',
                      border: activeCategories.has(category) 
                        ? 'none' 
                        : '2px solid #e5e7eb',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: activeCategories.has(category) 
                        ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                        : '0 2px 4px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(0)',
                      textAlign: 'left',
                      letterSpacing: '0.3px',
                      outline: 'none'
                    }}
                    onClick={() => toggleCategoryFilter(category)}
                    onMouseEnter={(e) => {
                      if (!activeCategories.has(category)) {
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.borderColor = '#667eea';
                      }
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      if (!activeCategories.has(category)) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.borderColor = '#e5e7eb';
                      }
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Panel>
        
        <Controls 
          showZoom={true} 
          showFitView={true} 
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
    </>
  );
};

export default FlowDiagram;
