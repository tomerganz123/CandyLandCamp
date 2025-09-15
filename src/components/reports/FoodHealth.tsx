'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Utensils, Download, Heart, AlertTriangle, Shield } from 'lucide-react';
import { IMember } from '@/models/Member';

interface FoodHealthProps {
  token: string;
}

interface HealthData {
  members: IMember[];
  dietaryData: { restriction: string; count: number; percentage: number }[];
  membersWithMedical: IMember[];
  membersWithAllergies: IMember[];
  membersWithDietary: IMember[];
  healthSummary: {
    totalMembers: number;
    withDietaryRestrictions: number;
    withMedicalConditions: number;
    withAllergies: number;
    noDietaryRestrictions: number;
  };
  dietaryCounts: Record<string, number>;
}

export default function FoodHealth({ token }: FoodHealthProps) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/admin/reports/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load health data');
      }
    } catch (error) {
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const exportHealthData = async () => {
    try {
      const response = await fetch('/api/admin/reports/health?format=csv', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `baba-zman-health-${new Date().toISOString().split('T')[0]}.csv`;
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
    fetchHealthData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchHealthData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Utensils className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-800">Food & Health</h2>
        </div>
        
        <button
          onClick={exportHealthData}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Health Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <Utensils className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Dietary Restrictions</p>
              <p className="text-2xl font-semibold text-green-900">{data.healthSummary.withDietaryRestrictions}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Medical Conditions</p>
              <p className="text-2xl font-semibold text-red-900">{data.healthSummary.withMedicalConditions}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Allergies</p>
              <p className="text-2xl font-semibold text-yellow-900">{data.healthSummary.withAllergies}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">No Restrictions</p>
              <p className="text-2xl font-semibold text-blue-900">{data.healthSummary.noDietaryRestrictions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dietary Restrictions Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Restrictions Summary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data.dietaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="restriction" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#ef4444" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Health Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medical Conditions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Medical Conditions ({data.membersWithMedical.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.membersWithMedical.length > 0 ? (
              data.membersWithMedical.map((member) => (
                <div key={member._id as string} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                  <div className="text-sm text-gray-600">{member.phone}</div>
                  <div className="text-sm text-red-800 mt-1 font-medium">{member.medicalConditions}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No medical conditions reported</p>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Allergies ({data.membersWithAllergies.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.membersWithAllergies.length > 0 ? (
              data.membersWithAllergies.map((member) => (
                <div key={member._id as string} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                  <div className="text-sm text-gray-600">{member.phone}</div>
                  <div className="text-sm text-yellow-800 mt-1 font-medium">{member.allergies}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No allergies reported</p>
            )}
          </div>
        </div>
      </div>

      {/* Dietary Restrictions Details */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Restrictions Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.dietaryData.map((item, index) => (
            <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{item.restriction}</span>
                <div className="text-right">
                  <span className="text-lg font-semibold text-green-900">{item.count}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {data.dietaryData.length === 0 && (
          <p className="text-gray-500 text-center py-8">No dietary restrictions reported</p>
        )}
      </div>
    </div>
  );
}
