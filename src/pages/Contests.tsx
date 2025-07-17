import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ContestCreationForm from '../components/ContestCreationForm'
import JoinContestFlow from '../components/JoinContestFlow'
import { ContestService, Contest, ContestFilterOptions, ContestTag } from '../services/contestService'
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Search, 
  Filter,
  Heart,
  ChevronDown,
  X,
  Play,
  Calendar,
  Target,
  Zap,
  Crown,
  Star,
  Plus,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Contests: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [joinedContests, setJoinedContests] = useState<string[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinFlow, setShowJoinFlow] = useState(false)
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const [contestTags, setContestTags] = useState<ContestTag[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalContests, setTotalContests] = useState(0)
  const [favoriteContests, setFavoriteContests] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  const [filters, setFilters] = useState<ContestFilterOptions>({
    contestTypes: [],
    minEntryFee: 0,
    maxEntryFee: 10000,
    minPrizePool: 0,
    statuses: ['upcoming', 'live'],
    difficultyLevels: [],
    tags: [],
    search: '',
    sortBy: 'prize_pool',
    sortDirection: 'desc',
    page: 1,
    pageSize: 12
  })

  useEffect(() => {
    fetchContests()
    fetchJoinedContests()
    fetchContestTags()
    fetchFavoriteContests()
  }, [])

  useEffect(() => {
    fetchContests()
  }, [filters, showFavoritesOnly, currentPage])

  const fetchContests = async () => {
    try {
      setLoading(true)
      
      if (showFavoritesOnly) {
        const favorites = await ContestService.getFavoriteContests()
        setContests(favorites)
        setTotalContests(favorites.length)
        setTotalPages(Math.ceil(favorites.length / filters.pageSize))
      } else {
        const response = await ContestService.getContests({
          ...filters,
          page: currentPage
        })
        
        setContests(response.data)
        setTotalContests(response.totalCount)
        setTotalPages(response.totalPages)
      }
    } catch (error) {
      console.error('Error fetching contests:', error)
      toast.error('Failed to load contests')
    } finally {
      setLoading(false)
    }
  }

  const fetchContestTags = async () => {
    try {
      const tags = await ContestService.getContestTags()
      setContestTags(tags)
    } catch (error) {
      console.error('Error fetching contest tags:', error)
    }
  }

  const fetchFavoriteContests = async () => {
    try {
      const favorites = await ContestService.getFavoriteContests()
      setFavoriteContests(favorites.map(contest => contest.id))
    } catch (error) {
      console.error('Error fetching favorite contests:', error)
    }
  }

  const fetchJoinedContests = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('contest_participants')
        .select('contest_id')
        .eq('user_id', user.id)

      if (error) throw error
      setJoinedContests(data?.map(p => p.contest_id) || [])
    } catch (error) {
      console.error('Error fetching joined contests:', error)
    }
  }

  const handleToggleFavorite = async (contestId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }
    
    try {
      const isFavorited = await ContestService.toggleFavorite(contestId)
      
      if (isFavorited) {
        setFavoriteContests(prev => [...prev, contestId])
        toast.success('Added to favorites')
      } else {
        setFavoriteContests(prev => prev.filter(id => id !== contestId))
        toast.success('Removed from favorites')
      }
      
      if (showFavoritesOnly) {
        fetchContests()
      }
    } catch (error) {
      toast.error('Failed to update favorites')
    }
  }

  const handleJoinContest = async (contestId: string) => {
    if (!user) {
      toast.error('Please sign in to join contests')
      navigate('/login')
      return
    }

    const contest = contests.find(c => c.id === contestId)
    if (!contest) return

    // Check if contest is in team building phase
    const now = new Date()
    const teamBuildingEndTime = new Date(contest.team_building_end_time || contest.start_time)
    
    if (now > teamBuildingEndTime) {
      toast.error('Team building phase has ended for this contest')
      return
    }
    
    // Navigate to team creation with contest ID
    navigate(`/create-team?contestId=${contestId}`)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split('_')
    setFilters(prev => ({ 
      ...prev, 
      sortBy, 
      sortDirection: sortDirection as 'asc' | 'desc' 
    }))
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
    setCurrentPage(1)
  }

  const handleTagToggle = (tag: string) => {
    setFilters(prev => {
      const currentTags = prev.tags || []
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag]
      
      return { ...prev, tags: newTags }
    })
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      contestTypes: [],
      minEntryFee: 0,
      maxEntryFee: 10000,
      minPrizePool: 0,
      statuses: ['upcoming', 'live'],
      difficultyLevels: [],
      tags: [],
      search: '',
      sortBy: 'prize_pool',
      sortDirection: 'desc',
      page: 1,
      pageSize: 12
    })
    setShowFavoritesOnly(false)
    setCurrentPage(1)
  }

  const getContestTypeIcon = (type: string) => {
    switch (type) {
      case 'head-to-head': return Target
      case 'tournament': return Trophy
      case 'mega-contest': return Crown
      default: return Trophy
    }
  }

  const getContestTypeColor = (type: string) => {
    switch (type) {
      case 'head-to-head': return 'from-blue-500 to-cyan-500'
      case 'tournament': return 'from-purple-500 to-pink-500'
      case 'mega-contest': return 'from-amber-500 to-orange-500'
      default: return 'from-purple-500 to-pink-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'from-blue-500 to-blue-600'
      case 'live': return 'from-green-500 to-green-600'
      case 'completed': return 'from-gray-500 to-gray-600'
      case 'cancelled': return 'from-red-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTagColor = (tagName: string) => {
    const tag = contestTags.find(t => t.name === tagName)
    return tag?.color || 'slate'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const ContestCard = ({ contest, index }: { contest: Contest; index: number }) => {
    const TypeIcon = getContestTypeIcon(contest.contest_type)
    const isJoined = joinedContests.includes(contest.id)
    const isFavorited = favoriteContests.includes(contest.id)
    const isFull = contest.current_participants >= contest.max_participants
    const participationPercentage = (contest.current_participants / contest.max_participants) * 100
    const startDateTime = formatDateTime(contest.start_time)
    const teamBuildingEndTime = contest.team_building_end_time ? 
      formatDateTime(contest.team_building_end_time) : startDateTime

    return (
      <div
        className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl animate-in slide-in-from-bottom-4"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getContestTypeColor(contest.contest_type)}`}>
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                {contest.title}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-slate-400 text-xs capitalize">
                  {contest.contest_type.replace('-', ' ')}
                </span>
                {contest.difficulty && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    contest.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    contest.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {contest.difficulty}
                  </span>
                )}
                {contest.featured && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleToggleFavorite(contest.id, e)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isFavorited 
                  ? 'text-red-400 bg-red-500/10' 
                  : 'text-slate-400 hover:text-red-400 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(contest.status)} text-white`}>
              {contest.status === 'live' && <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>}
              {contest.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-slate-400">Entry Fee</p>
              <p className="text-sm font-medium text-white">{formatCurrency(contest.entry_fee)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs text-slate-400">Prize Pool</p>
              <p className="text-sm font-medium text-white">{formatCurrency(contest.prize_pool)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Team Building Until</p>
              <p className="text-sm font-medium text-white">{teamBuildingEndTime.date} at {teamBuildingEndTime.time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs text-slate-400">Contest Starts</p>
              <p className="text-sm font-medium text-white">{startDateTime.date} at {startDateTime.time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs text-slate-400">Participants</p>
              <p className="text-sm font-medium text-white">
                {contest.current_participants}/{contest.max_participants}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Spots filled</span>
            <span>{Math.round(participationPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${participationPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {isJoined ? (
            <Link
              to={`/contests/${contest.id}`}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium text-center transition-all duration-300 hover:from-green-600 hover:to-green-700"
            >
              View Contest
            </Link>
          ) : (
            <button
              onClick={() => handleJoinContest(contest.id)}
              disabled={isFull || contest.status !== 'upcoming'}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                isFull || contest.status !== 'upcoming'
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
              }`}
            >
              {isFull ? 'Contest Full' : contest.status === 'live' ? 'In Progress' : 'Join Contest'}
            </button>
          )}
          
          <Link
            to={`/contests/${contest.id}`}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            <Play className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Stock Trading Contests
            </h1>
            <p className="text-slate-300">
              Join exciting trading competitions and win amazing prizes
            </p>
          </div>
          
          <button
            onClick={() => {
              if (user && userRole === 'admin') {
                setShowCreateForm(true)
              } else {
                toast.error('Only admins can create contests')
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Contest
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 sticky top-6">
              {!user?.is_admin && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-400 mb-1">Contest Schedule</h4>
                      <p className="text-amber-300/80 text-sm">
                        Team building ends at 9:00 AM on contest day. Results will be available after 3:30 PM.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                  onClick={handleClearFilters}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search contests..."
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contest Type
                  </label>
                  <div className="space-y-2">
                    {['head-to-head', 'tournament', 'mega-contest'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.contestTypes.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...filters.contestTypes, type]
                              : filters.contestTypes.filter(t => t !== type)
                            handleFilterChange('contestTypes', newTypes)
                          }}
                          className="mr-2 rounded"
                        />
                        <span className="text-slate-300 capitalize">
                          {type.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {['upcoming', 'live', 'completed'].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.statuses.includes(status)}
                          onChange={(e) => {
                            const newStatuses = e.target.checked
                              ? [...filters.statuses, status]
                              : filters.statuses.filter(s => s !== status)
                            handleFilterChange('statuses', newStatuses)
                          }}
                          className="mr-2 rounded"
                        />
                        <span className="text-slate-300 capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Difficulty
                  </label>
                  <div className="space-y-2">
                    {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                      <label key={difficulty} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.difficultyLevels.includes(difficulty)}
                          onChange={(e) => {
                            const newDifficulties = e.target.checked
                              ? [...filters.difficultyLevels, difficulty]
                              : filters.difficultyLevels.filter(d => d !== difficulty)
                            handleFilterChange('difficultyLevels', newDifficulties)
                          }}
                          className="mr-2 rounded"
                        />
                        <span className="text-slate-300 capitalize">{difficulty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {contestTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {contestTags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.name)}
                          className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                            filters.tags?.includes(tag.name)
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <select
                  value={`${filters.sortBy}_${filters.sortDirection}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="prize_pool_desc">Prize Pool (High to Low)</option>
                  <option value="prize_pool_asc">Prize Pool (Low to High)</option>
                  <option value="entry_fee_desc">Entry Fee (High to Low)</option>
                  <option value="entry_fee_asc">Entry Fee (Low to High)</option>
                  <option value="start_time_asc">Start Time (Earliest)</option>
                  <option value="start_time_desc">Start Time (Latest)</option>
                  <option value="current_participants_desc">Most Popular</option>
                </select>

                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    showFavoritesOnly
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  Favorites Only
                </button>
              </div>

              <div className="text-slate-300">
                {totalContests} contest{totalContests !== 1 ? 's' : ''} found
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : contests.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No contests found</h3>
                <p className="text-slate-400">Try adjusting your filters or create a new contest</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {contests.map((contest, index) => (
                    <ContestCard key={contest.id} contest={contest} index={index} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showCreateForm && (
        <ContestCreationForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchContests()
          }}
        />
      )}

      {showJoinFlow && selectedContest && (
        <JoinContestFlow
          contest={selectedContest}
          onClose={() => {
            setShowJoinFlow(false)
            setSelectedContest(null)
          }}
          onSuccess={() => {
            setShowJoinFlow(false)
            setSelectedContest(null)
            fetchJoinedContests()
            fetchContests()
          }}
        />
      )}
    </div>
  )
}

export default Contests