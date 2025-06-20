import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

// Expanded color scheme for different node types
const colors = {
  "Department": "#ff0000",
  "Area": "#ff8020",
  "Suite": "#f0c000",
  "Team": "#3bbb6b",
  "Product": "#35b5f0",
  "Person": "#a848ff",
  "Application": "#FFA500",
  "Service": "#8B4513",
  "Database": "#4682B4",
  "Server": "#2F4F4F",
  "Component": "#FF7F50",
  "Unknown": "#888888" // Fallback color
};

const CircleNode = ({ data, isConnectable }) => {
  const label = data?.label || 'Unknown';
  const category = data?.category || 'Unknown';
  const alias = data?.alias || '';
  const radius = (() => {
    // Calculate radius based on category, with a default value
    switch (category) {
      case 'Department':
        return 275;
      case 'Area':
        return 225;
      case 'Suite':
        return 150;
      case 'Team':
        return 125;
      case 'Product':
        return 100;
      case 'Person':
        return 75;
      default:
        return 75; // Fallback radius for unknown categories
    }
  })();
  //data?.radius || 75;
  
  // Determine node color based on category, with fallback to Unknown
  const bgColor = colors[category] || colors.Unknown;
  
  // Truncate long labels
  const truncateLabel = (text, maxLength = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <div
      style={{
        background: bgColor,
        color: 'white',
        borderRadius: '50%', // Make it a circle
        width: radius,
        height: radius,
        padding: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '12px',
        textAlign: 'center',
        wordBreak: 'break-word',
        overflow: 'hidden'
      }}
    >
      <div style={{ marginBottom: '4px' }}>
        {truncateLabel(label)}
      </div>
      
      {alias && (
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.8,
          fontWeight: 'normal'
        }}>
          {truncateLabel(alias, 15)}
        </div>
      )}
      
      <div style={{ 
        fontSize: '9px',
        marginTop: '2px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '1px 4px',
        borderRadius: '4px',
        maxWidth: '90%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {category}
      </div>
      
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          width: '1px', 
          height: '1px',
          top: '50%'
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          width: '1px', 
          height: '1px',
          bottom: '50%'
        }}
      />
    </div>
  );
};

export default memo(CircleNode);
