import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ColumnMapping from './ColumnMapping';
import CreateTableOption from './CreateTableOption';
import DataValidator from './DataValidator';
import EnhancedPreview from './EnhancedPreview';
import PipelineTemplates from './PipelineTemplates';
import KeyboardShortcuts from './KeyboardShortcuts';
import FileAnalyzer from './FileAnalyzer';
import './ModernApp.css';

function ModernApp() {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  
  // Modern UI state
  const [currentStep, setCurrentStep] = useState(0); // 0: Upload, 1: Configure, 2: Process, 3: Results
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [validationResults, setValidationResults] = useState(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileAnalyzer, setShowFileAnalyzer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [processingStep, setProcessingStep] = useState('');

  // Auto-advance steps
  useEffect(() => {
    if (file && !fileInfo && currentStep === 0) {
      // Auto-analyze file when uploaded
      handleUpload();
    }
  }, [file]);

  useEffect(() => {
    if (fileInfo && currentStep === 0) {
      setCurrentStep(1); // Move to configure step
    }
  }, [fileInfo]);

  useEffect(() => {
    if (importResult && currentStep === 2) {
      setCurrentStep(3); // Move to results step
    }
  }, [importResult]);

  // Helper functions
  const getColumnName = (col) => {
    return typeof col === 'object' ? col.name : col;
  };

  const getColumns = () => {
    return fileInfo?.columns || [];
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileInfo(null);
    setError(null);
    setImportResult(null);
    setCurrentStep(0);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setProcessingStep('Analyzing file structure...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload-excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFileInfo(response.data);
      setProcessingStep('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file');
      setProcessingStep('');
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
    setCurrentStep(2);
    setProcessingStep('Importing data...');

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
      setProcessingStep('');
      fetchImportHistory();
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Import timeout - file may be too large. Please try a smaller file.');
      } else {
        setError(err.response?.data?.detail || 'Error importing data');
      }
      setProcessingStep('');
      setCurrentStep(1); // Go back to configure
    } finally {
      setImporting(false);
    }
  };

  const handleMappingComplete = async (mappingData) => {
    setImporting(true);
    setError(null);
    setCurrentStep(2);
    setProcessingStep('Importing with custom mapping...');

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
      setProcessingStep('');
      fetchImportHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error importing with mapping');
      setProcessingStep('');
      setCurrentStep(1);
    } finally {
      setImporting(false);
    }
  };

  const handleCreateTable = async (tableData) => {
    setImporting(true);
    setError(null);
    setCurrentStep(2);
    setProcessingStep('Creating table and importing data...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('table_name', tableData.tableName);
    formData.append('table_description', tableData.tableDescription);

    try {
      const createResponse = await axios.post('http://localhost:8000/create-table-from-excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (createResponse.data.ready_for_import) {
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

      setProcessingStep('');
      fetchImportHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creating table and importing data');
      setProcessingStep('');
      setCurrentStep(1);
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

  const handleExportData = async () => {
    if (importResult?.session_id) {
      try {
        const response = await axios.get(`http://localhost:8000/export-csv/${importResult.session_id}`, {
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export_${importResult.session_id.substring(0, 8)}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setError('Export failed: ' + error.message);
      }
    }
  };

  const resetWorkflow = () => {
    setFile(null);
    setFileInfo(null);
    setImportResult(null);
    setError(null);
    setCurrentStep(0);
    setActiveTab('upload');
    setValidationResults(null);
    setSelectedTemplate(null);
  };

  // Step indicator component
  const StepIndicator = () => {
    const steps = [
      { id: 0, title: 'Upload', icon: '📁', description: 'Select your file' },
      { id: 1, title: 'Configure', icon: '⚙️', description: 'Set up import options' },
      { id: 2, title: 'Process', icon: '⚡', description: 'Import your data' },
      { id: 3, title: 'Results', icon: '✅', description: 'View results' }
    ];

    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={step.id} className={`step ${currentStep >= step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}>
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>
    );
  };

  // Main content based on current step
  const renderMainContent = () => {
    switch (currentStep) {
      case 0:
        return renderUploadStep();
      case 1:
        return renderConfigureStep();
      case 2:
        return renderProcessStep();
      case 3:
        return renderResultsStep();
      default:
        return renderUploadStep();
    }
  };

  const renderUploadStep = () => (
    <div className="step-content">
      <div className="upload-area">
        <div className={`file-drop-zone ${file ? 'has-file' : ''}`}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="drop-zone-content">
            {file ? (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <h3>{file.name}</h3>
                  <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  {loading && <div className="loading-bar"><div className="loading-progress"></div></div>}
                  {processingStep && <p className="processing-text">{processingStep}</p>}
                </div>
              </div>
            ) : (
              <div className="drop-zone-empty">
                <div className="drop-icon">📁</div>
                <h3>Drop your Excel file here</h3>
                <p>or click to browse</p>
                <div className="supported-formats">
                  Supports .xlsx and .xls files
                </div>
              </div>
            )}
          </label>
        </div>

        {file && !loading && (
          <div className="upload-actions">
            <button 
              onClick={handleUpload}
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze File'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="step-content">
      <div className="config-tabs">
        <div className="tab-nav">
          <button 
            className={`tab-button ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => setActiveTab('quick')}
          >
            <span>⚡</span>
            Quick Import
          </button>
          <button 
            className={`tab-button ${activeTab === 'mapping' ? 'active' : ''}`}
            onClick={() => setActiveTab('mapping')}
          >
            <span>🎯</span>
            Column Mapping
          </button>
          <button 
            className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            <span>🏗️</span>
            Create Table
          </button>
          <button 
            className={`tab-button ${activeTab === 'validate' ? 'active' : ''}`}
            onClick={() => setActiveTab('validate')}
          >
            <span>🔍</span>
            Validate Data
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'quick' && renderQuickImportTab()}
          {activeTab === 'mapping' && renderMappingTab()}
          {activeTab === 'table' && renderTableTab()}
          {activeTab === 'validate' && renderValidateTab()}
        </div>
      </div>
    </div>
  );

  const renderQuickImportTab = () => (
    <div className="tab-panel">
      <div className="quick-import-panel">
        <div className="panel-header">
          <h3>Quick Import</h3>
          <p>Import your data with automatic schema detection</p>
        </div>

        {fileInfo && (
          <div className="file-summary">
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <h4>Data Summary</h4>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-value">{fileInfo.total_rows || fileInfo.rows}</span>
                    <span className="stat-label">Rows</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{fileInfo.total_columns || fileInfo.columns?.length}</span>
                    <span className="stat-label">Columns</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="data-preview-card">
              <h4>Data Preview</h4>
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {getColumns().slice(0, 5).map((col, index) => (
                        <th key={index}>{getColumnName(col)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(fileInfo.preview_data || fileInfo.preview || []).slice(0, 3).map((row, index) => (
                      <tr key={index}>
                        {getColumns().slice(0, 5).map((col, colIndex) => {
                          const colName = getColumnName(col);
                          return (
                            <td key={colIndex}>{String(row[colName] || '').substring(0, 20)}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button 
            onClick={handleQuickImport}
            className="btn btn-primary btn-large"
            disabled={importing || !fileInfo}
          >
            {importing ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMappingTab = () => (
    <div className="tab-panel">
      {fileInfo ? (
        <ColumnMapping
          fileInfo={fileInfo}
          onMappingComplete={handleMappingComplete}
          onCancel={() => setActiveTab('quick')}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>File analysis required for column mapping</p>
        </div>
      )}
    </div>
  );

  const renderTableTab = () => (
    <div className="tab-panel">
      {fileInfo ? (
        <CreateTableOption
          fileInfo={fileInfo}
          onTableCreated={handleCreateTable}
          onCancel={() => setActiveTab('quick')}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <p>File analysis required for table creation</p>
        </div>
      )}
    </div>
  );

  const renderValidateTab = () => (
    <div className="tab-panel">
      {fileInfo ? (
        <DataValidator
          fileInfo={fileInfo}
          onValidationComplete={(results) => setValidationResults(results)}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>File analysis required for data validation</p>
        </div>
      )}
    </div>
  );

  const renderProcessStep = () => (
    <div className="step-content">
      <div className="processing-panel">
        <div className="processing-animation">
          <div className="spinner-large"></div>
        </div>
        <h3>Processing Your Data</h3>
        <p>{processingStep || 'Please wait while we import your data...'}</p>
        
        {importing && (
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="step-content">
      {importResult ? (
        <div className="results-panel">
          <div className="success-header">
            <div className="success-icon">🎉</div>
            <div className="success-content">
              <h2>Import Successful!</h2>
              <p>{importResult.message}</p>
            </div>
          </div>

          <div className="results-grid">
            <div className="result-card">
              <div className="result-icon">📊</div>
              <div className="result-content">
                <div className="result-number">{importResult.imported_rows}</div>
                <div className="result-label">Rows Imported</div>
              </div>
            </div>
            <div className="result-card">
              <div className="result-icon">⏱️</div>
              <div className="result-content">
                <div className="result-number">{importResult.processing_time}</div>
                <div className="result-label">Processing Time</div>
              </div>
            </div>
            <div className="result-card">
              <div className="result-icon">🗄️</div>
              <div className="result-content">
                <div className="result-number">{importResult.schema_used || 'Auto'}</div>
                <div className="result-label">Schema Used</div>
              </div>
            </div>
          </div>

          <div className="result-actions">
            <button 
              onClick={() => setShowEnhancedPreview(true)}
              className="btn btn-primary"
            >
              📊 View Data
            </button>
            <button 
              onClick={handleExportData}
              className="btn btn-secondary"
            >
              📥 Export CSV
            </button>
            <button 
              onClick={resetWorkflow}
              className="btn btn-outline"
            >
              🔄 Import Another File
            </button>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="warnings-panel">
              <h4>⚠️ Warnings</h4>
              <ul>
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No results available</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="modern-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">DataFlow</span>
          </div>
        </div>
        
        <div className="header-center">
          <StepIndicator />
        </div>
        
        <div className="header-right">
          <button 
            className="header-button"
            onClick={() => setShowTemplates(true)}
            title="Pipeline Templates"
          >
            🚀
          </button>
          <button 
            className="header-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            ☰
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="sidebar">
            <div className="sidebar-section">
              <h3>Recent Imports</h3>
              {importHistory.length > 0 ? (
                <div className="history-list">
                  {importHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className="history-item">
                      <div className="history-icon">📄</div>
                      <div className="history-content">
                        <div className="history-title">{item.session_id.substring(0, 8)}...</div>
                        <div className="history-subtitle">{item.record_count} rows</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No recent imports</p>
              )}
            </div>

            <div className="sidebar-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => setCurrentStep(0)}>
                  <span>📁</span>
                  New Import
                </button>
                <button className="quick-action" onClick={() => setShowTemplates(true)}>
                  <span>🚀</span>
                  Templates
                </button>
                {fileInfo && (
                  <button className="quick-action" onClick={() => setShowFileAnalyzer(true)}>
                    <span>🔍</span>
                    Analyze File
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="main-content">
          {error && (
            <div className="error-banner">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {renderMainContent()}
        </main>
      </div>

      {/* Modals */}
      {showEnhancedPreview && importResult && (
        <EnhancedPreview
          sessionId={importResult.session_id}
          onClose={() => setShowEnhancedPreview(false)}
        />
      )}

      {showTemplates && (
        <PipelineTemplates
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showFileAnalyzer && fileInfo && (
        <FileAnalyzer
          fileData={fileInfo}
          onClose={() => setShowFileAnalyzer(false)}
        />
      )}

      <KeyboardShortcuts
        onRunPipeline={() => {
          if (currentStep === 1) handleQuickImport();
        }}
        onExportData={handleExportData}
        onRunQuality={() => setActiveTab('validate')}
        onRefreshPreview={() => window.location.reload()}
        onSaveConfig={() => console.log('Save config')}
        onUndo={resetWorkflow}
      />
    </div>
  );
}

export default ModernApp;