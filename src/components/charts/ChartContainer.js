import React from 'react';
import { motion } from 'framer-motion';
import './ChartContainer.css';

const ChartContainer = ({ 
  title, 
  subtitle, 
  children, 
  actions,
  loading = false,
  error = null,
  className = ''
}) => {
  return (
    <motion.div 
      className={`chart-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div className="chart-actions">
            {actions}
          </div>
        )}
      </div>
      
      <div className="chart-content">
        {loading && (
          <div className="chart-loading">
            <div className="spinner"></div>
            <p>Loading chart data...</p>
          </div>
        )}
        
        {error && (
          <div className="chart-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && children}
      </div>
    </motion.div>
  );
};

export default ChartContainer;