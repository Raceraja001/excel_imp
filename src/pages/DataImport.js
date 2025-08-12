import React, { useState, useRef } from 'react';
import ColumnMapping from '../ColumnMapping';
import CreateTableOption from '../CreateTableOption';
import DataValidator from '../DataValidator';
import EnhancedPreview from '../EnhancedPreview';
import './DataImport.css';

const DataImport = () => {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // upload, quick, mapping, table, validate, results
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setImportResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/upload-excel/', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFileInfo(data);
        setActiveTab('quick'); // Auto-switch to quick import tab
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to analyze file');
      }
    } catch (err) {
      setError('Failed to analyze file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/import-data/', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setImportResult(data);
        setActiveTab('results'); // Auto-switch to results tab
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Import failed');
      }
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileInfo(null);
    setImportResult(null);
    setError(null);
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="data-import">
      {!file ? (
        /* Upload Section */
        <div className="upload-section">
          <div className="card upload-card">
            <div className="card-header">
              <h2 className="card-title">Upload Excel File</h2>
              <p className="card-subtitle">
                Select or drag & drop your Excel file to begin the import process
              </p>
            </div>
            <div className="card-body">
              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-content">
                  <div className="upload-icon">📁</div>
                  <h3>Drop your Excel file here</h3>
                  <p>or click to browse files</p>
                  <div className="supported-formats">
                    <span className="format-tag">.xlsx</span>
                    <span className="format-tag">.xls</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* File Processing Section */
        <div className="processing-section">
          <div className="file-info-card card">
            <div className="card-header">
              <h2 className="card-title">File Analysis</h2>
              <button className="btn btn-secondary btn-sm" onClick={resetForm}>
                🔄 Upload Different File
              </button>
            </div>
            <div className="card-body">
              <div className="file-details">
                <div className="file-icon">📄</div>
                <div className="file-meta">
                  <h3 className="file-name">{file.name}</h3>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing file structure...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <div className="error-content">
                    <h4>Analysis Failed</h4>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {fileInfo && (
                <div className="analysis-results">
                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-label">Rows</span>
                      <span className="stat-value">
                        {fileInfo.rows?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Columns</span>
                      <span className="stat-value">
                        {fileInfo.columns?.length || 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Type</span>
                      <span className="stat-value">Excel</span>
                    </div>
                  </div>

                  {fileInfo.columns && (
                    <div className="columns-section">
                      <h4>Detected Columns</h4>
                      <div className="columns-grid">
                        {fileInfo.columns.map((col, index) => (
                          <div key={index} className="column-item">
                            <span className="column-name">
                              {typeof col === 'object' ? col.name : col}
                            </span>
                            <span className="column-type">
                              {typeof col === 'object' ? col.type || 'Text' : 'Text'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="import-options-section">
                    <h4>Import Options</h4>
                    <div className="import-methods">
                      <div className="import-method-card primary">
                        <div className="method-icon">⚡</div>
                        <div className="method-content">
                          <h5>Quick Import</h5>
                          <p>Fast import with automatic detection</p>
                          <button 
                            className="btn btn-primary btn-lg"
                            onClick={handleImport}
                            disabled={importing}
                          >
                            {importing ? (
                              <>
                                <div className="spinner"></div>
                                Importing...
                              </>
                            ) : (
                              <>
                                🚀 Start Import
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="import-method-card">
                        <div className="method-icon">🎯</div>
                        <div className="method-content">
                          <h5>Column Mapping</h5>
                          <p>Map columns to existing schemas</p>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setActiveImportMethod('mapping')}
                          >
                            Configure Mapping
                          </button>
                        </div>
                      </div>

                      <div className="import-method-card">
                        <div className="method-icon">🏗️</div>
                        <div className="method-content">
                          <h5>Create Table</h5>
                          <p>Generate new table from data</p>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setActiveImportMethod('table')}
                          >
                            Create & Import
                          </button>
                        </div>
                      </div>

                      <div className="import-method-card">
                        <div className="method-icon">🔍</div>
                        <div className="method-content">
                          <h5>Quality Check</h5>
                          <p>Validate data before import</p>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setActiveImportMethod('validate')}
                          >
                            Analyze Quality
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Import Methods */}
          {activeImportMethod !== 'quick' && fileInfo && (
            <div className="advanced-method-card card">
              <div className="card-header">
                <h2 className="card-title">
                  {activeImportMethod === 'mapping' && '🎯 Column Mapping'}
                  {activeImportMethod === 'table' && '🏗️ Create Table'}
                  {activeImportMethod === 'validate' && '🔍 Data Quality Analysis'}
                </h2>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setActiveImportMethod('quick')}
                >
                  ← Back to Quick Import
                </button>
              </div>
              <div className="card-body">
                {activeImportMethod === 'mapping' && (
                  <ColumnMapping
                    fileInfo={fileInfo}
                    onMappingComplete={(result) => {
                      setImportResult(result);
                      setActiveImportMethod('quick');
                    }}
                    onCancel={() => setActiveImportMethod('quick')}
                  />
                )}
                
                {activeImportMethod === 'table' && (
                  <CreateTableOption
                    fileInfo={fileInfo}
                    onTableCreated={(result) => {
                      setImportResult(result);
                      setActiveImportMethod('quick');
                    }}
                    onCancel={() => setActiveImportMethod('quick')}
                  />
                )}
                
                {activeImportMethod === 'validate' && (
                  <DataValidator
                    fileInfo={fileInfo}
                    onValidationComplete={(results) => {
                      console.log('Validation results:', results);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="result-card card">
              <div className="card-header">
                <h2 className="card-title">Import Complete</h2>
                <p className="card-subtitle">Your data has been successfully imported</p>
              </div>
              <div className="card-body">
                <div className="success-content">
                  <div className="success-icon">✅</div>
                  <div className="success-details">
                    <h3>Import Successful!</h3>
                    <p>{importResult.message}</p>
                  </div>
                </div>

                <div className="result-stats">
                  <div className="result-stat">
                    <span className="result-label">Session ID</span>
                    <span className="result-value">
                      {importResult.session_id?.substring(0, 8)}...
                    </span>
                  </div>
                  {importResult.imported_rows && (
                    <div className="result-stat">
                      <span className="result-label">Records Imported</span>
                      <span className="result-value">
                        {importResult.imported_rows.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {importResult.processing_time && (
                    <div className="result-stat">
                      <span className="result-label">Processing Time</span>
                      <span className="result-value">{importResult.processing_time}</span>
                    </div>
                  )}
                </div>

                <div className="result-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowPreview(true)}
                  >
                    👁️ View Data
                  </button>
                  <button className="btn btn-secondary">
                    📥 Export CSV
                  </button>
                  <button className="btn btn-secondary" onClick={resetForm}>
                    🔄 Import Another File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Preview Modal */}
      {showPreview && importResult && (
        <EnhancedPreview
          sessionId={importResult.session_id}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default DataImport;