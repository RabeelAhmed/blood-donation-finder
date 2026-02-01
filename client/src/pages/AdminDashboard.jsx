import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Droplet, Activity, CheckCircle, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalPatients: 0,
    activeRequests: 0,
    successDonations: 0,
    bloodGroupStats: {},
    recentRequests: []
  });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load stats');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users'); // Ensure this endpoint exists and is protected
      setUsers(data);
    } catch (error) {
       console.error(error);
    }
  };

  const deleteUser = async (id) => {
      if(!window.confirm('Are you sure? This action is permanent!')) return;
      try {
          await api.delete(`/users/${id}`);
          toast.success('User removed successfully');
          // Refetch both lists to keep UI in sync
          fetchUsers();
          fetchStats();
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete user');
      }
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const filteredUsers = (users || []).filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Control Center</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor system activity and manage users</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Donors" value={stats.totalDonors} icon={Users} color="bg-red-500 shadow-red-200 dark:shadow-none" />
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Activity} color="bg-blue-500 shadow-blue-200 dark:shadow-none" />
        <StatCard title="Active Requests" value={stats.activeRequests} icon={Droplet} color="bg-orange-500 shadow-orange-200 dark:shadow-none" />
        <StatCard title="Successful Donations" value={stats.successDonations} icon={CheckCircle} color="bg-green-500 shadow-green-200 dark:shadow-none" />
      </div>

      {/* Blood Group Distribution */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Droplet className="mr-2 h-5 w-5 text-red-500" />
            Blood Group Inventory
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries(stats.bloodGroupStats || {}).map(([group, count]) => (
                <div key={group} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
                    <p className="text-xl font-black text-red-600 dark:text-red-400">{group}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mt-1">Donors</p>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Registry</h3>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 text-sm"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">User Profile</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Blood</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Join Date</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold">
                                            {user.name?.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                                        ${user.role === 'donor' ? 'bg-red-100 text-red-700' : 
                                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                          'bg-blue-100 text-blue-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-black text-red-600 dark:text-red-400">{user.bloodGroup || '—'}</div>
                                    <div className="text-[10px] text-gray-400">{user.city}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => deleteUser(user._id)} className="text-gray-400 hover:text-red-600 transition-colors p-2">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="card h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Blood Requests</h3>
            <div className="space-y-6 flex-grow">
                {(stats.recentRequests || []).map((req) => (
                    <div key={req._id} className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 pb-2">
                        <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-primary-500"></div>
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                {(req.patientId?.name || 'Deleted User')} requested {req.bloodGroup}
                            </p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                                ${req.status === 'accepted' ? 'text-green-600 bg-green-50' : 
                                  req.status === 'rejected' ? 'text-red-600 bg-red-50' : 
                                  'text-orange-600 bg-orange-50'}`}>
                                {req.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 truncate">"{req.message}"</p>
                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest gap-2">
                            <span>Donor: {req.donorId?.name || 'N/A'}</span>
                            <span>•</span>
                            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
                {(stats.recentRequests || []).length === 0 && (
                    <div className="text-center py-10">
                        <Activity className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No recent activity detected.</p>
                    </div>
                )}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button className="w-full text-center text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline">
                    View Full Request Log →
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
