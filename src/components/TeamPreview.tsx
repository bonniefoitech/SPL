import React from 'react'
import { Link } from 'react-router-dom'
import { TeamStock, ROLE_CONFIGS } from '../types/team'
import { 
  Crown, 
  Star, 
  Shield, 
  Target, 
  Zap, 
  Flame,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface TeamPreviewProps {
  teamId: string
  teamName: string
  stocks: TeamStock[]
  totalValue: number
  performance?: {
    daily: number
    weekly: number
    total: number
  }
  isEditable?: boolean
  className?: string
}

const TeamPreview: React.FC<TeamPreviewProps> = ({
  teamId,
  teamName,
  stocks,
  totalValue,
  performance,
  isEditable = false,
  className = ""
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'captain': return Crown
      case 'all-rounder': return Star
      case 'vice-captain': return Shield
      case 'wicket-keeper': return Target
      case 'batsman': return Zap
      case 'bowler': return Flame
      default: return Star
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-emerald-400' : 'text-red-400'
  }

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">{teamName}</h3>
          <p className="text-slate-400 text-sm">{stocks.length}/11 stocks selected</p>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/teams/${teamId}`}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300"
          >
            <Eye className="w-5 h-5" />
          </Link>
          
          {isEditable && (
            <Link
              to={`/teams/${teamId}/edit`}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300"
            >
              <Edit className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Team Value */}
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Team Value</span>
          <span className="text-white font-semibold">{formatCurrency(totalValue)}</span>
        </div>
        
        {performance && (
          <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
            <div>
              <div className={`font-semibold ${getPerformanceColor(performance.daily)}`}>
                {performance.daily > 0 ? '+' : ''}{performance.daily}%
              </div>
              <div className="text-slate-400">Today</div>
            </div>
            <div>
              <div className={`font-semibold ${getPerformanceColor(performance.weekly)}`}>
                {performance.weekly > 0 ? '+' : ''}{performance.weekly}%
              </div>
              <div className="text-slate-400">This Week</div>
            </div>
            <div>
              <div className={`font-semibold ${getPerformanceColor(performance.total)}`}>
                {performance.total > 0 ? '+' : ''}{performance.total}%
              </div>
              <div className="text-slate-400">Total</div>
            </div>
          </div>
        )}
      </div>

      {/* Stocks Preview */}
      <div className="space-y-4">
        <h4 className="font-medium text-white">Team Composition</h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stocks.map((stock) => {
            const Icon = getRoleIcon(stock.role)
            const roleConfig = ROLE_CONFIGS[stock.role as keyof typeof ROLE_CONFIGS]
            
            return (
              <div
                key={stock.id}
                className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded-full bg-gradient-to-r ${roleConfig?.gradient || 'from-purple-400 to-blue-400'}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm">{stock.symbol}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{roleConfig?.name || stock.role}</span>
                  <span className={`${getPerformanceColor(stock.changePercent)}`}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            )
          })}
          
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 11 - stocks.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-white/5 border border-dashed border-white/20 rounded-lg p-3 flex items-center justify-center"
            >
              <span className="text-slate-400 text-xs">Empty Slot</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamPreview