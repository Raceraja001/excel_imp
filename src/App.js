import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileInfo(null);
    setError(null);
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

  const handleImport = async () => {
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
        timeout: 60000, // 60 second timeout
      });
      setImportResult(response.data);
      // Refresh history after successful import
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

  const fetchImportHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/import-history/');
      setImportHistory(response.data.history);
    } catch (err) {
      console.error('Error fetching import history:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Excel to MySQL Importer</h1>
        
        <div className="upload-section">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
          />
          
          <button 
            onClick={handleUpload} 
            disabled={loading || !file}
            className="upload-btn"
          >
            {loading ? 'Processing...' : 'Upload & Preview'}
          </button>

          <button 
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) fetchImportHistory();
            }}
            className="history-btn"
          >
            {showHistory ? 'Hide History' : 'Show Import History'}
          </button>
        </div>

        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}

        {fileInfo && (
          <div className="file-info">
            <h3>File Information</h3>
            <p><strong>Filename:</strong> {fileInfo.filename}</p>
            <p><strong>Rows:</strong> {fileInfo.rows}</p>
            <p><strong>Columns:</strong> {fileInfo.columns.join(', ')}</p>
            
            <div className="import-section">
              <button 
                onClick={handleImport} 
                disabled={importing}
                className="import-btn"
              >
                {importing ? 'Importing...' : 'Import to Database'}
              </button>
            </div>
            
            <h4>Preview (First 5 rows):</h4>
            <div className="preview-table">
              <table>
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
                        <td key={col}>{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {importResult && (
          <div className="import-result">
            <h3>Import Results</h3>
            <p><strong>Status:</strong> {importResult.message}</p>
            <p><strong>Session ID:</strong> {importResult.session_id}</p>
            <p><strong>Imported Rows:</strong> {importResult.imported_rows} / {importResult.total_rows}</p>
            
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="import-errors">
                <h4>Errors:</h4>
                <ul>
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {showHistory && (
          <div className="import-history">
            <h3>Import History</h3>
            {importHistory.length === 0 ? (
              <p>No imports yet.</p>
            ) : (
              <div className="history-list">
                {importHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <p><strong>Session:</strong> {item.session_id.substring(0, 8)}...</p>
                    <p><strong>Records:</strong> {item.record_count}</p>
                    <p><strong>Date:</strong> {new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
