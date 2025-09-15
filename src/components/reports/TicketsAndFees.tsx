'use client';

import { useState, useEffect } from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Ticket, Download, CreditCard, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { IMember } from '@/models/Member';

interface TicketsAndFeesProps {
  token: string;
}

interface TicketsFeesData {
  members: IMember[];
  ticketStatusData: { status: string; fullStatus: string; count: number; percentage: number }[];
  campFeeData: { status: string; count: number; percentage: number }[];
  approvalData: { status: string; count: number; percentage: number }[];
  summary: {
    totalMembers: number;
    ticketStatusCounts: Record<string, number>;
    campFeeAcceptance: { accepted: number; pending: number };
    approvalStatus: { approved: number; pending: number };
  };
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

export default function TicketsAndFees({ token }: TicketsAndFeesProps) {
  const [data, setData] = useState<TicketsFeesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTicketsData = async () => {
    try {
      const response = await fetch('/api/admin/reports/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load tickets data');
      }
    } catch (error) {
      setError('Failed to load tickets data');
    } finally {
      setLoading(false);
    }
  };

  const exportTicketsData = async () => {
    try {
      const response = await fetch('/api/admin/reports/tickets?format=csv', {
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
        a.download = `baba-zman-tickets-fees-${new Date().toISOString().split('T')[0]}.csv`;
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
    fetchTicketsData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading tickets & fees data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchTicketsData}
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
          <Ticket className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Tickets & Fees</h2>
        </div>
        
        <button
          onClick={exportTicketsData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Fee Accepted</p>
              <p className="text-2xl font-semibold text-green-900">{data.summary.campFeeAcceptance.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Fee Pending</p>
              <p className="text-2xl font-semibold text-yellow-900">{data.summary.campFeeAcceptance.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Approved Members</p>
              <p className="text-2xl font-semibold text-blue-900">{data.summary.approvalStatus.approved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Ticket Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.ticketStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
                label
              >
                {data.ticketStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Camp Fee Acceptance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Camp Fee Acceptance (1500-2000 ILS)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data.campFeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Approval Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Approval Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data.approvalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Status Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Status Details</h3>
          <div className="space-y-3">
            {data.ticketStatusData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.fullStatus}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">{item.count}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee and Approval Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee & Approval Summary</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Camp Fee Acceptance</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">Accepted (1500-2000 ILS)</span>
                  <span className="text-lg font-semibold text-green-900">{data.summary.campFeeAcceptance.accepted}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-700">Pending Acceptance</span>
                  <span className="text-lg font-semibold text-yellow-900">{data.summary.campFeeAcceptance.pending}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Member Approval</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">Approved Members</span>
                  <span className="text-lg font-semibold text-blue-900">{data.summary.approvalStatus.approved}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-700">Pending Review</span>
                  <span className="text-lg font-semibold text-orange-900">{data.summary.approvalStatus.pending}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
