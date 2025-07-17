import React, { useState } from 'react'
import Navigation from '../components/Navigation'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Trophy,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  LineChart
} from 'lucide-react'

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('performance')

  const performanceData = [
    { period: 'Today', value: 2.3, change: 0.5, positive: true },
    { period: 'Yesterday', value: 1.8, change: -0.2, positive: false },
    { period: 'This Week', value: 8.7, change: 2.1, positive: true },
    { period: 'Last Week', value: 6.6, change: -1.2, positive: false },
    { period: 'This Month', value: 15.4, change: 4.8, positive: true },
    { period: 'Last Month', value: 10.6, change: -2.3, positive: false }
  ]

  const portfolioBreakdown = [
    { sector: 'Technology', allocation: 35, value: 35000000, change: 12.5 },
    { sector: 'Healthcare', allocation: 20, value: 20000000, change: 8.3 },
    { sector: 'Finance', allocation: 18, value: 18000000, change: -2.1 },
    { sector: 'Energy', allocation: 15, value: 15000000, change: 15.7 },
    { sector: 'Consumer', allocation: 12, value: 12000000, change: 5.2 }
  ]

  const contestAnalytics = [
    { metric: 'Total Contests', value: 45, change: 8, period: 'vs last month' },
    { metric: 'Win Rate', value: 68.9, change: 5.2, period: 'vs last month' },
    { metric: 'Avg Rank', value: 12.3, change: -2.1, period: 'vs last month' },
    { metric: 'Best Rank', value: 1, change: 0, period: 'all time' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 10000000 ? 'compact' : 'standard'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-300">Track your performance and portfolio insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="1d" className="bg-slate-800">1 Day</option>
              <option value="7d" className="bg-slate-800">7 Days</option>
              <option value="30d" className="bg-slate-800">30 Days</option>
              <option value="90d" className="bg-slate-800">90 Days</option>
              <option value="1y" className="bg-slate-800">1 Year</option>
            </select>
            
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Portfolio Value', value: '₹98.5L', change: '+12.5%', icon: DollarSign, gradient: 'from-emerald-400 to-green-500', positive: true },
            { title: 'Total Return', value: '+15.4%', change: '+4.8%', icon: TrendingUp, gradient: 'from-blue-400 to-cyan-500', positive: true },
            { title: 'Active Contests', value: '8', change: '+2', icon: Trophy, gradient: 'from-purple-400 to-pink-500', positive: true },
            { title: 'Global Rank', value: '#42', change: '+3', icon: Target, gradient: 'from-amber-400 to-orange-500', positive: true }
          ].map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.title}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.gradient}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {metric.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-slate-400 text-sm">{metric.title}</p>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <LineChart className="w-6 h-6 text-purple-400" />
                Performance Overview
              </h3>
              <div className="flex gap-2">
                {['performance', 'returns', 'volume'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                      selectedMetric === metric
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {performanceData.map((item, index) => (
                <div
                  key={item.period}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 animate-in slide-in-from-left-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-slate-300 font-medium">{item.period}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{item.value}%</span>
                    <div className={`flex items-center gap-1 text-sm ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.positive ? '+' : ''}{item.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Breakdown */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-400" />
              Portfolio Breakdown
            </h3>
            
            <div className="space-y-4">
              {portfolioBreakdown.map((sector, index) => (
                <div
                  key={sector.sector}
                  className="animate-in slide-in-from-right-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">{sector.sector}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{sector.allocation}%</span>
                      <span className={`text-sm ${sector.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {sector.change >= 0 ? '+' : ''}{sector.change}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${sector.allocation}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-sm">{formatCurrency(sector.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contest Analytics */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Contest Analytics
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contestAnalytics.map((item, index) => (
              <div
                key={item.metric}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h4 className="text-slate-400 text-sm mb-2">{item.metric}</h4>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-white">
                    {typeof item.value === 'number' && item.metric.includes('Rate') ? `${item.value}%` : item.value}
                  </span>
                  {item.change !== 0 && (
                    <span className={`text-sm ${item.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.change > 0 ? '+' : ''}{item.change}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs">{item.period}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics