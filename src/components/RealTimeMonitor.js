import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RealTimeMonitor.css';

const RealTimeMonitor = () => {
  const [activeImports, setActiveImports] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    api: 'online',
    storage: 'online',
    lastUpdate: new Date()
  });

  useEffect(() => {
    // Simulate real-time import monitoring
    const interval = setInterval(() => {
      // Simulate active imports
      const mockImports = [
        {
          id: 1,
          fileName: 'sales_data_2024.xlsx',
          progress: Math.min(100, Math.random() * 100),
          status: 'processing',
          recordsProcessed: Math.floor(Math.random() * 5000),
          totalRecords: 5000,
          startTime: new Date(Date.now() - Math.random() * 300000),
          speed: Math.floor(Math.random() * 100) + 50
        },
        {
          id: 2,
          fileName: 'customer_list.xlsx',
          progress: Math.min(100, Math.random() * 100),
          status: 'processing',
          recordsProcessed: Math.floor(Math.random() * 2500),
          totalRecords: 2500,
          startTime: new Date(Date.now() - Math.random() * 180000),
          speed: Math.floor(Math.random() * 80) + 30
        }
      ].filter(() => Math.random() > 0.3); // Sometimes show no active imports

      setActiveImports(mockImports);

      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (startTime) => {
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return '#ef4444';
    if (progress < 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="real-time-monitor">
      {/* System Status */}
      <motion.div 
        className="system-status-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card-header">
          <h3 className="card-title">🖥️ System Status</h3>
          <span className="last-update">
            Updated {systemStatus.lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        <div className="status-grid">
          <div className="status-item">
            <div 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(systemStatus.database) }}
            ></div>
            <span className="status-label">Database</span>
            <span className="status-value">{systemStatus.database}</span>
          </div>
          <div className="status-item">
            <div 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(systemStatus.api) }}
            ></div>
            <span className="status-label">API Server</span>
            <span className="status-value">{systemStatus.api}</span>
          </div>
          <div className="status-item">
            <div 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(systemStatus.storage) }}
            ></div>
            <span className="status-label">File Storage</span>
            <span className="status-value">{systemStatus.storage}</span>
          </div>
        </div>
      </motion.div>

      {/* Active Imports */}
      <motion.div 
        className="active-imports-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="card-header">
          <h3 className="card-title">⚡ Active Imports</h3>
          <span className="import-count">
            {activeImports.length} active
          </span>
        </div>
        
        <div className="imports-list">
          <AnimatePresence>
            {activeImports.length === 0 ? (
              <motion.div 
                className="no-active-imports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="empty-icon">💤</div>
                <p>No active imports</p>
                <small>All imports completed</small>
              </motion.div>
            ) : (
              activeImports.map((importItem) => (
                <motion.div
                  key={importItem.id}
                  className="import-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="import-header">
                    <div className="import-info">
                      <h4 className="import-filename">{importItem.fileName}</h4>
                      <div className="import-meta">
                        <span className="import-records">
                          {importItem.recordsProcessed.toLocaleString()} / {importItem.totalRecords.toLocaleString()} records
                        </span>
                        <span className="import-duration">
                          {formatDuration(importItem.startTime)}
                        </span>
                        <span className="import-speed">
                          {importItem.speed} rec/sec
                        </span>
                      </div>
                    </div>
                    <div className="import-progress-circle">
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke={getProgressColor(importItem.progress)}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${importItem.progress * 1.005} 100.5`}
                          transform="rotate(-90 20 20)"
                          style={{ transition: 'stroke-dasharray 0.3s ease' }}
                        />
                      </svg>
                      <span className="progress-text">
                        {Math.round(importItem.progress)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="import-progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${importItem.progress}%`,
                        backgroundColor: getProgressColor(importItem.progress)
                      }}
                    ></div>
                  </div>
                  
                  <div className="import-actions">
                    <button className="action-btn pause-btn" title="Pause Import">
                      ⏸️
                    </button>
                    <button className="action-btn cancel-btn" title="Cancel Import">
                      ❌
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div 
        className="performance-metrics-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="card-header">
          <h3 className="card-title">📊 Performance</h3>
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-icon">🚀</div>
            <div className="metric-content">
              <span className="metric-value">2.3s</span>
              <span className="metric-label">Avg Response</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">💾</div>
            <div className="metric-content">
              <span className="metric-value">78%</span>
              <span className="metric-label">Memory Usage</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">🔄</div>
            <div className="metric-content">
              <span className="metric-value">156</span>
              <span className="metric-label">Requests/min</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <span className="metric-value">99.9%</span>
              <span className="metric-label">Uptime</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeMonitor;