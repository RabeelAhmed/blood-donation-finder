import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, Droplet } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Droplet className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">BloodFinder</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/find-donors" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Find Donors
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                 {user.role === 'admin' && (
                    <Link to="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                      Admin
                    </Link>
                )}
                <NotificationBell />
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Welcome, {user.name}</span>
                    <button onClick={handleLogout} className="p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="pt-2 pb-3 space-y-1 px-4">
             <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Appearance</span>
                <ThemeToggle />
             </div>
             {user ? (
              <>
                <Link 
                  to="/find-donors" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Find Donors
                </Link>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
                 {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Admin
                    </Link>
                )}
                <div className="pt-4 pb-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="px-3 text-sm text-gray-500 dark:text-gray-400 mb-2">Logged in as {user.name}</p>
                    <button 
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                </div>
              </>
             ) : (
                <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors text-center mt-4"
                    >
                      Register
                    </Link>
                </>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
