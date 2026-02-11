import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FindDonors from './pages/FindDonors';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              
              <Route
                path="find-donors"
                element={
                  <PrivateRoute>
                    <FindDonors />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <PrivateRoute roles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
          <Toaster 
            position="top-left"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)',
              },
              success: {
                style: {
                  background: 'rgba(16, 185, 129, 0.95)',
                  backdropFilter: 'blur(8px)',
                },
              },
              error: {
                style: {
                  background: 'rgba(239, 68, 68, 0.95)',
                  backdropFilter: 'blur(8px)',
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
