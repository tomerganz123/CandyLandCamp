'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, MapPin, Users, Heart, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import VolunteerPopup from '@/components/VolunteerPopup';

interface GiftData {
  description: string;
  gifts: Array<{
    name: string;
    nameEn: string;
    description: string;
    descriptionHe?: string;
    times: Array<{
      day: string;
      time: string;
      duration: string;
      location: string;
      title?: string;
    }>;
    volunteering: {
      needed: boolean;
      roles: string[];
      description: string;
    };
  }>;
  volunteerInfo: {
    description: string;
    benefits: string[];
    commitment: string;
    contact: string;
  };
}

const giftIcons = {
  'קבאב הזמן': '🍽️',
  'סדנאות יוגה ומדיטציה': '🧘',
  'מסיבת שקיעה': '🎉',
};

import PublicLayout from '../layout-public';

interface VolunteerShiftData {
  shiftType: 'gift' | 'camp';
  giftName?: string;
  teamName?: string;
  role: string;
  timeSlot?: string;
  location?: string;
}

function GiftPageContent() {
  const { t, isRTL } = useI18n();
  const [giftData, setGiftData] = useState<GiftData | null>(null);
  const [volunteerPopup, setVolunteerPopup] = useState<{
    isOpen: boolean;
    shiftData: VolunteerShiftData | null;
  }>({
    isOpen: false,
    shiftData: null,
  });

  useEffect(() => {
    const fetchGiftData = async () => {
      try {
        const response = await fetch('/content/gift.json');
        const data = await response.json();
        setGiftData(data);
      } catch (error) {
        console.error('Failed to fetch gift data:', error);
      }
    };

    fetchGiftData();
  }, []);

  const handleVolunteerClick = (gift: any, role: string) => {
    // Find the main time slot for this gift
    const timeSlot = gift.times.length > 0 
      ? `${gift.times[0].day} ${gift.times[0].time} (${gift.times[0].duration})`
      : undefined;
    
    const location = gift.times.length > 0 ? gift.times[0].location : undefined;

    setVolunteerPopup({
      isOpen: true,
      shiftData: {
        shiftType: 'gift',
        giftName: gift.name,
        role,
        timeSlot,
        location
      }
    });
  };

  const handleCloseVolunteerPopup = () => {
    setVolunteerPopup({
      isOpen: false,
      shiftData: null,
    });
  };

  if (!giftData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-orange-50 to-yellow-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Gift Image */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img 
                  src="/gift.png" 
                  alt="Candy Land Gifts" 
                  className="max-w-sm md:max-w-md lg:max-w-lg w-full h-auto object-contain rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-3 -right-3">
                  <Sparkles className="h-10 w-10 text-purple-600 animate-pulse" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('gift.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('gift.subtitle')}
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">
                {giftData.description}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Gifts Section */}
        <section>
          <div className="grid grid-cols-1 gap-12">
            {giftData.gifts.map((gift, index) => {
              const isSunsetParty = gift.name === 'מסיבת שקיעה';
              return (
              <motion.div
                key={gift.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader 
                    className="bg-gradient-to-r from-orange-50 to-purple-50 pb-8 relative"
                    style={isSunsetParty ? {
                      backgroundImage: 'url(/7B.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundBlendMode: 'overlay',
                      backgroundColor: 'rgba(255, 255, 255, 0.85)'
                    } : {}}
                  >
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className="text-4xl">
                        {giftIcons[gift.name as keyof typeof giftIcons] || '✨'}
                      </div>
                      <div>
                        <CardTitle className="text-2xl md:text-3xl text-gray-900">
                          {isRTL ? gift.name : gift.nameEn}
                        </CardTitle>
                        <CardDescription className="text-lg mt-2 font-semibold" style={isSunsetParty ? {color: '#1f2937'} : {}}>
                          {isRTL && gift.descriptionHe ? gift.descriptionHe : gift.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    {/* Schedule */}
                    <div className="mb-8">
                      <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gift.times.map((time, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-600"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {time.title || `${time.day} Session`}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{time.day} at {time.time}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <span>Duration: {time.duration}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{time.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Volunteering */}
                    {gift.volunteering.needed && (
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <Users className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-green-900">Volunteers Needed!</h3>
                        </div>
                        <p className="text-green-800 mb-4">{gift.volunteering.description}</p>
                        <div className="mb-4">
                          <h4 className="font-semibold text-green-900 mb-2">Available Roles:</h4>
                          <div className="flex flex-wrap gap-2">
                            {gift.volunteering.roles.map((role, roleIndex) => (
                              <span
                                key={roleIndex}
                                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gift.volunteering.roles.map((role, roleIndex) => (
                            <Button 
                              key={roleIndex}
                              className="bg-green-600 hover:bg-green-700 text-sm"
                              onClick={() => handleVolunteerClick(gift, role)}
                            >
                              Volunteer as {role}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              );
            })}
          </div>
        </section>

        {/* Volunteer Info Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Heart className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">Volunteer With Us</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-orange-600">Why Volunteer?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{giftData.volunteerInfo.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Benefits:</h4>
                    {giftData.volunteerInfo.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-orange-600">Commitment & Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Time Commitment:</h4>
                      <p className="text-gray-700">{giftData.volunteerInfo.commitment}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Get Involved:</h4>
                      <p className="text-gray-700 mb-4">{giftData.volunteerInfo.contact}</p>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Contact Volunteer Coordinators
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join Us in Creating Magic
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Whether as a participant or volunteer, you're invited to be part of these special experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    {t('common.register')}
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  {t('common.volunteer')}
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
      
      {/* Volunteer Popup */}
      {volunteerPopup.shiftData && (
        <VolunteerPopup
          isOpen={volunteerPopup.isOpen}
          onClose={handleCloseVolunteerPopup}
          shiftType={volunteerPopup.shiftData.shiftType}
          giftName={volunteerPopup.shiftData.giftName}
          teamName={volunteerPopup.shiftData.teamName}
          role={volunteerPopup.shiftData.role}
          timeSlot={volunteerPopup.shiftData.timeSlot}
          location={volunteerPopup.shiftData.location}
        />
      )}
    </div>
  );
}

export default function GiftPage() {
  return (
    <PublicLayout>
      <GiftPageContent />
    </PublicLayout>
  );
}
