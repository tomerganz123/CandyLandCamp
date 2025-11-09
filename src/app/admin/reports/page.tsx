'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Users, 
  Ticket, 
  Car, 
  Utensils, 
  Wrench,
  Heart,
  DollarSign,
  FileText,
  ArrowLeft,
  Download,
  RefreshCw,
  ClipboardCheck
} from 'lucide-react';
import MemberDemographics from '@/components/reports/MemberDemographics';
import TicketsAndFees from '@/components/reports/TicketsAndFees';
import LogisticsArrival from '@/components/reports/LogisticsArrival';
import FoodHealth from '@/components/reports/FoodHealth';
import RolesSkillsGifts from '@/components/reports/RolesSkillsGifts';
import VolunteersReport from '@/components/reports/VolunteersReport';
import BudgetReport from '@/components/reports/BudgetReport';
import AdminViews from '@/components/reports/AdminViews';

import MemberCompletionStatus from '@/components/reports/MemberCompletionStatus';

const REPORT_CATEGORIES = [
  {
    id: 'demographics',
    name: 'Member & Demographics',
    icon: Users,
    description: 'Member roster, age distribution, gender breakdown',
    color: 'bg-blue-500'
  },
  {
    id: 'completion',
    name: 'Form Completion Status',
    icon: ClipboardCheck,
    description: 'Track which members completed additional info and kitchen shifts',
    color: 'bg-indigo-500'
  },
  {
    id: 'tickets',
    name: 'Tickets & Fees',
    icon: Ticket,
    description: 'Ticket status, fee acceptance, approval overview',
    color: 'bg-green-500'
  },
  {
    id: 'logistics',
    name: 'Logistics & Arrival',
    icon: Car,
    description: 'Arrival schedule, transportation, early arrival team',
    color: 'bg-purple-500'
  },
  {
    id: 'health',
    name: 'Kitchen Management',
    icon: Utensils,
    description: 'Food supply ordering, menu planning, volunteer shifts, kabab gift',
    color: 'bg-red-500'
  },
  {
    id: 'skills',
    name: 'Roles, Skills & Gifts',
    icon: Wrench,
    description: 'Camp roles, special skills, gift participation',
    color: 'bg-orange-500'
  },
  {
    id: 'volunteers',
    name: 'Volunteer Shifts',
    icon: Heart,
    description: 'Volunteer registrations, shift assignments, contact info',
    color: 'bg-pink-500'
  },
  {
    id: 'budget',
    name: 'Budget Management',
    icon: DollarSign,
    description: 'Track expenses, payments, and budget allocation',
    color: 'bg-emerald-500'
  },
  {
    id: 'admin',
    name: 'Admin Views',
    icon: FileText,
    description: 'Contact sheets, emergency info, comments log',
    color: 'bg-gray-500'
  }
];

export default function ReportsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('demographics');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) {
      router.push('/admin');
      return;
    }
    setToken(storedToken);
    setIsLoading(false);
  }, [router]);

  const handleExportAll = async () => {
    if (!token) return;
    
    // For now, just export the current category's data
    // TODO: Implement combined export endpoint
    alert('Export All feature coming soon! Use individual export buttons for now.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect to admin login
  }

  const activeReport = REPORT_CATEGORIES.find(cat => cat.id === activeCategory);

  const renderActiveReport = () => {
    switch (activeCategory) {
      case 'demographics':
        return <MemberDemographics token={token} />;
      case 'completion':
        return <MemberCompletionStatus token={token} />;
      case 'tickets':
        return <TicketsAndFees token={token} />;
      case 'logistics':
        return <LogisticsArrival token={token} />;
      case 'health':
        return <FoodHealth token={token} />;
      case 'skills':
        return <RolesSkillsGifts token={token} />;
      case 'volunteers':
        return <VolunteersReport token={token} />;
      case 'budget':
        return <BudgetReport token={token} />;
      case 'admin':
        return <AdminViews token={token} />;
      default:
        return <MemberDemographics token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">
                    BABA ZMAN Reports
                  </h1>
                  <p className="text-sm text-gray-500">
                    {activeReport?.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href="/admin-unified"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors shadow-md"
                title="Try the new unified admin dashboard"
              >
                <TrendingUp className="h-4 w-4" />
                Unified
              </a>
              
              <button
                onClick={handleExportAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export All
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh reports"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {REPORT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isActive
                      ? `${category.color} text-white border-transparent shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {category.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Report Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {renderActiveReport()}
        </div>
      </div>
    </div>
  );
}
