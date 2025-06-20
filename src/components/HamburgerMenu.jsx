import React, { useState, useEffect } from 'react'

const HamburgerMenu = ({ isOpen, onClose, onOpen, nodeData }) => {
  // State for cascading dropdowns
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hierarchyData, setHierarchyData] = useState({
    departments: [],
    areas: [],
    suites: [],
    teams: [],
    products: [],
    people: []
  });

  // Process nodeData to create hierarchy
  useEffect(() => {
    if (!nodeData || !nodeData.nodes) return;

    const processedData = {
      departments: [],
      areas: [],
      suites: [],
      teams: [],
      products: [],
      people: []
    };

    // Group nodes by category
    nodeData.nodes.forEach(node => {
      const category = node.data?.category?.toLowerCase();
      const item = {
        id: node.id,
        name: node.data?.label || 'Unknown',
        alias: node.data?.alias || '',
        description: node.data?.description || '',
        properties: node.data?.properties || {}
      };

      switch(category) {
        case 'department':
          processedData.departments.push(item);
          break;
        case 'area':
          processedData.areas.push(item);
          break;
        case 'suite':
          processedData.suites.push(item);
          break;
        case 'team':
          processedData.teams.push(item);
          break;
        case 'product':
          processedData.products.push(item);
          break;
        case 'person':
          processedData.people.push(item);
          break;
        default:
          break;
      }
    });

    setHierarchyData(processedData);
  }, [nodeData]);

  // Reset selections when level changes
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setSelectedArea(null);
    setSelectedSuite(null);
    setSelectedTeam(null);
    setSelectedProduct(null);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setSelectedSuite(null);
    setSelectedTeam(null);
    setSelectedProduct(null);
  };

  const handleSuiteSelect = (suite) => {
    setSelectedSuite(suite);
    setSelectedTeam(null);
    setSelectedProduct(null);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setSelectedProduct(null);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedDepartment(null);
    setSelectedArea(null);
    setSelectedSuite(null);
    setSelectedTeam(null);
    setSelectedProduct(null);
  };

  // Dropdown component
  const DropdownSection = ({ title, items, selectedItem, onSelect, disabled = false }) => (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: disabled ? '#999' : '#333'
      }}>
        {title}
      </h3>
      <select
        value={selectedItem?.id || ''}
        onChange={(e) => {
          const selected = items.find(item => item.id === e.target.value);
          onSelect(selected || null);
        }}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '2px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: disabled ? '#f5f5f5' : 'white',
          color: disabled ? '#999' : '#333',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'border-color 0.2s ease'
        }}
        onFocus={(e) => !disabled && (e.target.style.borderColor = '#007bff')}
        onBlur={(e) => !disabled && (e.target.style.borderColor = '#ddd')}
      >
        <option value="">-- Select {title} --</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>
            {item.name} {item.alias && `(${item.alias})`}
          </option>
        ))}
      </select>
    </div>
  );

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
      >        {/* Navigation Section */}
        <div style={{ marginBottom: '30px' }}>
          {/* Navigation Title */}
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Navigate
          </h2>
          
          {/* Navigation Description */}
          <p style={{
            margin: '0 0 15px 0',
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.4'
          }}>
            Browse by department, area, suite, team, product, and people
          </p>

          {/* Clear Selections Button */}
          <button
            onClick={clearSelections}
            style={{
              padding: '6px 12px',
              marginBottom: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa',
              color: '#666',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          >
            Clear All
          </button>

          {/* Cascading Dropdowns */}
          <DropdownSection
            title="Department"
            items={hierarchyData.departments}
            selectedItem={selectedDepartment}
            onSelect={handleDepartmentSelect}
          />

          <DropdownSection
            title="Area"
            items={hierarchyData.areas}
            selectedItem={selectedArea}
            onSelect={handleAreaSelect}
            disabled={!selectedDepartment}
          />

          <DropdownSection
            title="Suite"
            items={hierarchyData.suites}
            selectedItem={selectedSuite}
            onSelect={handleSuiteSelect}
            disabled={!selectedArea}
          />

          <DropdownSection
            title="Team"
            items={hierarchyData.teams}
            selectedItem={selectedTeam}
            onSelect={handleTeamSelect}
            disabled={!selectedSuite}
          />

          <DropdownSection
            title="Product"
            items={hierarchyData.products}
            selectedItem={selectedProduct}
            onSelect={handleProductSelect}
            disabled={!selectedTeam}
          />

          {/* People Section */}
          {selectedProduct && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333'
              }}>
                People
              </h3>
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '8px'
              }}>
                {hierarchyData.people.length > 0 ? (
                  hierarchyData.people.map(person => (
                    <div
                      key={person.id}
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #eee',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '500' }}>{person.name}</div>
                      {person.alias && <div style={{ fontSize: '12px', color: '#666' }}>{person.alias}</div>}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '8px', color: '#999', fontSize: '14px' }}>
                    No people found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          {(selectedDepartment || selectedArea || selectedSuite || selectedTeam || selectedProduct) && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#666'
            }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>Current Path:</div>
              <div>
                {selectedDepartment?.name}
                {selectedArea && ` → ${selectedArea.name}`}
                {selectedSuite && ` → ${selectedSuite.name}`}
                {selectedTeam && ` → ${selectedTeam.name}`}
                {selectedProduct && ` → ${selectedProduct.name}`}
              </div>
            </div>
          )}
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