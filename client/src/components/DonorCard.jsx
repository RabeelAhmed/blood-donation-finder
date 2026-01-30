import { MapPin, Phone, Calendar, Droplet, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DonorCard = ({ donor, onRequest }) => {
  const { user, updateUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(user?.favorites?.includes(donor._id));

  const toggleFavorite = async () => {
      try {
          const { data } = await api.put(`/users/favorite/${donor._id}`);
          const newStatus = !isFavorite;
          setIsFavorite(newStatus);
          
          // Update global user context so filters and other components stay in sync
          if (user) {
              const updatedUser = { ...user, favorites: data };
              updateUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          toast.success(newStatus ? 'Added to favorites' : 'Removed from favorites');
      } catch (error) {
          toast.error('Failed to update favorites');
      }
  };

  return (
    <div className="card hover:shadow-md transition-shadow relative">
      {user?.role === 'patient' && (
          <button 
            onClick={toggleFavorite}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
      )}

      <div className="flex justify-between items-start pr-10"> {/* Added padding-right for heart icon */}
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{donor.name}</h3>
            {donor.availability && (
                 <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Available
                </span>
            )}
           </div>
          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            {donor.city}
          </div>
          {/* Show donation count if available (privacy permitting or just for badges) */}
          {donor.donationHistory && donor.donationHistory.length > 0 && (
               <div className="mt-1 flex items-center text-xs text-blue-600 font-medium">
                   <Droplet className="flex-shrink-0 mr-1.5 h-3 w-3" />
                   {donor.donationHistory.length} Donations
               </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-bold text-lg">
            {donor.bloodGroup}
          </div>
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
             <a href={`tel:${donor.phone}`} className="btn-secondary flex justify-center items-center text-xs py-2">
                 <Phone className="mr-1.5 h-3 w-3" /> Call
             </a>
             <a href={`https://wa.me/${donor.phone}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex justify-center items-center text-xs py-2 text-green-600 hover:text-green-700 hover:bg-green-50">
                 <MessageCircle className="mr-1.5 h-3 w-3" /> WhatsApp
             </a>
        </div>
        
        <button
          type="button"
          onClick={() => onRequest(donor)}
          className="w-full btn-primary flex justify-center items-center text-sm"
        >
          <Droplet className="mr-2 h-4 w-4" />
          Request Blood
        </button>
      </div>
    </div>
  );
};

export default DonorCard;
