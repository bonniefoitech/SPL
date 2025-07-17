import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Trophy, 
  Target,
  Zap,
  BarChart3,
  Wallet,
  Crown,
  Star
} from 'lucide-react'

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Create Team',
      description: 'Build your stock dream team',
      icon: Target,
      gradient: 'from-purple-600 to-blue-600',
      path: '/create-team',
      primary: true
    },
    {
      title: 'Join Contest',
      description: 'Enter live competitions',
      icon: Trophy,
      gradient: 'from-emerald-600 to-blue-600',
      path: '/contests',
      primary: true
    },
    {
      title: 'Browse Stocks',
      description: 'Explore market opportunities',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/stocks'
    },
    {
      title: 'View Analytics',
      description: 'Track your performance',
      icon: BarChart3,
      gradient: 'from-indigo-500 to-purple-500',
      path: '/analytics'
    },
    {
      title: 'Add Funds',
      description: 'Top up your wallet',
      icon: Wallet,
      gradient: 'from-emerald-500 to-green-500',
      path: '/wallet'
    },
    {
      title: 'Leaderboard',
      description: 'See top performers',
      icon: Crown,
      gradient: 'from-amber-500 to-orange-500',
      path: '/leaderboard'
    }
  ]

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-400 to-blue-500">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          
          return (
            <Link
              key={action.title}
              to={action.path}
              className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-in slide-in-from-bottom-4 ${
                action.primary 
                  ? `bg-gradient-to-r ${action.gradient} text-white` 
                  : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-3 rounded-lg ${
                action.primary 
                  ? 'bg-white/20' 
                  : `bg-gradient-to-r ${action.gradient}`
              }`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">
                  {action.title}
                </h4>
                <p className={`text-sm ${
                  action.primary ? 'text-white/80' : 'text-slate-400'
                }`}>
                  {action.description}
                </p>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Plus className="w-5 h-5 rotate-0 group-hover:rotate-90 transition-transform duration-300" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Featured Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Star className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-semibold">Featured</span>
        </div>
        <h4 className="text-white font-semibold mb-2">Weekly Mega Contest</h4>
        <p className="text-amber-300/80 text-sm mb-4">
          Join our biggest contest of the week with ₹1,00,000 prize pool!
        </p>
        <Link
          to="/contests/weekly-mega"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <Trophy className="w-4 h-4" />
          Join Now
        </Link>
      </div>
    </div>
  )
}

export default QuickActions