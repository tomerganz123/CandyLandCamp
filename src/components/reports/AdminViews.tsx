'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Phone, Mail, MessageCircle } from 'lucide-react';
import { IMember } from '@/models/Member';

interface AdminViewsProps {
  token: string;
}

export default function AdminViews({ token }: AdminViewsProps) {
  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch members');

      const result = await response.json();
      if (result.success) {
        setMembers(result.data.members);
      } else {
        setError(result.error || 'Failed to load members');
      }
    } catch (error) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const exportContacts = async () => {
    const csvHeaders = ['Name', 'Phone', 'Email', 'Role'].join(',');
    const csvRows = members.map(member => [
      `"${member.firstName} ${member.lastName}"`, `"${member.phone}"`, `"${member.email}"`, `"${member.campRole}"`
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baba-zman-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const membersWithComments = members.filter(m => m.comments && m.comments.trim());
  const membersWithMedical = members.filter(m => (m.medicalConditions && m.medicalConditions.trim()) || (m.allergies && m.allergies.trim()));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">Admin Views</h2>
        </div>
        <button onClick={exportContacts} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <Download className="h-4 w-4" />
          Export Contacts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Contact Sheet */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Quick Contact Sheet ({members.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.map((member) => (
              <div key={member._id as string} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{member.firstName} {member.lastName}</span>
                  <span className="text-sm text-gray-500 ml-2">({member.campRole})</span>
                </div>
                <div className="text-sm text-gray-600">{member.phone}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Flagged Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-red-600" />
            Health Flagged Members ({membersWithMedical.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {membersWithMedical.length > 0 ? (
              membersWithMedical.map((member) => (
                <div key={member._id as string} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                  <div className="text-sm text-gray-600">{member.phone}</div>
                  {member.medicalConditions && <div className="text-sm text-red-800 mt-1">Medical: {member.medicalConditions}</div>}
                  {member.allergies && <div className="text-sm text-yellow-800 mt-1">Allergies: {member.allergies}</div>}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No health concerns reported</p>
            )}
          </div>
        </div>
      </div>

      {/* Comments Log */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments Log ({membersWithComments.length})
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {membersWithComments.length > 0 ? (
            membersWithComments.map((member) => (
              <div key={member._id as string} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">{member.firstName} {member.lastName}</span>
                  <span className="text-sm text-gray-500">{new Date(member.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-700">{member.comments}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No comments submitted</p>
          )}
        </div>
      </div>
    </div>
  );
}