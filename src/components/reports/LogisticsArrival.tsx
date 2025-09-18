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
import { Car, Download, Calendar, Users, Truck, Clock } from 'lucide-react';
import { IMember } from '@/models/Member';

interface LogisticsArrivalProps {
  token: string;
}

interface LogisticsData {
  members: IMember[];
  arrivalSchedule: Record<string, IMember[]>;
  arrivalData: { day: string; count: number; members: string[] }[];
  earlyArrivalTeam: IMember[];
  transportationNeeds: { needsRide: number; hasVehicle: number; totalSeats: number };
  departureCommitment: { committed: number; notCommitted: number };
  vehicleInventory: { member: string; details: string }[];
  summary: {
    totalMembers: number;
    earlyArrivals: number;
    needsTransport: number;
    hasVehicles: number;
    committedToSaturday: number;
  };
}

const ARRIVAL_COLORS = {
  'Saturday': '#10b981',
  'Sunday': '#3b82f6', 
  'Monday': '#8b5cf6',
  'Tuesday': '#f59e0b',
  'Wednesday': '#ef4444',
  'Thursday': '#6b7280'
};

// Sort arrival days by day of the week (Saturday to Wednesday)
const sortArrivalData = (arrivalData: { day: string; count: number; members: string[] }[]) => {
  const dayOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  
  return arrivalData.sort((a, b) => {
    const indexA = dayOrder.indexOf(a.day);
    const indexB = dayOrder.indexOf(b.day);
    
    // If day not found in order, put it at the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
};

export default function LogisticsArrival({ token }: LogisticsArrivalProps) {
  const [data, setData] = useState<LogisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogisticsData = async () => {
    try {
      const response = await fetch('/api/admin/reports/logistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logistics data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load logistics data');
      }
    } catch (error) {
      setError('Failed to load logistics data');
    } finally {
      setLoading(false);
    }
  };

  const exportLogisticsData = async () => {
    try {
      const response = await fetch('/api/admin/reports/logistics?format=csv', {
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
        a.download = `baba-zman-logistics-${new Date().toISOString().split('T')[0]}.csv`;
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
    fetchLogisticsData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading logistics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchLogisticsData}
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
          <Car className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Logistics & Arrival</h2>
        </div>
        
        <button
          onClick={exportLogisticsData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Early Arrivals</p>
              <p className="text-2xl font-semibold text-green-900">{data.summary.earlyArrivals}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Need Transport</p>
              <p className="text-2xl font-semibold text-blue-900">{data.summary.needsTransport}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Have Vehicles</p>
              <p className="text-2xl font-semibold text-purple-900">{data.summary.hasVehicles}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Stay Till Saturday</p>
              <p className="text-2xl font-semibold text-orange-900">{data.summary.committedToSaturday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Arrival Schedule Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Arrival Schedule by Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={sortArrivalData([...data.arrivalData])}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Early Arrival Team */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Early Arrival Team (Build Days: Sat & Sun 22/23 Nov)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.earlyArrivalTeam.length > 0 ? (
              data.earlyArrivalTeam.map((member) => (
                <div key={member._id as string} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{member.firstName} {member.lastName}</span>
                    <div className="text-sm text-gray-500">{member.campRole}</div>
                  </div>
                  <div className="text-sm text-gray-600">{member.phone}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No early arrivals yet</p>
            )}
          </div>
        </div>

        {/* Vehicle Inventory */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Inventory</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.vehicleInventory.length > 0 ? (
              data.vehicleInventory.map((vehicle, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-gray-900">{vehicle.member}</div>
                  <div className="text-sm text-gray-600">{vehicle.details}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No vehicle details provided yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Arrival Schedule Details */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Arrival Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data.arrivalSchedule).map(([day, memberList]) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: ARRIVAL_COLORS[day as keyof typeof ARRIVAL_COLORS] || '#6b7280' }}
                ></div>
                <h4 className="font-semibold text-gray-800">{day}</h4>
                <span className="text-sm text-gray-500">({memberList.length})</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {memberList.map((member) => (
                  <div key={member._id as string} className="text-sm">
                    <div className="font-medium text-gray-700">{member.firstName} {member.lastName}</div>
                    <div className="text-gray-500">{member.campRole}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
