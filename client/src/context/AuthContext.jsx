import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Login success!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Registration success!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out');
  };

  const updateProfile = async (profileData) => {
      try {
          const { data } = await api.put('/users/profile', profileData);
          const updatedUser = { ...user, ...data }; // Merge updates
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
          toast.success('Profile updated');
          return data;
      } catch (error) {
           const message = error.response?.data?.message || 'Update failed';
           toast.error(message);
           throw error;
      }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, updateUser: setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
