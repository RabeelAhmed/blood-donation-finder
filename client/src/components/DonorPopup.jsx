import React from 'react';
import { X, MapPin, Phone, Droplet, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { calculateDistance, formatDistance } from '@/lib/distance';

const DonorPopup = ({ donor, userLocation, onClose, onSendRequest }) => {
  if (!donor) return null;

  // Calculate distance
  const distance = userLocation && donor.location?.coordinates
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        donor.location.coordinates[1], // lat
        donor.location.coordinates[0]  // lng
      )
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="relative shadow-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white pr-8">
                {donor.name || 'Donor'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  donor.availability 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {donor.availability ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Available
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Unavailable
                    </>
                  )}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Blood Group */}
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                  <Droplet className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Blood Group</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {donor.bloodGroup || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Distance */}
              {distance !== null && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Distance from you</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatDistance(distance)}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {donor.phone || 'No phone provided'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {donor.city || 'Location not specified'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => onSendRequest(donor)}
                  disabled={!donor.availability}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Request
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>

              {!donor.availability && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  This donor is currently unavailable
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DonorPopup;
