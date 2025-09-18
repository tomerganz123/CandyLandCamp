'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, PieChart, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PublicStats {
  totalMembers: number;
  averageAge: number;
  genderBreakdown: Array<{ gender: string; count: number }>;
  ageDistribution: Array<{ range: string; count: number }>;
  arrivalDays: Array<{ day: string; count: number }>;
  roles: Array<{ role: string; count: number }>;
  lastUpdated: string;
}

import PublicLayout from '../layout-public';

function ReportsPageContent() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#f97316', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']; // Changed second color to pink for female

  // Sort arrival days by day of the week (Saturday to Wednesday)
  const sortArrivalDays = (arrivalDays: Array<{ day: string; count: number }>) => {
    const dayOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
    
    return arrivalDays.sort((a, b) => {
      const indexA = dayOrder.indexOf(a.day);
      const indexB = dayOrder.indexOf(b.day);
      
      // If day not found in order, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  };

  // Custom tooltip component for gender chart
  const GenderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = stats?.genderBreakdown.reduce((sum, item) => sum + item.count, 0) || 0;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium">{data.payload.gender}</span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <div>Count: <span className="font-semibold">{data.value}</span></div>
            <div>Percentage: <span className="font-semibold">{percentage}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend component with gender icons
  const GenderLegend = (props: any) => {
    const { payload } = props;
    const total = stats?.genderBreakdown.reduce((sum, item) => sum + item.count, 0) || 0;
    
    const getGenderIcon = (gender: string) => {
      switch (gender.toLowerCase()) {
        case 'male':
        case 'man':
        case 'זכר':
          return '♂️';
        case 'female':
        case 'woman':
        case 'נקבה':
          return '♀️';
        case 'non-binary':
        case 'לא בינארי':
          return '⚧️';
        case 'other':
        case 'אחר':
          return '🏳️‍🌈';
        default:
          return '👤';
      }
    };
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.count / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <span className="text-lg">{getGenderIcon(entry.payload.gender)}</span>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
              </div>
              <div className="text-sm">
                <div className="font-medium">{entry.payload.gender}</div>
                <div className="text-gray-600">
                  {entry.payload.count} ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Custom tooltip component for roles chart
  const RolesTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = stats?.roles.reduce((sum, item) => sum + item.count, 0) || 0;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium">{data.payload.role}</span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <div>Count: <span className="font-semibold">{data.value}</span></div>
            <div>Percentage: <span className="font-semibold">{percentage}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend component with role icons
  const RolesLegend = (props: any) => {
    const { payload } = props;
    const total = stats?.roles.reduce((sum, item) => sum + item.count, 0) || 0;
    
    const getRoleIcon = (role: string) => {
      const roleLower = role.toLowerCase();
      if (roleLower.includes('build') || roleLower.includes('construction')) return '🔨';
      if (roleLower.includes('kitchen') || roleLower.includes('food') || roleLower.includes('cook')) return '👨‍🍳';
      if (roleLower.includes('art') || roleLower.includes('creative')) return '🎨';
      if (roleLower.includes('dj') || roleLower.includes('music') || roleLower.includes('sound')) return '🎵';
      if (roleLower.includes('safety') || roleLower.includes('security')) return '🛡️';
      if (roleLower.includes('medical') || roleLower.includes('health')) return '⚕️';
      if (roleLower.includes('transport') || roleLower.includes('logistics')) return '🚛';
      if (roleLower.includes('gate') || roleLower.includes('entrance')) return '🚪';
      if (roleLower.includes('clean') || roleLower.includes('maintenance')) return '🧹';
      if (roleLower.includes('photo') || roleLower.includes('media')) return '📸';
      if (roleLower.includes('volunteer') || roleLower.includes('general')) return '🙋‍♀️';
      return '⭐'; // Default for other roles
    };
    
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.count / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <span className="text-lg">{getRoleIcon(entry.payload.role)}</span>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
              </div>
              <div className="text-sm">
                <div className="font-medium">{entry.payload.role}</div>
                <div className="text-gray-600">
                  {entry.payload.count} ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <TrendingUp className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('reports.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('reports.subtitle')}
            </p>
            <div className="bg-blue-100 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                {t('reports.privacy')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats Overview */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-orange-600">
                    {stats.totalMembers}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {t('reports.charts.totalMembers')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-blue-600">
                    {stats.averageAge}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Average Age
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PieChart className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-green-600">
                    {stats.genderBreakdown.length}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Gender Categories
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>
        </section>

        {/* Charts Section */}
        <section className="space-y-12">
          {/* Gender Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {t('reports.charts.genderBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={stats.genderBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="count"
                      nameKey="gender"
                    >
                      {stats.genderBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<GenderTooltip />} />
                    <Legend content={<GenderLegend />} />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Age Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {t('reports.charts.ageDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBar data={stats.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </RechartsBar>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Arrival Days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {t('reports.charts.arrivalDays')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBar data={sortArrivalDays([...stats.arrivalDays])}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </RechartsBar>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Roles Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {t('reports.charts.rolesBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={stats.roles}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="count"
                      nameKey="role"
                    >
                      {stats.roles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<RolesTooltip />} />
                    <Legend content={<RolesLegend />} />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Last Updated */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <PublicLayout>
      <ReportsPageContent />
    </PublicLayout>
  );
}
