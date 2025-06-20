import React, { useState } from 'react';

const PersonSearchBar = ({ onSearch, onClose, isLoading: externalIsLoading }) => {
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!person1 || !person2) {
      alert('Please enter both names/aliases');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (onSearch) {
        await onSearch(person1, person2);
      }
    } catch (error) {
      console.error('Error searching for connection:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  // Use external isLoading state if provided
  const loading = externalIsLoading !== undefined ? externalIsLoading : isLoading;

  return (
    <div 
      className="person-search"
      style={{
        position: 'absolute', 
        top: '60px', 
        right: '20px',
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        minWidth: '280px',
        border: '1px solid #eaeaea'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Find Connection</h3>
        <button 
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            opacity: 0.6,
            padding: '0 5px',
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSearch}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#666' }}>
            First person
          </label>
          <input 
            type="text"
            placeholder="Enter name or alias"
            value={person1}
            onChange={(e) => setPerson1(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#666' }}>
            Second person
          </label>
          <input 
            type="text"
            placeholder="Enter name or alias"
            value={person2}
            onChange={(e) => setPerson2(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#b3c9e6' : '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? '🔄 Searching...' : '🔍 Find Connection'}
        </button>
      </form>
    </div>
  );
};

export default PersonSearchBar;
