import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react'
import { TeamStock, ROLE_CONFIGS, TEAM_BUDGET } from '../types/team'

interface TeamValidationProps {
  team: TeamStock[]
  teamName: string
  className?: string
}

interface ValidationRule {
  id: string
  name: string
  isValid: boolean
  message: string
  type: 'error' | 'warning' | 'success'
}

const TeamValidation: React.FC<TeamValidationProps> = ({
  team,
  teamName,
  className = ""
}) => {
  const totalSpent = team.reduce((sum, stock) => sum + stock.price, 0)
  
  const getValidationRules = (): ValidationRule[] => {
    const rules: ValidationRule[] = []

    // Team name validation
    rules.push({
      id: 'team-name',
      name: 'Team Name',
      isValid: teamName.trim().length >= 3,
      message: teamName.trim().length >= 3 
        ? 'Team name is valid' 
        : 'Team name must be at least 3 characters',
      type: teamName.trim().length >= 3 ? 'success' : 'error'
    })

    // Team size validation
    rules.push({
      id: 'team-size',
      name: 'Team Size',
      isValid: team.length === 11,
      message: team.length === 11 
        ? 'Team has 11 stocks' 
        : `Team needs ${11 - team.length} more stocks`,
      type: team.length === 11 ? 'success' : 'error'
    })

    // Budget validation
    rules.push({
      id: 'budget',
      name: 'Budget',
      isValid: totalSpent <= TEAM_BUDGET,
      message: totalSpent <= TEAM_BUDGET 
        ? 'Within budget limit' 
        : `Over budget by $${(totalSpent - TEAM_BUDGET).toLocaleString()}`,
      type: totalSpent <= TEAM_BUDGET ? 'success' : 'error'
    })

    // Role validation
    Object.entries(ROLE_CONFIGS).forEach(([roleKey, config]) => {
      const roleStocks = team.filter(stock => stock.role === roleKey)
      const isValid = roleStocks.length === config.maxCount
      
      rules.push({
        id: `role-${roleKey}`,
        name: config.name,
        isValid,
        message: isValid 
          ? `${config.name} position filled` 
          : `Need ${config.maxCount - roleStocks.length} more ${config.name}${config.maxCount > 1 ? 's' : ''}`,
        type: isValid ? 'success' : 'error'
      })
    })

    // Duplicate stocks validation
    const symbols = team.map(stock => stock.symbol)
    const duplicates = symbols.filter((symbol, index) => symbols.indexOf(symbol) !== index)
    const hasDuplicates = duplicates.length > 0
    
    rules.push({
      id: 'duplicates',
      name: 'Unique Stocks',
      isValid: !hasDuplicates,
      message: hasDuplicates 
        ? `Duplicate stocks found: ${[...new Set(duplicates)].join(', ')}` 
        : 'All stocks are unique',
      type: hasDuplicates ? 'error' : 'success'
    })

    return rules
  }

  const validationRules = getValidationRules()
  const errorRules = validationRules.filter(rule => !rule.isValid && rule.type === 'error')
  const isTeamValid = errorRules.length === 0

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return XCircle
      case 'warning': return AlertCircle
      default: return AlertCircle
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400'
      case 'error': return 'text-red-400'
      case 'warning': return 'text-amber-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${
          isTeamValid 
            ? 'from-emerald-400 to-blue-500' 
            : 'from-red-400 to-pink-500'
        }`}>
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Team Validation</h3>
          <p className="text-slate-400 text-sm">
            {isTeamValid ? 'Your team is ready!' : `${errorRules.length} issues to fix`}
          </p>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg border mb-6 ${
        isTeamValid 
          ? 'bg-emerald-500/10 border-emerald-400/30' 
          : 'bg-red-500/10 border-red-400/30'
      }`}>
        <div className="flex items-center gap-2">
          {isTeamValid ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className={`font-semibold ${
            isTeamValid ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {isTeamValid ? 'Team Valid' : 'Team Invalid'}
          </span>
        </div>
        <p className={`text-sm mt-1 ${
          isTeamValid ? 'text-emerald-300' : 'text-red-300'
        }`}>
          {isTeamValid 
            ? 'Your team meets all requirements and is ready to compete!'
            : 'Please fix the issues below before saving your team.'
          }
        </p>
      </div>

      {/* Validation Rules */}
      <div className="space-y-3">
        <h4 className="text-white font-medium">Validation Checklist</h4>
        {validationRules.map((rule) => {
          const Icon = getIcon(rule.type)
          const color = getColor(rule.type)
          
          return (
            <div
              key={rule.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                rule.isValid 
                  ? 'bg-white/5' 
                  : 'bg-red-500/5 border border-red-400/20'
              }`}
            >
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{rule.name}</span>
                  {rule.isValid && (
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      ✓
                    </span>
                  )}
                </div>
                <p className={`text-sm ${color} opacity-80`}>
                  {rule.message}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Valid Rules</span>
            <span className="text-emerald-400 font-semibold">
              {validationRules.filter(r => r.isValid).length}/{validationRules.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Team Status</span>
            <span className={`font-semibold ${
              isTeamValid ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isTeamValid ? 'Ready' : 'Incomplete'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamValidation