'use client';

import { useEffect, useState } from 'react';
import { 
  CheckCircle, XCircle, Users, ClipboardList, ChefHat, 
  Filter, Download, Search, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MemberStatus {
  id: string;
  name: string;
  email: string;
  phone: string;
  campRole: string;
  hasFilledAdditionalInfo: boolean;
  hasFilledKitchenShift: boolean;
  kitchenShifts: Array<{
    day: string;
    shiftTime: string;
    role: string;
  }>;
  kitchenShiftCount: number;
}

interface CompletionStats {
  totalMembers: number;
  completedAdditionalInfo: number;
  completedKitchenShift: number;
  completedBoth: number;
  completedNeither: number;
  pendingAdditionalInfo: number;
  pendingKitchenShift: number;
}

interface MemberCompletionStatusProps {
  token: string;
}

type FilterType = 'all' | 'both-complete' | 'both-pending' | 'missing-additional' | 'missing-kitchen';

export default function MemberCompletionStatus({ token }: MemberCompletionStatusProps) {
  const [members, setMembers] = useState<MemberStatus[]>([]);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members/completion-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch member completion status');
      }

      const data = await response.json();
      setMembers(data.data || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Camp Role', 'Additional Info', 'Kitchen Shift', 'Kitchen Shifts Count', 'Kitchen Shift Details'].join(','),
      ...filteredMembers.map(member => [
        member.name,
        member.email,
        member.phone,
        member.campRole,
        member.hasFilledAdditionalInfo ? 'Yes' : 'No',
        member.hasFilledKitchenShift ? 'Yes' : 'No',
        member.kitchenShiftCount,
        member.kitchenShifts.map(s => `${s.day} ${s.shiftTime} (${s.role})`).join('; ')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `member-completion-status-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredMembers = members
    .filter(member => {
      // Search filter
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.campRole.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Type filter
      switch (filterType) {
        case 'both-complete':
          return member.hasFilledAdditionalInfo && member.hasFilledKitchenShift;
        case 'both-pending':
          return !member.hasFilledAdditionalInfo && !member.hasFilledKitchenShift;
        case 'missing-additional':
          return !member.hasFilledAdditionalInfo;
        case 'missing-kitchen':
          return !member.hasFilledKitchenShift;
        case 'all':
        default:
          return true;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading member completion status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <Button 
          onClick={fetchData} 
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Form Completion Status</h2>
          <p className="text-gray-600 mt-1">Track which members have completed required forms</p>
        </div>
        <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalMembers}</p>
                  <p className="text-sm text-gray-600">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.completedBoth}</p>
                  <p className="text-sm text-gray-600">Completed Both Forms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.pendingAdditionalInfo}</p>
                  <p className="text-sm text-gray-600">Need Additional Info</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingKitchenShift}</p>
                  <p className="text-sm text-gray-600">Need Kitchen Shift</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert for pending members */}
      {stats && (stats.pendingAdditionalInfo > 0 || stats.pendingKitchenShift > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900">Action Required</h3>
              <p className="text-sm text-orange-800 mt-1">
                {stats.pendingAdditionalInfo > 0 && (
                  <span>{stats.pendingAdditionalInfo} members need to complete Additional Info form. </span>
                )}
                {stats.pendingKitchenShift > 0 && (
                  <span>{stats.pendingKitchenShift} members need to register for Kitchen Shifts.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-64">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
              >
                <option value="all">All Members</option>
                <option value="both-complete">✅ Both Forms Complete</option>
                <option value="both-pending">⚠️ Both Forms Pending</option>
                <option value="missing-additional">📋 Missing Additional Info</option>
                <option value="missing-kitchen">🍳 Missing Kitchen Shift</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Members List ({filteredMembers.length} members)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Additional Info
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kitchen Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kitchen Shift Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{member.campRole}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {member.hasFilledAdditionalInfo ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {member.hasFilledKitchenShift ? (
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-xs text-gray-500">({member.kitchenShiftCount})</span>
                        </div>
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.kitchenShifts.length > 0 ? (
                        <div className="text-xs space-y-1">
                          {member.kitchenShifts.map((shift, idx) => (
                            <div key={idx} className="text-gray-700">
                              <span className="font-medium">{shift.day}</span> - {shift.shiftTime}
                              <span className="text-gray-500 ml-1">({shift.role})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not registered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No members found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

