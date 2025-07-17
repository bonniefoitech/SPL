import React, { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Plus, BarChart3, Building2, DollarSign, Users, Calendar } from 'lucide-react'
import { StockQuote, StockTimeSeries, stockApi } from '../services/stockApi'

interface StockModalProps {
  stock: StockQuote | null
  isOpen: boolean
  onClose: () => void
  onAddToTeam?: (stock: StockQuote) => void
  isInTeam?: boolean
}

const StockModal: React.FC<StockModalProps> = ({
  stock,
  isOpen,
  onClose,
  onAddToTeam,
  isInTeam = false
}) => {
  const [timeSeries, setTimeSeries] = useState<StockTimeSeries[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && stock) {
      setLoading(true)
      stockApi.getStockTimeSeries(stock.symbol)
        .then(setTimeSeries)
        .finally(() => setLoading(false))
    }
  }, [isOpen, stock])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !stock) return null

  const isPositive = stock.change >= 0
  const changeIcon = isPositive ? TrendingUp : TrendingDown
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400'
  const changeBgColor = isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
  const gradientColor = isPositive ? 'from-emerald-400 to-blue-500' : 'from-red-400 to-pink-500'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}`
  }

  const formatPercentage = (percent: number) => {
    const sign = percent >= 0 ? '+' : ''
    return `${sign}${percent.toFixed(2)}%`
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`
    }
    return `$${marketCap.toLocaleString()}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  // Simple mini chart component
  const MiniChart = () => {
    if (loading || timeSeries.length === 0) {
      return (
        <div className="h-32 bg-white/5 rounded-lg flex items-center justify-center">
          <div className="text-slate-400">Loading chart...</div>
        </div>
      )
    }

    const prices = timeSeries.map(item => item.close)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 100
      const y = 100 - ((price - minPrice) / priceRange) * 100
      return `${x},${y}`
    }).join(' ')

    const isChartPositive = prices[prices.length - 1] >= prices[0]

    return (
      <div className="h-32 bg-white/5 rounded-lg p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isChartPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isChartPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke={isChartPositive ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            fill="url(#chartGradient)"
            points={`${points} 100,100 0,100`}
          />
        </svg>
        <div className="absolute top-2 left-2 text-xs text-slate-400">
          30 Day Performance
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              {stock.logo ? (
                <img
                  src={stock.logo}
                  alt={`${stock.name} logo`}
                  className="w-16 h-16 rounded-xl object-cover bg-white/10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 bg-gradient-to-r ${gradientColor} rounded-xl flex items-center justify-center ${stock.logo ? 'hidden' : ''}`}>
                <span className="text-white font-bold text-lg">
                  {stock.symbol.slice(0, 2)}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">{stock.symbol}</h2>
                {stock.sector && (
                  <span className="text-sm px-3 py-1 bg-white/10 rounded-full text-slate-300 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {stock.sector}
                  </span>
                )}
              </div>
              <p className="text-slate-300">{stock.name}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Price Section */}
          <div className="mb-8">
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-3">
              <span className="text-4xl font-bold text-white">
                {formatPrice(stock.price)}
              </span>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${changeBgColor}`}>
                {React.createElement(changeIcon, { className: `w-5 h-5 ${changeColor}` })}
                <span className={`text-lg font-semibold ${changeColor}`}>
                  {formatChange(stock.change)}
                </span>
                <span className={`text-lg font-semibold ${changeColor}`}>
                  ({formatPercentage(stock.changePercent)})
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Volume: {formatVolume(stock.volume)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Price Chart
            </h3>
            <MiniChart />
          </div>

          {/* Key Statistics */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Key Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Market Cap</p>
                <p className="text-white font-semibold text-lg">{formatMarketCap(stock.marketCap)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">P/E Ratio</p>
                <p className="text-white font-semibold text-lg">{stock.peRatio?.toFixed(1) || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Volume</p>
                <p className="text-white font-semibold text-lg">{formatVolume(stock.volume)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Sector</p>
                <p className="text-white font-semibold text-lg">{stock.sector || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-4">
            <button
              onClick={() => onAddToTeam?.(stock)}
              disabled={isInTeam}
              className={`flex-1 flex items-center justify-center gap-3 font-semibold py-4 px-6 rounded-xl transition-all duration-300 ${
                isInTeam
                  ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-2xl'
              }`}
            >
              <Plus className={`w-5 h-5 transition-transform duration-300 ${isInTeam ? 'rotate-45' : ''}`} />
              {isInTeam ? 'Already in Team' : 'Add to Team'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockModal