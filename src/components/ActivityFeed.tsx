import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Trophy, 
  DollarSign,
  Plus,
  Minus
} from 'lucide-react'

interface Activity {
  id: string
  type: 'trade' | 'contest' | 'achievement' | 'deposit' | 'withdrawal'
  title: string
  description: string
  amount?: number
  timestamp: Date
  status?: 'success' | 'pending' | 'failed'
}

interface ActivityFeedProps {
  activities: Activity[]
  loading?: boolean
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: string, amount?: number) => {
    switch (type) {
      case 'trade':
        return amount && amount > 0 ? TrendingUp : TrendingDown
      case 'contest':
        return Users
      case 'achievement':
        return Trophy
      case 'deposit':
        return Plus
      case 'withdrawal':
        return Minus
      default:
        return DollarSign
    }
  }

  const getActivityColor = (type: string, amount?: number) => {
    switch (type) {
      case 'trade':
        return amount && amount > 0 ? 'from-emerald-400 to-green-500' : 'from-red-400 to-pink-500'
      case 'contest':
        return 'from-purple-400 to-blue-500'
      case 'achievement':
        return 'from-amber-400 to-orange-500'
      case 'deposit':
        return 'from-emerald-400 to-blue-500'
      case 'withdrawal':
        return 'from-orange-400 to-red-500'
      default:
        return 'from-slate-400 to-slate-500'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-emerald-400'
      case 'pending':
        return 'text-amber-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-white/10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-white/10 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type, activity.amount)
        const gradient = getActivityColor(activity.type, activity.amount)
        
        return (
          <div
            key={activity.id}
            className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 animate-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-2 rounded-full bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-white truncate">{activity.title}</h4>
                {activity.status && (
                  <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm truncate">{activity.description}</p>
            </div>
            
            <div className="text-right">
              {activity.amount && (
                <p className={`font-semibold ${activity.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toLocaleString()}
                </p>
              )}
              <p className="text-slate-500 text-xs">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
      
      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-white font-medium mb-2">No activity yet</h3>
          <p className="text-slate-400 text-sm">Your recent activities will appear here</p>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed