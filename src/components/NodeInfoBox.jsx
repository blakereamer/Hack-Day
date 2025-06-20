import React from 'react'

// Color scheme matching CircleNode colors
const colors = {
  "Department": "#ff0000",
  "Area": "#f06010",
  "Suite": "#f0c000",
  "Team": "#008030",
  "Product": "#0080e0",
  "Person": "#6000ff",
  "Application": "#FFA500",
  "Service": "#8B4513",
  "Database": "#4682B4",
  "Server": "#2F4F4F",
  "Component": "#FF7F50",
  "Unknown": "#888888" // Fallback color
};

// Function to create gradient based on category color
const getCategoryGradient = (category) => {
  const baseColor = colors[category] || colors.Unknown;
  // Create a lighter version for gradient
  const lighterColor = adjustColorBrightness(baseColor, 40);
  return `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 100%)`;
};

// Function to lighten a hex color
const adjustColorBrightness = (hex, percent) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// Function to determine text color based on background brightness
const getTextColor = (category) => {
  const baseColor = colors[category] || colors.Unknown;
  
  // Special handling for specific categories that should always use white text
  if (category === 'Team' || category === 'Product' || category === 'Department' || category === 'Person') {
    return '#ffffff';
  }
  
  // Simple brightness calculation for other categories
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180 ? '#000000' : '#ffffff'; // Adjusted threshold from 128 to 180
};

const NodeInfoBox = (props) => {
  const { 
    title, 
    description, 
    category, 
    people, 
    position = { top: '20px', left: '20px' },
    data = {}  // Node data from selection
  } = props;
  
  // Get properties from node data if available
  const properties = data?.properties || {};
  
  return (
    <div style={{
      position: "absolute",
      zIndex: 9999,
      backgroundColor: '#e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: '15px 20px',
      minWidth: '250px',
      maxWidth: '350px',
      ...position,
      border: '1px solid #e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}
    onClick={(e) => e.stopPropagation()} // Prevent clicks inside the box from closing it
    >

      <h2 style={{
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '18px',
        fontWeight: '600'
      }}>{title || 'Title'}</h2>

      <div style={{
        background: getCategoryGradient(category),
        padding: '8px 12px',
        borderRadius: '8px',
        marginBottom: '12px',
        display: 'inline-block',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <h3 style={{
          margin: '0',
          color: getTextColor(category),
          fontSize: '14px',
          fontWeight: '600',
          textShadow: getTextColor(category) === '#ffffff' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
        }}>{category || 'Category'}</h3>
      </div>

      {data?.alias && (
        <div style={{
          color: '#555',
          fontSize: '14px',
          lineHeight: '1.4',
          marginBottom: '12px',
          fontStyle: 'italic'
        }}>
          {data.alias}
        </div>
      )}

      {(description && description !== 'No description available') && (
        <div style={{
          color: '#555',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '15px',
          borderTop: '1px solid #ddd',
          paddingTop: '10px'
        }}>
          {description}
        </div>
      )}
        {/* Display additional properties if present */}
      {properties && Object.keys(properties).length > 0 && (
        <div style={{ 
          marginTop: '15px',
          borderTop: '1px solid #0f',
          paddingTop: '10px'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#333',
            fontSize: '15px',
            fontWeight: '500'
          }}>Properties</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '13px'
          }}>
            {Object.entries(properties)
              .filter(([key, value]) => {
                // Skip rendering certain complex properties and avoid duplicate alias and description
                if (key === 'start' || key === 'end' || key === 'alias' || key === 'description' || key === 'desc' || value === null || value === undefined) {
                  return false;
                }
                // Skip deprecated field if it's empty string or falsy (but allow explicit false)
                if (key === 'deprecated' && (value === '' || (value !== false && !value))) {
                  return false;
                }
                return true;
              })
              .map(([key, value], filteredIndex, filteredArray) => {
              // Handle Neo4j low/high format
              let displayValue = value;
              if (value && typeof value === 'object' && 'low' in value && 'high' in value) {
                displayValue = value.low.toString();
              } else if (typeof value === 'object') {
                try {
                  displayValue = JSON.stringify(value).substring(0, 50);
                  if (displayValue.length === 50) displayValue += '...';
                } catch {
                  displayValue = '[Complex Object]';
                }
              } else if (typeof value === 'boolean') {
                displayValue = value.toString();
              }
              
              const isLastOddItem = filteredArray.length % 2 === 1 && filteredIndex === filteredArray.length - 1;
              
              return (
                <div key={key} style={{
                  gridColumn: isLastOddItem ? '1 / -1' : 'auto',
                  textAlign: 'center'
                }}>
                  <span style={{ fontWeight: '500', marginRight: '5px' }}>{key}:</span>
                  <span>{displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {people && (
        <div style={{ 
          marginTop: '15px',
          borderTop: '1px solid #ddd',
          paddingTop: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#333',
            fontSize: '15px',
            fontWeight: '500'
          }}>People</h3>
          <div style={{ fontSize: '14px' }}>{people}</div>
        </div>
      )}
    </div>
  )
}

export default NodeInfoBox