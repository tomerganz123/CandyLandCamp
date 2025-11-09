'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Calendar, User, Check, X, Plus, 
  Edit, Trash2, Download, Search, Filter,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Payment {
  _id?: string;
  amount: number;
  whoPaid: string;
  whoPaidName: string;
  datePaid: string;
  moneyReturned: boolean;
  notes?: string;
}

interface BudgetExpense {
  _id: string;
  costCategory: string;
  item: string;
  quantity: number;
  costAmount: number;
  
  // New payment structure
  payments?: Payment[];
  totalPaid?: number;
  remainingAmount?: number;
  
  // Legacy fields
  alreadyPaid: boolean;
  whoPaid?: string;
  whoPaidName?: string;
  moneyReturned: boolean;
  
  dateOfExpense: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetStatistics {
  totalExpenses: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  returnedAmount: number;
  paidExpenses: number;
  unpaidExpenses: number;
  partiallyPaidExpenses?: number;
}

interface CategoryStat {
  _id: string;
  count: number;
  totalAmount: number;
  paidAmount: number;
}

interface BudgetReportProps {
  token: string;
}

interface ExpenseFormData {
  costCategory: string;
  item: string;
  quantity: number;
  costAmount: number;
  dateOfExpense: string;
  notes: string;
}

const CAMP_FEE_PER_MEMBER = 2000;

export default function BudgetReport({ token }: BudgetReportProps) {
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [statistics, setStatistics] = useState<BudgetStatistics | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [approvedMembersCount, setApprovedMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPaidStatus, setFilterPaidStatus] = useState<string>('');
  const [filterReturnedStatus, setFilterReturnedStatus] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BudgetExpense | null>(null);
  const [selectedExpenseForPayments, setSelectedExpenseForPayments] = useState<BudgetExpense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    costCategory: 'Food & Beverages',
    item: '',
    quantity: 1,
    costAmount: 0,
    dateOfExpense: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment form state
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    whoPaid: '',
    whoPaidName: '',
    datePaid: new Date().toISOString().split('T')[0],
    moneyReturned: false,
    notes: ''
  });
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const costCategories = [
    'Food & Beverages',
    'Transportation',
    'Equipment & Supplies',
    'Art & Decorations',
    'Infrastructure',
    'Emergency/Medical',
    'Gift',
    'Other'
  ];

  // Helper functions for payment calculations
  const getTotalPaid = (expense: BudgetExpense): number => {
    if (expense.payments && expense.payments.length > 0) {
      return expense.payments.reduce((sum, payment) => sum + payment.amount, 0);
    }
    // Legacy: if using old structure
    return expense.alreadyPaid ? expense.costAmount : 0;
  };

  const getRemainingAmount = (expense: BudgetExpense): number => {
    return expense.costAmount - getTotalPaid(expense);
  };

  const getPaymentStatus = (expense: BudgetExpense): 'paid' | 'partial' | 'unpaid' => {
    const totalPaid = getTotalPaid(expense);
    if (totalPaid >= expense.costAmount) return 'paid';
    if (totalPaid > 0) return 'partial';
    return 'unpaid';
  };

  const hasUnreturnedPayments = (expense: BudgetExpense): boolean => {
    // Check if there are any payments where money hasn't been returned
    if (expense.payments && expense.payments.length > 0) {
      return expense.payments.some(payment => !payment.moneyReturned);
    }
    // Legacy: check old structure
    return expense.alreadyPaid && !expense.moneyReturned;
  };

  const getUnreturnedPaymentsInfo = (expense: BudgetExpense): { count: number; total: number } => {
    let count = 0;
    let total = 0;
    
    if (expense.payments && expense.payments.length > 0) {
      expense.payments.forEach(payment => {
        if (!payment.moneyReturned) {
          count++;
          total += payment.amount;
        }
      });
    } else if (expense.alreadyPaid && !expense.moneyReturned) {
      // Legacy structure
      count = 1;
      total = expense.costAmount;
    }
    
    return { count, total };
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const [expensesResponse, membersResponse, approvedMembersResponse] = await Promise.all([
        fetch('/api/budget', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('/api/members?approved=true&limit=9999', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('/api/members?approved=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      if (!expensesResponse.ok) {
        throw new Error('Failed to fetch budget data');
      }

      const expensesData = await expensesResponse.json();
      setExpenses(expensesData.data || []);
      setStatistics(expensesData.statistics);
      setCategoryStats(expensesData.categoryStats || []);

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.data?.members || []);
      }

      if (approvedMembersResponse.ok) {
        const approvedMembersData = await approvedMembersResponse.json();
        // Use pagination total count if available, otherwise use the length of returned members
        const count = approvedMembersData.data?.pagination?.total || approvedMembersData.data?.members?.length || 0;
        setApprovedMembersCount(count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
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

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      costCategory: 'Food & Beverages',
      item: '',
      quantity: 1,
      costAmount: 0,
      dateOfExpense: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (expense: BudgetExpense) => {
    setEditingExpense(expense);
    setFormData({
      costCategory: expense.costCategory,
      item: expense.item,
      quantity: expense.quantity,
      costAmount: expense.costAmount,
      dateOfExpense: expense.dateOfExpense.split('T')[0],
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingExpense ? `/api/budget/${editingExpense._id}` : '/api/budget';
      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save expense');
      }

      setShowModal(false);
      fetchExpenses(); // Refresh the data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (expense: BudgetExpense) => {
    if (!confirm(`Are you sure you want to delete this expense: ${expense.item}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/budget/${expense._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete expense');
      }

      fetchExpenses(); // Refresh the data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  // Payment management functions
  const openPaymentsModal = (expense: BudgetExpense) => {
    setSelectedExpenseForPayments(expense);
    setEditingPayment(null);
    setPaymentFormData({
      amount: getRemainingAmount(expense),
      whoPaid: '',
      whoPaidName: '',
      datePaid: new Date().toISOString().split('T')[0],
      moneyReturned: false,
      notes: ''
    });
    setShowPaymentsModal(true);
  };

  const startEditingPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentFormData({
      amount: payment.amount,
      whoPaid: payment.whoPaid,
      whoPaidName: payment.whoPaidName,
      datePaid: new Date(payment.datePaid).toISOString().split('T')[0],
      moneyReturned: payment.moneyReturned,
      notes: payment.notes || ''
    });
  };

  const cancelEditingPayment = () => {
    setEditingPayment(null);
    if (selectedExpenseForPayments) {
      setPaymentFormData({
        amount: getRemainingAmount(selectedExpenseForPayments),
        whoPaid: '',
        whoPaidName: '',
        datePaid: new Date().toISOString().split('T')[0],
        moneyReturned: false,
        notes: ''
      });
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpenseForPayments) return;

    setIsSubmitting(true);
    try {
      let response;
      
      if (editingPayment && editingPayment._id) {
        // Update existing payment
        response = await fetch(`/api/budget/${selectedExpenseForPayments._id}/payments/${editingPayment._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(paymentFormData),
        });
      } else {
        // Add new payment
        response = await fetch(`/api/budget/${selectedExpenseForPayments._id}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(paymentFormData),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingPayment ? 'update' : 'add'} payment`);
      }

      // Reset form and refresh
      setEditingPayment(null);
      setPaymentFormData({
        amount: 0,
        whoPaid: '',
        whoPaidName: '',
        datePaid: new Date().toISOString().split('T')[0],
        moneyReturned: false,
        notes: ''
      });
      
      await fetchExpenses();
      
      // Update the selected expense in the modal
      const updatedExpenses = await fetch('/api/budget', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json());
      
      const updatedExpense = updatedExpenses.data.find((e: BudgetExpense) => e._id === selectedExpenseForPayments._id);
      if (updatedExpense) {
        setSelectedExpenseForPayments(updatedExpense);
        // Set next payment amount to remaining
        setPaymentFormData(prev => ({
          ...prev,
          amount: getRemainingAmount(updatedExpense)
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingPayment ? 'update' : 'add'} payment`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!selectedExpenseForPayments) return;
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      const response = await fetch(`/api/budget/${selectedExpenseForPayments._id}/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete payment');
      }

      await fetchExpenses();
      
      // Update the selected expense
      const updatedExpenses = await fetch('/api/budget', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json());
      
      const updatedExpense = updatedExpenses.data.find((e: BudgetExpense) => e._id === selectedExpenseForPayments._id);
      if (updatedExpense) {
        setSelectedExpenseForPayments(updatedExpense);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Category', 'Item', 'Quantity', 'Amount (NIS)', 'Paid', 'Who Paid', 'Money Returned', 'Date', 'Notes'].join(','),
      ...filteredExpenses.map(expense => [
        expense.costCategory,
        expense.item,
        expense.quantity,
        expense.costAmount,
        expense.alreadyPaid ? 'Yes' : 'No',
        expense.whoPaidName || '',
        expense.moneyReturned ? 'Yes' : 'No',
        new Date(expense.dateOfExpense).toLocaleDateString(),
        expense.notes || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and sort expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.costCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.whoPaidName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || expense.costCategory === filterCategory;
    const matchesPaidStatus = !filterPaidStatus || 
      (filterPaidStatus === 'paid' && expense.alreadyPaid) ||
      (filterPaidStatus === 'unpaid' && !expense.alreadyPaid);
    const matchesReturnedStatus = !filterReturnedStatus ||
      (filterReturnedStatus === 'returned' && expense.moneyReturned) ||
      (filterReturnedStatus === 'not-returned' && !expense.moneyReturned);
    
    return matchesSearch && matchesCategory && matchesPaidStatus && matchesReturnedStatus;
  });

  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.costCategory]) {
      acc[expense.costCategory] = [];
    }
    acc[expense.costCategory].push(expense);
    return acc;
  }, {} as Record<string, BudgetExpense[]>);

  // Sort categories by total amount (highest first)
  const sortedCategories = Object.keys(expensesByCategory).sort((a, b) => {
    const totalA = expensesByCategory[a].reduce((sum, exp) => sum + exp.costAmount, 0);
    const totalB = expensesByCategory[b].reduce((sum, exp) => sum + exp.costAmount, 0);
    return totalB - totalA;
  });

  // Sort expenses within each category by amount (highest first by default)
  Object.keys(expensesByCategory).forEach(category => {
    expensesByCategory[category].sort((a, b) => b.costAmount - a.costAmount);
  });

  // Calculate total count
  const totalCount = filteredExpenses.length;

  // Calculate total budget and percentage spent
  const totalBudget = approvedMembersCount * CAMP_FEE_PER_MEMBER;
  const percentageSpent = statistics && totalBudget > 0 
    ? (statistics.totalAmount / totalBudget) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading budget data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <Button 
          onClick={fetchExpenses} 
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
          <h2 className="text-2xl font-bold text-gray-900">Budget & Expenses</h2>
          <p className="text-gray-600 mt-1">Track and manage camp expenditures and budget allocation</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Expenses Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Camp Expenses</h3>
              <p className="text-gray-600 mt-1">Track and manage camp expenditures</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={exportData} variant="outline" className="bg-green-50 hover:bg-green-100">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-blue-600">₪{statistics.totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  {totalBudget > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Budget: ₪{totalBudget.toLocaleString()} ({percentageSpent.toFixed(1)}%)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">₪{statistics.paidAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Paid ({statistics.paidExpenses} items)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">₪{statistics.unpaidAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Unpaid ({statistics.unpaidExpenses} items)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">₪{statistics.returnedAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Money Returned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((category) => (
                <div key={category._id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{category._id}</h4>
                  <p className="text-sm text-gray-600">{category.count} items</p>
                  <p className="text-lg font-bold text-blue-600">₪{category.totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-green-600">₪{category.paidAmount.toLocaleString()} paid</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {costCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterPaidStatus}
              onChange={(e) => setFilterPaidStatus(e.target.value)}
            >
              <option value="">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterReturnedStatus}
              onChange={(e) => setFilterReturnedStatus(e.target.value)}
            >
              <option value="">All Return Status</option>
              <option value="returned">Money Returned</option>
              <option value="not-returned">Not Returned</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Expenses ({totalCount} items)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Who Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCategories.map((category) => {
                  const categoryExpenses = expensesByCategory[category];
                  const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.costAmount, 0);
                  
                  return (
                    <React.Fragment key={category}>
                      {/* Category Header */}
                      <tr className="bg-orange-50 border-b-2 border-orange-200">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-base font-bold text-orange-900">{category}</span>
                              <span className="text-sm text-gray-600">({categoryExpenses.length} items)</span>
                            </div>
                            <div className="text-lg font-bold text-orange-900">
                              Total: ₪{categoryTotal.toLocaleString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expenses in this category */}
                      {categoryExpenses.map((expense) => (
                        <React.Fragment key={expense._id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {expense.item}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Qty: {expense.quantity}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ₪{expense.costAmount.toLocaleString()}
                              </div>
                              {expense.payments && expense.payments.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  Paid: ₪{getTotalPaid(expense).toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                {(() => {
                                  const status = getPaymentStatus(expense);
                                  const totalPaid = getTotalPaid(expense);
                                  const remaining = getRemainingAmount(expense);
                                  const hasUnreturned = hasUnreturnedPayments(expense);
                                  const unreturnedInfo = hasUnreturned ? getUnreturnedPaymentsInfo(expense) : null;
                                  
                                  return (
                                    <>
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        status === 'paid' 
                                          ? 'bg-green-100 text-green-800' 
                                          : status === 'partial'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {status === 'paid' ? 'Fully Paid' : status === 'partial' ? `Partial (₪${remaining})` : 'Unpaid'}
                                      </span>
                                      {expense.payments && expense.payments.length > 0 && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                          {expense.payments.length} payment{expense.payments.length > 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {hasUnreturned && unreturnedInfo && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800" title={`${unreturnedInfo.count} payment${unreturnedInfo.count > 1 ? 's' : ''} need${unreturnedInfo.count === 1 ? 's' : ''} to be reimbursed`}>
                                          ⚠️ Not Returned (₪{unreturnedInfo.total})
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {expense.payments && expense.payments.length > 0 ? (
                                  expense.payments.length === 1 ? (
                                    expense.payments[0].whoPaidName
                                  ) : (
                                    `${expense.payments.length} payers`
                                  )
                                ) : (
                                  expense.whoPaidName || (expense.alreadyPaid ? 'Unknown' : '-')
                                )}
                              </div>
                              {expense.payments && expense.payments.length > 1 && (
                                <div className="text-xs text-gray-500">Click to see details</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(expense.dateOfExpense).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => toggleRowExpansion(expense._id)}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Expand details"
                                >
                                  {expandedRows.has(expense._id) ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => openPaymentsModal(expense)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Manage payments"
                                >
                                  <DollarSign className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEditModal(expense)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit expense"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete expense"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows.has(expense._id) && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                                    <p><strong>Total Amount:</strong> ₪{expense.costAmount.toLocaleString()}</p>
                                    <p><strong>Total Paid:</strong> ₪{getTotalPaid(expense).toLocaleString()}</p>
                                    <p><strong>Remaining:</strong> ₪{getRemainingAmount(expense).toLocaleString()}</p>
                                    
                                    {expense.payments && expense.payments.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="font-medium text-gray-800 mb-1">Payments ({expense.payments.length}):</h5>
                                        <div className="space-y-1">
                                          {expense.payments.map((payment, idx) => (
                                            <div key={payment._id || idx} className={`text-xs p-2 rounded border ${!payment.moneyReturned ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
                                              <div><strong>{payment.whoPaidName}</strong> - ₪{payment.amount.toLocaleString()}</div>
                                              <div className="text-gray-500">
                                                {new Date(payment.datePaid).toLocaleDateString()}
                                                {payment.moneyReturned ? (
                                                  <span className="text-green-600"> • ✓ Returned</span>
                                                ) : (
                                                  <span className="text-orange-600 font-semibold"> • ⚠️ Not Returned</span>
                                                )}
                                              </div>
                                              {payment.notes && <div className="text-gray-600 italic">{payment.notes}</div>}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Additional Info</h4>
                                    <p><strong>Date:</strong> {new Date(expense.dateOfExpense).toLocaleDateString()}</p>
                                    <p><strong>Created:</strong> {new Date(expense.createdAt).toLocaleDateString()}</p>
                                    {expense.notes && (
                                      <p><strong>Notes:</strong> {expense.notes}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {totalCount === 0 && (
              <div className="text-center py-8 text-gray-500">
                No expenses found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl mx-auto z-10">
              <Card className="w-full bg-white shadow-2xl border-0">
                <CardHeader>
                  <CardTitle>
                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                  </CardTitle>
                  <CardDescription>
                    {editingExpense ? 'Update expense details' : 'Enter details for the new expense'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost Category *
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={formData.costCategory}
                          onChange={(e) => setFormData({ ...formData, costCategory: e.target.value })}
                        >
                          {costCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Expense *
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={formData.dateOfExpense}
                          onChange={(e) => setFormData({ ...formData, dateOfExpense: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Description *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Fresh vegetables for camp meals"
                        value={formData.item}
                        onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost Amount (NIS) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.00"
                          value={formData.costAmount}
                          onChange={(e) => setFormData({ ...formData, costAmount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    {/* Payment Status Info - Read Only */}
                    {editingExpense && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <DollarSign className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 text-sm mb-1">Payment Information</h4>
                            <div className="text-sm text-blue-800 space-y-1">
                              <p>Total: ₪{editingExpense.costAmount.toLocaleString()}</p>
                              <p>Paid: ₪{getTotalPaid(editingExpense).toLocaleString()}</p>
                              <p>Remaining: ₪{getRemainingAmount(editingExpense).toLocaleString()}</p>
                              {editingExpense.payments && editingExpense.payments.length > 0 && (
                                <p className="font-medium">{editingExpense.payments.length} payment(s) recorded</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setShowModal(false);
                                setTimeout(() => openPaymentsModal(editingExpense), 100);
                              }}
                              className="mt-2 text-sm text-blue-700 hover:text-blue-900 underline font-medium"
                            >
                              → Manage Payments
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info box for new expenses */}
                    {!editingExpense && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">💡 Tip:</span> After creating this expense, you can add payments using the <DollarSign className="w-3 h-3 inline" /> (Manage Payments) button.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                        placeholder="Additional notes about this expense..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowModal(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : (editingExpense ? 'Update' : 'Add')} Expense
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Payments Management Modal */}
      {showPaymentsModal && selectedExpenseForPayments && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowPaymentsModal(false)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-3xl mx-auto z-10">
              <Card className="w-full bg-white shadow-2xl border-0">
                <CardHeader>
                  <CardTitle>
                    Manage Payments - {selectedExpenseForPayments.item}
                  </CardTitle>
                  <CardDescription>
                    Total: ₪{selectedExpenseForPayments.costAmount.toLocaleString()} | 
                    Paid: ₪{getTotalPaid(selectedExpenseForPayments).toLocaleString()} | 
                    Remaining: ₪{getRemainingAmount(selectedExpenseForPayments).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Existing Payments */}
                  {selectedExpenseForPayments.payments && selectedExpenseForPayments.payments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Existing Payments</h3>
                      <div className="space-y-2">
                        {selectedExpenseForPayments.payments.map((payment, idx) => (
                          <div key={payment._id || idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                            editingPayment?._id === payment._id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex-1">
                              <div className="font-medium">{payment.whoPaidName}</div>
                              <div className="text-sm text-gray-600">
                                ₪{payment.amount.toLocaleString()} • {new Date(payment.datePaid).toLocaleDateString()}
                                {payment.moneyReturned && ' • ✓ Money Returned'}
                              </div>
                              {payment.notes && <div className="text-xs text-gray-500 italic mt-1">{payment.notes}</div>}
                              {editingPayment?._id === payment._id && (
                                <div className="text-xs text-blue-600 font-medium mt-1">Editing this payment below ↓</div>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => startEditingPayment(payment)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit payment"
                                disabled={editingPayment?._id === payment._id}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment._id!)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete payment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Status Alert */}
                  {getRemainingAmount(selectedExpenseForPayments) <= 0 && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                        <div>
                          <p className="font-semibold text-green-800">Fully Paid!</p>
                          <p className="text-sm text-green-700">This expense has been completely paid. You can still edit or add payments below.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add/Edit Payment Form - Always visible */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      {editingPayment ? 'Edit Payment' : 'Add New Payment'}
                    </h3>
                    {!editingPayment && getRemainingAmount(selectedExpenseForPayments) < 0 && (
                      <div className="mb-3 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
                        ⚠️ Warning: Total payments exceed expense amount by ₪{Math.abs(getRemainingAmount(selectedExpenseForPayments)).toLocaleString()}
                      </div>
                    )}
                    <form onSubmit={handleAddPayment} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (NIS) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder={getRemainingAmount(selectedExpenseForPayments) > 0 
                              ? `Suggested: ₪${getRemainingAmount(selectedExpenseForPayments).toLocaleString()}`
                              : 'Enter amount'}
                            value={paymentFormData.amount || ''}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: parseFloat(e.target.value) || 0 })}
                          />
                          {getRemainingAmount(selectedExpenseForPayments) > 0 && (
                            <p className="text-xs text-gray-500 mt-1">Remaining: ₪{getRemainingAmount(selectedExpenseForPayments).toLocaleString()}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Paid *
                          </label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            value={paymentFormData.datePaid}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, datePaid: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Who Paid *
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={paymentFormData.whoPaid}
                          onChange={(e) => {
                            const selectedMember = members.find(m => m._id === e.target.value);
                            setPaymentFormData({ 
                              ...paymentFormData, 
                              whoPaid: e.target.value,
                              whoPaidName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : ''
                            });
                          }}
                        >
                          <option value="">Select member...</option>
                          {members.map(member => (
                            <option key={member._id} value={member._id}>
                              {member.firstName} {member.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="paymentMoneyReturned"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={paymentFormData.moneyReturned}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, moneyReturned: e.target.checked })}
                        />
                        <label htmlFor="paymentMoneyReturned" className="ml-2 text-sm text-gray-700">Money Returned</label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          rows={2}
                          placeholder="Optional notes about this payment..."
                          value={paymentFormData.notes}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        {editingPayment && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditingPayment}
                            disabled={isSubmitting}
                          >
                            Cancel Edit
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPaymentsModal(false)}
                          disabled={isSubmitting}
                        >
                          Close
                        </Button>
                        <Button
                          type="submit"
                          className={editingPayment ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                          disabled={isSubmitting}
                        >
                          {isSubmitting 
                            ? (editingPayment ? 'Updating...' : 'Adding...') 
                            : (editingPayment ? 'Update Payment' : 'Add Payment')
                          }
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
