'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, CheckCircle, ArrowRight } from 'lucide-react';
import KitchenShiftForm from '@/components/KitchenShiftForm';
import { I18nProvider } from '@/components/I18nProvider';

function KitchenShiftsPageContent() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = (data: any) => {
    setSuccessMessage(data.message || 'Successfully registered for kitchen shift!');
    setShowSuccess(true);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-purple-600 py-16 px-4">
        <div className="absolute inset-0 bg-[url('/images/desert-pattern.svg')] opacity-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <ChefHat className="h-16 w-16 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kitchen Volunteer Shifts
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Sign up for a kitchen shift and help feed our amazing community! 🍳✨
          </p>
        </motion.div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-4xl mx-auto px-4 mt-6"
        >
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Registration Successful!</h3>
                <p className="text-green-800 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
            How Kitchen Shifts Work
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Choose Your Shift</h3>
                <p className="text-sm">
                  Select a day and time that works for you. Morning shifts need <strong>5 volunteers</strong>, 
                  evening shifts need <strong>6 volunteers</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Shift Managers Lead the Way</h3>
                <p className="text-sm">
                  Each shift needs <strong>1 shift manager</strong> to coordinate. Managers must register first 
                  before other volunteers can sign up. Consider becoming a shift manager!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Help Your Camp Community</h3>
                <p className="text-sm">
                  Target is <strong>1 shift per member</strong> during the week. Together, we'll create 
                  amazing meals for everyone!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ArrowRight className="h-4 w-4 text-orange-600" />
              <span>Fill out the form below to register for your shift</span>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <KitchenShiftForm onSuccess={handleSuccess} />
        </motion.div>
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="text-center text-gray-600 text-sm">
          <p>Questions about kitchen shifts? Contact the Kitchen Manager for more details.</p>
        </div>
      </div>
    </div>
  );
}

export default function KitchenShiftsPage() {
  return (
    <I18nProvider>
      <KitchenShiftsPageContent />
    </I18nProvider>
  );
}

