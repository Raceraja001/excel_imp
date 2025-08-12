import React, { useState, useEffect } from 'react';
import RealTimeMonitor from '../components/RealTimeMonitor';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalImports: 0,
    totalRecords: 0,
    successRate: 0,
    avgProcessingTime: '0s'
  });
  const [recentImports, setRecentImports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('http://localhost:8000/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalImports: statsData.total_imports || 0,
          totalRecords: statsData.total_records || 0,
          successRate: statsData.success_rate || 0,
          avgProcessingTime: statsData.avg_processing_time || '0s'
        });
      }

      // Fetch recent imports
      const importsResponse = await fetch('http://localhost:8000/import-history/');
      if (importsResponse.ok) {
        const importsData = await importsResponse.json();
        setRecentImports(importsData.history?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalImports.toLocaleString()}</h3>
            <p className="stat-label">Total Imports</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalRecords.toLocaleString()}</h3>
            <p className="stat-label">Records Processed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.successRate}%</h3>
            <p className="stat-label">Success Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.avgProcessingTime}</h3>
            <p className="stat-label">Avg Processing Time</p>
          </div>
        </div>
      </div>

      {/* Real-time Monitoring */}
      <div className="monitoring-section">
        <RealTimeMonitor />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Imports */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Imports</h2>
            <p className="card-subtitle">Latest data import activities</p>
          </div>
          <div className="card-body">
            {recentImports.length > 0 ? (
              <div className="imports-list">
                {recentImports.map((item, index) => (
                  <div key={index} className="import-item">
                    <div className="import-icon">📄</div>
                    <div className="import-details">
                      <h4 className="import-session">
                        Session {item.session_id?.substring(0, 8)}...
                      </h4>
                      <p className="import-info">
                        {item.record_count?.toLocaleString()} records • {' '}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="import-status">
                      <span className="status-badge success">Success</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No recent imports</p>
                <small>Import data will appear here</small>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
            <p className="card-subtitle">Common tasks and shortcuts</p>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="action-btn primary">
                <span className="action-icon">📥</span>
                <div className="action-content">
                  <h4>Import Data</h4>
                  <p>Upload new Excel files</p>
                </div>
              </button>

              <button className="action-btn secondary">
                <span className="action-icon">🔍</span>
                <div className="action-content">
                  <h4>Explore Data</h4>
                  <p>Browse imported data</p>
                </div>
              </button>

              <button className="action-btn secondary">
                <span className="action-icon">📈</span>
                <div className="action-content">
                  <h4>View Analytics</h4>
                  <p>Generate reports</p>
                </div>
              </button>

              <button className="action-btn secondary">
                <span className="action-icon">⚙️</span>
                <div className="action-content">
                  <h4>Settings</h4>
                  <p>Configure system</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">System Status</h2>
            <p className="card-subtitle">Current system health</p>
          </div>
          <div className="card-body">
            <div className="status-list">
              <div className="status-item">
                <div className="status-indicator online"></div>
                <span className="status-label">Database Connection</span>
                <span className="status-value">Online</span>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <span className="status-label">API Server</span>
                <span className="status-value">Running</span>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <span className="status-label">File Storage</span>
                <span className="status-value">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;