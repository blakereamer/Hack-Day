import React from 'react'

const NodeInfoBox = (props) => {
  const { 
    title, 
    description, 
    category, 
    people, 
    position = { top: '20px', right: '20px' },
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
    }}>

      <h2 style={{
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '18px',
        fontWeight: '600'
      }}>{title || 'Title'}</h2>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '5px 10px',
        borderRadius: '8px',
        marginBottom: '12px',
        display: 'inline-block'
      }}>
        <h3 style={{
          margin: '0',
          color: '#555',
          fontSize: '14px',
          fontWeight: '500'
        }}>{category || 'Category'}</h3>
      </div>

      {data?.alias && (
        <div style={{
          marginBottom: '12px',
        }}>
          <span style={{ 
            fontWeight: '500',
            fontSize: '14px',
            color: '#555' 
          }}>Alias: </span>
          <span style={{ fontSize: '14px' }}>{data.alias}</span>
        </div>
      )}

      <div style={{
        color: '#555',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '15px',
        borderTop: '1px solid #ddd',
        paddingTop: '10px'
      }}>
        {description || 'No description available'}
      </div>
        {/* Display additional properties if present */}
      {properties && Object.keys(properties).length > 0 && (
        <div style={{ 
          marginTop: '15px',
          borderTop: '1px solid #ddd',
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
            {Object.entries(properties).map(([key, value]) => {
              // Skip rendering certain complex properties
              if (key === 'start' || key === 'end' || value === null || value === undefined) {
                return null;
              }
              
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
              }
              
              return (
                <div key={key}>
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
          paddingTop: '10px'
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