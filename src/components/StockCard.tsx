import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Plus, BarChart3, Building2 } from 'lucide-react'
import { StockQuote } from '../services/stockApi'

interface StockCardProps {
  stock: StockQuote
  onAddToTeam?: (stock: StockQuote) => void
  disabled?: boolean
  onViewDetails?: (stock: StockQuote) => void
  isInTeam?: boolean
  loading?: boolean
  className?: string
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onAddToTeam,
  disabled = false,
  onViewDetails,
  isInTeam = false,
  loading = false,
  className = ""
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [previousPrice, setPreviousPrice] = useState(stock.price)

  const isPositive = stock.change >= 0
  const changeIcon = isPositive ? TrendingUp : TrendingDown
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400'
  const changeBgColor = isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
  const gradientColor = isPositive ? 'from-emerald-400 to-blue-500' : 'from-red-400 to-pink-500'

  useEffect(() => {
    if (stock.price !== previousPrice) {
      setIsUpdating(true)
      const timer = setTimeout(() => {
        setIsUpdating(false)
        setPreviousPrice(stock.price)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [stock.price, previousPrice])

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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
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

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 animate-pulse ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-white/10 rounded w-2/3"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
          <div className="h-10 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-2xl cursor-pointer ${
        isUpdating ? 'ring-2 ring-purple-400/50 animate-pulse' : ''
      } ${className} h-full`}
      onClick={() => onViewDetails?.(stock)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          {stock.logo ? (
            <img
              src={stock.logo}
              alt={`${stock.name} logo`}
              className="w-12 h-12 rounded-lg object-cover bg-white/10"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`w-12 h-12 bg-gradient-to-r ${gradientColor} rounded-lg flex items-center justify-center ${stock.logo ? 'hidden' : ''}`}>
            <span className="text-white font-bold text-sm">
              {stock.symbol.slice(0, 2)}
            </span>
          </div>
          {isUpdating && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
              {stock.symbol}
            </h3>
            {stock.sector && (
              <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {stock.sector}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm truncate">{stock.name}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-white">
            {formatPrice(stock.price)}
          </span>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${changeBgColor}`}>
            {React.createElement(changeIcon, { className: `w-4 h-4 ${changeColor}` })}
            <span className={`text-sm font-semibold ${changeColor}`}>
              {formatChange(stock.change)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${changeColor}`}>
            {formatPercentage(stock.changePercent)}
          </span>
          <span className="text-slate-400 text-sm">
            Vol: {formatVolume(stock.volume)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 text-sm">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-slate-400 text-xs">Market Cap</p>
          <p className="text-white font-semibold">{formatMarketCap(stock.marketCap)}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-slate-400 text-xs">P/E Ratio</p>
          <p className="text-white font-semibold">{stock.peRatio?.toFixed(1) || 'N/A'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 sm:gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails?.(stock)
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 group/btn"
        >
          <BarChart3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
          Details
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) onAddToTeam?.(stock)
          }}
          disabled={isInTeam || disabled}
          className={`flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-all duration-300 group/btn ${
            isInTeam || disabled
              ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105'
          }`}
        >
          <Plus className={`w-4 h-4 transition-transform duration-300 ${isInTeam ? 'rotate-45' : disabled ? '' : 'group-hover/btn:rotate-90'}`} />
          {isInTeam ? 'Added' : disabled ? 'Locked' : 'Add'}
        </button>
      </div>
    </div>
  )
}

export default StockCard