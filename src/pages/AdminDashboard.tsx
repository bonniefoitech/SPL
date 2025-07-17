import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import ContestCreationForm from '../components/ContestCreationForm'
import ContestStatusManager from '../components/ContestStatusManager'
import { 
  BarChart3, 
  Users, 
  Trophy, 
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Shield,
  Activity,
  Calendar,
  Target,
  Zap
} from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const { user, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState('contests')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Mock admin stats
  const adminStats = [
    {
      title: 'Total Contests',
      value: '247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Trophy,
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Active Users',
      value: '12,450',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Users,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Total Revenue',
      value: '₹8.4L',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
      gradient: 'from-emerald-400 to-green-500'
    },
    {
      title: 'Platform Growth',
      value: '23.8%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      gradient: 'from-amber-400 to-orange-500'
    }
  ]

  const tabs = [
    { id: 'contests', name: 'Contest Management', icon: Trophy },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
            {userRole === 'admin' ? (
              <span className="ml-2 text-sm px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                Admin Access
              </span>
            ) : (
              <span className="ml-2 text-sm px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                Restricted Access
              </span>
            )}
          </h1>
          <p className="text-slate-300">Manage contests, users, and platform settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                    {stat.value}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                    ↗ {stat.change}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden mb-8">
          <div className="border-b border-white/20">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap text-emerald-400 hover:text-emerald-300 hover:bg-white/10"
              >
                <Plus className="w-5 h-5" />
                Create Contest
              </button>
              
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b-2 border-purple-400'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'contests' && <ContestStatusManager />}
            
            {activeTab === 'users' && (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
                <p className="text-slate-400">User management features coming soon</p>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-slate-400">Analytics features coming soon</p>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="text-center py-16">
                <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Platform Settings</h3>
                <p className="text-slate-400">Settings panel coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showCreateForm && (
        <ContestCreationForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            // Refresh contest list if needed
          }}
        />
      )}
    </div>
  )
}

export default AdminDashboard