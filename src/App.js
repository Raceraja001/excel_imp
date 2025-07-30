import React, { useState } from 'react';
import axios from 'axios';
import ColumnMapping from './ColumnMapping';
import CreateTableOption from './CreateTableOption';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  
  // Navigation state
  const [activeView, setActiveView] = useState('upload'); // upload, mapping, create-table, history, results

  // Fetch history when history view is active
  React.useEffect(() => {
    if (activeView === 'history') {
      fetchImportHistory();
    }
  }, [activeView]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileInfo(null);
    setError(null);
    setImportResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload-excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFileInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/import-data/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      setImportResult(response.data);
      setActiveView('results');
      fetchImportHistory();
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Import timeout - file may be too large. Please try a smaller file.');
      } else {
        setError(err.response?.data?.detail || 'Error importing data');
      }
    } finally {
      setImporting(false);
    }
  };

  const handleMappingComplete = async (mappingData) => {
    setImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('schema_id', mappingData.schemaId.toString());
    formData.append('mapping', JSON.stringify(mappingData.mapping));

    try {
      const response = await axios.post('http://localhost:8000/import-with-mapping/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      setImportResult(response.data);
      setActiveView('results');
      fetchImportHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error importing with mapping');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateTable = async (tableData) => {
    setImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('table_name', tableData.tableName);
    formData.append('table_description', tableData.tableDescription);

    try {
      // First create the table
      const createResponse = await axios.post('http://localhost:8000/create-table-from-excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (createResponse.data.ready_for_import) {
        // Now import the data to the new table
        const mapping = {};
        tableData.fields.forEach(field => {
          mapping[field.originalName] = field.fieldName;
        });

        const importFormData = new FormData();
        importFormData.append('file', file);
        importFormData.append('table_name', tableData.tableName);
        importFormData.append('mapping', JSON.stringify(mapping));

        const importResponse = await axios.post('http://localhost:8000/import-to-custom-table/', importFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        });

        setImportResult({
          ...importResponse.data,
          table_created: true,
          schema_id: createResponse.data.schema_id
        });
      }

      setActiveView('results');
      fetchImportHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creating table and importing data');
    } finally {
      setImporting(false);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/import-history/');
      setImportHistory(response.data.history);
    } catch (err) {
      console.error('Error fetching import history:', err);
    }
  };

  // Render different views based on activeView
  const renderContent = () => {
    switch (activeView) {
      case 'upload':
        return renderUploadView();
      case 'mapping':
        return renderMappingView();
      case 'create-table':
        return renderCreateTableView();
      case 'history':
        return renderHistoryView();
      case 'results':
        return renderResultsView();
      default:
        return renderUploadView();
    }
  };

  const renderUploadView = () => (
    <div className="content-card">
      {/* File Upload Zone */}
      <div className={`upload-zone ${file ? 'has-file' : ''}`}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="upload-content">
          <div className="upload-icon">{file ? '📄' : '📁'}</div>
          <div className="upload-text">
            {file ? (
              <>
                <h3>{file.name}</h3>
                <p>Click to change file or analyze current file</p>
              </>
            ) : (
              <>
                <h3>Choose Excel File</h3>
                <p>Select your .xlsx or .xls file to get started</p>
              </>
            )}
          </div>
          <div className="upload-actions">
            {file && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleUpload();
                }} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🔍 Analyze File
                  </>
                )}
              </button>
            )}
          </div>
        </label>
      </div>

      {/* File Info */}
      {fileInfo && (
        <div className="file-info">
          <div className="file-info-icon">✅</div>
          <div className="file-info-content">
            <h4>{fileInfo.filename}</h4>
            <p>{fileInfo.rows} rows, {fileInfo.columns.length} columns</p>
          </div>
        </div>
      )}

      {/* Import Options */}
      {fileInfo && (
        <div className="import-options">
          <div className="option-card" onClick={handleQuickImport}>
            <div className="option-icon">⚡</div>
            <div className="option-title">Quick Import</div>
            <div className="option-description">Fast import with automatic detection</div>
            <button className="btn btn-primary" disabled={importing}>
              {importing ? 'Importing...' : 'Import Now'}
            </button>
          </div>

          <div className="option-card" onClick={() => setActiveView('mapping')}>
            <div className="option-icon">🎯</div>
            <div className="option-title">Column Mapping</div>
            <div className="option-description">Map to existing schemas</div>
            <button className="btn btn-primary">Configure</button>
          </div>

          <div className="option-card" onClick={() => setActiveView('create-table')}>
            <div className="option-icon">🏗️</div>
            <div className="option-title">Create Table</div>
            <div className="option-description">Generate custom table</div>
            <button className="btn btn-primary">Create</button>
          </div>
        </div>
      )}

      {/* Data Preview */}
      {fileInfo && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Data Preview</h3>
          <div className="preview-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {fileInfo.columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileInfo.preview.map((row, index) => (
                  <tr key={index}>
                    {fileInfo.columns.map(col => (
                      <td key={col}>{String(row[col] || '').substring(0, 50)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderMappingView = () => (
    <div className="content-card content-full">
      {fileInfo ? (
        <ColumnMapping
          fileInfo={fileInfo}
          onMappingComplete={handleMappingComplete}
          onCancel={() => setActiveView('upload')}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-title">No File Selected</div>
          <div className="empty-description">Please upload a file first to configure column mapping</div>
          <button className="btn btn-primary" onClick={() => setActiveView('upload')}>
            Upload File
          </button>
        </div>
      )}
    </div>
  );

  const renderCreateTableView = () => (
    <div className="content-card content-full">
      {fileInfo ? (
        <CreateTableOption
          fileInfo={fileInfo}
          onTableCreated={handleCreateTable}
          onCancel={() => setActiveView('upload')}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-title">No File Selected</div>
          <div className="empty-description">Please upload a file first to create a new table</div>
          <button className="btn btn-primary" onClick={() => setActiveView('upload')}>
            Upload File
          </button>
        </div>
      )}
    </div>
  );

  const renderHistoryView = () => (
    <div className="content-card">
      {importHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No Import History</div>
          <div className="empty-description">Your import history will appear here after you import files</div>
        </div>
      ) : (
        <div className="history-grid">
          {importHistory.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-header">
                <div className="history-icon">📊</div>
                <div className="history-id">
                  Session: {item.session_id.substring(0, 8)}...
                </div>
              </div>
              <div className="history-stats">
                <span>{item.record_count} records</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResultsView = () => (
    <div className="content-card">
      {importResult ? (
        <div className="result-success">
          <div className="result-header">
            <div className="result-icon">✅</div>
            <div>
              <div className="result-title">Import Successful!</div>
              <div className="result-subtitle">{importResult.message}</div>
            </div>
          </div>
          
          <div className="result-stats">
            <div className="stat-card">
              <div className="stat-number">{importResult.imported_rows}</div>
              <div className="stat-label">Rows Imported</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{importResult.total_rows}</div>
              <div className="stat-label">Total Rows</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{importResult.processing_time}</div>
              <div className="stat-label">Processing Time</div>
            </div>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <p><strong>Session ID:</strong> <code>{importResult.session_id}</code></p>
            {importResult.schema_used && (
              <p><strong>Schema Used:</strong> {importResult.schema_used}</p>
            )}
            {importResult.table_created && (
              <p><strong>New Table Created:</strong> {importResult.table_name}</p>
            )}
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="error-alert" style={{ marginTop: '1rem' }}>
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <div className="error-title">Warnings</div>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                  {importResult.errors.map((error, index) => (
                    <li key={index} style={{ fontSize: '0.875rem' }}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No Results Yet</div>
          <div className="empty-description">Import results will appear here after successful imports</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">📊</div>
            <div className="logo-text">
              <h1>Excel Importer</h1>
              <p>MySQL Data Import Tool</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Import</div>
            <button 
              className={`nav-item ${activeView === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveView('upload')}
            >
              <span className="nav-item-icon">📁</span>
              Upload File
              {file && <span className="nav-item-badge">1</span>}
            </button>
            <button 
              className={`nav-item ${activeView === 'mapping' ? 'active' : ''}`}
              onClick={() => setActiveView('mapping')}
            >
              <span className="nav-item-icon">🎯</span>
              Column Mapping
            </button>
            <button 
              className={`nav-item ${activeView === 'create-table' ? 'active' : ''}`}
              onClick={() => setActiveView('create-table')}
            >
              <span className="nav-item-icon">🏗️</span>
              Create Table
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Results</div>
            <button 
              className={`nav-item ${activeView === 'results' ? 'active' : ''}`}
              onClick={() => setActiveView('results')}
            >
              <span className="nav-item-icon">✅</span>
              Import Results
              {importResult && <span className="nav-item-badge">New</span>}
            </button>
            <button 
              className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
              onClick={() => setActiveView('history')}
            >
              <span className="nav-item-icon">📈</span>
              History
              {importHistory.length > 0 && <span className="nav-item-badge">{importHistory.length}</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <div className="content-title">
            <span style={{ fontSize: '1.5rem' }}>
              {activeView === 'upload' && '📁'}
              {activeView === 'mapping' && '🎯'}
              {activeView === 'create-table' && '🏗️'}
              {activeView === 'history' && '📈'}
              {activeView === 'results' && '✅'}
            </span>
            <h1>
              {activeView === 'upload' && 'Upload & Import'}
              {activeView === 'mapping' && 'Column Mapping'}
              {activeView === 'create-table' && 'Create New Table'}
              {activeView === 'history' && 'Import History'}
              {activeView === 'results' && 'Import Results'}
            </h1>
          </div>
          <div className="content-subtitle">
            {activeView === 'upload' && 'Upload Excel files and choose your import method'}
            {activeView === 'mapping' && 'Map Excel columns to database schema fields'}
            {activeView === 'create-table' && 'Generate custom database tables from Excel structure'}
            {activeView === 'history' && 'View your previous import sessions'}
            {activeView === 'results' && 'Review your latest import results'}
          </div>
        </div>

        <div className="content-body">
          {/* Error Display */}
          {error && (
            <div className="error-alert">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <div className="error-title">Error</div>
                <div className="error-message">{error}</div>
              </div>
            </div>
          )}

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
