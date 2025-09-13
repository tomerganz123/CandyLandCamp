'use client';

import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import { CheckCircle, Flame, Users, Calendar, MapPin } from 'lucide-react';

export default function HomePage() {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleRegistrationSuccess = (data: any) => {
    setRegistrationSuccess(true);
    setSuccessData(data);
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-green-200 success-bounce">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Registration Successful! 🎉
              </h1>
              <p className="text-lg text-gray-600">
                Welcome to our Midburn camp family!
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
              <p className="text-green-800 font-medium mb-2">
                {successData?.message || 'Your registration has been received successfully.'}
              </p>
              <p className="text-green-700 text-sm">
                We'll review your application and send you a confirmation email at{' '}
                <span className="font-semibold">{successData?.data?.email}</span> within 24 hours.
              </p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <h3 className="font-semibold text-gray-800 text-center mb-4">What's Next?</h3>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Check Your Email</p>
                  <p className="text-sm text-gray-600">You'll receive a confirmation email with next steps.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Join Our Community</p>
                  <p className="text-sm text-gray-600">We'll add you to our WhatsApp group and send camp updates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Prepare for the Burn</p>
                  <p className="text-sm text-gray-600">Get ready for an amazing experience at Midburn!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setRegistrationSuccess(false);
                setSuccessData(null);
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
            >
              Register Another Member
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Flame className="h-16 w-16 text-yellow-300 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Join Our Midburn Camp!
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Register now for an unforgettable experience at Israel's Burning Man
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <Users className="h-6 w-6" />
              <span className="font-semibold">Amazing Community</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
              <span className="font-semibold">June 2024</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <MapPin className="h-6 w-6" />
              <span className="font-semibold">Negev Desert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Camp Registration Form
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fill out the form below to join our camp. We'll review your application and get back to you within 24 hours.
            </p>
          </div>

          <RegistrationForm onSuccess={handleRegistrationSuccess} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Flame className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-gray-300 mb-2">
            Built with ❤️ for our Midburn community
          </p>
          <p className="text-sm text-gray-400">
            Questions? Contact us at camp@midburn.org
          </p>
        </div>
      </footer>
    </div>
  );
}
