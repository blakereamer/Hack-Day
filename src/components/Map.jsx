import React, { useState, useEffect } from 'react';
import FlowDiagram from './FlowDiagram';
import HamburgerMenu from './HamburgerMenu';

const Map = ({ nodeData = { nodes: [], edges: [] }, onNodeSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Log nodeData for debugging
  useEffect(() => {
    console.log('Map component received nodeData:', 
      { 
        nodeCount: nodeData?.nodes?.length || 0, 
        edgeCount: nodeData?.edges?.length || 0,
        sampleNodes: nodeData?.nodes?.slice(0, 3) || []
      }
    );
  }, [nodeData]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  return (
    <div className="map-container" style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Black navigation bar */}<div className="nav-bar" style={{ 
        width: '100%', 
        height: '50px', 
        backgroundColor: 'black', 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 10,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0 20px'
      }}>
        {/* Hamburger menu icon */}
        <div 
          className="hamburger-menu" 
          onClick={toggleMenu}
          style={{ 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '30px',
            height: '20px'
          }}
        >
          <div style={{ height: '3px', width: '100%', backgroundColor: 'white', borderRadius: '3px' }}></div>
          <div style={{ height: '3px', width: '100%', backgroundColor: 'white', borderRadius: '3px' }}></div>
          <div style={{ height: '3px', width: '100%', backgroundColor: 'white', borderRadius: '3px' }}></div>        </div>
      </div>      {/* New Hamburger Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={closeMenu} onOpen={openMenu} nodeData={nodeData} />

      {/* Flow diagram with adjusted position to account for the nav bar */}      <div style={{ 
        position: 'absolute', 
        top: '50px', 
        left: 0, 
        right: 0, 
        bottom: 0,
        width: '100%',
        height: 'calc(100vh - 50px)',
        overflow: 'hidden'
      }}>
        <FlowDiagram 
          nodes={nodeData.nodes} 
          edges={nodeData.edges}
          onNodeClick={(event, node) => {
            if (onNodeSelect) {
              onNodeSelect(node);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Map;
