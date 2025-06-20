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
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 1001,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '24px'
        }}
      >
        {/* Search Section */}
        <div style={{ marginBottom: '32px' }}>
          {/* Search Title */}
          <h2 style={{
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.5px'
          }}>
            Search
          </h2>
          
          {/* Search Description */}
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Search person, product, area
          </p>
          
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Type to search..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.9)',
                transition: 'all 0.3s ease'
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
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '16px',
              pointerEvents: 'none'
            }}>
              🔍
            </div>
          </div>
        </div>
        
        {/* Menu content will go here */}
        
        {/* Close button - positioned relative to menu */}
        
        {isOpen && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '50%',
              right: '-16px',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderLeft: 'none',
              borderRadius: '0 12px 12px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#374151',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              zIndex: 1002,
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 1)';
              e.target.style.transform = 'translateY(-50%) translateX(2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.95)';
              e.target.style.transform = 'translateY(-50%) translateX(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
          >
            ◀
          </button>
        )}
      </div>
    </>
  )
}

export default HamburgerMenu