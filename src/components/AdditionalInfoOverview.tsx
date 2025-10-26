'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Coffee, 
  Tent, 
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AdditionalInfo {
  _id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  arrivalWhen: string;
  bringingTent: boolean;
  sharingTent: boolean;
  sharingWithMemberName?: string;
  tentSize?: string;
  drinksCoffee: boolean;
  milkPreference?: string;
  hasDietaryRestriction: boolean;
  dietaryRestrictionType?: string;
  wantsMattress: boolean;
  specialFoodRequests?: string;
  comments?: string;
  createdAt: string;
}

interface AdditionalInfoStats {
  totalSubmissions: number;
  totalMembers: number;
  submissionRate: number;
  byArrivalDay: Record<string, number>;
  bringingTent: number;
  sharingTent: number;
  drinksCoffee: number;
  wantsMattress: number;
  withDietaryRestriction: number;
  milkPreferenceBreakdown: Record<string, number>;
  dietaryRestrictionBreakdown: Record<string, number>;
}

interface AdditionalInfoOverviewProps {
  token: string;
}

export default function AdditionalInfoOverview({ token }: AdditionalInfoOverviewProps) {
  const [additionalInfoList, setAdditionalInfoList] = useState<AdditionalInfo[]>([]);
  const [stats, setStats] = useState<AdditionalInfoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState<AdditionalInfo | null>(null);
  const [error, setError] = useState('');
  const [showDietaryDetails, setShowDietaryDetails] = useState(false);
  const [showSharingDetails, setShowSharingDetails] = useState(false);

  const fetchAdditionalInfo = async () => {
    try {
      const [infoResponse, membersResponse] = await Promise.all([
        fetch('/api/additional-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      if (!infoResponse.ok || !membersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const infoResult = await infoResponse.json();
      const membersResult = await membersResponse.json();

      if (infoResult.success) {
        setAdditionalInfoList(infoResult.data);
        
        // Calculate stats
        const totalMembers = membersResult.success ? membersResult.data.total : 0;
        const statsData: AdditionalInfoStats = {
          totalSubmissions: infoResult.data.length,
          totalMembers,
          submissionRate: totalMembers > 0 ? (infoResult.data.length / totalMembers) * 100 : 0,
          byArrivalDay: {},
          bringingTent: infoResult.data.filter((info: AdditionalInfo) => info.bringingTent).length,
          sharingTent: infoResult.data.filter((info: AdditionalInfo) => info.sharingTent).length,
          drinksCoffee: infoResult.data.filter((info: AdditionalInfo) => info.drinksCoffee).length,
          wantsMattress: infoResult.data.filter((info: AdditionalInfo) => info.wantsMattress).length,
          withDietaryRestriction: infoResult.data.filter((info: AdditionalInfo) => info.hasDietaryRestriction).length,
          milkPreferenceBreakdown: {},
          dietaryRestrictionBreakdown: {},
        };

        // Count by arrival day
        infoResult.data.forEach((info: AdditionalInfo) => {
          statsData.byArrivalDay[info.arrivalWhen] = (statsData.byArrivalDay[info.arrivalWhen] || 0) + 1;
          
          // Count milk preferences
          if (info.milkPreference) {
            statsData.milkPreferenceBreakdown[info.milkPreference] = (statsData.milkPreferenceBreakdown[info.milkPreference] || 0) + 1;
          }
          
          // Count dietary restriction types
          if (info.dietaryRestrictionType) {
            statsData.dietaryRestrictionBreakdown[info.dietaryRestrictionType] = (statsData.dietaryRestrictionBreakdown[info.dietaryRestrictionType] || 0) + 1;
          }
        });

        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch additional info:', error);
      setError('Failed to load additional information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdditionalInfo();
  }, []);

  const exportAdditionalInfo = () => {
    const csv = [
      ['Member Name', 'Email', 'Arrival When', 'Bringing Tent', 'Sharing Tent', 'Tent Size', 'Drinks Coffee', 'Milk Preference', 'Dietary Restriction', 'Dietary Type', 'Wants Mattress', 'Special Food Requests', 'Comments'].join(','),
      ...additionalInfoList.map(info => [
        info.memberName,
        info.memberEmail,
        info.arrivalWhen,
        info.bringingTent ? 'Yes' : 'No',
        info.sharingTent ? info.sharingWithMemberName || 'Yes' : 'No',
        info.tentSize || '',
        info.drinksCoffee ? 'Yes' : 'No',
        info.milkPreference || '',
        info.hasDietaryRestriction ? 'Yes' : 'No',
        info.dietaryRestrictionType || '',
        info.wantsMattress ? 'Yes' : 'No',
        info.specialFoodRequests || '',
        info.comments || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `additional-info-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading additional information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Form Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalSubmissions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submission Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats ? Math.round(stats.submissionRate) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Tent className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bringing Tents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.bringingTent || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Coffee className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drinks Coffee</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.drinksCoffee || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milk Preference Chart */}
      {stats && Object.keys(stats.milkPreferenceBreakdown).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Coffee className="h-5 w-5 text-purple-600" />
            Milk Preference Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.milkPreferenceBreakdown).map(([milk, count]) => {
              const percentage = stats.totalSubmissions > 0 ? (count / stats.totalSubmissions) * 100 : 0;
              return (
                <div key={milk} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{milk}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Arrival Distribution
          </h3>
          <div className="space-y-2">
            {stats && Object.entries(stats.byArrivalDay).map(([day, count]) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{day}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Additional Requests
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Mattress Requests</span>
              <span className="text-sm font-medium text-gray-900">{stats?.wantsMattress || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Dietary Restrictions</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{stats?.withDietaryRestriction || 0}</span>
                {stats && Object.keys(stats.dietaryRestrictionBreakdown).length > 0 && (
                  <button
                    onClick={() => setShowDietaryDetails(!showDietaryDetails)}
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    {showDietaryDetails ? 'Hide' : 'Show'} Details
                  </button>
                )}
              </div>
            </div>
            {showDietaryDetails && stats && Object.keys(stats.dietaryRestrictionBreakdown).length > 0 && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 pl-2">
                {Object.entries(stats.dietaryRestrictionBreakdown).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-gray-600">{type}</span>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Sharing Tents</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{stats?.sharingTent || 0}</span>
                {stats && stats.sharingTent > 0 && (
                  <button
                    onClick={() => setShowSharingDetails(!showSharingDetails)}
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    {showSharingDetails ? 'Hide' : 'Show'} Details
                  </button>
                )}
              </div>
            </div>
            {showSharingDetails && stats && stats.sharingTent > 0 && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 pl-2">
                {additionalInfoList
                  .filter(info => info.sharingTent && info.sharingWithMemberName)
                  .map((info, idx) => (
                    <div key={idx} className="text-xs text-gray-600">
                      {info.memberName} → {info.sharingWithMemberName}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Submissions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Individual Submissions</h3>
          <button
            onClick={exportAdditionalInfo}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrival</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sharing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coffee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mattress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {additionalInfoList.map((info) => (
                <tr key={info._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{info.memberName}</div>
                    <div className="text-sm text-gray-500">{info.memberEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{info.arrivalWhen}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {info.bringingTent ? (
                      <div>
                        <CheckCircle className="h-4 w-4 text-green-600 inline mr-1" />
                        <span className="text-gray-900">{info.tentSize}</span>
                      </div>
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 inline" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {info.sharingTent ? (
                      <div>
                        <CheckCircle className="h-4 w-4 text-blue-600 inline mr-1" />
                        <span className="text-gray-900">{info.sharingWithMemberName || 'Yes'}</span>
                      </div>
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 inline" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {info.drinksCoffee ? (
                      <div className="text-gray-900">{info.milkPreference}</div>
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {info.wantsMattress ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedInfo(info)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInfo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedInfo.memberName}</h3>
              <button
                onClick={() => setSelectedInfo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                  <p className="text-sm text-gray-600">{selectedInfo.memberEmail}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Arrival</h4>
                  <p className="text-sm text-gray-600">{selectedInfo.arrivalWhen}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tent Information</h4>
                <p className="text-sm text-gray-600">
                  Bringing tent: {selectedInfo.bringingTent ? 'Yes' : 'No'}
                </p>
                {selectedInfo.bringingTent && (
                  <>
                    <p className="text-sm text-gray-600">Size: {selectedInfo.tentSize}</p>
                    <p className="text-sm text-gray-600">
                      Sharing: {selectedInfo.sharingTent ? 'Yes' : 'No'}
                    </p>
                    {selectedInfo.sharingTent && (
                      <p className="text-sm text-gray-600">
                        With: {selectedInfo.sharingWithMemberName}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Coffee Preferences</h4>
                <p className="text-sm text-gray-600">
                  Drinks coffee: {selectedInfo.drinksCoffee ? 'Yes' : 'No'}
                </p>
                {selectedInfo.drinksCoffee && selectedInfo.milkPreference && (
                  <p className="text-sm text-gray-600">Milk: {selectedInfo.milkPreference}</p>
                )}
                <p className="text-sm text-gray-600">
                  Dietary restriction: {selectedInfo.hasDietaryRestriction ? 'Yes' : 'No'}
                </p>
                {selectedInfo.hasDietaryRestriction && selectedInfo.dietaryRestrictionType && (
                  <p className="text-sm text-gray-600">Type: {selectedInfo.dietaryRestrictionType}</p>
                )}
              </div>

              {selectedInfo.wantsMattress && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mattress Request</h4>
                  <p className="text-sm text-gray-600">Yes, ordered</p>
                </div>
              )}

              {selectedInfo.specialFoodRequests && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Special Food Requests</h4>
                  <p className="text-sm text-gray-600">{selectedInfo.specialFoodRequests}</p>
                </div>
              )}

              {selectedInfo.comments && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                  <p className="text-sm text-gray-600">{selectedInfo.comments}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setSelectedInfo(null)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
