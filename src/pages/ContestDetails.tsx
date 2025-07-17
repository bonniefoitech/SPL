import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { ContestDetailService, ContestDetail } from '../services/contestDetailService'
import CountdownTimer from '../components/CountdownTimer'
import ContestLeaderboard from '../components/ContestLeaderboard'
import TeamPreview from '../components/TeamPreview'
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Target,
  Crown,
  Star,
  ArrowLeft,
  Calendar,
  Award,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const ContestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [contest, setContest] = useState<ContestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [userTeam, setUserTeam] = useState<any>(null)
  const [isJoined, setIsJoined] = useState(false)

  useEffect(() => {
    if (id) {
      fetchContestDetails()
    }
  }, [id])

  const fetchContestDetails = async () => {
    try {
      setLoading(true)
      const details = await ContestDetailService.getContestDetails(id!)
      setContest(details)
      
      if (user) {
        const team = await ContestDetailService.getUserTeamForContest(id!)
        setUserTeam(team)
        setIsJoined(!!team)
      }
    } catch (error) {
      console.error('Error fetching contest details:', error)
      toast.error('Failed to load contest details')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinContest = async () => {
    if (!user) {
      toast.error('Please sign in to join contests')
      return
    }
    
    try {
      await ContestDetailService.joinContest(id!)
      toast.success('Successfully joined contest!')
      fetchContestDetails()
    } catch (error) {
      toast.error('Failed to join contest')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Contest not found</h1>
            <Link to="/contests" className="text-purple-400 hover:text-purple-300">
              Back to contests
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/contests" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contests
          </Link>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{contest.title}</h1>
                <p className="text-slate-300">{contest.description}</p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  ${contest.prize_pool.toLocaleString()}
                </div>
                <div className="text-slate-400">Prize Pool</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-white">
                  ${contest.entry_fee}
                </div>
                <div className="text-slate-400 text-sm">Entry Fee</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-semibold text-white">
                  {contest.current_participants}/{contest.max_participants}
                </div>
                <div className="text-slate-400 text-sm">Participants</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-semibold text-white capitalize">
                  {contest.contest_type.replace('-', ' ')}
                </div>
                <div className="text-slate-400 text-sm">Type</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-semibold text-white capitalize">
                  {contest.status}
                </div>
                <div className="text-slate-400 text-sm">Status</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown Timer */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {contest.status === 'upcoming' ? 'Starts In' : contest.status === 'live' ? 'Ends In' : 'Contest Ended'}
              </h2>
              
              <CountdownTimer 
                targetDate={contest.status === 'upcoming' ? contest.start_time : contest.end_time}
                onComplete={() => fetchContestDetails()}
              />
            </div>

            {/* Rules */}
            {contest.rules && contest.rules.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Contest Rules
                </h2>
                
                <div className="space-y-3">
                  {contest.rules.map((rule, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-purple-400 font-semibold mr-3">
                        {index + 1}.
                      </span>
                      <span className="text-slate-300">{rule.rule_text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prize Distribution */}
            {contest.prize_distributions && contest.prize_distributions.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Prize Distribution
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 text-slate-300">Rank</th>
                        <th className="text-left py-3 text-slate-300">Prize</th>
                        <th className="text-left py-3 text-slate-300">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contest.prize_distributions.map((prize, index) => (
                        <tr key={index} className="border-b border-white/10">
                          <td className="py-3 text-white font-medium">
                            {prize.rank === 1 ? (
                              <span className="flex items-center">
                                <Crown className="w-4 h-4 text-yellow-400 mr-2" />
                                1st
                              </span>
                            ) : (
                              `${prize.rank}${prize.rank === 2 ? 'nd' : prize.rank === 3 ? 'rd' : 'th'}`
                            )}
                          </td>
                          <td className="py-3 text-green-400 font-semibold">
                            ${prize.prize_amount.toLocaleString()}
                          </td>
                          <td className="py-3 text-slate-300">
                            {prize.prize_percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Entry Fee Breakdown */}
            {contest.entry_fee_breakdown && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Entry Fee Breakdown
                </h2>
                
                <div className="space-y-3">
                  {Object.entries(contest.entry_fee_breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-slate-300 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-white font-medium">
                        ${Number(value).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join/Team Section */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              {isJoined && userTeam ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Your Team</h3>
                  <TeamPreview team={userTeam} />
                  
                  {contest.status === 'upcoming' && (
                    <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Switch Team
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Join Contest</h3>
                  <p className="text-slate-300 mb-4">
                    Create or select a team to join this contest
                  </p>
                  
                  <button
                    onClick={handleJoinContest}
                    disabled={contest.status !== 'upcoming' || contest.current_participants >= contest.max_participants}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {contest.current_participants >= contest.max_participants ? 'Contest Full' : 'Join Contest'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Spots Filled</span>
                  <span className="text-white">
                    {Math.round((contest.current_participants / contest.max_participants) * 100)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-300">Start Time</span>
                  <span className="text-white">
                    {new Date(contest.start_time).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-300">Duration</span>
                  <span className="text-white">
                    {Math.ceil((new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                <Link 
                  to={`/contests/${contest.id}/leaderboard`}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View Full
                </Link>
              </div>
              
              <ContestLeaderboard contestId={contest.id} preview={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestDetails