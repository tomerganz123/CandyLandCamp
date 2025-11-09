'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp,
  Ticket,
  Car,
  Utensils,
  Wrench,
  Heart,
  DollarSign,
  CreditCard,
  ClipboardCheck,
  Menu,
  X,
  LogOut,
  RefreshCw,
  Home,
  BarChart3,
  Download,
  Settings,
  Calendar,
  UserCheck,
  UserX,
  Search
} from 'lucide-react';

// Import all report components
import MemberDemographics from './reports/MemberDemographics';
import MemberCompletionStatus from './reports/MemberCompletionStatus';
import TicketsAndFees from './reports/TicketsAndFees';
import LogisticsArrival from './reports/LogisticsArrival';
import FoodHealth from './reports/FoodHealth';
import RolesSkillsGifts from './reports/RolesSkillsGifts';
import VolunteersReport from './reports/VolunteersReport';
import BudgetReport from './reports/BudgetReport';
import FeeCollectionReport from './reports/FeeCollectionReport';
import AdminViews from './reports/AdminViews';
import AdditionalInfoOverview from './AdditionalInfoOverview';

interface MemberStats {
  total: number;
  approved: number;
  pending: number;
  recentRegistrations: number;
}

interface UnifiedAdminDashboardProps {
  token: string;
  onLogout: () => void;
}

type Section = 
  | 'dashboard'
  | 'members' 
  | 'additional-info'
  | 'completion'
  | 'demographics'
  | 'tickets'
  | 'logistics'
  | 'kitchen'
  | 'skills'
  | 'volunteers'
  | 'budget'
  | 'fee-collection'
  | 'admin-views';

const MENU_SECTIONS = [
  {
    id: 'dashboard' as Section,
    name: 'Dashboard',
    icon: Home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    description: 'Overview & Statistics'
  },
  {
    id: 'members' as Section,
    name: 'Member Management',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100',
    description: 'View and manage all camp members'
  },
  {
    id: 'budget' as Section,
    name: 'Budget & Expenses',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
    description: 'Track expenses and budget allocation'
  },
  {
    id: 'fee-collection' as Section,
    name: 'Fee Collection',
    icon: CreditCard,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    hoverColor: 'hover:bg-teal-100',
    description: 'Member fee payments and tracking'
  },
  {
    id: 'kitchen' as Section,
    name: 'Kitchen Management',
    icon: Utensils,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100',
    description: 'Food planning and dietary needs'
  },
  {
    id: 'additional-info' as Section,
    name: 'Additional Info',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    description: 'Tent, coffee, mattress preferences'
  },
  {
    id: 'completion' as Section,
    name: 'Form Completion',
    icon: ClipboardCheck,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    hoverColor: 'hover:bg-cyan-100',
    description: 'Track member form submissions'
  },
  {
    id: 'demographics' as Section,
    name: 'Demographics',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    description: 'Age, gender, and member distribution'
  },
  {
    id: 'tickets' as Section,
    name: 'Tickets & Fees',
    icon: Ticket,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    description: 'Ticket status and fee acceptance'
  },
  {
    id: 'logistics' as Section,
    name: 'Logistics',
    icon: Car,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    description: 'Arrival schedule and transportation'
  },
  {
    id: 'skills' as Section,
    name: 'Roles & Skills',
    icon: Wrench,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100',
    description: 'Camp roles and special skills'
  },
  {
    id: 'volunteers' as Section,
    name: 'Volunteer Shifts',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    hoverColor: 'hover:bg-pink-100',
    description: 'Shift registrations and assignments'
  },
  {
    id: 'admin-views' as Section,
    name: 'Admin Views',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    hoverColor: 'hover:bg-gray-100',
    description: 'Contact sheets and admin tools'
  }
];

export default function UnifiedAdminDashboard({ token, onLogout }: UnifiedAdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview stats={stats} token={token} onNavigate={setActiveSection} />;
      case 'members':
        return <MemberManagementSection token={token} />;
      case 'additional-info':
        return <AdditionalInfoOverview token={token} />;
      case 'completion':
        return <MemberCompletionStatus token={token} />;
      case 'demographics':
        return <MemberDemographics token={token} />;
      case 'tickets':
        return <TicketsAndFees token={token} />;
      case 'logistics':
        return <LogisticsArrival token={token} />;
      case 'kitchen':
        return <FoodHealth token={token} />;
      case 'skills':
        return <RolesSkillsGifts token={token} />;
      case 'volunteers':
        return <VolunteersReport token={token} />;
      case 'budget':
        return <BudgetReport token={token} />;
      case 'fee-collection':
        return <FeeCollectionReport token={token} />;
      case 'admin-views':
        return <AdminViews token={token} />;
      default:
        return <DashboardOverview stats={stats} token={token} onNavigate={setActiveSection} />;
    }
  };

  const activeMenu = MENU_SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            <h1 className="font-semibold text-gray-800">Candy Land Admin</h1>
          </div>
          
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed top-0 left-0 h-screen bg-white border-r shadow-lg transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-800">Candy Land</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {MENU_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive 
                        ? `${section.bgColor} ${section.color} shadow-md` 
                        : `text-gray-600 ${section.hoverColor}`
                    }`}
                    title={!sidebarOpen ? section.name : ''}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? section.color : 'text-gray-500'}`} />
                    {sidebarOpen && (
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium ${isActive ? section.color : 'text-gray-700'}`}>
                          {section.name}
                        </div>
                        {isActive && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {section.description}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t">
            <button
              onClick={() => fetchStats()}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors ${
                !sidebarOpen && 'justify-center'
              }`}
              title="Refresh data"
            >
              <RefreshCw className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Refresh</span>}
            </button>
            
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2 ${
                !sidebarOpen && 'justify-center'
              }`}
              title="Logout"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute top-0 left-0 w-80 h-full bg-white shadow-xl overflow-y-auto pt-16">
            <nav className="p-4">
              <div className="space-y-1">
                {MENU_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive 
                          ? `${section.bgColor} ${section.color} shadow-md` 
                          : `text-gray-600 ${section.hoverColor}`
                      }`}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? section.color : 'text-gray-500'}`} />
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium ${isActive ? section.color : 'text-gray-700'}`}>
                          {section.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {section.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className={`lg:transition-all lg:duration-300 pt-16 lg:pt-0 ${
        sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
      }`}>
        {/* Content Header */}
        <div className="bg-white border-b shadow-sm sticky top-16 lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {activeMenu && <activeMenu.icon className={`h-7 w-7 ${activeMenu.color}`} />}
                  {activeMenu?.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{activeMenu?.description}</p>
              </div>
              
              {/* Quick Stats for desktop */}
              {stats && activeSection === 'dashboard' && (
                <div className="hidden xl:flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="text-xl font-bold text-blue-600">{stats.total}</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                    <div className="text-xs text-gray-600">Approved</div>
                    <div className="text-xl font-bold text-green-600">{stats.approved}</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg">
                    <div className="text-xs text-gray-600">Pending</div>
                    <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {loading && activeSection === 'dashboard' ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="spinner h-12 w-12 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ stats, token, onNavigate }: { stats: MemberStats | null; token: string; onNavigate: (section: Section) => void }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold mt-2">{stats.approved}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-2">{stats.pending}</p>
              </div>
              <UserX className="h-12 w-12 text-yellow-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">This Week</p>
                <p className="text-3xl font-bold mt-2">{stats.recentRegistrations}</p>
              </div>
              <Calendar className="h-12 w-12 text-purple-200 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MENU_SECTIONS.filter(s => s.id !== 'dashboard').map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={`${section.bgColor} ${section.hoverColor} p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-left group`}
              >
                <Icon className={`h-8 w-8 ${section.color} mb-3`} />
                <h4 className={`font-semibold ${section.color} mb-1`}>{section.name}</h4>
                <p className="text-sm text-gray-600">{section.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-800">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Active Session</p>
            <p className="font-medium text-green-600">Connected</p>
          </div>
          <div>
            <p className="text-gray-500">Dashboard Version</p>
            <p className="font-medium text-gray-800">Unified v2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Member Management Section - Simplified version (the full table is now embedded)
function MemberManagementSection({ token }: { token: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Member Management</h3>
        <a
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Open Full View
        </a>
      </div>
      <p className="text-gray-600 mb-4">
        For the complete member management experience with all filters and actions, click "Open Full View" above.
        This will open the detailed member management page in a new tab.
      </p>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
        <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Complete Member Database</h4>
        <p className="text-gray-600 mb-4">
          Access the full member management system with advanced search, filtering, approval management, and export capabilities.
        </p>
        <a
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Users className="h-5 w-5" />
          Go to Member Management
        </a>
      </div>
    </div>
  );
}

