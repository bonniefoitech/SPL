import React from 'react'
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { TeamStock, TEAM_BUDGET } from '../types/team'

interface TeamBudgetTrackerProps {
  team: TeamStock[]
  className?: string
}

const TeamBudgetTracker: React.FC<TeamBudgetTrackerProps> = ({
  team,
  className = ""
}) => {
  const totalSpent = team.reduce((sum, stock) => sum + stock.price, 0)
  const remainingBudget = TEAM_BUDGET - totalSpent
  const budgetUsedPercent = (totalSpent / TEAM_BUDGET) * 100
  
  const isOverBudget = totalSpent > TEAM_BUDGET
  const isNearBudget = budgetUsedPercent > 90 && !isOverBudget

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount)
  }

  const getBudgetColor = () => {
    if (isOverBudget) return 'from-red-400 to-pink-500'
    if (isNearBudget) return 'from-amber-400 to-orange-500'
    return 'from-emerald-400 to-blue-500'
  }

  const getBudgetIcon = () => {
    if (isOverBudget) return TrendingDown
    if (isNearBudget) return AlertTriangle
    return TrendingUp
  }

  const BudgetIcon = getBudgetIcon()

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${getBudgetColor()}`}>
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Team Budget</h3>
          <p className="text-slate-400 text-sm">Manage your $100M allocation</p>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-300 text-sm">Budget Used</span>
          <span className={`text-sm font-semibold ${
            isOverBudget ? 'text-red-400' : 
            isNearBudget ? 'text-amber-400' : 
            'text-emerald-400'
          }`}>
            {budgetUsedPercent.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getBudgetColor()} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
          />
          {isOverBudget && (
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
              style={{ width: `${budgetUsedPercent - 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BudgetIcon className={`w-4 h-4 ${
              isOverBudget ? 'text-red-400' : 
              isNearBudget ? 'text-amber-400' : 
              'text-emerald-400'
            }`} />
            <span className="text-slate-400 text-sm">Total Spent</span>
          </div>
          <p className={`text-lg font-bold ${
            isOverBudget ? 'text-red-400' : 'text-white'
          }`}>
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Remaining</span>
          </div>
          <p className={`text-lg font-bold ${
            isOverBudget ? 'text-red-400' : 
            remainingBudget < TEAM_BUDGET * 0.1 ? 'text-amber-400' : 
            'text-emerald-400'
          }`}>
            {formatCurrency(remainingBudget)}
          </p>
        </div>
      </div>

      {/* Budget Status Messages */}
      {isOverBudget && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Over Budget!</span>
          </div>
          <p className="text-red-300 text-sm">
            You're {formatCurrency(totalSpent - TEAM_BUDGET)} over budget. 
            Remove some stocks or choose cheaper alternatives.
          </p>
        </div>
      )}

      {isNearBudget && !isOverBudget && (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold">Budget Warning</span>
          </div>
          <p className="text-amber-300 text-sm">
            You're using {budgetUsedPercent.toFixed(1)}% of your budget. 
            Only {formatCurrency(remainingBudget)} remaining.
          </p>
        </div>
      )}

      {/* Team Composition */}
      <div className="space-y-2">
        <h4 className="text-white font-medium">Team Composition</h4>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Stocks Selected</span>
          <span className="text-white font-semibold">{team.length}/11</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Average Price</span>
          <span className="text-white font-semibold">
            {team.length > 0 ? formatCurrency(totalSpent / team.length) : '$0'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TeamBudgetTracker