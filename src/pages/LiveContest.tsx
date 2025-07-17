import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users,
  Share2,
  RefreshCw,
  Zap,
  Target,
  BarChart3
} from 'lucide-react'

const LiveContest: React.FC = () => {
  const { id } = useParams()
  const [timeRemaining, setTimeRemaining] = useState({ hours: 2, minutes: 45, seconds: 30 })
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, user: 'StockMaster', team: 'Tech Giants', points: 1250, change: '+50', trend: 'up' },
    { rank: 2, user: 'TradingPro', team: 'Market Movers', points: 1180, change: '-20', trend: 'down' },
    { rank: 3, user: 'InvestorGuru', team: 'Bull Run', points: 1120, change: '+80', trend: 'up' }
  ])

  const stockTicker = [
    { symbol: 'AAPL', price: 182.52, change: 2.34, percent: 1.30 },
    { symbol: 'MSFT', price: 378.85, change: -1.23, percent: -0.32 },
    { symbol: 'GOOGL', price: 142.56, change: 3.45, percent: 2.48 }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900">
      <Navigation />
      
      {/* Stock Ticker */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 overflow-hidden">
        <div className="flex animate-scroll py-2">
          {[...stockTicker, ...stockTicker].map((stock, i) => (
            <div key={i} className="flex items-center gap-3 px-6 whitespace-nowrap">
              <span className="font-bold text-white">{stock.symbol}</span>
              <span className="text-slate-300">${stock.price}</span>
              <span className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.percent}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tech Giants Weekly Challenge</h1>
            <div className="flex items-center gap-4 text-emerald-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>87/100 participants</span>
              </div>
            </div>
          </div>
          
          {/* Time Remaining */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="text-center">
              <p className="text-slate-300 text-sm mb-2">Time Remaining</p>
              <div className="flex gap-2">
                {[
                  { label: 'H', value: timeRemaining.hours },
                  { label: 'M', value: timeRemaining.minutes },
                  { label: 'S', value: timeRemaining.seconds }
                ].map((item, i) => (
                  <div key={i} className="bg-emerald-500/20 rounded-lg p-2 min-w-[50px]">
                    <div className="text-xl font-bold text-white">{item.value.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-emerald-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  Live Leaderboard
                </h2>
                <button className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                  <RefreshCw className="w-4 h-4" />
                  Auto-refresh
                </button>
              </div>
              
              <div className="space-y-3">
                {leaderboard.map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.rank === 1 ? 'bg-amber-500' : entry.rank === 2 ? 'bg-slate-400' : entry.rank === 3 ? 'bg-amber-600' : 'bg-purple-500'
                    }`}>
                      <span className="text-white font-bold text-sm">{entry.rank}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{entry.user}</h3>
                      <p className="text-slate-400 text-sm">{entry.team}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-bold">{entry.points}</div>
                      <div className={`flex items-center gap-1 text-sm ${
                        entry.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {entry.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {entry.change}
                      </div>
                    </div>
                    
                    <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* My Performance */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                My Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-300">Current Rank</span>
                  <span className="text-white font-bold">#12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Points</span>
                  <span className="text-emerald-400 font-bold">1,045</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Change</span>
                  <span className="text-emerald-400 font-bold">+25</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  <BarChart3 className="w-4 h-4" />
                  View Team Details
                </button>
                <button className="w-full flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  <Share2 className="w-4 h-4" />
                  Share Performance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default LiveContest