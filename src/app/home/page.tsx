'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import MeltingTimeSection from '@/components/public/MeltingTimeSection';
import DesertSoundscape from '@/components/public/DesertSoundscape';

interface PublicStats {
  totalMembers: number;
  averageAge: number;
  arrivalDays: Array<{ day: string; count: number }>;
  genderBreakdown: Array<{ gender: string; count: number }>;
}

import PublicLayout from '../layout-public';

function PublicHome() {
  const { t, isRTL } = useI18n();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0
  });

  // Countdown to Midburn (Nov 24th 12pm Israel Time)
  useEffect(() => {
    // November 24th, 2025 at 12:00 PM Israel Time (UTC+2)
    const targetDate = new Date('2025-11-24T10:00:00Z'); // 12pm Israel = 10am UTC
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft({ days, hours, minutes });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Fetch public stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public-stats');
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      title: t('home.features.event.title'),
      description: t('home.features.event.description'),
      icon: Calendar,
      href: '/event',
      color: 'bg-blue-500'
    },
    {
      title: t('home.features.camp.title'),
      description: t('home.features.camp.description'),
      icon: Users,
      href: '/camp',
      color: 'bg-green-500'
    },
    {
      title: t('home.features.gift.title'),
      description: t('home.features.gift.description'),
      icon: Sparkles,
      href: '/gift',
      color: 'bg-purple-500'
    }
  ];

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white overflow-hidden"
        style={{
          backgroundImage: 'url(/baba-zman-logo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                {isRTL ? 'באבא זמן' : 'BABA ZMAN'}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-2 drop-shadow-lg">
                {t('home.hero.subtitle')}
              </p>
              <p className="text-base text-white/80 mb-6 drop-shadow-lg">
                {t('home.hero.tagline')}
              </p>
              <p className="text-lg font-semibold text-yellow-300 mb-6 drop-shadow-lg">
                November 24-29, 2025
              </p>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center items-center space-x-6 mb-8"
            >
              <div className="text-center bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg">
                  {timeLeft.days}
                </div>
                <div className="text-sm text-white/80 drop-shadow-lg">Days</div>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg">
                  {timeLeft.hours}
                </div>
                <div className="text-sm text-white/80 drop-shadow-lg">Hours</div>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg">
                  {timeLeft.minutes}
                </div>
                <div className="text-sm text-white/80 drop-shadow-lg">Minutes</div>
              </div>
            </motion.div>

            {/* Learn More Button Only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center"
            >
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm" asChild>
                <a href="#features">
                  {t('common.learnMore')}
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Time Is Melting Section - First after hero */}
      <MeltingTimeSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover BABA ZMAN
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore everything our camp has to offer for Midburn 2025
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href={feature.href}>
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      {stats && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('home.community.title')}
              </h2>
              <p className="text-xl text-gray-600">
                Live stats from our growing community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Total Members */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-orange-600">
                    {stats.totalMembers}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {t('home.community.totalMembers')}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Average Age */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-blue-600">
                    {stats.averageAge}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {t('home.community.avgAge')}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Arrival Days Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-lg">
                    {t('home.community.arrivalDays')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.arrivalDays}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="day"
                      >
                        {stats.arrivalDays.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Desert Soundscape */}
      <DesertSoundscape />
    </div>
  );
}

export default function HomePage() {
  return (
    <PublicLayout>
      <PublicHome />
    </PublicLayout>
  );
}
