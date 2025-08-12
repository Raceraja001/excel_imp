import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DataTable.css';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  searchable = true,
  sortable = true,
  filterable = true,
  exportable = true,
  pageSize = 50,
  onRowClick = null,
  onExport = null,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row =>
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    return filtered;
  }, [data, searchQuery, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, [sortable]);

  const handleFilter = useCallback((column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1);
  }, []);

  const handleRowSelect = useCallback((rowIndex, checked) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowIndex);
      } else {
        newSet.delete(rowIndex);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  }, [paginatedData]);

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className={`data-table-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Table Header Controls */}
      <div className="table-controls">
        <div className="controls-left">
          {searchable && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>
          )}
          
          <div className="results-info">
            Showing {paginatedData.length} of {sortedData.length} results
            {selectedRows.size > 0 && (
              <span className="selected-info">
                ({selectedRows.size} selected)
              </span>
            )}
          </div>
        </div>

        <div className="controls-right">
          {exportable && (
            <button 
              className="export-btn"
              onClick={() => onExport?.(selectedRows.size > 0 ? 
                paginatedData.filter((_, index) => selectedRows.has(index)) : 
                sortedData
              )}
            >
              📥 Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="select-column">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`table-header ${sortable ? 'sortable' : ''}`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="header-content">
                    <span className="header-title">{column.title}</span>
                    {sortable && (
                      <span className="sort-icon">{getSortIcon(column.key)}</span>
                    )}
                  </div>
                  {filterable && (
                    <div className="filter-input-wrapper">
                      <input
                        type="text"
                        placeholder={`Filter ${column.title}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                        className="filter-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  className={`table-row ${selectedRows.has(index) ? 'selected' : ''} ${onRowClick ? 'clickable' : ''}`}
                  onClick={() => onRowClick?.(row, index)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={(e) => handleRowSelect(index, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="table-cell">
                      {column.render ? 
                        column.render(row[column.key], row, index) : 
                        String(row[column.key] || '')
                      }
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Data Found</h3>
            <p>No records match your current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            ⏮️
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            ⏪
          </button>
          
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            ⏩
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            ⏭️
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DataTable;