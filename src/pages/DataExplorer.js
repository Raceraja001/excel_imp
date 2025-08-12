import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';
import './DataExplorer.css';

const DataExplorer = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch('http://localhost:8000/import-history/');
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.history || []);
        if (data.history?.length > 0) {
          setSelectedDataset(data.history[0]);
          fetchDatasetData(data.history[0].session_id);
        }
      }
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError('Failed to load datasets');
    }
  };

  const fetchDatasetData = async (sessionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/import-data/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Convert data to table format
        if (data.data && data.data.length > 0) {
          const columns = Object.keys(data.data[0]).map(key => ({
            key,
            title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            render: (value) => {
              if (value === null || value === undefined) {
                return <span className="null-value">—</span>;
              }
              if (typeof value === 'boolean') {
                return <span className={`boolean-value ${value}`}>{value ? '✓' : '✗'}</span>;
              }
              if (typeof value === 'number') {
                return <span className="number-value">{value.toLocaleString()}</span>;
              }
              return String(value);
            }
          }));
          
          setTableColumns(columns);
          setTableData(data.data);
        } else {
          setTableColumns([]);
          setTableData([]);
        }
      } else {
        throw new Error('Failed to fetch dataset data');
      }
    } catch (err) {
      console.error('Error fetching dataset data:', err);
      setError('Failed to load dataset data');
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetChange = (dataset) => {
    setSelectedDataset(dataset);
    fetchDatasetData(dataset.session_id);
  };

  const handleRowClick = (row, index) => {
    toast.success(`Clicked row ${index + 1}`, {
      duration: 2000,
      position: 'top-right'
    });
  };

  const handleExport = (data) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Convert data to CSV
    const headers = tableColumns.map(col => col.title);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        tableColumns.map(col => {
          const value = row[col.key];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : String(value || '');
        }).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDataset?.session_id?.substring(0, 8) || 'data'}_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Data exported successfully!');
  };

  return (
    <div className="data-explorer">
      {/* Explorer Header */}
      <motion.div 
        className="explorer-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-content">
          <div className="header-info">
            <h1>Data Explorer</h1>
            <p>Browse and analyze your imported datasets</p>
          </div>
          <div className="header-controls">
            <select 
              className="dataset-select"
              value={selectedDataset?.session_id || ''}
              onChange={(e) => {
                const dataset = datasets.find(d => d.session_id === e.target.value);
                if (dataset) handleDatasetChange(dataset);
              }}
            >
              <option value="">Select Dataset</option>
              {datasets.map(dataset => (
                <option key={dataset.session_id} value={dataset.session_id}>
                  Session {dataset.session_id.substring(0, 8)} - {dataset.record_count} records
                </option>
              ))}
            </select>
            <button className="refresh-btn" onClick={fetchDatasets}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dataset Info */}
      {selectedDataset && (
        <motion.div 
          className="dataset-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">📊</div>
              <div className="info-content">
                <h3>{selectedDataset.record_count?.toLocaleString() || 'N/A'}</h3>
                <p>Total Records</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <h3>{new Date(selectedDataset.created_at).toLocaleDateString()}</h3>
                <p>Import Date</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🏷️</div>
              <div className="info-content">
                <h3>{tableColumns.length}</h3>
                <p>Columns</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🔗</div>
              <div className="info-content">
                <h3>{selectedDataset.session_id.substring(0, 8)}...</h3>
                <p>Session ID</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div 
        className="table-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {selectedDataset ? (
          <DataTable
            data={tableData}
            columns={tableColumns}
            loading={loading}
            error={error}
            searchable={true}
            sortable={true}
            filterable={true}
            exportable={true}
            pageSize={50}
            onRowClick={handleRowClick}
            onExport={handleExport}
            className="explorer-table"
          />
        ) : (
          <div className="no-dataset-selected">
            <div className="empty-icon">🔍</div>
            <h3>No Dataset Selected</h3>
            <p>Select a dataset from the dropdown above to start exploring your data.</p>
            {datasets.length === 0 && (
              <p className="hint">
                Import some data first to see it here.
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      {tableData.length > 0 && (
        <motion.div 
          className="quick-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📈 Quick Statistics</h2>
              <p className="card-subtitle">Overview of your dataset</p>
            </div>
            <div className="card-body">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Rows</span>
                  <span className="stat-value">{tableData.length.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Columns</span>
                  <span className="stat-value">{tableColumns.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Null Values</span>
                  <span className="stat-value">
                    {tableData.reduce((count, row) => 
                      count + Object.values(row).filter(val => val === null || val === undefined).length, 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Data Completeness</span>
                  <span className="stat-value">
                    {(((tableData.length * tableColumns.length) - 
                      tableData.reduce((count, row) => 
                        count + Object.values(row).filter(val => val === null || val === undefined).length, 0
                      )) / (tableData.length * tableColumns.length) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataExplorer;