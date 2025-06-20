import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

// Expanded color scheme for different node types
const colors = {
  "Department": "#ff0072",
  "Area": "#0041d0",
  "Suite": "#800080",
  "Team": "#00ff00",
  "Product": "#0000ff",
  "Person": "#ff00ff",
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
  const radius = data?.radius || 75;
  const alias = data?.alias || '';
  
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
        style={{ background: '#fff', width: '10px', height: '10px' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable}
        style={{ background: '#fff', width: '10px', height: '10px' }}
      />
    </div>
  );
};

export default memo(CircleNode);
