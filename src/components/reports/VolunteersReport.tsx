'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, MapPin, Clock, Mail, User, 
  Filter, Download, Search, ChevronDown, ChevronUp,
  Gift, Tent
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VolunteerData {
  _id: string;
  name: string;
  email: string;
  campName?: string;
  shiftType: 'gift' | 'camp';
  giftName?: string;
  teamName?: string;
  role: string;
  timeSlot?: string;
  location?: string;
  registeredAt: string;
}

interface VolunteersReportProps {
  token: string;
}

export default function VolunteersReport({ token }: VolunteersReportProps) {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShiftType, setFilterShiftType] = useState<'all' | 'gift' | 'camp'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof VolunteerData>('registeredAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/volunteers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch volunteer data');
      }

      const data = await response.json();
      setVolunteers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load volunteer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [token]);

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field: keyof VolunteerData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Camp Name', 'Shift Type', 'Gift/Team', 'Role', 'Time Slot', 'Location', 'Registered At'].join(','),
      ...filteredAndSortedVolunteers.map(volunteer => [
        volunteer.name,
        volunteer.email,
        volunteer.campName || '',
        volunteer.shiftType,
        volunteer.giftName || volunteer.teamName || '',
        volunteer.role,
        volunteer.timeSlot || '',
        volunteer.location || '',
        new Date(volunteer.registeredAt).toLocaleString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `volunteers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and sort volunteers
  const filteredAndSortedVolunteers = volunteers
    .filter(volunteer => {
      const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (volunteer.campName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           volunteer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (volunteer.giftName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (volunteer.teamName?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterShiftType === 'all' || volunteer.shiftType === filterShiftType;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Statistics
  const stats = {
    total: volunteers.length,
    giftVolunteers: volunteers.filter(v => v.shiftType === 'gift').length,
    campVolunteers: volunteers.filter(v => v.shiftType === 'camp').length,
    withCampName: volunteers.filter(v => v.campName).length,
    uniqueCamps: new Set(volunteers.filter(v => v.campName).map(v => v.campName)).size,
    recentRegistrations: volunteers.filter(v => 
      new Date(v.registeredAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading volunteer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <Button 
          onClick={fetchVolunteers} 
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
          <h2 className="text-2xl font-bold text-gray-900">Volunteer Registrations</h2>
          <p className="text-gray-600 mt-1">Manage and track volunteer shift registrations</p>
        </div>
        <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Volunteers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.giftVolunteers}</p>
                <p className="text-sm text-gray-600">Gift Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tent className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.campVolunteers}</p>
                <p className="text-sm text-gray-600">Camp Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.uniqueCamps}</p>
                <p className="text-sm text-gray-600">Unique Camps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold text-indigo-600">{stats.withCampName}</p>
                <p className="text-sm text-gray-600">With Camp Name</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.recentRegistrations}</p>
                <p className="text-sm text-gray-600">Last 7 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, camp, role..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filterShiftType}
                onChange={(e) => setFilterShiftType(e.target.value as 'all' | 'gift' | 'camp')}
              >
                <option value="all">All Shifts</option>
                <option value="gift">Gift Volunteers</option>
                <option value="camp">Camp Teams</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Volunteer List ({filteredAndSortedVolunteers.length} volunteers)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Name</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Email</span>
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('registeredAt')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Registered</span>
                      {sortField === 'registeredAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedVolunteers.map((volunteer) => (
                  <React.Fragment key={volunteer._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {volunteer.name}
                            </div>
                            {volunteer.campName && (
                              <div className="text-sm text-gray-500">
                                Camp: {volunteer.campName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{volunteer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {volunteer.shiftType === 'gift' ? (
                            <Gift className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Tent className="w-4 h-4 text-orange-600" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {volunteer.giftName || volunteer.teamName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {volunteer.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(volunteer.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleRowExpansion(volunteer._id)}
                          className="text-orange-600 hover:text-orange-900 flex items-center space-x-1"
                        >
                          <span>Details</span>
                          {expandedRows.has(volunteer._id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(volunteer._id) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Contact Info</h4>
                              <p><strong>Email:</strong> {volunteer.email}</p>
                              {volunteer.campName && (
                                <p><strong>Camp:</strong> {volunteer.campName}</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Shift Details</h4>
                              <p><strong>Type:</strong> {volunteer.shiftType === 'gift' ? 'Gift Volunteer' : 'Camp Team'}</p>
                              <p><strong>Role:</strong> {volunteer.role}</p>
                              {volunteer.timeSlot && (
                                <p><strong>Time:</strong> {volunteer.timeSlot}</p>
                              )}
                              {volunteer.location && (
                                <p><strong>Location:</strong> {volunteer.location}</p>
                              )}
                              <p><strong>Registered:</strong> {new Date(volunteer.registeredAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {filteredAndSortedVolunteers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No volunteers found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add React import for Fragment
import React from 'react';
