import React, { useState, useEffect } from 'react'
import { useJoinContest, Contest, Team } from '../contexts/JoinContestContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { 
  X, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Loader2,
  Plus,
  Wallet,
  CreditCard,
  Shield,
  Star,
  Trophy,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Zap,
  Share2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

interface JoinContestFlowProps {
  isOpen: boolean
  onClose: () => void
  contest: Contest
}

const JoinContestFlow: React.FC<JoinContestFlowProps> = ({ isOpen, onClose, contest }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { state, setStep, setContest, setSelectedTeam, setPaymentMethod, setLoading, setError, setTransactionId, resetFlow } = useJoinContest()
  const [userTeams, setUserTeams] = useState<Team[]>([])
  const [walletBalance, setWalletBalance] = useState(12450) // Mock wallet balance
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen && contest) {
      setContest(contest)
      fetchUserTeams()
    }
  }, [isOpen, contest])

  useEffect(() => {
    if (state.step === 4) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [state.step])

  const fetchUserTeams = async () => {
    if (!user) return

    try {
      // Mock teams data - replace with actual Supabase query
      const mockTeams: Team[] = [
        {
          id: 'team1',
          name: 'Tech Giants',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          stocks: [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52 },
            { symbol: 'MSFT', name: 'Microsoft', price: 378.85 },
            { symbol: 'GOOGL', name: 'Alphabet', price: 142.56 }
          ],
          total_value: 95000000,
          performance: {
            daily_change: 2.3,
            weekly_change: 5.7,
            total_return: 12.4
          }
        },
        {
          id: 'team2',
          name: 'Value Hunters',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          stocks: [
            { symbol: 'BRK.A', name: 'Berkshire Hathaway', price: 545000 },
            { symbol: 'JPM', name: 'JPMorgan Chase', price: 178.45 },
            { symbol: 'V', name: 'Visa Inc.', price: 267.89 }
          ],
          total_value: 98500000,
          performance: {
            daily_change: -0.8,
            weekly_change: 3.2,
            total_return: 8.9
          }
        }
      ]
      setUserTeams(mockTeams)
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError('Failed to load your teams')
    }
  }

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team)
    setStep(3)
  }

  const handleJoinContest = async () => {
    if (!user || !state.selectedTeam) return

    setLoading(true)
    setError(null)

    try {
      // Check wallet balance
      if (state.paymentMethod === 'wallet' && walletBalance < contest.entry_fee) {
        throw new Error('Insufficient wallet balance')
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Insert contest participation
      const { error } = await supabase
        .from('contest_participants')
        .insert({
          contest_id: contest.id,
          user_id: user.id,
          team_id: state.selectedTeam.id
        })

      if (error) throw error

      // Generate mock transaction ID
      const transactionId = `TXN${Date.now()}`      
      setTransactionId(transactionId)
      setStep(4)

      toast.success('Successfully joined contest!')
    } catch (error: any) {
      if (error.code === '23505') {
        setError('You have already joined this contest')
      } else {
        setError(error.message || 'Failed to join contest')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = () => {
    onClose()
    navigate('/create-team')
  }

  const handleClose = () => {
    resetFlow()
    onClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPerformanceColor = (change: number) => {
    return change >= 0 ? 'text-emerald-400' : 'text-red-400'
  }

  const getPerformanceIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  state.step >= stepNumber
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 text-slate-400'
                }`}>
                  {state.step > stepNumber ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                    state.step > stepNumber ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Step 1: Contest Selection (Info) */}
          {state.step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Join Contest</h2>
                <p className="text-slate-300">Review contest details and proceed</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">{contest.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                      {formatCurrency(contest.prize_pool)}
                    </div>
                    <div className="text-slate-400 text-sm">Prize Pool</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {contest.entry_fee === 0 ? 'FREE' : formatCurrency(contest.entry_fee)}
                    </div>
                    <div className="text-slate-400 text-sm">Entry Fee</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {contest.current_participants}/{contest.max_participants} participants
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {contest.status === 'upcoming' ? 'Starts soon' : 'Live now'}
                  </div>
                </div>

                <div className="w-full bg-white/10 rounded-full h-2 mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(contest.current_participants / contest.max_participants) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Select Team
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Team Selection */}
          {state.step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Select Your Team</h2>
                  <p className="text-slate-300">Choose which team to enter the contest</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {userTeams.map((team, index) => {
                  const PerformanceIcon = getPerformanceIcon(team.performance.daily_change)
                  
                  return (
                    <div
                      key={team.id}
                      className="group bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all duration-300 cursor-pointer animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleTeamSelect(team)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                            {team.name}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            Created {formatDistanceToNow(new Date(team.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {formatCurrency(team.total_value)}
                          </div>
                          <div className={`flex items-center gap-1 text-sm ${getPerformanceColor(team.performance.daily_change)}`}>
                            <PerformanceIcon className="w-3 h-3" />
                            {team.performance.daily_change > 0 ? '+' : ''}{team.performance.daily_change}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {team.stocks.slice(0, 3).map((stock, stockIndex) => (
                          <div key={stockIndex} className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300">
                            {stock.symbol}
                          </div>
                        ))}
                        {team.stocks.length > 3 && (
                          <div className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300">
                            +{team.stocks.length - 3} more
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className={`font-semibold ${getPerformanceColor(team.performance.daily_change)}`}>
                            {team.performance.daily_change > 0 ? '+' : ''}{team.performance.daily_change}%
                          </div>
                          <div className="text-slate-400">Today</div>
                        </div>
                        <div>
                          <div className={`font-semibold ${getPerformanceColor(team.performance.weekly_change)}`}>
                            {team.performance.weekly_change > 0 ? '+' : ''}{team.performance.weekly_change}%
                          </div>
                          <div className="text-slate-400">This Week</div>
                        </div>
                        <div>
                          <div className={`font-semibold ${getPerformanceColor(team.performance.total_return)}`}>
                            {team.performance.total_return > 0 ? '+' : ''}{team.performance.total_return}%
                          </div>
                          <div className="text-slate-400">Total Return</div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Create New Team Option */}
                <div 
                  className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={handleCreateTeam}
                >
                  <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium mb-1">Create New Team</h3>
                  <p className="text-slate-400 text-sm">Build a new team for this contest</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Confirmation */}
          {state.step === 3 && state.selectedTeam && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Confirm Payment</h2>
                  <p className="text-slate-300">Review your selection and complete payment</p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Summary */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Contest</span>
                    <span className="text-white font-medium">{contest.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Team</span>
                    <span className="text-white font-medium">{state.selectedTeam.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Entry Fee</span>
                    <span className="text-white font-semibold">
                      {contest.entry_fee === 0 ? 'FREE' : formatCurrency(contest.entry_fee)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-bold">
                      {contest.entry_fee === 0 ? 'FREE' : formatCurrency(contest.entry_fee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              {contest.entry_fee > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300">
                      <input
                        type="radio"
                        name="payment"
                        value="wallet"
                        checked={state.paymentMethod === 'wallet'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <Wallet className="w-5 h-5 text-emerald-400" />
                      <div className="flex-1">
                        <div className="text-white font-medium">Wallet Balance</div>
                        <div className="text-slate-400 text-sm">
                          Available: {formatCurrency(walletBalance)}
                        </div>
                      </div>
                      {walletBalance >= contest.entry_fee && (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      )}
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300">
                      <input
                        type="radio"
                        name="payment"
                        value="add_money"
                        checked={state.paymentMethod === 'add_money'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <Plus className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <div className="text-white font-medium">Add Money to Wallet</div>
                        <div className="text-slate-400 text-sm">Top up and pay</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300">
                      <input
                        type="radio"
                        name="payment"
                        value="direct"
                        checked={state.paymentMethod === 'direct'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      <div className="flex-1">
                        <div className="text-white font-medium">Direct Payment</div>
                        <div className="text-slate-400 text-sm">Pay with card/UPI</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Security & Terms */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Your payment information is encrypted and secure. By proceeding, you agree to our Terms of Service.
                </p>
              </div>

              {/* Error Display */}
              {state.error && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{state.error}</p>
                </div>
              )}

              {/* Insufficient Balance Warning */}
              {state.paymentMethod === 'wallet' && walletBalance < contest.entry_fee && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
                  <p className="text-amber-400 text-sm">
                    Insufficient wallet balance. Please add money or choose a different payment method.
                  </p>
                </div>
              )}

              <button
                onClick={handleJoinContest}
                disabled={state.isLoading || (state.paymentMethod === 'wallet' && walletBalance < contest.entry_fee)}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {state.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {contest.entry_fee === 0 ? 'Join Contest' : `Pay ${formatCurrency(contest.entry_fee)}`}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {state.step === 4 && (
            <div className="text-center space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full mx-auto animate-ping opacity-20"></div>
              </div>

              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  Contest Joined!
                </h2>
                <p className="text-slate-300 text-lg">
                  You've successfully joined {contest.title}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Receipt Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Transaction ID</span>
                    <span className="text-white font-mono">{state.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Contest</span>
                    <span className="text-white">{contest.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Team</span>
                    <span className="text-white">{state.selectedTeam?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Amount Paid</span>
                    <span className="text-white font-semibold">
                      {contest.entry_fee === 0 ? 'FREE' : formatCurrency(contest.entry_fee)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    handleClose()
                    // Navigate to contest details
                  }}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-xl transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                  View Contest
                </button>
                
                <button
                  onClick={() => {
                    // Share functionality
                    toast.success('Contest shared!')
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-300"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white transition-colors duration-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinContestFlow