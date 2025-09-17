'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Backpack, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

interface EventData {
  dates: {
    start: string;
    end: string;
    year: number;
  };
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  schedule: Array<{
    day: string;
    date: string;
    events: Array<{
      time: string;
      title: string;
      description: string;
    }>;
  }>;
  travelTips: Array<{
    title: string;
    content: string;
  }>;
  packingList: Array<{
    category: string;
    items: string[];
  }>;
  ticketsFAQ: Array<{
    question: string;
    answer: string;
  }>;
}

import PublicLayout from '../layout-public';

function EventPageContent() {
  const { t } = useI18n();
  const [eventData, setEventData] = useState<EventData | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch('/content/event.json');
        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error('Failed to fetch event data:', error);
      }
    };

    fetchEventData();
  }, []);

  if (!eventData) {
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
              {t('event.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('event.subtitle')}
            </p>
            <div className="flex items-center justify-center space-x-8 text-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-orange-600" />
                <span className="font-semibold">
                  {new Date(eventData.dates.start).toLocaleDateString()} - {new Date(eventData.dates.end).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-orange-600" />
                <span className="font-semibold">{eventData.location.address}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Daily Schedule */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Clock className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('event.sections.schedule')}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {eventData.schedule.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-orange-600">
                        {day.day} - {new Date(day.date).toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {day.events.map((event, eventIndex) => (
                          <div key={eventIndex} className="flex space-x-4">
                            <div className="flex-shrink-0 w-16 text-sm font-semibold text-gray-600">
                              {event.time}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <p className="text-sm text-gray-600">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Travel Tips */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <MapPin className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('event.sections.travel')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventData.travelTips.map((tip, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{tip.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Packing List */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <Backpack className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('event.sections.packing')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventData.packingList.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-600">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Tickets FAQ */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <HelpCircle className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('event.sections.tickets')}</h2>
            </div>
            <div className="space-y-6">
              {eventData.ticketsFAQ.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Map Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <MapPin className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('event.sections.dates')}</h2>
            </div>
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{eventData.location.name}</h3>
                  <p className="text-lg text-gray-600 mb-6">{eventData.location.address}</p>
                  <div className="bg-gray-100 rounded-lg p-8">
                    <p className="text-gray-500">
                      Interactive map coming soon! <br />
                      Coordinates: {eventData.location.coordinates.lat}, {eventData.location.coordinates.lng}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default function EventPage() {
  return (
    <PublicLayout>
      <EventPageContent />
    </PublicLayout>
  );
}
