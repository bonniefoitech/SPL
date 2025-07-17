import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import DashboardStats from '../components/DashboardStats'
import MyContests from '../components/MyContests'
import LiveLeaderboard from '../components/LiveLeaderboard'
import QuickActions from '../components/QuickActions'
import ActivityFeed from '../components/ActivityFeed'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Mock activity data
  const activities = [
    {
      id: '1',
      type: 'trade' as const,
      title: 'Portfolio Update',
      description: 'Added AAPL to your portfolio',
      amount: 150,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success' as const
    },
    {
      id: '2',
      type: 'contest' as const,
      title: 'Joined Contest',
      description: 'Tech Giants Weekly Challenge',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'success' as const
    },
    {
      id: '3',
      type: 'achievement' as const,
      title: 'Achievement Unlocked',
      description: 'First Place in Daily Contest',
      amount: 500,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'success' as const
    },
    {
      id: '4',
      type: 'deposit' as const,
      title: 'Funds Added',
      description: 'Credit card deposit',
      amount: 1000,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'success' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Top Navigation */}
      <TopNavigation sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 w-full ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-4 sm:p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-slate-300">Here's what's happening with your portfolio today</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8">
            <DashboardStats />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Contests & Actions */}
            <div className="lg:col-span-2 space-y-8">
              <MyContests />
              <QuickActions />
            </div>

            {/* Right Column - Leaderboard & Activity */}
            <div className="space-y-8">
              <LiveLeaderboard />
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400 to-cyan-500">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Recent Activity
                </h3>
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard