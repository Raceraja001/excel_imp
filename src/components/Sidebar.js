import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeMenu, setActiveMenu, collapsed, setCollapsed }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Statistics'
    },
    {
      id: 'import',
      label: 'Data Import',
      icon: '📥',
      description: 'Upload & Import Files'
    },
    {
      id: 'explorer',
      label: 'Data Explorer',
      icon: '🔍',
      description: 'Browse & Search Data'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Reports & Insights'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Configuration'
    }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🗃️</span>
          {!collapsed && (
            <div className="logo-text">
              <h2>DataHub</h2>
              <span>Admin Panel</span>
            </div>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
                title={collapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">Admin User</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;