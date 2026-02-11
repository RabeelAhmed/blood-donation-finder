import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from '@/components/ui/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Loader2, MapPin, Droplet, MapPinOff } from 'lucide-react';
import DonorPopup from '@/components/DonorPopup';
import RequestModal from '@/components/RequestModal';
import { useAuth } from '@/context/AuthContext';

const FindDonors = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);

  const isPatient = user?.role === 'patient';

  // Check if donor has location sharing enabled on mount
  useEffect(() => {
    if (!isPatient && user?.locationSharingEnabled) {
      setLocationSharingEnabled(true);
      if (user?.location?.coordinates) {
        setLocation({
          latitude: user.location.coordinates[1],
          longitude: user.location.coordinates[0]
        });
      }
    }
  }, [user, isPatient]);

  const toggleLocationSharing = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);

    // PATIENT FLOW: Just get location and search for donors
    if (isPatient) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchNearbyDonors(latitude, longitude);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable it in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
          }
          toast.error(errorMessage);
          console.error('Error getting location:', error);
        }
      );
      return;
    }

    // DONOR FLOW: Toggle location sharing in database
    if (!locationSharingEnabled) {
      // Enable location sharing
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const response = await axios.put(
              `${import.meta.env.VITE_API_URL}/users/location`,
              { latitude, longitude, enabled: true },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setLocation({ latitude, longitude });
            setLocationSharingEnabled(true);
            setLoading(false);
            toast.success('Location sharing enabled! Patients can now find you on the map.');
          } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'Failed to enable location sharing');
            console.error('Error enabling location:', error);
          }
        },
        (error) => {
          setLoading(false);
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable it in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
          }
          toast.error(errorMessage);
          console.error('Error getting location:', error);
        }
      );
    } else {
      // Disable location sharing
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        await axios.put(
          `${import.meta.env.VITE_API_URL}/users/location`,
          { enabled: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setLocationSharingEnabled(false);
        setLoading(false);
        toast.success('Location sharing disabled. You are no longer visible to patients.');
      } catch (error) {
        setLoading(false);
        toast.error(error.response?.data?.message || 'Failed to disable location sharing');
        console.error('Error disabling location:', error);
      }
    }
  };

  const fetchNearbyDonors = async (lat, lng) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lng,
      });
      if (bloodGroup) params.append('bloodGroup', bloodGroup);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/nearby?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonors(response.data);
      setLoading(false);
      if (response.data.length === 0) {
        toast('No donors found nearby', { icon: 'ℹ️' });
      } else {
        toast.success(`Found ${response.data.length} donors nearby!`);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Error fetching donors');
      console.error('Error fetching donors:', error);
    }
  };

  const handleMarkerClick = (donor) => {
    setSelectedDonor(donor);
  };

  const handleSendRequest = (donor) => {
    setSelectedDonor(donor);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    setShowRequestModal(false);
    setSelectedDonor(null);
    toast.success('Request sent successfully!');
  };

  useEffect(() => {
    // Optionally trigger location on mount or wait for user action
    // getUserLocation(); 
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isPatient ? 'Find Nearby Donors' : 'Enable Your Location'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isPatient 
              ? 'Locate blood donors within 10km of your current location.' 
              : 'Share your location to help patients find you when you\'re available.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {isPatient && (
            <div className="relative">
              <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
              <select 
                className="appearance-none w-full sm:w-48 h-11 pl-10 pr-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium shadow-sm hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <svg 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
          
          <Button 
            onClick={toggleLocationSharing} 
            disabled={loading}
            className={`h-11 px-6 font-medium shadow-md hover:shadow-lg transition-all ${
              locationSharingEnabled && !isPatient
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {locationSharingEnabled && !isPatient ? (
                  <>
                    <MapPinOff className="mr-2 h-4 w-4" />
                    Disable Location
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    {isPatient ? 'Find Donors' : 'Enable Location'}
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="h-[600px] overflow-hidden relative shadow-lg">
         {!location ? (
             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 z-10">
                 <div className="text-center p-8 max-w-md">
                     <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30">
                       <MapPin className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                       Location Access Needed
                     </h3>
                     <p className="text-gray-600 dark:text-gray-400 mb-6">
                       {isPatient 
                         ? 'Allow location access to discover nearby blood donors on the map.' 
                         : 'Enable your location so patients can find you when they need blood donations.'}
                     </p>
                     <Button 
                       onClick={toggleLocationSharing}
                       className="bg-primary-600 hover:bg-primary-700 shadow-md"
                     >
                       <MapPin className="mr-2 h-4 w-4" />
                       Enable Location
                     </Button>
                 </div>
             </div>
         ) : null}
         
         {location && (
            <div className="w-full h-full">
                <Map
                    initialViewState={{
                        longitude: location.longitude,
                        latitude: location.latitude,
                        zoom: 13
                    }}
                    style={{width: '100%', height: '100%'}}
                    mapStyle="https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL"
                >
                    <MapMarker
                        longitude={location.longitude}
                        latitude={location.latitude}
                        color="blue"
                    />
                    {isPatient && donors.map(donor => (
                        donor.location && donor.location.coordinates ? (
                            <MapMarker
                                key={donor._id}
                                longitude={donor.location.coordinates[0]}
                                latitude={donor.location.coordinates[1]}
                                color="red"
                                onClick={() => handleMarkerClick(donor)}
                            />
                        ) : null
                    ))}
                </Map>
                
                {!isPatient && locationSharingEnabled && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Your location is now visible to patients
                    </p>
                  </div>
                )}
            </div>
         )}
      </Card>

      {/* Donor Popup - Only for patients */}
      {isPatient && selectedDonor && !showRequestModal && (
        <DonorPopup
          donor={selectedDonor}
          userLocation={location}
          onClose={() => setSelectedDonor(null)}
          onSendRequest={handleSendRequest}
        />
      )}

      {/* Request Modal - Only for patients */}
      {isPatient && showRequestModal && selectedDonor && (
        <RequestModal
          donor={selectedDonor}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedDonor(null);
          }}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default FindDonors;
