'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Mail,
  Phone,
  LogOut,
  RefreshCw,
  TrendingUp,
  FileText,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { IMember } from '@/models/Member';
import AdditionalInfoOverview from './AdditionalInfoOverview';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

interface MemberStats {
  total: number;
  approved: number;
  pending: number;
  recentRegistrations: number;
  byRole: Record<string, number>;
  byDietary: Record<string, number>;
}

interface MembersResponse {
  members: IMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'additionalInfo'>('members');
  const [members, setMembers] = useState<IMember[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<IMember | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showFieldToggles, setShowFieldToggles] = useState(false);
  
  // Field visibility toggles
  const [visibleFields, setVisibleFields] = useState({
    gender: false,
    age: false,
    ticketStatus: false,
    arrivalDay: false,
    previousBurns: false,
    dietaryRestrictions: false,
    specialSkills: false,
    giftParticipation: false,
    acceptsCampFee: false,
    canArriveEarly: false,
    agreesToStayTillSaturday: false,
    hasVehicle: false,
    needsTransport: false,
    comments: false
  });

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (approvedFilter) params.append('approved', approvedFilter);
      if (genderFilter) params.append('gender', genderFilter);
      if (ticketStatusFilter.length > 0) params.append('ticketStatus', ticketStatusFilter.join(','));

      const response = await fetch(`/api/members?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const result = await response.json();
      if (result.success) {
        setMembers(result.data.members);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      setError('Failed to load members');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const updateMemberApproval = async (memberId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the members list
        fetchMembers();
        fetchStats();
      }
    } catch (error) {
      setError('Failed to update member status');
    }
  };

  const deleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the members list
        fetchMembers();
        fetchStats();
        setSelectedMember(null);
      }
    } catch (error) {
      setError('Failed to delete member');
    }
  };

  const exportMembers = async (format: 'json' | 'csv' = 'csv') => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (approvedFilter) params.append('approved', approvedFilter);
      if (genderFilter) params.append('gender', genderFilter);
      if (ticketStatusFilter.length > 0) params.append('ticketStatus', ticketStatusFilter.join(','));
      params.append('format', format);

      const response = await fetch(`/api/admin/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export members');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `midburn-camp-members-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `midburn-camp-members-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setError('Failed to export members');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [currentPage, searchTerm, roleFilter, approvedFilter, genderFilter, ticketStatusFilter]);

  if (loading && !members.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const roleOptions = stats ? Object.keys(stats.byRole) : [];
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const ticketStatusOptions = [
    'Yes I bought via Camp',
    'Yes I bought via other Department', 
    'No - but should get a ticket via other department',
    'No - no lead for a ticket at this stage'
  ];
  
  const handleTicketStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setTicketStatusFilter([...ticketStatusFilter, status]);
    } else {
      setTicketStatusFilter(ticketStatusFilter.filter(s => s !== status));
    }
  };
  
  const toggleFieldVisibility = (field: keyof typeof visibleFields) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <h1 className="text-xl font-semibold text-gray-800">
                Camp Admin Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="/admin/reports"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                Reports
              </a>
              
              <button
                onClick={() => {
                  fetchMembers();
                  fetchStats();
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'members'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Member Management
            </button>
            <button
              onClick={() => setActiveTab('additionalInfo')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'additionalInfo'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="h-5 w-5 inline mr-2" />
              Additional Info
            </button>
          </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'additionalInfo' ? (
          <AdditionalInfoOverview token={token} />
        ) : (
          <>
            {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserX className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.recentRegistrations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col gap-6">
            {/* Search and Basic Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <select
                  value={approvedFilter}
                  onChange={(e) => setApprovedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Genders</option>
                  {genderOptions.map((gender) => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFieldToggles(!showFieldToggles)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Columns
                </button>
                
                <button
                  onClick={() => exportMembers('csv')}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                
                <button
                  onClick={() => exportMembers('json')}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  Export JSON
                </button>
              </div>
            </div>

            {/* Ticket Status Multi-Select Filter */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ticket Status Filter:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ticketStatusOptions.map((status) => (
                  <label key={status} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ticketStatusFilter.includes(status)}
                      onChange={(e) => handleTicketStatusChange(status, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Field Visibility Toggles */}
            {showFieldToggles && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Show Additional Columns:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {Object.entries(visibleFields).map(([field, visible]) => (
                    <label key={field} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleFieldVisibility(field as keyof typeof visibleFields)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  {visibleFields.gender && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                  )}
                  {visibleFields.age && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                  )}
                  {visibleFields.ticketStatus && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket Status
                    </th>
                  )}
                  {visibleFields.arrivalDay && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrival Day
                    </th>
                  )}
                  {visibleFields.previousBurns && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Burns
                    </th>
                  )}
                  {visibleFields.dietaryRestrictions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dietary
                    </th>
                  )}
                  {visibleFields.specialSkills && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                  )}
                  {visibleFields.giftParticipation && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gift
                    </th>
                  )}
                  {visibleFields.acceptsCampFee && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Camp Fee
                    </th>
                  )}
                  {visibleFields.canArriveEarly && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Early Arrival
                    </th>
                  )}
                  {visibleFields.agreesToStayTillSaturday && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stay Till Sat
                    </th>
                  )}
                  {visibleFields.hasVehicle && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                  )}
                  {visibleFields.needsTransport && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transport
                    </th>
                  )}
                  {visibleFields.comments && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member._id as string} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {member.campRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </div>
                    </td>
                    {visibleFields.gender && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.gender}
                      </td>
                    )}
                    {visibleFields.age && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.age}
                      </td>
                    )}
                    {visibleFields.ticketStatus && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {member.ticketStatus.split(' ')[0]} {/* Show first word for space */}
                        </span>
                      </td>
                    )}
                    {visibleFields.arrivalDay && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.arrivalDay}
                      </td>
                    )}
                    {visibleFields.previousBurns && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.previousBurns}
                      </td>
                    )}
                    {visibleFields.dietaryRestrictions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.dietaryRestrictions.length > 0 ? member.dietaryRestrictions.slice(0, 2).join(', ') : 'None'}
                      </td>
                    )}
                    {visibleFields.specialSkills && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.specialSkills.length > 0 ? member.specialSkills.slice(0, 2).join(', ') : 'None'}
                      </td>
                    )}
                    {visibleFields.giftParticipation && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.giftParticipation}
                      </td>
                    )}
                    {visibleFields.acceptsCampFee && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.acceptsCampFee ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.acceptsCampFee ? 'Yes' : 'No'}
                        </span>
                      </td>
                    )}
                    {visibleFields.canArriveEarly && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.canArriveEarly ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.canArriveEarly ? 'Yes' : 'No'}
                        </span>
                      </td>
                    )}
                    {visibleFields.agreesToStayTillSaturday && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.agreesToStayTillSaturday ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.agreesToStayTillSaturday ? 'Yes' : 'No'}
                        </span>
                      </td>
                    )}
                    {visibleFields.hasVehicle && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.hasVehicle ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.hasVehicle ? 'Yes' : 'No'}
                        </span>
                      </td>
                    )}
                    {visibleFields.needsTransport && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.needsTransport ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.needsTransport ? 'Yes' : 'No'}
                        </span>
                      </td>
                    )}
                    {visibleFields.comments && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                        {member.comments || 'None'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {member.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => updateMemberApproval(member._id as string, !member.isApproved)}
                          className={`p-1 rounded transition-colors ${
                            member.isApproved
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={member.isApproved ? 'Mark as pending' : 'Approve member'}
                        >
                          {member.isApproved ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={() => deleteMember(member._id as string)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedMember.firstName} {selectedMember.lastName}
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <p className="text-sm text-gray-600">Email: {selectedMember.email}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedMember.phone}</p>
                  <p className="text-sm text-gray-600">ID/Passport: {selectedMember.idNumber}</p>
                  <p className="text-sm text-gray-600">Gender: {selectedMember.gender}</p>
                  <p className="text-sm text-gray-600">Age: {selectedMember.age}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Camp Details</h4>
                  <p className="text-sm text-gray-600">Role: {selectedMember.campRole}</p>
                  <p className="text-sm text-gray-600">Previous Burns: {selectedMember.previousBurns}</p>
                  <p className="text-sm text-gray-600">Ticket Status: {selectedMember.ticketStatus}</p>
                  <p className="text-sm text-gray-600">Gift Participation: {selectedMember.giftParticipation}</p>
                  <p className="text-sm text-gray-600">Accepted Camp Fee: {selectedMember.acceptsCampFee ? 'Yes' : 'No'}</p>
                </div>
                
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Logistics</h4>
                  <p className="text-sm text-gray-600">
                    Arrival Day: {selectedMember.arrivalDay}
                  </p>
                  <p className="text-sm text-gray-600">
                    Can arrive early for building: {selectedMember.canArriveEarly ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Agreed to stay till Saturday: {selectedMember.agreesToStayTillSaturday ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              
              {selectedMember.dietaryRestrictions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Dietary Restrictions</h4>
                  <p className="text-sm text-gray-600">{selectedMember.dietaryRestrictions.join(', ')}</p>
                </div>
              )}
              
              {selectedMember.specialSkills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Special Skills</h4>
                  <p className="text-sm text-gray-600">{selectedMember.specialSkills.join(', ')}</p>
                </div>
              )}
              
              {selectedMember.comments && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                  <p className="text-sm text-gray-600">{selectedMember.comments}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => updateMemberApproval(selectedMember._id as string, !selectedMember.isApproved)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedMember.isApproved
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {selectedMember.isApproved ? 'Mark as Pending' : 'Approve Member'}
              </button>
              
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
          </>
        )}
      </div>
    </div>
  );
}
