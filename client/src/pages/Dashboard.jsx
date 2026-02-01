import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DonorCard from '../components/DonorCard';
import RequestModal from '../components/RequestModal';
import CityAutocomplete from '../components/CityAutocomplete';
import { Search, Filter, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  // Redirect admin to admin panel
  useEffect(() => {
    if (user.role === 'admin') {
      navigate('/admin');
    }
  }, [user.role, navigate]);
  
  // Patient State
  const [donors, setDonors] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchGroup, setSearchGroup] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false); // [Favorites]
  const [selectedDonor, setSelectedDonor] = useState(null);
  
  // Donor State
  const [requests, setRequests] = useState([]);
  const [availability, setAvailability] = useState(user?.availability);
  const [donationHistory, setDonationHistory] = useState(user?.donationHistory || []);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [newDonation, setNewDonation] = useState({ date: '', location: '', notes: '' });

  // Common State
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    if (user.role === 'patient') {
      fetchDonors();
      fetchMyRequests(); // Requests sent by patient
    } else if (user.role === 'donor') {
      fetchIncomingRequests(); // Requests received by donor
      setAvailability(user.availability);
      fetchMyRequests(); // History if needed
    }
  }, [user.role, user.availability, onlyAvailable, onlyEligible, showFavorites]);

  const fetchDonors = async () => {
    try {
      const { data } = await api.get(`/users/donors`, {
          params: {
              city: searchCity,
              bloodGroup: searchGroup,
              isEligible: onlyEligible || null,
              availability: onlyAvailable ? 'true' : null,
              favorites: showFavorites ? 'true' : null
          }
      });
      if (Array.isArray(data)) {
        setDonors(data);
      } else {
        console.error('Expected donors array, got:', data);
        setDonors([]);
      }
    } catch (error) {
      console.error('Fetch donors error:', error);
      setDonors([]);
    }
  };

  const fetchMyRequests = async () => {
      try {
          const { data } = await api.get('/requests');
          if (Array.isArray(data)) {
            setMyRequests(data);
          } else {
            console.error('Expected requests array, got:', data);
            setMyRequests([]);
          }
      } catch (error) {
          console.error('Fetch my requests error:', error);
          setMyRequests([]);
      }
  }

  const fetchIncomingRequests = async () => {
      try {
           const { data } = await api.get('/requests'); 
           if (Array.isArray(data)) {
             setRequests(data);
           } else {
             console.error('Expected incoming requests array, got:', data);
             setRequests([]);
           }
      } catch (error) {
           console.error('Fetch incoming requests error:', error);
           setRequests([]);
      }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleAvailabilityToggle = async () => {
      try {
          const newStatus = !availability;
          await updateProfile({ availability: newStatus });
          setAvailability(newStatus);
      } catch (error) {
          console.error(error);
      }
  }

  const handleRequestAction = async (requestId, status) => {
      try {
          await api.put(`/requests/${requestId}`, { status });
          toast.success(`Request ${status}`);
          fetchIncomingRequests();
      } catch (error) {
          toast.error('Failed to update status');
      }
  }

  const handleAddDonation = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/donation', newDonation);
      setDonationHistory(data.donationHistory);
      setShowDonationForm(false);
      setNewDonation({ date: '', location: '', notes: '' });
      toast.success('Donation logged successfully');
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to log donation');
    }
  };

  const calculateEligibility = () => {
    if (!donationHistory || !Array.isArray(donationHistory) || donationHistory.length === 0) {
      return { eligible: true, text: 'You are eligible to donate now.' };
    }
    
    // Create copy before sorting to avoid mutation during render
    const sortedHistory = [...donationHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (!sortedHistory[0]?.date) {
      return { eligible: true, text: 'You are eligible to donate now.' };
    }

    const lastDate = new Date(sortedHistory[0].date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + 90); 

    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return { eligible: true, text: 'You are eligible to donate now!' };
    } else {
        return { 
            eligible: false, 
            text: `You will be eligible in ${diffDays} day${diffDays === 1 ? '' : 's'} (${nextDate.toLocaleDateString()}).` 
        };
    }
  };

  const eligibility = user.role === 'donor' ? calculateEligibility() : { eligible: true, text: '' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
           Welcome, {user.name}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            {user.role === 'patient' ? 'Find donors near you' : 'Manage your donation requests'}
        </p>
      </div>

      {user.role === 'patient' && (
        <div className="space-y-8">
          {/* Search Section */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Search className="mr-2 h-5 w-5 text-primary-600" />
                Find Blood Donors
            </h2>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                  <div className="w-full">
                    <CityAutocomplete 
                        value={searchCity} 
                        onChange={setSearchCity} 
                    />
                  </div>
                  <select
                    className="input-field bg-white dark:bg-gray-800"
                    value={searchGroup}
                    onChange={(e) => setSearchGroup(e.target.value)}
                  >
                    <option value="">Any Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <button type="submit" className="btn-primary w-full shadow-lg">
                    Search Donors
                  </button>
              </div>
              <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                          type="checkbox" 
                          checked={onlyAvailable}
                          onChange={(e) => setOnlyAvailable(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Available Only</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                          type="checkbox" 
                          checked={onlyEligible}
                          onChange={(e) => setOnlyEligible(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Eligible to Donate</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                          type="checkbox" 
                          checked={showFavorites}
                          onChange={(e) => setShowFavorites(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-red-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">❤️ My Favorites</span>
                  </label>
              </div>
            </form>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(donors || []).map((donor) => {
              if (!donor) return null;
              // Find if there's an existing request for this donor
              const request = (myRequests || []).find(r => 
                (r.donorId?._id === donor._id) || (r.donorId === donor._id)
              );
              
              return (
                <DonorCard 
                  key={donor._id} 
                  donor={donor} 
                  onRequest={setSelectedDonor} 
                  requestStatus={request?.status}
                />
              );
            })}
          </div>
          
           {/* My Requests Status */}
           <div className="card overflow-hidden">
               <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                   <Clock className="mr-2 h-5 w-5 text-blue-600" />
                   My Requests
               </h2>
               <div className="overflow-x-auto -mx-6 px-6">
                   <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                       <thead className="bg-gray-50 dark:bg-gray-900">
                           <tr>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Donor</th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Group</th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                           </tr>
                       </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {(myRequests || []).map((req) => (
                                <tr key={req._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{req.patientId?.name || user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.bloodGroup}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                             ${req.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                               req.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                               'bg-yellow-100 text-yellow-800'}`}>
                                             {req.status}
                                         </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                   </table>
                   {myRequests.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">No requests sent yet.</p>}
               </div>
           </div>
        </div>
      )}

      {user.role === 'donor' && (
        <div className="space-y-8">
             {/* Availability Toggle */}
            <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Donor Status</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Turn off if you are not available to donate</p>
                </div>
                <button
                    onClick={handleAvailabilityToggle}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${availability ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                    <span className="sr-only">Use setting</span>
                    <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${availability ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                </button>
            </div>

            {/* Donation History Section */}
             <div className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="w-full sm:w-auto">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-primary-600" />
                            Donation History
                        </h2>
                        <div className="flex flex-wrap gap-3 mt-3">
                             <div className="bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-md">
                                 <p className="text-[10px] uppercase text-primary-600 dark:text-primary-400 font-bold tracking-wider">Total Donations</p>
                                 <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{donationHistory.length}</p>
                             </div>
                             <div className={`px-3 py-1.5 rounded-md ${eligibility.eligible ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                                 <p className={`text-[10px] uppercase font-bold tracking-wider ${eligibility.eligible ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>Status</p>
                                 <p className={`text-sm font-bold leading-tight ${eligibility.eligible ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>{eligibility.eligible ? 'Eligible' : 'Waiting Period'}</p>
                             </div>
                        </div>
                         <p className={`text-xs mt-2 ${eligibility.eligible ? 'text-green-600' : 'text-orange-500'}`}>
                            {eligibility.text}
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowDonationForm(!showDonationForm)}
                        className="btn-secondary text-sm"
                    >
                        {showDonationForm ? 'Cancel' : 'Log Donation'}
                    </button>
                </div>

                {showDonationForm && (
                    <form onSubmit={handleAddDonation} className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    required
                                    className="input-field"
                                    value={newDonation.date}
                                    onChange={(e) => setNewDonation({...newDonation, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / Hospital</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. City Hospital"
                                    className="input-field"
                                    value={newDonation.location}
                                    onChange={(e) => setNewDonation({...newDonation, location: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Any side effects, weight, etc."
                                    className="input-field"
                                    value={newDonation.notes}
                                    onChange={(e) => setNewDonation({...newDonation, notes: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button type="submit" className="btn-primary">Save Record</button>
                        </div>
                    </form>
                )}

                 <div className="overflow-x-auto -mx-6 px-6">
                   {(donationHistory || []).length > 0 ? (
                       <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                           {[...(donationHistory || [])].sort((a,b) => new Date(b.date) - new Date(a.date)).map((record, index) => (
                               <li key={index} className="py-4">
                                   <div className="flex justify-between gap-4">
                                       <div>
                                           <p className="text-sm font-medium text-gray-900 dark:text-white">{record.location}</p>
                                           {record.notes && <p className="text-sm text-gray-500 dark:text-gray-400">{record.notes}</p>}
                                       </div>
                                       <div className="text-right flex-shrink-0">
                                           <p className="text-sm text-gray-900 dark:text-gray-100">{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</p>
                                           <p className="text-xs text-gray-500">Donation</p>
                                       </div>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : (
                       <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">No donations logged yet. Start your journey!</p>
                   )}
                </div>
             </div>

            {/* Incoming Requests */}
            <div className="card">
               <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Incoming Requests</h2>
                <div className="space-y-4">
                   {(requests || []).map((req) => (
                       <div key={req._id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                           <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                               <div className="w-full">
                                   <h3 className="font-medium text-gray-900 dark:text-white">Request from {req.patientId?.name || 'Patient'}</h3>
                                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Needed: {req.bloodGroup}</p>
                                   <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                       "{req.message}"
                                   </div>
                               </div>
                               <div className="flex flex-col items-end space-y-3 flex-shrink-0 w-full sm:w-auto">
                                   <span className="text-xs text-gray-400">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</span>
                                   
                                   {req.status === 'pending' ? (
                                       <div className="flex space-x-2 w-full sm:w-auto">
                                           <button 
                                            onClick={() => handleRequestAction(req._id, 'accepted')}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-sm transition-colors">
                                            Accept
                                           </button>
                                           <button 
                                            onClick={() => handleRequestAction(req._id, 'rejected')}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 shadow-sm transition-colors">
                                            Reject
                                           </button>
                                       </div>
                                   ) : (
                                       <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider
                                            ${req.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {req.status}
                                       </span>
                                   )}
                               </div>
                           </div>
                       </div>
                   ))}
                   {(requests || []).length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No incoming requests yet.</p>}
               </div>
            </div>
        </div>
      )}

      {selectedDonor && (
        <RequestModal 
          donor={selectedDonor} 
          onClose={() => setSelectedDonor(null)} 
          onSuccess={fetchMyRequests}
        />
      )}
    </div>
  );
};

export default Dashboard;
