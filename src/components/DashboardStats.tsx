import React from 'react'
import { 
  DollarSign, 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  Crown,
  Zap,
  BarChart3
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<any>
  gradient: string
  loading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  gradient,
  loading = false
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-400'
      case 'negative':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
          {value}
        </h3>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        {change && (
          <p className={`text-sm font-medium ${getChangeColor()} flex items-center gap-1`}>
            {changeType === 'positive' && '↗'}
            {changeType === 'negative' && '↘'}
            {change}
          </p>
        )}
      </div>
    </div>
  )
}

const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Portfolio Value',
      value: '₹12,450',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      gradient: 'from-emerald-400 to-blue-500'
    },
    {
      title: 'Global Rank',
      value: '#42',
      change: '+3 positions',
      changeType: 'positive' as const,
      icon: Crown,
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      title: 'Active Contests',
      value: '3',
      change: '2 public, 1 private',
      changeType: 'neutral' as const,
      icon: Trophy,
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Weekly Earnings',
      value: '₹2,847',
      change: '+12.8%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Win Rate',
      value: '68%',
      change: '+4% this month',
      changeType: 'positive' as const,
      icon: Target,
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Total Teams',
      value: '7',
      change: '2 active',
      changeType: 'neutral' as const,
      icon: Users,
      gradient: 'from-indigo-400 to-purple-500'
    },
    {
      title: 'Performance',
      value: '+2.8%',
      change: 'Today',
      changeType: 'positive' as const,
      icon: BarChart3,
      gradient: 'from-pink-400 to-rose-500'
    },
    {
      title: 'Streak',
      value: '5 days',
      change: 'Current winning streak',
      changeType: 'positive' as const,
      icon: Zap,
      gradient: 'from-yellow-400 to-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="animate-in slide-in-from-bottom-4 duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  )
}

export default DashboardStats