import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EnhancedPreview.css';

function EnhancedPreview({ sessionId, onClose }) {
  const [data, setData] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [showStats, setShowStats] = useState(false);

  const pageSize = 50;

  useEffect(() => {
    if (sessionId) {
      loadData();
      loadStatistics();
    }
  }, [sessionId, currentPage, sortBy, filterColumn, filterValue]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize
      };
      
      if (sortBy) params.sort_by = sortBy;
      if (filterColumn && filterValue) {
        params.filter_column = filterColumn;
        params.filter_value = filterValue;
      }

      const response = await axios.get(`http://localhost:8000/preview-enhanced/${sessionId}`, { params });
      setData(response.data.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/data-statistics/${sessionId}`);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSort = (column) => {
    const newSortBy = sortBy === column ? `-${column}` : column;
    setSortBy(newSortBy);
    setCurrentPage(0);
  };

  const handleFilter = () => {
    setCurrentPage(0);
    loadData();
  };

  const clearFilter = () => {
    setFilterColumn('');
    setFilterValue('');
    setCurrentPage(0);
  };

  const exportCSV = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/export-csv/${sessionId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_${sessionId.substring(0, 8)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : [];
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="enhanced-preview-overlay">
      <div className="enhanced-preview">
        <div className="preview-header">
          <div className="preview-title">
            <span>📊</span>
            Data Preview - {totalRecords.toLocaleString()} records
          </div>
          <div className="preview-actions">
            <button onClick={() => setShowStats(!showStats)} className="stats-toggle">
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            <button onClick={exportCSV} className="export-btn">
              📥 Export CSV
            </button>
            <button onClick={onClose} className="close-btn">
              ✕
            </button>
          </div>
        </div>

        {showStats && (
          <div className="statistics-panel">
            <div className="stats-grid">
              {Object.entries(statistics).map(([column, stats]) => (
                <div key={column} className="stat-card">
                  <div className="stat-header">{column}</div>
                  <div className="stat-details">
                    <div className="stat-item">
                      <span>Non-null:</span>
                      <span>{stats.non_null_count}</span>
                    </div>
                    <div className="stat-item">
                      <span>Unique:</span>
                      <span>{stats.unique_count}</span>
                    </div>
                    <div className="stat-item">
                      <span>Null %:</span>
                      <span>{stats.null_percentage}%</span>
                    </div>
                    {stats.avg_value && (
                      <div className="stat-item">
                        <span>Average:</span>
                        <span>{stats.avg_value}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="preview-controls">
          <div className="filter-controls">
            <select 
              value={filterColumn} 
              onChange={(e) => setFilterColumn(e.target.value)}
              className="filter-select"
            >
              <option value="">Filter by column...</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filter value..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="filter-input"
              onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
            />
            <button onClick={handleFilter} className="filter-btn">Filter</button>
            <button onClick={clearFilter} className="clear-btn">Clear</button>
          </div>

          <div className="pagination-controls">
            <button 
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="page-btn"
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="page-btn"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="preview-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              Loading data...
            </div>
          ) : (
            <table className="enhanced-table">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column} onClick={() => handleSort(column)} className="sortable-header">
                      <div className="header-content">
                        <span>{column}</span>
                        <div className="sort-indicators">
                          <span className={`sort-arrow ${sortBy === column ? 'active' : ''}`}>↑</span>
                          <span className={`sort-arrow ${sortBy === `-${column}` ? 'active' : ''}`}>↓</span>
                        </div>
                      </div>
                      {statistics[column] && (
                        <div className="column-stats">
                          {statistics[column].null_percentage > 0 && (
                            <span className="null-indicator">{statistics[column].null_percentage}% null</span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={row._id || index}>
                    {columns.map(column => (
                      <td key={column} className={row[column] === null ? 'null-cell' : ''}>
                        {row[column] === null ? (
                          <span className="null-value">NULL</span>
                        ) : (
                          String(row[column]).substring(0, 100)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnhancedPreview;