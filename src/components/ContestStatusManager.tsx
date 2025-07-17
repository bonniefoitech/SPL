import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  DollarSign,
  AlertTriangle,
  Loader2,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Trophy,
  Zap,
  Timer,
  Bell,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format } from 'date-fns'

interface Contest {
  id: string
  title: string
  description: string
  entry_fee: number
  prize_pool: number
  max_participants: number
  current_participants: number
  contest_type: 'head-to-head' | 'tournament' | 'mega-contest'
  start_time: string
  end_time: string
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
}

interface StatusChangeModal {
  isOpen: boolean
  contest: Contest | null
  newStatus: string
  reason?: string
}

const ContestStatusManager: React.FC = () => {
  const { user } = useAuth()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContests, setSelectedContests] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [statusModal, setStatusModal] = useState<StatusChangeModal>({
    isOpen: false,
    contest: null,
    newStatus: '',
    reason: ''
  })
  const [bulkAction, setBulkAction] = useState('')
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchContests()
    setupRealtimeSubscription()
    setupAutoStatusUpdates()
  }, [])

  const fetchContests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContests(data || [])
    } catch (error) {
      console.error('Error fetching contests:', error)
      toast.error('Failed to load contests')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('contests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contests' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setContests(prev => prev.map(contest => 
              contest.id === payload.new.id 
                ? { ...contest, ...payload.new }
                : contest
            ))
            
            // Show notification for status changes
            if (payload.old.status !== payload.new.status) {
              toast.success(`Contest "${payload.new.title}" status changed to ${payload.new.status}`)
            }
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const setupAutoStatusUpdates = () => {
    const interval = setInterval(() => {
      const now = new Date()
      
      contests.forEach(async (contest) => {
        const startTime = new Date(contest.start_time)
        const endTime = new Date(contest.end_time)
        
        // Auto-start upcoming contests
        if (contest.status === 'upcoming' && now >= startTime && contest.current_participants >= 2) {
          await updateContestStatus(contest.id, 'live', 'Automatic start at scheduled time')
        }
        
        // Auto-complete live contests
        if (contest.status === 'live' && now >= endTime) {
          await updateContestStatus(contest.id, 'completed', 'Automatic completion at end time')
        }
      })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }

  const updateContestStatus = async (contestId: string, newStatus: string, reason?: string) => {
    setProcessingStatus(contestId)
    
    try {
      const { error } = await supabase
        .from('contests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', contestId)

      if (error) throw error

      // Handle status-specific actions
      switch (newStatus) {
        case 'live':
          await handleContestStart(contestId)
          break
        case 'completed':
          await handleContestCompletion(contestId)
          break
        case 'cancelled':
          await handleContestCancellation(contestId, reason)
          break
      }

      toast.success(`Contest status updated to ${newStatus}`)
      setStatusModal({ isOpen: false, contest: null, newStatus: '', reason: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contest status')
    } finally {
      setProcessingStatus(null)
    }
  }

  const handleContestStart = async (contestId: string) => {
    // Notify participants
    // Initialize scoring system
    // Lock team changes
    console.log('Contest started:', contestId)
  }

  const handleContestCompletion = async (contestId: string) => {
    // Calculate final scores
    // Distribute prizes
    // Send winner notifications
    console.log('Contest completed:', contestId)
  }

  const handleContestCancellation = async (contestId: string, reason?: string) => {
    // Process refunds
    // Notify participants
    // Log cancellation reason
    console.log('Contest cancelled:', contestId, reason)
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedContests.length === 0) return

    setLoading(true)
    try {
      for (const contestId of selectedContests) {
        await updateContestStatus(contestId, bulkAction)
      }
      setSelectedContests([])
      setBulkAction('')
      toast.success(`Bulk action completed for ${selectedContests.length} contests`)
    } catch (error) {
      toast.error('Bulk action failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'from-blue-400 to-cyan-500'
      case 'live': return 'from-emerald-400 to-green-500'
      case 'completed': return 'from-slate-400 to-slate-500'
      case 'cancelled': return 'from-red-400 to-pink-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return Clock
      case 'live': return Play
      case 'completed': return CheckCircle
      case 'cancelled': return XCircle
      default: return Clock
    }
  }

  const canChangeStatus = (contest: Contest, newStatus: string) => {
    const validTransitions: Record<string, string[]> = {
      'upcoming': ['live', 'cancelled'],
      'live': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    }
    
    return validTransitions[contest.status]?.includes(newStatus) || false
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredContests = contests.filter(contest => 
    statusFilter === 'all' || contest.status === statusFilter
  )

  const statusCounts = {
    all: contests.length,
    upcoming: contests.filter(c => c.status === 'upcoming').length,
    live: contests.filter(c => c.status === 'live').length,
    completed: contests.filter(c => c.status === 'completed').length,
    cancelled: contests.filter(c => c.status === 'cancelled').length
  }

  if (loading && contests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Contest Management
              </h1>
              <p className="text-slate-300 mt-2">Monitor and manage contest statuses in real-time</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchContests}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              {selectedContests.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Bulk Action</option>
                    <option value="cancelled">Cancel Selected</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                }`}
              >
                <span className="capitalize">{status}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  statusFilter === status ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContests.map((contest, index) => {
            const StatusIcon = getStatusIcon(contest.status)
            const statusGradient = getStatusColor(contest.status)
            const isSelected = selectedContests.includes(contest.id)
            const isProcessing = processingStatus === contest.id
            
            return (
              <div
                key={contest.id}
                className={`group bg-white/10 backdrop-blur-lg border rounded-xl p-6 transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl animate-in slide-in-from-bottom-4 ${
                  isSelected ? 'border-purple-400 bg-purple-500/20' : 'border-white/20'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContests(prev => [...prev, contest.id])
                        } else {
                          setSelectedContests(prev => prev.filter(id => id !== contest.id))
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                    />
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${statusGradient}`}>
                      <StatusIcon className={`w-4 h-4 text-white ${contest.status === 'live' ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contest Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                    {contest.title}
                  </h3>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${statusGradient} text-white`}>
                    {contest.status === 'live' && <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>}
                    {contest.status.toUpperCase()}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-slate-400">Prize Pool</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {formatCurrency(contest.prize_pool)}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-slate-400">Participants</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {contest.current_participants}/{contest.max_participants}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-full bg-gradient-to-r ${statusGradient} rounded-full transition-all duration-500`}
                      style={{ width: `${(contest.current_participants / contest.max_participants) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="mb-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {contest.status === 'upcoming' 
                        ? `Starts ${formatDistanceToNow(new Date(contest.start_time), { addSuffix: true })}`
                        : contest.status === 'live'
                        ? `Ends ${formatDistanceToNow(new Date(contest.end_time), { addSuffix: true })}`
                        : `Ended ${formatDistanceToNow(new Date(contest.end_time), { addSuffix: true })}`
                      }
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {contest.status === 'upcoming' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStatusModal({
                          isOpen: true,
                          contest,
                          newStatus: 'live',
                          reason: ''
                        })}
                        disabled={isProcessing || contest.current_participants < 2}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-xs disabled:opacity-50"
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </button>
                      <button
                        onClick={() => setStatusModal({
                          isOpen: true,
                          contest,
                          newStatus: 'cancelled',
                          reason: ''
                        })}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-xs"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {contest.status === 'live' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStatusModal({
                          isOpen: true,
                          contest,
                          newStatus: 'completed',
                          reason: ''
                        })}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-xs"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </button>
                      <button
                        onClick={() => setStatusModal({
                          isOpen: true,
                          contest,
                          newStatus: 'cancelled',
                          reason: ''
                        })}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-xs"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </button>
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredContests.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No contests found</h3>
            <p className="text-slate-400 mb-6">
              {statusFilter === 'all' 
                ? 'No contests have been created yet'
                : `No ${statusFilter} contests found`
              }
            </p>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {statusModal.isOpen && statusModal.contest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Change Contest Status
              </h3>
              <button
                onClick={() => setStatusModal({ isOpen: false, contest: null, newStatus: '', reason: '' })}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">{statusModal.contest.title}</h4>
                <p className="text-slate-400 text-sm">
                  Change status from <span className="capitalize font-medium">{statusModal.contest.status}</span> to{' '}
                  <span className="capitalize font-medium text-white">{statusModal.newStatus}</span>
                </p>
              </div>

              {statusModal.newStatus === 'cancelled' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cancellation Reason
                  </label>
                  <textarea
                    value={statusModal.reason}
                    onChange={(e) => setStatusModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason for cancellation..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>
              )}

              {statusModal.newStatus === 'live' && statusModal.contest.current_participants < 2 && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 font-medium">Warning</span>
                  </div>
                  <p className="text-amber-300 text-sm mt-1">
                    This contest has less than 2 participants. Starting it may not be ideal.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStatusModal({ isOpen: false, contest: null, newStatus: '', reason: '' })}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateContestStatus(statusModal.contest!.id, statusModal.newStatus, statusModal.reason)}
                  disabled={statusModal.newStatus === 'cancelled' && !statusModal.reason?.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContestStatusManager