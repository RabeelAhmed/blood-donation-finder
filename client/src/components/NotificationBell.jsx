import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { connected } = useSocket();
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/notifications/unread/count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(data.slice(0, 5)); // Show only 5 most recent
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Listen for new notifications
    const handleNewNotification = () => {
      fetchUnreadCount();
      fetchNotifications();
    };

    window.addEventListener('new-notification', handleNewNotification);

    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_sent':
        return '📩';
      case 'request_accepted':
        return '✅';
      case 'request_rejected':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) fetchNotifications();
        }}
        className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {connected && (
          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-900"></span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.sender?.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
            <button 
              onClick={() => {
                setShowDropdown(false);
                navigate('/notifications');
              }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1 px-4"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
