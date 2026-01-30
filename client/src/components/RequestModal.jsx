import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RequestModal = ({ donor, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests', {
        donorId: donor._id,
        bloodGroup: donor.bloodGroup,
        message,
      });
      toast.success('Request sent successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Panel */}
      <div className="relative w-full max-w-lg mx-auto my-6 z-50">
        <div className="border-0 rounded-lg shadow-xl relative flex flex-col w-full bg-white dark:bg-gray-800 outline-none focus:outline-none">
          <div className="flex items-center justify-between p-5 border-b border-solid border-gray-200 dark:border-gray-700 rounded-t">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Request Blood from {donor.name}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-900 dark:text-gray-400 opacity-50 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:opacity-100"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="relative p-6 flex-auto">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group Needed</label>
                <input 
                    type="text" 
                    value={donor.bloodGroup} 
                    disabled 
                    className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message / Urgency</label>
                <textarea
                  rows={4}
                  required
                  className="input-field min-h-[100px]"
                  placeholder="Please describe the emergency and location..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-end pt-4 border-t border-solid border-gray-200 dark:border-gray-700 rounded-b gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
