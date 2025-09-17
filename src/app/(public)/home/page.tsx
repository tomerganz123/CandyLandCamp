'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PublicStats {
  totalMembers: number;
  averageAge: number;
  arrivalDays: Array<{ day: string; count: number }>;
  genderBreakdown: Array<{ gender: string; count: number }>;
}

export default function PublicHome() {
  const { t, isRTL } = useI18n();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0
  });

  // Countdown to Midburn
  useEffect(() => {
    const targetDate = new Date('2025-05-26T00:00:00');
    
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
      <section className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/desert-pattern.svg')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                {isRTL ? 'באבא זמן' : 'BABA ZMAN'}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-2">
                {t('home.hero.subtitle')}
              </p>
              <p className="text-lg text-gray-500 mb-8">
                {t('home.hero.tagline')}
              </p>
              <p className="text-lg font-semibold text-orange-600 mb-8">
                {t('home.hero.dates')}
              </p>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center items-center space-x-8 mb-12"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">
                  {timeLeft.days}
                </div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">
                  {timeLeft.hours}
                </div>
                <div className="text-sm text-gray-600">Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">
                  {timeLeft.minutes}
                </div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3">
                <Link href="/">
                  {t('common.register')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3" asChild>
                <a href="#features">
                  {t('common.learnMore')}
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

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
    </div>
  );
}
