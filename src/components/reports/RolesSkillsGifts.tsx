'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Wrench, Download, Users, Star, Gift } from 'lucide-react';
import { IMember } from '@/models/Member';

interface RolesSkillsGiftsProps {
  token: string;
}

interface SkillsData {
  members: IMember[];
  roleData: { role: string; count: number; percentage: number }[];
  giftData: { gift: string; count: number; percentage: number }[];
  skillsData: { skill: string; count: number; members: string[] }[];
  summary: {
    totalMembers: number;
    totalRoles: number;
    totalSkills: number;
    totalGifts: number;
  };
}

const COLORS = ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#10b981', '#3b82f6'];

export default function RolesSkillsGifts({ token }: RolesSkillsGiftsProps) {
  const [data, setData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSkillsData = async () => {
    try {
      const response = await fetch('/api/admin/reports/skills', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch skills data');

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load skills data');
      }
    } catch (error) {
      setError('Failed to load skills data');
    } finally {
      setLoading(false);
    }
  };

  const exportSkillsData = async () => {
    try {
      const response = await fetch('/api/admin/reports/skills?format=csv', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `baba-zman-skills-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  useEffect(() => {
    fetchSkillsData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading skills data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button onClick={fetchSkillsData} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-800">Roles, Skills & Gifts</h2>
        </div>
        <button onClick={exportSkillsData} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Total Roles</p>
              <p className="text-2xl font-semibold text-orange-900">{data.summary.totalRoles}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Unique Skills</p>
              <p className="text-2xl font-semibold text-blue-900">{data.summary.totalSkills}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <Gift className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Gift Options</p>
              <p className="text-2xl font-semibold text-green-900">{data.summary.totalGifts}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Members</p>
              <p className="text-2xl font-semibold text-purple-900">{data.summary.totalMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Camp Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data.roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gift Participation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie data={data.giftData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count" nameKey="gift" label>
                {data.giftData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Directory */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Special Skills Directory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.skillsData.slice(0, 12).map((skill, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-gray-900 mb-2">{skill.skill}</div>
              <div className="text-sm text-blue-600 mb-2">{skill.count} members</div>
              <div className="text-xs text-gray-600">{skill.members.slice(0, 3).join(', ')}{skill.members.length > 3 ? '...' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
