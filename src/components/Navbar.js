import React from 'react';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = ({ toggleSidebar, activeMenu }) => {
  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      import: 'Data Import',
      explorer: 'Data Explorer',
      analytics: 'Analytics',
      settings: 'Settings'
    };
    return titles[activeMenu] || 'Dashboard';
  };

  const getPageDescription = () => {
    const descriptions = {
      dashboard: 'Overview of your data operations and system status',
      import: 'Upload and import Excel files into your database',
      explorer: 'Browse, search, and analyze your imported data',
      analytics: 'View reports, charts, and data insights',
      settings: 'Configure system settings and preferences'
    };
    return descriptions[activeMenu] || '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        >
          ☰
        </button>
        <div className="page-info">
          <h1 className="page-title">{getPageTitle()}</h1>
          <p className="page-description">{getPageDescription()}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-actions">
          <NotificationCenter />
          <button className="navbar-btn" title="Help">
            ❓
          </button>
          <div className="user-menu">
            <button className="user-btn">
              <span className="user-avatar">👤</span>
              <span className="user-name">Admin</span>
              <span className="dropdown-arrow">▼</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;