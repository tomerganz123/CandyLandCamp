'use client';

import { useState } from 'react';
import AdditionalInfoForm from '@/components/AdditionalInfoForm';
import { CheckCircle, Flame } from 'lucide-react';

export default function AdditionalInfoPage() {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleSubmissionSuccess = (data: any) => {
    setSubmissionSuccess(true);
    setSuccessData(data);
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-green-200 success-bounce">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Information Submitted! 🎉
              </h1>
              <p className="text-lg text-gray-600">
                Thank you for providing your additional information!
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
              <p className="text-green-800 font-medium">
                {successData?.message || 'Your information has been recorded successfully.'}
              </p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <h3 className="font-semibold text-gray-800 text-center mb-4">What's Next?</h3>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Stay Updated</p>
                  <p className="text-sm text-gray-600">We'll use this information to organize logistics, meals, and tent arrangements.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Prepare for Camp</p>
                  <p className="text-sm text-gray-600">Check your email and WhatsApp for updates and important information.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">See You Soon!</p>
                  <p className="text-sm text-gray-600">We can't wait to see you at BABA ZMAN!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmissionSuccess(false);
                setSuccessData(null);
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
            >
              Submit Another Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white py-16 min-h-[400px] flex items-center"
        style={{
          backgroundImage: 'url(/baba-zman-logo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Flame className="h-16 w-16 text-yellow-300 animate-pulse drop-shadow-lg" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
            BABA ZMAN Additional Information
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow-lg">
            Help us organize the camp better by providing additional details
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Additional Information Form
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Please fill out this form to help us organize tents, meals, and logistics for the camp.
            </p>
          </div>

          <AdditionalInfoForm onSuccess={handleSubmissionSuccess} />
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
