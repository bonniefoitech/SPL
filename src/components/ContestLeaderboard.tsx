import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ContestDetailService, LeaderboardEntry } from '../services/contestDetailService'
import { 
  Crown, 
  Trophy, 
  Medal, 
  Award,
  TrendingUp, 
  TrendingDown,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ContestLeaderboardProps {
  contestId: string
  className?: string
  limit?: number
  showViewAll?: boolean
  autoRefresh?: boolean
}

const ContestLeaderboard: React.FC<ContestLeaderboardProps> = ({ 
  contestId,
  className = "",
  limit = 10,
  showViewAll = true,
  autoRefresh = false
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)
  
  const location = useLocation()
  const itemsPerPage = limit

  useEffect(() => {
    fetchLeaderboard()
    
    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(handleRefresh, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [contestId, currentPage])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const data = await ContestDetailService.getContestLeaderboard(contestId)
      setLeaderboard(data)
      setTotalPages(Math.ceil(data.length / itemsPerPage))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLeaderboard()
    setRefreshing(false)
  }

  const paginatedLeaderboard = leaderboard.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  if (loading && leaderboard.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            Leaderboard
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            Leaderboard
          </h3>
          <p className="text-slate-400 text-sm">
            Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-3">
        {paginatedLeaderboard.length > 0 ? (
          paginatedLeaderboard.map((entry, index) => {
            const RankIcon = getRankIcon(entry.current_rank)
            const rankGradient = getRankColor(entry.current_rank)
            const isMovingUp = entry.current_rank < entry.previous_rank
            const isMovingDown = entry.current_rank > entry.previous_rank
            
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 animate-in slide-in-from-right-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${rankGradient} flex items-center justify-center`}>
                    {entry.current_rank <= 3 ? (
                      <RankIcon className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white font-bold text-sm">{entry.current_rank}</span>
                    )}
                  </div>
                  
                  {isMovingUp && (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  )}
                  {isMovingDown && (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-white">{entry.username}</div>
                  <div className="text-slate-400 text-sm">{entry.team_name}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-white">{entry.points}</div>
                  <div className={`text-sm ${
                    entry.points_change > 0 ? 'text-emerald-400' : 
                    entry.points_change < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {entry.points_change > 0 ? '+' : ''}{entry.points_change}
                  </div>
                </div>
                
                {index < 3 && (
                  <div className="hidden sm:flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No participants yet</p>
            <p className="text-slate-400 text-sm">Be the first to join!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <span className="text-slate-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View All Link */}
      {showViewAll && leaderboard.length > limit && (
        <div className="mt-6 text-center">
          <Link
            to={`/leaderboard?contest=${contestId}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300"
          >
            View Full Leaderboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default ContestLeaderboard