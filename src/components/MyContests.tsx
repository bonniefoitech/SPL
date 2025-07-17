import React, { useState, useEffect } from 'react'
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Play,
  Eye,
  Crown,
  Target,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Contest {
  id: string
  title: string
  type: 'head-to-head' | 'tournament' | 'mega-contest'
  status: 'upcoming' | 'live' | 'completed'
  entryFee: number
  prizePool: number
  participants: number
  maxParticipants: number
  startTime: Date
  endTime: Date
  myRank?: number
  myEarnings?: number
}

const MyContests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContests([
        {
          id: '1',
          title: 'Tech Giants Weekly Challenge',
          type: 'tournament',
          status: 'live',
          entryFee: 500,
          prizePool: 50000,
          participants: 87,
          maxParticipants: 100,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          myRank: 12,
          myEarnings: 0
        },
        {
          id: '2',
          title: 'Banking Sector Showdown',
          type: 'head-to-head',
          status: 'upcoming',
          entryFee: 1000,
          prizePool: 2000,
          participants: 1,
          maxParticipants: 2,
          startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Pharma Power Play',
          type: 'mega-contest',
          status: 'completed',
          entryFee: 250,
          prizePool: 125000,
          participants: 500,
          maxParticipants: 500,
          startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          myRank: 23,
          myEarnings: 2500
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getContestIcon = (type: string) => {
    switch (type) {
      case 'head-to-head': return Target
      case 'tournament': return Trophy
      case 'mega-contest': return Crown
      default: return Star
    }
  }

  const getContestTypeColor = (type: string) => {
    switch (type) {
      case 'head-to-head': return 'from-blue-400 to-cyan-500'
      case 'tournament': return 'from-purple-400 to-pink-500'
      case 'mega-contest': return 'from-amber-400 to-orange-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'from-emerald-400 to-green-500'
      case 'upcoming': return 'from-blue-400 to-cyan-500'
      case 'completed': return 'from-slate-400 to-slate-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }

  const formatTimeRemaining = (startTime: Date, endTime: Date, status: string) => {
    const now = new Date()
    
    if (status === 'live') {
      const timeLeft = endTime.getTime() - now.getTime()
      if (timeLeft <= 0) return 'Ended'
      
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) return `${days}d ${hours}h left`
      return `${hours}h left`
    } else if (status === 'upcoming') {
      return `Starts ${formatDistanceToNow(startTime, { addSuffix: true })}`
    }
    
    return `Ended ${formatDistanceToNow(endTime, { addSuffix: true })}`
  }

  const filteredContests = contests.filter(contest => {
    if (activeTab === 'all') return true
    return contest.status === activeTab
  })

  const tabs = [
    { id: 'all', name: 'All', count: contests.length },
    { id: 'live', name: 'Live', count: contests.filter(c => c.status === 'live').length },
    { id: 'upcoming', name: 'Upcoming', count: contests.filter(c => c.status === 'upcoming').length },
    { id: 'completed', name: 'Completed', count: contests.filter(c => c.status === 'completed').length }
  ]

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-white/10 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">My Contests</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
            }`}
          >
            {tab.name}
            <span className={`px-2 py-1 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Contest List */}
      <div className="space-y-4">
        {filteredContests.length > 0 ? (
          filteredContests.map((contest, index) => {
            const TypeIcon = getContestIcon(contest.type)
            const typeGradient = getContestTypeColor(contest.type)
            const statusGradient = getStatusColor(contest.status)
            
            return (
              <div
                key={contest.id}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all duration-300 animate-in slide-in-from-left-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${typeGradient}`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                        {contest.title}
                      </h4>
                      <p className="text-slate-400 text-sm capitalize">
                        {contest.type.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${statusGradient} text-white`}>
                    {contest.status === 'live' && <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>}
                    {contest.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs text-slate-400">Prize Pool</p>
                      <p className="text-sm font-semibold text-emerald-400">₹{contest.prizePool.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-400">Participants</p>
                      <p className="text-sm font-semibold text-white">{contest.participants}/{contest.maxParticipants}</p>
                    </div>
                  </div>
                  
                  {contest.myRank && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">My Rank</p>
                        <p className="text-sm font-semibold text-purple-400">#{contest.myRank}</p>
                      </div>
                    </div>
                  )}
                  
                  {contest.myEarnings !== undefined && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs text-slate-400">Earnings</p>
                        <p className="text-sm font-semibold text-amber-400">₹{contest.myEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {formatTimeRemaining(contest.startTime, contest.endTime, contest.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-2 rounded-lg transition-all duration-300">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {contest.status === 'live' && (
                      <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-all duration-300">
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-white font-medium mb-2">No contests found</h3>
            <p className="text-slate-400 text-sm mb-6">
              {activeTab === 'all' 
                ? "You haven't joined any contests yet"
                : `No ${activeTab} contests found`
              }
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
              Browse Contests
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyContests