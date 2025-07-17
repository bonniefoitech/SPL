import React, { useState } from 'react'
import Navigation from '../components/Navigation'
import GlobalLeaderboard from '../components/GlobalLeaderboard'
import { 
  Crown, 
  Trophy, 
  Medal, 
  Award,
  TrendingUp, 
  Users,
  Calendar,
  Target,
  Star,
  Zap
} from 'lucide-react'

const Leaderboard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('global')

  const categories = [
    { id: 'global', name: 'Global Rankings', icon: Crown },
    { id: 'contests', name: 'Contest Winners', icon: Trophy },
    { id: 'weekly', name: 'Weekly Leaders', icon: Calendar },
    { id: 'achievements', name: 'Top Achievers', icon: Star }
  ]

  const topPerformers = [
    {
      rank: 1,
      username: 'StockMaster',
      points: 12450,
      change: '+350',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      gradient: 'from-amber-400 to-yellow-500'
    },
    {
      rank: 2,
      username: 'TradingPro',
      points: 11850,
      change: '-120',
      avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      gradient: 'from-slate-300 to-slate-400'
    },
    {
      rank: 3,
      username: 'InvestorGuru',
      points: 11200,
      change: '+280',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      gradient: 'from-amber-600 to-orange-500'
    }
  ]

  const stats = [
    {
      title: 'Total Players',
      value: '12,450',
      change: '+8.2%',
      icon: Users,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Active Contests',
      value: '247',
      change: '+12%',
      icon: Trophy,
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Total Prizes',
      value: '₹8.4L',
      change: '+15.3%',
      icon: Target,
      gradient: 'from-emerald-400 to-green-500'
    },
    {
      title: 'Live Matches',
      value: '23',
      change: '+5',
      icon: Zap,
      gradient: 'from-amber-400 to-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Global Leaderboard
          </h1>
          <p className="text-slate-300">Compete with the best traders and climb the rankings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
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
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Top 3 Podium */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            Top Performers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {topPerformers.map((performer, index) => {
              const RankIcon = index === 0 ? Crown : index === 1 ? Trophy : Medal
              
              return (
                <div
                  key={performer.rank}
                  className={`group bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-in slide-in-from-bottom-4 ${
                    index === 0 ? 'md:order-2 md:scale-110' : index === 1 ? 'md:order-1' : 'md:order-3'
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${performer.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <RankIcon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="relative mb-4">
                      <img
                        src={performer.avatar}
                        alt={performer.username}
                        className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white/20"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {performer.rank}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                      {performer.username}
                    </h3>
                    
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
                      {performer.points.toLocaleString()}
                    </div>
                    
                    <div className={`flex items-center justify-center gap-1 text-sm ${
                      performer.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {performer.change}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Leaderboard */}
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <GlobalLeaderboard className="min-h-[600px]" />
        </div>
      </div>
    </div>
  )
}

export default Leaderboard