import React, { useState } from 'react';
import axios from 'axios';
import './CreateTableOption.css';

function CreateTableOption({ fileInfo, onTableCreated, onCancel }) {
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [previewFields, setPreviewFields] = useState([]);

  // Generate preview of fields that will be created
  React.useEffect(() => {
    if (fileInfo) {
      const fields = fileInfo.columns.map((col, index) => {
        // Get column name from enhanced or legacy format
        const colName = typeof col === 'object' ? col.name : col;
        // Clean column name for database field
        const fieldName = colName.toLowerCase()
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '') || `field_${index + 1}`;
        
        // Guess field type from sample data
        let fieldType = 'text';
        const previewData = fileInfo.preview_data || fileInfo.preview || [];
        if (previewData.length > 0) {
          const sampleValue = previewData[0][colName];
          if (typeof sampleValue === 'number') {
            fieldType = 'number';
          } else if (typeof sampleValue === 'string' && sampleValue.includes('@')) {
            fieldType = 'email';
          }
        }
        
        return {
          originalName: colName,
          fieldName: fieldName,
          displayName: colName,
          fieldType: fieldType
        };
      });
      
      setPreviewFields(fields);
      
      // Auto-generate table name from filename
      if (!tableName && fileInfo.filename) {
        const baseName = fileInfo.filename
          .replace(/\.[^/.]+$/, '') // Remove extension
          .toLowerCase()
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        setTableName(baseName);
      }
    }
  }, [fileInfo, tableName]);

  const handleCreateTable = async () => {
    if (!tableName.trim()) {
      alert('Please enter a table name');
      return;
    }

    setCreating(true);

    try {
      const formData = new FormData();
      // We need to recreate the file from fileInfo - this is a limitation
      // In a real implementation, we'd pass the original file
      
      // For now, let's call the parent with the table info
      onTableCreated({
        tableName: tableName.trim(),
        tableDescription: tableDescription.trim(),
        fields: previewFields
      });
      
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Error creating table. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="create-table-option">
      <div className="step-header">
        <div className="step-number">2</div>
        <div className="step-info">
          <h2>Create New Table</h2>
          <p>Create a new database table based on your Excel file structure</p>
        </div>
      </div>
      
      <div className="table-config">
        <div className="config-row">
          <label>Table Name:</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name (e.g., my_data)"
            className="table-name-input"
          />
        </div>
        
        <div className="config-row">
          <label>Description:</label>
          <input
            type="text"
            value={tableDescription}
            onChange={(e) => setTableDescription(e.target.value)}
            placeholder="Optional description"
            className="table-description-input"
          />
        </div>
      </div>

      <div className="field-preview">
        <h4>Fields that will be created:</h4>
        <div className="field-list">
          {previewFields.map((field, index) => (
            <div key={index} className="field-item">
              <div className="field-original">{field.originalName}</div>
              <div className="field-arrow">→</div>
              <div className="field-name">{field.fieldName}</div>
              <div className={`field-type ${field.fieldType}`}>
                {field.fieldType}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="create-actions">
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button 
          onClick={handleCreateTable} 
          disabled={creating || !tableName.trim()}
          className="create-btn"
        >
          {creating ? 'Creating Table...' : 'Create Table & Import'}
        </button>
      </div>
      
      <div className="create-info">
        <p><strong>Note:</strong> This will create a new database table with the structure based on your Excel columns.</p>
        <p>Field names will be automatically cleaned (lowercase, underscores for spaces).</p>
      </div>
    </div>
  );
}

export default CreateTableOption;