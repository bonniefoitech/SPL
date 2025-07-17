import React, { useState } from 'react'
import Navigation from '../components/Navigation'
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Calendar,
  Target,
  Star,
  Eye
} from 'lucide-react'

const Portfolio: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const teams = [
    {
      id: '1',
      name: 'Tech Giants',
      created: '2 weeks ago',
      contests: 12,
      wins: 8,
      winRate: 66.7,
      totalEarnings: 15000,
      currentValue: 98500000,
      performance: 12.5,
      status: 'active'
    },
    {
      id: '2',
      name: 'Value Hunters',
      created: '1 month ago',
      contests: 8,
      wins: 5,
      winRate: 62.5,
      totalEarnings: 8500,
      currentValue: 95200000,
      performance: -2.3,
      status: 'active'
    },
    {
      id: '3',
      name: 'Growth Stocks',
      created: '3 weeks ago',
      contests: 15,
      wins: 12,
      winRate: 80.0,
      totalEarnings: 22000,
      currentValue: 102000000,
      performance: 18.7,
      status: 'archived'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || team.status === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            My Portfolio
          </h1>
          <p className="text-slate-300">Manage your teams and track performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Teams', value: '3', icon: Trophy, gradient: 'from-purple-400 to-pink-500' },
            { title: 'Total Contests', value: '35', icon: Target, gradient: 'from-blue-400 to-cyan-500' },
            { title: 'Win Rate', value: '69.7%', icon: Star, gradient: 'from-emerald-400 to-green-500' },
            { title: 'Total Earnings', value: '₹45,500', icon: TrendingUp, gradient: 'from-amber-400 to-orange-500' }
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-slate-400 text-sm">{stat.title}</p>
              </div>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Teams</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-3 rounded-xl transition-all duration-300">
              <Download className="w-5 h-5" />
              Export
            </button>
            
            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300">
              <Plus className="w-5 h-5" />
              Create Team
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map((team, i) => (
            <div key={team.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                  <p className="text-slate-400 text-sm">Created {team.created}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  team.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-400/30'
                }`}>
                  {team.status}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white mb-1">{formatCurrency(team.currentValue)}</div>
                  <div className="text-slate-400 text-sm">Current Value</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className={`text-2xl font-bold mb-1 flex items-center gap-1 ${
                    team.performance >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {team.performance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {team.performance >= 0 ? '+' : ''}{team.performance}%
                  </div>
                  <div className="text-slate-400 text-sm">Performance</div>
                </div>
              </div>

              {/* Contest Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{team.contests}</div>
                  <div className="text-slate-400 text-xs">Contests</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-400">{team.wins}</div>
                  <div className="text-slate-400 text-xs">Wins</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">{team.winRate}%</div>
                  <div className="text-slate-400 text-xs">Win Rate</div>
                </div>
              </div>

              {/* Earnings */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium text-sm">Total Earnings</span>
                </div>
                <div className="text-xl font-bold text-white">{formatCurrency(team.totalEarnings)}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-red-400 font-medium py-2 px-3 rounded-lg transition-all duration-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTeams.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No teams found</h3>
            <p className="text-slate-400 mb-6">Create your first team to start competing</p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300">
              Create Your First Team
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio