import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Connect to Socket.IO server
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      
      // Register user with their ID
      newSocket.emit('register', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Listen for notifications
    newSocket.on('new_notification', (notification) => {
      console.log('Received notification:', notification);
      
      // Show toast notification on the left
      const notificationTypeConfig = {
        request_sent: { 
          icon: '📩', 
          gradient: 'from-blue-500 to-indigo-600',
          lightBg: 'bg-blue-50 dark:bg-blue-900/30' 
        },
        request_accepted: { 
          icon: '✅', 
          gradient: 'from-green-500 to-emerald-600',
          lightBg: 'bg-green-50 dark:bg-green-900/30' 
        },
        request_rejected: { 
          icon: '❌', 
          gradient: 'from-red-500 to-rose-600',
          lightBg: 'bg-red-50 dark:bg-red-900/30' 
        }
      };

      const config = notificationTypeConfig[notification.type] || { 
        icon: '🔔', 
        gradient: 'from-gray-500 to-slate-600',
        lightBg: 'bg-gray-50 dark:bg-gray-800/30' 
      };

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all duration-300 transform hover:scale-[1.02]`}
          >
            <div className={`w-2 bg-gradient-to-b ${config.gradient}`} />
            <div className="flex-1 p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 p-2 rounded-xl ${config.lightBg} shadow-inner`}>
                  <span className="text-xl leading-none">{config.icon}</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                      {notification.sender?.name || 'New Notification'}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                      Now
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-100 dark:border-gray-800">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full px-4 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors focus:outline-none"
              >
                DISMISS
              </button>
            </div>
          </div>
        ),
        {
          position: 'top-left',
          duration: 6000
        }
      );

      // Trigger a custom event for components to refresh notifications
      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
