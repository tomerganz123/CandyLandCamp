'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Clock, MapPin, Mail, Loader2, CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VolunteerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  shiftType: 'gift' | 'camp';
  giftName?: string;
  teamName?: string;
  role: string;
  timeSlot?: string;
  location?: string;
}

interface VolunteerFormData {
  name: string;
  email: string;
  campName: string;
}

export default function VolunteerPopup({
  isOpen,
  onClose,
  shiftType,
  giftName,
  teamName,
  role,
  timeSlot,
  location
}: VolunteerPopupProps) {
  const [formData, setFormData] = useState<VolunteerFormData>({
    name: '',
    email: '',
    campName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        campName: formData.campName || undefined,
        shiftType,
        giftName: shiftType === 'gift' ? giftName : undefined,
        teamName: shiftType === 'camp' ? teamName : undefined,
        role,
        timeSlot,
        location
      };

      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setIsSuccess(true);
      
      // Close popup after 2 seconds of success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: '', email: '', campName: '' });
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError('');
      setIsSuccess(false);
      setFormData({ name: '', email: '', campName: '' });
    }
  };

  const shiftTitle = shiftType === 'gift' ? giftName : teamName;
  const shiftDescription = shiftType === 'gift' ? 'Gift Volunteer' : 'Camp Team';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md mx-auto z-10"
            >
            <Card className="w-full bg-white shadow-2xl border-0">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Volunteer Registration</CardTitle>
                </div>
                
                <CardDescription>{shiftDescription}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Shift Details */}
                <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-orange-900">{shiftTitle}</h3>
                  <div className="flex items-center space-x-2 text-sm text-orange-800">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{role}</span>
                  </div>
                  
                  {timeSlot && (
                    <div className="flex items-center space-x-2 text-sm text-orange-800">
                      <Clock className="h-4 w-4" />
                      <span>{timeSlot}</span>
                    </div>
                  )}
                  
                  {location && (
                    <div className="flex items-center space-x-2 text-sm text-orange-800">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>

                {/* Success State */}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Registration Successful!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      You're now registered for this volunteer shift. We'll be in touch soon!
                    </p>
                  </motion.div>
                )}

                {/* Form */}
                {!isSuccess && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="name"
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="campName" className="text-sm font-medium text-gray-700">
                        Camp Name <span className="text-gray-500">(optional)</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="campName"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Your camp name (if applicable)"
                          value={formData.campName}
                          onChange={(e) => setFormData({ ...formData, campName: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        disabled={isSubmitting || !formData.name || !formData.email}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          'Register'
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Info Text */}
                <p className="text-xs text-gray-500 text-center">
                  By registering, you're committing to help make our camp amazing. 
                  We'll contact you with more details about your volunteer shift.
                </p>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
