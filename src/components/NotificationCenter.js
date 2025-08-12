import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate fetching notifications
    const sampleNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Import Completed',
        message: 'Your Excel file has been successfully imported with 1,247 records.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        icon: '✅'
      },
      {
        id: 2,
        type: 'warning',
        title: 'Data Quality Alert',
        message: 'Quality score dropped to 78% in the latest import. Review recommended.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        icon: '⚠️'
      },
      {
        id: 3,
        type: 'info',
        title: 'System Update',
        message: 'New features have been added to the analytics dashboard.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        icon: 'ℹ️'
      },
      {
        id: 4,
        type: 'error',
        title: 'Import Failed',
        message: 'Failed to import data.xlsx due to format validation errors.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: false,
        icon: '❌'
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'success': return 'notification-success';
      case 'warning': return 'notification-warning';
      case 'error': return 'notification-error';
      case 'info': return 'notification-info';
      default: return 'notification-info';
    }
  };

  return (
    <div className="notification-center">
      {/* Notification Bell */}
      <button 
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="notification-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="notification-panel"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Panel Header */}
              <div className="notification-header">
                <div className="header-title">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="unread-count">{unreadCount} unread</span>
                  )}
                </div>
                <div className="header-actions">
                  {unreadCount > 0 && (
                    <button 
                      className="mark-all-read-btn"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                    >
                      ✓
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      className="clear-all-btn"
                      onClick={clearAll}
                      title="Clear all"
                    >
                      🗑️
                    </button>
                  )}
                  <button 
                    className="close-btn"
                    onClick={() => setIsOpen(false)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <div className="empty-icon">🔕</div>
                    <p>No notifications</p>
                    <small>You're all caught up!</small>
                  </div>
                ) : (
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`notification-item ${getNotificationTypeClass(notification.type)} ${
                          notification.read ? 'read' : 'unread'
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {notification.icon}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                            {!notification.read && <span className="unread-dot"></span>}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>
                          <div className="notification-timestamp">
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                        <button
                          className="delete-notification-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          title="Delete notification"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Panel Footer */}
              {notifications.length > 0 && (
                <div className="notification-footer">
                  <button className="view-all-btn">
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;