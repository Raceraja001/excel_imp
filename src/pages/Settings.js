import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'DataHub Admin',
      siteDescription: 'Advanced Data Management Platform',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      language: 'en'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3b82f6',
      sidebarCollapsed: false,
      showAnimations: true,
      compactMode: false
    },
    data: {
      maxFileSize: 50,
      allowedFileTypes: ['xlsx', 'xls', 'csv'],
      autoValidation: true,
      retentionDays: 90,
      backupEnabled: true
    },
    notifications: {
      emailNotifications: true,
      importAlerts: true,
      errorAlerts: true,
      weeklyReports: false,
      emailAddress: 'admin@datahub.com'
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireSpecialChars: true,
      twoFactorAuth: false,
      apiRateLimit: 1000
    },
    integrations: {
      webhookUrl: '',
      apiKey: '',
      slackIntegration: false,
      emailService: 'smtp'
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: '🏠' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'data', label: 'Data Management', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Simulate API call to load settings
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      localStorage.removeItem('adminSettings');
      window.location.reload();
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">Site Name</label>
          <input
            type="text"
            className="setting-input"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Site Description</label>
          <textarea
            className="setting-textarea"
            value={settings.general.siteDescription}
            onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
            rows="3"
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Timezone</label>
          <select
            className="setting-select"
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Date Format</label>
          <select
            className="setting-select"
            value={settings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h3>Appearance & Theme</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">Theme</label>
          <div className="theme-selector">
            <button
              className={`theme-option ${settings.appearance.theme === 'light' ? 'active' : ''}`}
              onClick={() => handleSettingChange('appearance', 'theme', 'light')}
            >
              ☀️ Light
            </button>
            <button
              className={`theme-option ${settings.appearance.theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleSettingChange('appearance', 'theme', 'dark')}
            >
              🌙 Dark
            </button>
            <button
              className={`theme-option ${settings.appearance.theme === 'auto' ? 'active' : ''}`}
              onClick={() => handleSettingChange('appearance', 'theme', 'auto')}
            >
              🔄 Auto
            </button>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Primary Color</label>
          <div className="color-picker">
            <input
              type="color"
              value={settings.appearance.primaryColor}
              onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
            />
            <span className="color-value">{settings.appearance.primaryColor}</span>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Sidebar</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="sidebarCollapsed"
              checked={settings.appearance.sidebarCollapsed}
              onChange={(e) => handleSettingChange('appearance', 'sidebarCollapsed', e.target.checked)}
            />
            <label htmlFor="sidebarCollapsed">Start collapsed</label>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Animations</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="showAnimations"
              checked={settings.appearance.showAnimations}
              onChange={(e) => handleSettingChange('appearance', 'showAnimations', e.target.checked)}
            />
            <label htmlFor="showAnimations">Enable animations</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="settings-section">
      <h3>Data Management</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">Max File Size (MB)</label>
          <input
            type="number"
            className="setting-input"
            value={settings.data.maxFileSize}
            onChange={(e) => handleSettingChange('data', 'maxFileSize', parseInt(e.target.value))}
            min="1"
            max="500"
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Data Retention (Days)</label>
          <input
            type="number"
            className="setting-input"
            value={settings.data.retentionDays}
            onChange={(e) => handleSettingChange('data', 'retentionDays', parseInt(e.target.value))}
            min="1"
            max="365"
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Auto Validation</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="autoValidation"
              checked={settings.data.autoValidation}
              onChange={(e) => handleSettingChange('data', 'autoValidation', e.target.checked)}
            />
            <label htmlFor="autoValidation">Validate data on import</label>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Backup</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="backupEnabled"
              checked={settings.data.backupEnabled}
              onChange={(e) => handleSettingChange('data', 'backupEnabled', e.target.checked)}
            />
            <label htmlFor="backupEnabled">Enable automatic backups</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">Email Address</label>
          <input
            type="email"
            className="setting-input"
            value={settings.notifications.emailAddress}
            onChange={(e) => handleSettingChange('notifications', 'emailAddress', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Email Notifications</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            />
            <label htmlFor="emailNotifications">Enable email notifications</label>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Import Alerts</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="importAlerts"
              checked={settings.notifications.importAlerts}
              onChange={(e) => handleSettingChange('notifications', 'importAlerts', e.target.checked)}
            />
            <label htmlFor="importAlerts">Notify on import completion</label>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Error Alerts</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="errorAlerts"
              checked={settings.notifications.errorAlerts}
              onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
            />
            <label htmlFor="errorAlerts">Notify on errors</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">Session Timeout (minutes)</label>
          <input
            type="number"
            className="setting-input"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            min="5"
            max="480"
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Password Min Length</label>
          <input
            type="number"
            className="setting-input"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            min="6"
            max="32"
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Special Characters</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="requireSpecialChars"
              checked={settings.security.requireSpecialChars}
              onChange={(e) => handleSettingChange('security', 'requireSpecialChars', e.target.checked)}
            />
            <label htmlFor="requireSpecialChars">Require special characters</label>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Two-Factor Auth</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="twoFactorAuth"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            />
            <label htmlFor="twoFactorAuth">Enable 2FA</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="settings-section">
      <h3>External Integrations</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">Webhook URL</label>
          <input
            type="url"
            className="setting-input"
            value={settings.integrations.webhookUrl}
            onChange={(e) => handleSettingChange('integrations', 'webhookUrl', e.target.value)}
            placeholder="https://your-webhook-url.com"
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">API Key</label>
          <input
            type="password"
            className="setting-input"
            value={settings.integrations.apiKey}
            onChange={(e) => handleSettingChange('integrations', 'apiKey', e.target.value)}
            placeholder="Enter your API key"
          />
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Slack Integration</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="slackIntegration"
              checked={settings.integrations.slackIntegration}
              onChange={(e) => handleSettingChange('integrations', 'slackIntegration', e.target.checked)}
            />
            <label htmlFor="slackIntegration">Enable Slack notifications</label>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Email Service</label>
          <select
            className="setting-select"
            value={settings.integrations.emailService}
            onChange={(e) => handleSettingChange('integrations', 'emailService', e.target.value)}
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'data': return renderDataSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'integrations': return renderIntegrationSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="settings">
      {/* Settings Header */}
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-content">
          <div className="header-info">
            <h1>System Settings</h1>
            <p>Configure your admin panel preferences and system behavior</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              🔄 Reset to Defaults
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  ✅ Saved
                </>
              ) : (
                <>
                  💾 Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="settings-container">
        {/* Settings Tabs */}
        <motion.div 
          className="settings-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div 
          className="settings-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="card">
            <div className="card-body">
              {renderTabContent()}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;