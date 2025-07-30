import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ColumnMapping.css';

function ColumnMapping({ fileInfo, onMappingComplete, onCancel }) {
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [columnMappings, setColumnMappings] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/schemas/');
      setSchemas(response.data.schemas);
      
      // Auto-select first schema if available
      if (response.data.schemas.length > 0) {
        setSelectedSchema(response.data.schemas[0]);
        initializeMapping(response.data.schemas[0]);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
    }
  };

  const initializeMapping = (schema) => {
    const mappings = {};
    
    // Try to auto-match columns by name similarity
    fileInfo.columns.forEach(excelCol => {
      const normalizedExcelCol = excelCol.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const matchedField = schema.fields.find(field => {
        const normalizedFieldName = field.field_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedDisplayName = field.display_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        return normalizedExcelCol.includes(normalizedFieldName) || 
               normalizedFieldName.includes(normalizedExcelCol) ||
               normalizedExcelCol.includes(normalizedDisplayName) ||
               normalizedDisplayName.includes(normalizedExcelCol);
      });
      
      if (matchedField) {
        mappings[excelCol] = matchedField.field_name;
      }
    });
    
    setColumnMappings(mappings);
  };

  const handleSchemaChange = (schemaId) => {
    const schema = schemas.find(s => s.id === parseInt(schemaId));
    setSelectedSchema(schema);
    if (schema) {
      initializeMapping(schema);
    }
  };

  const handleMappingChange = (excelColumn, targetField) => {
    setColumnMappings(prev => ({
      ...prev,
      [excelColumn]: targetField
    }));
  };

  const handleImport = async () => {
    if (!selectedSchema) {
      alert('Please select a schema');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      // We need to get the original file - this would need to be passed from parent
      // For now, we'll call the callback with the mapping data
      
      onMappingComplete({
        schemaId: selectedSchema.id,
        mapping: columnMappings
      });
      
    } catch (error) {
      console.error('Error during import:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMappingStats = () => {
    const mappedCount = Object.keys(columnMappings).length;
    const requiredFields = selectedSchema ? selectedSchema.fields.filter(f => f.is_required) : [];
    const mappedRequiredFields = requiredFields.filter(field => 
      Object.values(columnMappings).includes(field.field_name)
    );
    
    return {
      mappedColumns: mappedCount,
      totalColumns: fileInfo.columns.length,
      requiredFieldsMapped: mappedRequiredFields.length,
      totalRequiredFields: requiredFields.length
    };
  };

  const stats = getMappingStats();

  return (
    <div className="column-mapping">
      <div className="step-header">
        <div className="step-number">2</div>
        <div className="step-info">
          <h2>Column Mapping</h2>
          <p>Map your Excel columns to database fields</p>
        </div>
      </div>
      
      <div className="mapping-header">
        <div className="schema-selector">
          <label>Target Schema:</label>
          <select 
            value={selectedSchema?.id || ''} 
            onChange={(e) => handleSchemaChange(e.target.value)}
          >
            <option value="">Select a schema...</option>
            {schemas.map(schema => (
              <option key={schema.id} value={schema.id}>
                {schema.name} - {schema.description}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mapping-stats">
          <span>Mapped: {stats.mappedColumns}/{stats.totalColumns} columns</span>
          <span>Required fields: {stats.requiredFieldsMapped}/{stats.totalRequiredFields}</span>
        </div>
      </div>

      {selectedSchema && (
        <div className="mapping-table">
          <div className="mapping-header-row">
            <div className="excel-column-header">Excel Column</div>
            <div className="sample-data-header">Sample Data</div>
            <div className="target-field-header">Target Field</div>
            <div className="field-info-header">Field Info</div>
          </div>
          
          {fileInfo.columns.map(excelCol => {
            const sampleData = fileInfo.preview.length > 0 ? 
              fileInfo.preview[0][excelCol] : 'No data';
            const mappedField = columnMappings[excelCol];
            const fieldInfo = selectedSchema.fields.find(f => f.field_name === mappedField);
            
            return (
              <div key={excelCol} className="mapping-row">
                <div className="excel-column">
                  <strong>{excelCol}</strong>
                </div>
                
                <div className="sample-data">
                  {String(sampleData).substring(0, 50)}
                  {String(sampleData).length > 50 ? '...' : ''}
                </div>
                
                <div className="target-field">
                  <select
                    value={mappedField || ''}
                    onChange={(e) => handleMappingChange(excelCol, e.target.value)}
                  >
                    <option value="">-- Skip this column --</option>
                    {selectedSchema.fields.map(field => (
                      <option key={field.field_name} value={field.field_name}>
                        {field.display_name}
                        {field.is_required ? ' *' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="field-info">
                  {fieldInfo && (
                    <span className={`field-type ${fieldInfo.field_type}`}>
                      {fieldInfo.field_type}
                      {fieldInfo.is_required && <span className="required">*</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mapping-actions">
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button 
          onClick={handleImport} 
          disabled={loading || stats.requiredFieldsMapped < stats.totalRequiredFields}
          className="import-btn"
        >
          {loading ? 'Importing...' : 'Import with Mapping'}
        </button>
      </div>
      
      {stats.requiredFieldsMapped < stats.totalRequiredFields && (
        <div className="warning">
          ⚠️ Please map all required fields before importing
        </div>
      )}
    </div>
  );
}

export default ColumnMapping;