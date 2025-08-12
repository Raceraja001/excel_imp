import React, { useState, useRef } from 'react';
import axios from 'axios';
import EnhancedPreview from './EnhancedPreview';
import DataValidator from './DataValidator';
import './ModernDataApp.css';

function ModernDataApp() {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showValidator, setShowValidator] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:8000/upload-excel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFileInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze file');
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

      const response = await axios.post('http://localhost:8000/import-data/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (!importResult?.session_id) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/export-csv/${importResult.session_id}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${importResult.session_id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Export failed');
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
    <div className="modern-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">📊</div>
            <h1>DataFlow</h1>
            <span className="tagline">Modern Data Import & Analysis</span>
          </div>
          <div className="header-actions">
            {fileInfo && (
              <button 
                className="header-btn secondary"
                onClick={() => setShowValidator(true)}
              >
                🔍 Quality Check
              </button>
            )}
            {importResult && (
              <>
                <button 
                  className="header-btn secondary"
                  onClick={() => setShowPreview(true)}
                >
                  👁️ Preview Data
                </button>
                <button 
                  className="header-btn primary"
                  onClick={handleExport}
                >
                  📥 Export CSV
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!file ? (
          /* Upload Zone */
          <div className="upload-section">
            <div 
              className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📁</div>
              <h2>Drop your Excel file here</h2>
              <p>or click to browse files</p>
              <div className="supported-formats">
                <span>.xlsx</span>
                <span>.xls</span>
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
        ) : (
          /* File Processing */
          <div className="processing-section">
            {/* File Info Card */}
            <div className="file-card">
              <div className="file-header">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <h3>{file.name}</h3>
                  <p>{formatFileSize(file.size)}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => {
                    setFile(null);
                    setFileInfo(null);
                    setImportResult(null);
                    setError(null);
                  }}
                >
                  ✕
                </button>
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing file...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <p>{error}</p>
                </div>
              )}

              {fileInfo && (
                <div className="file-analysis">
                  <div className="analysis-grid">
                    <div className="stat-item">
                      <span className="stat-label">Rows</span>
                      <span className="stat-value">{fileInfo.rows?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Columns</span>
                      <span className="stat-value">{fileInfo.columns?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Size</span>
                      <span className="stat-value">{formatFileSize(fileInfo.file_size || file.size)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Type</span>
                      <span className="stat-value">Excel</span>
                    </div>
                  </div>

                  {fileInfo.columns && (
                    <div className="columns-preview">
                      <h4>Columns ({fileInfo.columns.length})</h4>
                      <div className="columns-list">
                        {fileInfo.columns.slice(0, 6).map((col, index) => (
                          <span key={index} className="column-tag">
                            {typeof col === 'object' ? col.name : col}
                          </span>
                        ))}
                        {fileInfo.columns.length > 6 && (
                          <span className="column-tag more">
                            +{fileInfo.columns.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data Preview */}
                  {fileInfo.preview_data && fileInfo.preview_data.length > 0 && (
                    <div className="data-preview-section">
                      <h4>Data Preview</h4>
                      <div className="preview-table-wrapper">
                        <table className="modern-preview-table">
                          <thead>
                            <tr>
                              {fileInfo.columns.slice(0, 4).map((col, index) => (
                                <th key={index}>
                                  {typeof col === 'object' ? col.name : col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fileInfo.preview_data.slice(0, 3).map((row, index) => (
                              <tr key={index}>
                                {fileInfo.columns.slice(0, 4).map((col, colIndex) => {
                                  const colName = typeof col === 'object' ? col.name : col;
                                  const value = row[colName];
                                  return (
                                    <td key={colIndex}>
                                      {value ? String(value).substring(0, 20) : '—'}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {fileInfo.columns.length > 4 && (
                          <div className="preview-note">
                            Showing first 4 columns and 3 rows
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {fileInfo && !importResult && (
              <div className="action-section">
                <div className="import-options">
                  <button 
                    className="action-btn primary large"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing ? (
                      <>
                        <div className="btn-spinner"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        🚀 Quick Import
                      </>
                    )}
                  </button>
                  
                  <div className="advanced-options">
                    <button 
                      className="option-btn"
                      onClick={() => setShowValidator(true)}
                      title="Analyze data quality before import"
                    >
                      🔍 Quality Check
                    </button>
                    <button 
                      className="option-btn"
                      onClick={() => alert('Column mapping feature - coming soon!')}
                      title="Map columns to custom schema"
                    >
                      🎯 Custom Mapping
                    </button>
                    <button 
                      className="option-btn"
                      onClick={() => alert('Table creation feature - coming soon!')}
                      title="Create new table from data"
                    >
                      🏗️ Create Table
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Import Success */}
            {importResult && (
              <div className="success-section">
                <div className="success-card">
                  <div className="success-icon">✅</div>
                  <h3>Import Successful!</h3>
                  <p>Your data has been processed and is ready for analysis.</p>
                  
                  <div className="success-stats">
                    <div className="success-stat">
                      <span className="stat-label">Session ID</span>
                      <span className="stat-value">{importResult.session_id}</span>
                    </div>
                    {importResult.records_imported && (
                      <div className="success-stat">
                        <span className="stat-label">Records</span>
                        <span className="stat-value">{importResult.records_imported.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="success-actions">
                    <button 
                      className="success-btn primary"
                      onClick={() => setShowPreview(true)}
                    >
                      👁️ View & Explore Data
                    </button>
                    <button 
                      className="success-btn secondary"
                      onClick={handleExport}
                    >
                      📥 Download CSV
                    </button>
                    <button 
                      className="success-btn secondary"
                      onClick={() => setShowValidator(true)}
                    >
                      🔍 Quality Report
                    </button>
                    <button 
                      className="success-btn outline"
                      onClick={() => {
                        setFile(null);
                        setFileInfo(null);
                        setImportResult(null);
                        setError(null);
                      }}
                    >
                      🔄 Import Another File
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showPreview && importResult && (
        <EnhancedPreview
          sessionId={importResult.session_id}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showValidator && (
        <DataValidator
          sessionId={importResult?.session_id}
          fileInfo={fileInfo}
          onClose={() => setShowValidator(false)}
        />
      )}
    </div>
  );
}

export default ModernDataApp;