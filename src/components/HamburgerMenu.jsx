import React from 'react'

const HamburgerMenu = ({ isOpen, onClose, onOpen }) => {
  return (
    <>
      {/* Slide-out menu */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '25vw', // 1/4 of the page width
          backgroundColor: 'white',
          zIndex: 1001,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
          padding: '20px'
        }}
      >
        {/* Search Section */}
        <div style={{ marginBottom: '30px' }}>
          {/* Search Title */}
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Search
          </h2>
          
          {/* Search Description */}
          <p style={{
            margin: '0 0 15px 0',
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.4'
          }}>
            Search person, product, area
          </p>
          
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Type to search..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
        
        {/* Menu content will go here */}
        
        {/* Close button - positioned relative to menu */}
        {isOpen && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '50%',
              right: '-12px', // Positioned exactly on the right edge of the menu
              transform: 'translateY(-50%)',
              width: '12px',
              height: '40px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderLeft: 'none',
              borderRadius: '0 6px 6px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#666',
              boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
              zIndex: 1002,
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            ◀
          </button>
        )}
      </div>

      {/* Open button - shows only when menu is closed */}
      {!isOpen && (
        <button
          onClick={onOpen}
          style={{
            position: 'fixed',
            top: '50%',
            left: '-10px',
            transform: 'translateY(-50%)',
            width: '12px',
            height: '40px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRight: 'none',
            borderRadius: '6px 0 0 6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666',
            boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
            zIndex: 1002,
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          ▶
        </button>
      )}
    </>
  )
}

export default HamburgerMenu