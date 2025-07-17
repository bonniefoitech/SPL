import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LeaderboardEntry, Achievement } from '../types/scoring'
import { 
  Crown, 
  Trophy, 
  Medal, 
  Award,
  TrendingUp, 
  TrendingDown,
  User,
  Search,
  Filter,
  Share2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
  Target,
  Flame,
  Shield,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface GlobalLeaderboardProps {
  contestId?: string
  className?: string
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ 
  contestId, 
  className = "" 
}) => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    fetchLeaderboard()
    setupRealtimeSubscription()
  }, [timeframe, currentPage, searchTerm, contestId])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      
      if (contestId) {
        await fetchContestLeaderboard()
      } else {
        await fetchGlobalLeaderboard()
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchGlobalLeaderboard = async () => {
    // Mock global leaderboard data
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        rank: 1,
        previousRank: 2,
        userId: 'user1',
        username: 'StockMaster',
        avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        teamName: 'Tech Giants',
        points: 12450,
        pointsChange: 350,
        earnings: 45000,
        winRate: 78.5,
        contestsWon: 23,
        totalContests: 45,
        achievements: [
          { id: '1', name: 'First Place', description: 'Won first place', icon: 'crown', color: 'amber', rarity: 'legendary' },
          { id: '2', name: 'Streak Master', description: '10 day winning streak', icon: 'flame', color: 'red', rarity: 'epic' }
        ],
        trend: 'up',
        streakDays: 12
      },
      {
        id: '2',
        rank: 2,
        previousRank: 1,
        userId: 'user2',
        username: 'TradingPro',
        teamName: 'Market Movers',
        points: 11850,
        pointsChange: -120,
        earnings: 38500,
        winRate: 72.3,
        contestsWon: 19,
        totalContests: 38,
        achievements: [
          { id: '3', name: 'Consistent Performer', description: 'Top 10 for 30 days', icon: 'target', color: 'blue', rarity: 'rare' }
        ],
        trend: 'down',
        streakDays: 0
      },
      {
        id: '3',
        rank: 3,
        previousRank: 4,
        userId: 'user3',
        username: 'InvestorGuru',
        teamName: 'Value Hunters',
        points: 11200,
        pointsChange: 280,
        earnings: 32000,
        winRate: 68.9,
        contestsWon: 15,
        totalContests: 32,
        achievements: [
          { id: '4', name: 'Rising Star', description: 'Climbed 10 ranks', icon: 'star', color: 'purple', rarity: 'rare' }
        ],
        trend: 'up',
        streakDays: 5
      }
    ]

    // Add current user if not in top results
    if (user && !mockLeaderboard.find(entry => entry.userId === user.id)) {
      const userEntry: LeaderboardEntry = {
        id: user.id,
        rank: 42,
        previousRank: 45,
        userId: user.id,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'You',
        teamName: 'My Team',
        points: 8750,
        pointsChange: 150,
        earnings: 12500,
        winRate: 65.2,
        contestsWon: 8,
        totalContests: 18,
        achievements: [
          { id: '5', name: 'Getting Started', description: 'Joined SPL', icon: 'shield', color: 'green', rarity: 'common' }
        ],
        isCurrentUser: true,
        trend: 'up',
        streakDays: 3
      }
      setUserPosition(userEntry)
    }

    setLeaderboard(mockLeaderboard)
    setTotalPages(Math.ceil(100 / ITEMS_PER_PAGE)) // Mock total of 100 users
  }

  const fetchContestLeaderboard = async () => {
    // Mock contest-specific leaderboard
    const mockContestLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        rank: 1,
        previousRank: 1,
        userId: 'user1',
        username: 'StockMaster',
        teamName: 'Tech Focus',
        points: 1250,
        pointsChange: 50,
        earnings: 5000,
        winRate: 100,
        contestsWon: 1,
        totalContests: 1,
        achievements: [],
        trend: 'same',
        streakDays: 1
      }
    ]

    setLeaderboard(mockContestLeaderboard)
  }

  const setupRealtimeSubscription = () => {
    if (!contestId) return

    const subscription = supabase
      .channel(`contest_${contestId}_leaderboard`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contest_scoring' },
        (payload) => {
          // Update leaderboard in real-time
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

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

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown': return Crown
      case 'flame': return Flame
      case 'target': return Target
      case 'star': return Star
      case 'shield': return Shield
      default: return Award
    }
  }

  const getAchievementColor = (color: string) => {
    switch (color) {
      case 'amber': return 'text-amber-400'
      case 'red': return 'text-red-400'
      case 'blue': return 'text-blue-400'
      case 'purple': return 'text-purple-400'
      case 'green': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'SPL Leaderboard',
        text: `Check out the current SPL leaderboard! I'm ranked #${userPosition?.rank || 'unranked'}.`,
        url: window.location.href
      })
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Leaderboard link copied to clipboard!')
    }
  }

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && leaderboard.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-48"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-white/10 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
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
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {contestId ? 'Contest Leaderboard' : 'Global Leaderboard'}
              </h3>
              <p className="text-slate-400 text-sm">
                {contestId ? 'Live contest rankings' : `Top performers - ${timeframe}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeframe Selection (Global only) */}
        {!contestId && (
          <div className="flex gap-2 mb-4">
            {(['daily', 'weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                  timeframe === period
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* User Position (if not in top results) */}
      {userPosition && !contestId && (
        <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{userPosition.rank}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{userPosition.username}</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">You</span>
              </div>
              <p className="text-slate-400 text-sm">{userPosition.points} points</p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${
                userPosition.pointsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {userPosition.pointsChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {userPosition.pointsChange >= 0 ? '+' : ''}{userPosition.pointsChange}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredLeaderboard.length > 0 ? (
          <div className="space-y-1 p-4">
            {filteredLeaderboard.map((entry, index) => {
              const RankIcon = getRankIcon(entry.rank)
              const rankGradient = getRankColor(entry.rank)
              const isMovingUp = entry.rank < entry.previousRank
              const isMovingDown = entry.rank > entry.previousRank
              
              return (
                <div
                  key={entry.id}
                  className={`group flex items-center gap-4 p-4 rounded-lg transition-all duration-300 hover:bg-white/10 animate-in slide-in-from-left-2 ${
                    entry.isCurrentUser 
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30' 
                      : 'bg-white/5'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${rankGradient} flex items-center justify-center shadow-lg`}>
                      {entry.rank <= 3 ? (
                        <RankIcon className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">{entry.rank}</span>
                      )}
                    </div>
                    
                    {/* Rank Movement */}
                    {isMovingUp && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-medium">+{entry.previousRank - entry.rank}</span>
                      </div>
                    )}
                    {isMovingDown && (
                      <div className="flex items-center gap-1 text-red-400">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-xs font-medium">-{entry.rank - entry.previousRank}</span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      
                      {/* Streak Indicator */}
                      {entry.streakDays > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                          <Flame className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${
                          entry.isCurrentUser 
                            ? 'text-purple-400' 
                            : 'text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text'
                        } transition-all duration-300`}>
                          {entry.username}
                        </h4>
                        {entry.isCurrentUser && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            You
                          </span>
                        )}
                        
                        {/* Achievements */}
                        <div className="flex gap-1">
                          {entry.achievements.slice(0, 3).map((achievement) => {
                            const AchievementIcon = getAchievementIcon(achievement.icon)
                            return (
                              <div
                                key={achievement.id}
                                className={`w-4 h-4 ${getAchievementColor(achievement.color)}`}
                                title={achievement.name}
                              >
                                <AchievementIcon className="w-full h-full" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{entry.teamName}</span>
                        <span>{entry.winRate.toFixed(1)}% win rate</span>
                        {entry.streakDays > 0 && (
                          <span className="text-orange-400">{entry.streakDays} day streak</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-white font-bold text-lg mb-1">
                      {entry.points.toLocaleString()}
                    </div>
                    <div className={`flex items-center gap-1 justify-end text-sm ${
                      entry.pointsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {entry.pointsChange >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="font-medium">
                        {entry.pointsChange >= 0 ? '+' : ''}{entry.pointsChange}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs">
                      ₹{entry.earnings.toLocaleString()} earned
                    </div>
                  </div>

                  {/* Live Indicator */}
                  {contestId && entry.rank <= 3 && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-amber-400 text-xs font-medium">LIVE</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No players found</h3>
            <p className="text-slate-400 text-sm">
              {searchTerm ? 'Try a different search term' : 'Be the first to join!'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!contestId && totalPages > 1 && (
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalLeaderboard