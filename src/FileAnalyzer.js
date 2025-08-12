import React, { useState } from 'react';
import './FileAnalyzer.css';

const FileAnalyzer = ({ fileData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!fileData) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDataTypeIcon = (type) => {
    switch (type) {
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'email': return '📧';
      case 'phone': return '📞';
      default: return '📝';
    }
  };

  const getHealthColor = (percentage) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 70) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="file-analyzer-overlay">
      <div className="file-analyzer-modal">
        <div className="file-analyzer-header">
          <h2>📊 File Structure Analysis</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="file-analyzer-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'columns' ? 'active' : ''}`}
            onClick={() => setActiveTab('columns')}
          >
            📊 Columns
          </button>
          <button 
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Data Preview
          </button>
          <button 
            className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            ⚠️ Issues
          </button>
        </div>

        <div className="file-analyzer-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="file-stats">
                <div className="stat-card">
                  <div className="stat-icon">📁</div>
                  <div className="stat-info">
                    <div className="stat-label">File Name</div>
                    <div className="stat-value">{fileData.filename}</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💾</div>
                  <div className="stat-info">
                    <div className="stat-label">File Size</div>
                    <div className="stat-value">{formatFileSize(fileData.file_size)}</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📏</div>
                  <div className="stat-info">
                    <div className="stat-label">Dimensions</div>
                    <div className="stat-value">{fileData.total_rows} × {fileData.total_columns}</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🔍</div>
                  <div className="stat-info">
                    <div className="stat-label">Data Quality</div>
                    <div className="stat-value">
                      {fileData.data_summary.potential_issues.length === 0 ? '✅ Good' : `⚠️ ${fileData.data_summary.potential_issues.length} Issues`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="data-health">
                <h3>📈 Data Health Overview</h3>
                <div className="health-metrics">
                  <div className="health-metric">
                    <span>Empty Rows:</span>
                    <span className={fileData.data_summary.empty_rows > 0 ? 'warning' : 'good'}>
                      {fileData.data_summary.empty_rows}
                    </span>
                  </div>
                  <div className="health-metric">
                    <span>Empty Columns:</span>
                    <span className={fileData.data_summary.empty_columns > 0 ? 'warning' : 'good'}>
                      {fileData.data_summary.empty_columns}
                    </span>
                  </div>
                  <div className="health-metric">
                    <span>Total Data Points:</span>
                    <span className="info">{fileData.total_rows * fileData.total_columns}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'columns' && (
            <div className="columns-tab">
              <div className="columns-header">
                <h3>📊 Column Analysis ({fileData.columns.length} columns)</h3>
              </div>
              
              <div className="columns-list">
                {fileData.columns.map((col, index) => (
                  <div key={index} className="column-card">
                    <div className="column-header">
                      <div className="column-name">
                        <span className="column-icon">{getDataTypeIcon(col.data_type)}</span>
                        <span className="name">{col.name}</span>
                        <span className="type-badge">{col.data_type}</span>
                      </div>
                      <div className="column-health">
                        <div 
                          className="health-bar"
                          style={{ 
                            width: `${col.percentage_filled}%`,
                            backgroundColor: getHealthColor(col.percentage_filled)
                          }}
                        ></div>
                        <span className="health-text">{col.percentage_filled}%</span>
                      </div>
                    </div>
                    
                    <div className="column-stats">
                      <div className="stat">
                        <span>Values:</span>
                        <span>{col.non_empty_values}/{col.total_values}</span>
                      </div>
                      <div className="stat">
                        <span>Unique:</span>
                        <span>{col.unique_values}</span>
                      </div>
                      {col.data_type === 'number' && (
                        <>
                          <div className="stat">
                            <span>Range:</span>
                            <span>{col.min_value} - {col.max_value}</span>
                          </div>
                          <div className="stat">
                            <span>Average:</span>
                            <span>{col.avg_value}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {col.sample_values.length > 0 && (
                      <div className="column-samples">
                        <span className="samples-label">Sample values:</span>
                        <div className="samples-list">
                          {col.sample_values.slice(0, 3).map((value, i) => (
                            <span key={i} className="sample-value">
                              {value !== null ? String(value) : 'null'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="preview-tab">
              <h3>👁️ Data Preview (First 10 rows)</h3>
              
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th className="row-number">#</th>
                      {fileData.columns.map((col, index) => (
                        <th key={index} title={`${col.data_type} - ${col.percentage_filled}% filled`}>
                          <div className="column-header-content">
                            <span className="column-icon">{getDataTypeIcon(col.data_type)}</span>
                            <span>{col.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.preview_data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="row-number">{rowIndex + 1}</td>
                        {fileData.columns.map((col, colIndex) => (
                          <td key={colIndex} className={row[col.name] === null ? 'empty-cell' : ''}>
                            {row[col.name] !== null ? String(row[col.name]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="issues-tab">
              <h3>⚠️ Potential Issues</h3>
              
              {fileData.data_summary.potential_issues.length === 0 ? (
                <div className="no-issues">
                  <div className="success-icon">✅</div>
                  <h4>No Issues Found!</h4>
                  <p>Your file structure looks good and ready for import.</p>
                </div>
              ) : (
                <div className="issues-list">
                  {fileData.data_summary.potential_issues.map((issue, index) => (
                    <div key={index} className="issue-card">
                      <div className="issue-icon">⚠️</div>
                      <div className="issue-content">
                        <div className="issue-text">{issue}</div>
                        <div className="issue-suggestion">
                          {issue.includes('empty') && 'Consider cleaning the data before import'}
                          {issue.includes('mostly empty') && 'This column may not be useful for analysis'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="recommendations">
                <h4>💡 Recommendations</h4>
                <ul>
                  <li>Review columns with low fill rates before importing</li>
                  <li>Consider removing completely empty rows/columns</li>
                  <li>Verify data types match your expectations</li>
                  <li>Check sample values for data quality</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="file-analyzer-footer">
          <button onClick={onClose} className="btn-secondary">Close Analysis</button>
          <button className="btn-primary">Proceed with Import</button>
        </div>
      </div>
    </div>
  );
};

export default FileAnalyzer;