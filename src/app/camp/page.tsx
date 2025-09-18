'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Shield, Wrench, Utensils, Palette, Music, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import VolunteerPopup from '@/components/VolunteerPopup';

interface CampData {
  about: string;
  values: Array<{
    title: string;
    description: string;
  }>;
  layoutImage: string;
  teams: Array<{
    name: string;
    description: string;
    responsibilities: string[];
    volunteer: boolean;
  }>;
  codeOfConduct: string[];
}

const teamIcons = {
  'Art Team': Palette,
  'Build Team': Wrench,
  'Kitchen Team': Utensils,
  'Safety Team': Shield,
  'Logistics Team': Users,
  'DJ/Music Team': Music,
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

function CampPageContent() {
  const { t } = useI18n();
  const [campData, setCampData] = useState<CampData | null>(null);
  const [volunteerPopup, setVolunteerPopup] = useState<{
    isOpen: boolean;
    shiftData: VolunteerShiftData | null;
  }>({
    isOpen: false,
    shiftData: null,
  });

  useEffect(() => {
    const fetchCampData = async () => {
      try {
        const response = await fetch('/content/camp.json');
        const data = await response.json();
        setCampData(data);
      } catch (error) {
        console.error('Failed to fetch camp data:', error);
      }
    };

    fetchCampData();
  }, []);

  const handleVolunteerClick = (team: any) => {
    setVolunteerPopup({
      isOpen: true,
      shiftData: {
        shiftType: 'camp',
        teamName: team.name,
        role: 'Team Member', // Generic role for camp teams
      }
    });
  };

  const handleCloseVolunteerPopup = () => {
    setVolunteerPopup({
      isOpen: false,
      shiftData: null,
    });
  };

  if (!campData) {
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
      <section className="bg-gradient-to-br from-orange-50 to-yellow-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('camp.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('camp.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* About Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Heart className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('camp.sections.about')}</h2>
            </div>
            <Card>
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {campData.about}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Values Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <CheckCircle className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('camp.sections.values')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campData.values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-600">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Camp Layout */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Users className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">Camp Layout</h2>
            </div>
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-12 mb-4">
                    <p className="text-gray-500 text-lg">
                      Camp layout visualization coming soon!
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      We're working on an interactive camp map to help you navigate our space.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Teams Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Wrench className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('camp.sections.teams')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campData.teams.map((team, index) => {
                const IconComponent = teamIcons[team.name as keyof typeof teamIcons] || Users;
                return (
                  <motion.div
                    key={team.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{team.name}</CardTitle>
                            {team.volunteer && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                Volunteers Needed
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base mb-4">
                          {team.description}
                        </CardDescription>
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Responsibilities:</h4>
                          <ul className="space-y-1">
                            {team.responsibilities.map((responsibility, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-orange-600 mt-1">•</span>
                                <span className="text-gray-600 text-sm">{responsibility}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {team.volunteer && (
                          <Button 
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleVolunteerClick(team)}
                          >
                            {t('common.volunteer')}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Code of Conduct */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Shield className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('camp.sections.conduct')}</h2>
            </div>
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campData.codeOfConduct.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{rule}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Join Our Camp?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Become part of the BABA ZMAN family and help create magic in the desert.
            </p>
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3">
              <a href="/" target="_blank" rel="noopener noreferrer">
                {t('common.register')}
              </a>
            </Button>
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

export default function CampPage() {
  return (
    <PublicLayout>
      <CampPageContent />
    </PublicLayout>
  );
}
