'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Users, CheckCircle, XCircle, Clock, 
  Download, Search, Filter, MessageCircle, Mail, Calendar,
  TrendingUp, AlertCircle, User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FeePaymentData {
  _id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  firstPaymentPaid: boolean;
  firstPaymentDate?: string;
  firstPaymentNotes?: string;
  secondPaymentPaid: boolean;
  secondPaymentDate?: string;
  secondPaymentNotes?: string;
  thirdPaymentPaid: boolean;
  thirdPaymentDate?: string;
  thirdPaymentNotes?: string;
  wantsMattress: boolean;
  totalPaid: number;
  createdAt: string;
  updatedAt: string;
}

interface FeeStatistics {
  totalMembers: number;
  firstPaymentPaid: number;
  secondPaymentPaid: number;
  fullyPaid: number;
  totalCollected: number;
  expectedTotal: number;
  outstandingAmount: number;
  firstPaymentOutstanding: number;
  secondPaymentOutstanding: number;
  collectionRate: number;
}

interface FeeCollectionReportProps {
  token: string;
}

export default function FeeCollectionReport({ token }: FeeCollectionReportProps) {
  const [payments, setPayments] = useState<FeePaymentData[]>([]);
  const [statistics, setStatistics] = useState<FeeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('');
  const [updatingPayment, setUpdatingPayment] = useState<string>(''); // Track which payment is being updated

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterPaymentStatus) params.append('paymentStatus', filterPaymentStatus);
      params.append('limit', '200'); // Get more records for fee collection
      params.append('_t', Date.now().toString()); // Cache busting

      const response = await fetch(`/api/fee-payments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fee payment data');
      }

      const data = await response.json();
      setPayments(data.data || []);
      setStatistics(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fee payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [token, searchTerm, filterPaymentStatus]);

  // Add a separate effect to refresh data when needed
  const refreshData = () => {
    fetchPayments();
  };

  const handlePaymentToggle = async (
    memberId: string, 
    paymentType: 'first' | 'second' | 'third',
    currentValue: boolean
  ) => {
    const member = payments.find(p => p.memberId === memberId);
    if (!member) return;

    setUpdatingPayment(`${memberId}-${paymentType}`);

    try {
      const updateData = {
        memberId: member.memberId,
        memberName: member.memberName,
        memberEmail: member.memberEmail,
        memberPhone: member.memberPhone,
        firstPaymentPaid: member.firstPaymentPaid,
        secondPaymentPaid: member.secondPaymentPaid,
        thirdPaymentPaid: member.thirdPaymentPaid,
        [`${paymentType}PaymentPaid`]: !currentValue,
        [`${paymentType}PaymentDate`]: !currentValue ? new Date().toISOString() : undefined,
      };

      const response = await fetch('/api/fee-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update payment');
      }

      // Refresh data
      await fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setUpdatingPayment('');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', '1st Payment (750₪)', '1st Payment Date', '2nd Payment (1250₪)', '2nd Payment Date', 'Ordered Mattress', 'Paid for Mattress', 'Mattress Payment Date', 'Total Paid', 'Outstanding'].join(','),
      ...payments.map(payment => [
        payment.memberName,
        payment.memberPhone,
        payment.memberEmail,
        payment.firstPaymentPaid ? 'Yes' : 'No',
        payment.firstPaymentDate ? new Date(payment.firstPaymentDate).toLocaleDateString() : '',
        payment.secondPaymentPaid ? 'Yes' : 'No',
        payment.secondPaymentDate ? new Date(payment.secondPaymentDate).toLocaleDateString() : '',
        payment.wantsMattress ? 'Yes' : 'No',
        payment.thirdPaymentPaid ? 'Yes' : 'No',
        payment.thirdPaymentDate ? new Date(payment.thirdPaymentDate).toLocaleDateString() : '',
        `₪${payment.totalPaid}`,
        `₪${2000 - payment.totalPaid}` // 750 + 1250 = 2000 total expected
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fee-collection-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading fee collection data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <Button 
          onClick={fetchPayments} 
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
          <h2 className="text-2xl font-bold text-gray-900">Fee Collection</h2>
          <p className="text-gray-600 mt-1">Monitor camp fee payments from members</p>
        </div>
        <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{statistics.totalMembers}</p>
                  <p className="text-sm text-gray-600">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">₪{statistics.totalCollected.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">₪{statistics.outstandingAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{statistics.collectionRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Breakdown */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1st Payment (750₪)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Paid:</span>
                  <span className="font-semibold">{statistics.firstPaymentPaid} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Outstanding:</span>
                  <span className="font-semibold">{statistics.firstPaymentOutstanding} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Collected:</span>
                  <span className="font-semibold">₪{(statistics.firstPaymentPaid * 750).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2nd Payment (1250₪)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Paid:</span>
                  <span className="font-semibold">{statistics.secondPaymentPaid} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Outstanding:</span>
                  <span className="font-semibold">{statistics.secondPaymentOutstanding} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Collected:</span>
                  <span className="font-semibold">₪{(statistics.secondPaymentPaid * 1250).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
            >
              <option value="">All Payment Status</option>
              <option value="unpaid">No Payments</option>
              <option value="paid-first">1st Payment Only</option>
              <option value="paid-second">2nd Payment Only</option>
              <option value="partially-paid">Partial Payments</option>
              <option value="fully-paid">Fully Paid</option>
              <option value="unpaid-first">Missing 1st Payment</option>
              <option value="unpaid-second">Missing 2nd Payment</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Member Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Member Fee Collection ({payments.length} members)
          </CardTitle>
          <CardDescription>
            Click checkboxes to mark payments as received
          </CardDescription>
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
                    Contact
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1st Payment<br />(750₪)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2nd Payment<br />(1250₪)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordered<br />Mattress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid for<br />Mattress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.memberId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.memberName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <MessageCircle className="h-3 w-3 text-green-500 mr-1" />
                          <a
                            href={`https://wa.me/${payment.memberPhone.replace(/[^0-9]/g, '')}?text=Hi ${payment.memberName.split(' ')[0]}, this is regarding your BABA ZMAN camp fee payment. Please let me know if you have any questions!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 hover:underline transition-colors flex items-center"
                            title="Send WhatsApp message"
                          >
                            {payment.memberPhone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="truncate max-w-xs">{payment.memberEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={payment.firstPaymentPaid}
                            onChange={() => handlePaymentToggle(payment.memberId, 'first', payment.firstPaymentPaid)}
                            disabled={updatingPayment === `${payment.memberId}-first`}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
                          />
                          {updatingPayment === `${payment.memberId}-first` && (
                            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          )}
                        </label>
                        {payment.firstPaymentPaid && payment.firstPaymentDate && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(payment.firstPaymentDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={payment.secondPaymentPaid}
                            onChange={() => handlePaymentToggle(payment.memberId, 'second', payment.secondPaymentPaid)}
                            disabled={updatingPayment === `${payment.memberId}-second`}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
                          />
                          {updatingPayment === `${payment.memberId}-second` && (
                            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          )}
                        </label>
                        {payment.secondPaymentPaid && payment.secondPaymentDate && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(payment.secondPaymentDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        {payment.wantsMattress ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={payment.thirdPaymentPaid}
                            onChange={() => handlePaymentToggle(payment.memberId, 'third', payment.thirdPaymentPaid)}
                            disabled={updatingPayment === `${payment.memberId}-third` || !payment.wantsMattress}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5 disabled:opacity-50"
                          />
                          {updatingPayment === `${payment.memberId}-third` && (
                            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          )}
                        </label>
                        {payment.thirdPaymentPaid && payment.thirdPaymentDate && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(payment.thirdPaymentDate).toLocaleDateString()}
                          </div>
                        )}
                        {!payment.wantsMattress && (
                          <div className="text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₪{payment.totalPaid.toLocaleString()}
                      </div>
                      {payment.totalPaid < 2000 && (
                        <div className="text-xs text-red-600">
                          ₪{(2000 - payment.totalPaid).toLocaleString()} outstanding
                        </div>
                      )}
                      {payment.totalPaid >= 2000 && (
                        <div className="text-xs text-green-600">
                          ✓ Fully paid
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
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

// Add React import
import React from 'react';
