import { MapPin, Phone, Calendar, Droplet, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DonorCard = ({ donor, onRequest, requestStatus }) => {
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

      <div className="flex justify-between items-start gap-2 pr-8"> {/* Added padding-right for heart icon */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{donor.name}</h3>
            {donor.availability && (
                 <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Available
                </span>
            )}
           </div>
          <div className="mt-1.5 flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
            <span className="truncate">{donor.city}</span>
          </div>
          {/* Show donation count if available */}
          {donor.donationHistory && donor.donationHistory.length > 0 && (
               <div className="mt-1.5 flex items-center text-[11px] text-primary-600 dark:text-primary-400 font-bold">
                   <Droplet className="flex-shrink-0 mr-1.5 h-3 w-3" />
                   {donor.donationHistory.length} Donations
               </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-black text-lg sm:text-xl border border-primary-100 dark:border-primary-800 shadow-sm">
            {donor.bloodGroup}
          </div>
        </div>
      </div>
      
      <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-4">
        {requestStatus === 'accepted' ? (
           <>
             <div className="grid grid-cols-2 gap-3 mb-3">
                  <a href={`tel:${donor.phone}`} className="btn-secondary flex justify-center items-center text-xs py-2.5 font-bold shadow-sm">
                      <Phone className="mr-2 h-3.5 w-3.5" /> Call
                  </a>
                  <a href={`https://wa.me/${donor.phone}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex justify-center items-center text-xs py-2.5 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-100 dark:border-green-900 shadow-sm font-bold">
                      <MessageCircle className="mr-2 h-3.5 w-3.5" /> WhatsApp
                  </a>
             </div>
             <button
               type="button"
               disabled
               className="w-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800 flex justify-center items-center text-sm py-3 font-bold rounded-lg"
             >
               Request Accepted
             </button>
           </>
        ) : (
          <button
            type="button"
            onClick={() => !requestStatus && onRequest(donor)}
            disabled={requestStatus === 'pending' || requestStatus === 'rejected'}
            className={`w-full flex justify-center items-center text-sm py-3 font-bold rounded-lg shadow-lg transition-all
              ${!requestStatus 
                ? 'btn-primary' 
                : requestStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-not-allowed shadow-none'
                : 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed shadow-none'}`}
          >
            {requestStatus === 'pending' ? (
               <>
                 <Clock className="mr-2 h-4.5 w-4.5" />
                 Request Sent (Pending)
               </>
            ) : requestStatus === 'rejected' ? (
               'Request Rejected'
            ) : (
              <>
                <Droplet className="mr-2 h-4.5 w-4.5" />
                Request Blood Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DonorCard;
