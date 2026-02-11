import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Trash2, Clock, User as UserIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token;
            
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/notifications`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setNotifications(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token;
            
            await axios.put(
                `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
            toast.error('Action failed');
        }
    };

    const markAllAsRead = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token;
            
            await axios.put(
                `${import.meta.env.VITE_API_URL}/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success('All marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Action failed');
        }
    };

    const deleteNotification = async (id) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token;
            
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/notifications/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Delete failed');
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        const handleNewNotification = () => fetchNotifications();
        window.addEventListener('new-notification', handleNewNotification);
        return () => window.removeEventListener('new-notification', handleNewNotification);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'request_sent': return <Bell className="text-blue-500" />;
            case 'request_accepted': return <Check className="text-green-500" />;
            case 'request_rejected': return <X className="text-red-500" />;
            default: return <Bell className="text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Bell className="mr-3 h-8 w-8 text-primary-600" />
                    Your Notifications
                </h1>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-full mb-4">
                        <Bell className="h-12 w-12 text-gray-300 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">We'll notify you when someone reaches out to you or updates a request.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div 
                            key={notification._id}
                            className={`group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${
                                !notification.read ? 'border-primary-600 bg-primary-50/30 dark:bg-primary-900/10' : 'border-transparent'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${
                                    notification.type === 'request_sent' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                                    notification.type === 'request_accepted' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                    notification.type === 'request_rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                    'bg-gray-100 text-gray-600 dark:bg-gray-700'
                                }`}>
                                    {notification.type === 'request_sent' ? <Bell size={20} /> :
                                     notification.type === 'request_accepted' ? <Check size={20} /> :
                                     <Clock size={20} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            {notification.sender?.name}
                                            <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                                {notification.sender?.bloodGroup || 'Blood Group'}
                                            </span>
                                        </h4>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                            <Clock size={12} className="mr-1" />
                                            {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    
                                    <div className="mt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {!notification.read && (
                                            <button 
                                                onClick={() => markAsRead(notification._id)}
                                                className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                                            >
                                                <Check size={14} /> Mark as read
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteNotification(notification._id)}
                                            className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
