import React, { useState, useEffect } from 'react'
import { 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  User,
  Trophy,
  Medal,
  Award,
  Zap
} from 'lucide-react'

interface LeaderboardEntry {
  id: string
  rank: number
  previousRank: number
  username: string
  avatar?: string
  portfolioValue: number
  change: number
  changePercent: number
  isCurrentUser?: boolean
}

const LiveLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    // Simulate API call with real-time updates
    const fetchLeaderboard = () => {
      setTimeout(() => {
        setLeaderboard([
          {
            id: '1',
            rank: 1,
            previousRank: 2,
            username: 'StockMaster',
            portfolioValue: 125000,
            change: 8500,
            changePercent: 7.3
          },
          {
            id: '2',
            rank: 2,
            previousRank: 1,
            username: 'TradingPro',
            portfolioValue: 118500,
            change: 3200,
            changePercent: 2.8
          },
          {
            id: '3',
            rank: 3,
            previousRank: 4,
            username: 'InvestorGuru',
            portfolioValue: 115200,
            change: 6800,
            changePercent: 6.3
          },
          {
            id: '4',
            rank: 4,
            previousRank: 3,
            username: 'MarketWiz',
            portfolioValue: 112800,
            change: -1200,
            changePercent: -1.1
          },
          {
            id: '5',
            rank: 5,
            previousRank: 6,
            username: 'BullRunner',
            portfolioValue: 108900,
            change: 4500,
            changePercent: 4.3
          },
          {
            id: '42',
            rank: 42,
            previousRank: 45,
            username: 'You',
            portfolioValue: 87500,
            change: 2100,
            changePercent: 2.5,
            isCurrentUser: true
          }
        ])
        setLoading(false)
      }, 1000)
    }

    fetchLeaderboard()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      // Simulate small changes
      setLeaderboard(prev => prev.map(entry => ({
        ...entry,
        change: entry.change + (Math.random() - 0.5) * 1000,
        changePercent: entry.changePercent + (Math.random() - 0.5) * 2
      })))
    }, 30000)

    return () => clearInterval(interval)
  }, [timeframe])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return Crown
      case 2: return Trophy
      case 3: return Medal
      default: return Award
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-amber-400 to-yellow-500'
      case 2: return 'from-slate-300 to-slate-400'
      case 3: return 'from-amber-600 to-orange-500'
      default: return 'from-purple-400 to-blue-500'
    }
  }

  const getRankMovement = (current: number, previous: number) => {
    if (current < previous) return { direction: 'up', change: previous - current }
    if (current > previous) return { direction: 'down', change: current - previous }
    return { direction: 'same', change: 0 }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-white/10 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-white/10 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Live Leaderboard</h3>
        </div>
        
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                timeframe === period
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => {
          const RankIcon = getRankIcon(entry.rank)
          const rankGradient = getRankColor(entry.rank)
          const movement = getRankMovement(entry.rank, entry.previousRank)
          const isPositive = entry.change >= 0
          
          return (
            <div
              key={entry.id}
              className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-300 hover:bg-white/10 animate-in slide-in-from-left-2 ${
                entry.isCurrentUser 
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30' 
                  : 'bg-white/5'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Rank */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${rankGradient} flex items-center justify-center`}>
                  {entry.rank <= 3 ? (
                    <RankIcon className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white font-bold text-sm">{entry.rank}</span>
                  )}
                </div>
                
                {/* Rank Movement */}
                {movement.direction !== 'same' && (
                  <div className={`flex items-center gap-1 ${
                    movement.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {movement.direction === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium">{movement.change}</span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    entry.isCurrentUser 
                      ? 'text-purple-400' 
                      : 'text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text'
                  } transition-all duration-300`}>
                    {entry.username}
                    {entry.isCurrentUser && (
                      <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        You
                      </span>
                    )}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    ₹{entry.portfolioValue.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Performance */}
              <div className="text-right">
                <div className={`flex items-center gap-1 justify-end ${
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">
                    {isPositive ? '+' : ''}₹{Math.abs(entry.change).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{entry.changePercent.toFixed(1)}%
                </p>
              </div>

              {/* Live Indicator */}
              {index < 3 && (
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-xs font-medium">LIVE</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* View Full Leaderboard */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          View Full Leaderboard
        </button>
      </div>
    </div>
  )
}

export default LiveLeaderboard