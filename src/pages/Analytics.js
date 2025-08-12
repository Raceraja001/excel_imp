import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart, PieChart } from '../components/charts';
import './Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate sample data
      const sampleData = generateSampleData(timeRange);
      setAnalyticsData(sampleData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = (range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const labels = [];
    const importData = [];
    const recordData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      importData.push(Math.floor(Math.random() * 20) + 5);
      recordData.push(Math.floor(Math.random() * 5000) + 1000);
    }

    return {
      importTrends: {
        labels,
        datasets: [
          {
            label: 'Daily Imports',
            data: importData
          },
          {
            label: 'Records Processed',
            data: recordData.map(v => v / 100)
          }
        ]
      },
      dataTypes: {
        labels: ['Excel Files', 'CSV Files', 'JSON Data', 'Database Imports', 'API Data'],
        datasets: [{
          data: [45, 25, 15, 10, 5]
        }]
      },
      qualityMetrics: {
        labels,
        datasets: [{
          label: 'Quality Score',
          data: labels.map(() => Math.floor(Math.random() * 20) + 75)
        }]
      },
      departmentUsage: {
        labels: ['Engineering', 'Marketing', 'Sales', 'Finance', 'Operations'],
        datasets: [{
          data: [120, 85, 95, 60, 40]
        }]
      }
    };
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="analytics">
      {/* Analytics Header */}
      <motion.div 
        className="analytics-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-content">
          <div className="header-info">
            <h1>Analytics Dashboard</h1>
            <p>Comprehensive insights into your data operations</p>
          </div>
          <div className="header-controls">
            <select 
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="refresh-btn" onClick={fetchAnalyticsData}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="metrics-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>1,247</h3>
            <p>Total Imports</p>
            <span className="metric-change positive">+12.5%</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>2.4M</h3>
            <p>Records Processed</p>
            <span className="metric-change positive">+8.3%</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>94.2%</h3>
            <p>Success Rate</p>
            <span className="metric-change positive">+2.1%</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>2.3s</h3>
            <p>Avg Processing Time</p>
            <span className="metric-change negative">-0.4s</span>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        className="charts-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="chart-item large">
          <LineChart
            title="Import Trends"
            subtitle="Daily import activity and record processing"
            data={analyticsData?.importTrends}
            loading={loading}
            height={350}
            showArea={true}
          />
        </div>

        <div className="chart-item">
          <PieChart
            title="Data Sources"
            subtitle="Distribution by file type"
            data={analyticsData?.dataTypes}
            loading={loading}
            height={300}
          />
        </div>

        <div className="chart-item">
          <LineChart
            title="Data Quality"
            subtitle="Quality score trends"
            data={analyticsData?.qualityMetrics}
            loading={loading}
            height={300}
          />
        </div>

        <div className="chart-item">
          <BarChart
            title="Department Usage"
            subtitle="Imports by department"
            data={analyticsData?.departmentUsage}
            loading={loading}
            height={300}
          />
        </div>
      </motion.div>

      {/* Insights Panel */}
      <motion.div 
        className="insights-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Key Insights</h2>
            <p className="card-subtitle">Automated analysis of your data patterns</p>
          </div>
          <div className="card-body">
            <div className="insights-list">
              <div className="insight-item">
                <div className="insight-icon positive">📈</div>
                <div className="insight-content">
                  <h4>Import Volume Increasing</h4>
                  <p>Daily imports have increased by 12.5% compared to the previous period.</p>
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon warning">⚠️</div>
                <div className="insight-content">
                  <h4>Quality Score Fluctuation</h4>
                  <p>Data quality scores show some variation. Consider implementing stricter validation rules.</p>
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon positive">⚡</div>
                <div className="insight-content">
                  <h4>Performance Improvement</h4>
                  <p>Average processing time has decreased by 0.4 seconds due to recent optimizations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;