import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { StockQuote, stockApi } from '../services/stockApi'

const StockTicker: React.FC = () => {
  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchTrendingStocks = async () => {
      try {
        const trending = await stockApi.getTrendingStocks()
        setStocks(trending)
      } catch (error) {
        console.error('Error fetching trending stocks:', error)
      }
    }

    fetchTrendingStocks()
    
    // Update every 30 seconds
    const interval = setInterval(fetchTrendingStocks, 30000)
    return () => clearInterval(interval)
  }, [])

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

  if (stocks.length === 0) return null

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10 overflow-hidden">
      <div 
        className={`flex items-center gap-8 py-3 ${isPaused ? '' : 'animate-scroll'}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          animation: isPaused ? 'none' : 'scroll 60s linear infinite',
        }}
      >
        {/* Duplicate the stocks array to create seamless loop */}
        {[...stocks, ...stocks].map((stock, index) => {
          const isPositive = stock.change >= 0
          const changeIcon = isPositive ? TrendingUp : TrendingDown
          const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400'
          
          return (
            <div
              key={`${stock.symbol}-${index}`}
              className="flex items-center gap-3 whitespace-nowrap flex-shrink-0 px-4"
            >
              <span className="font-bold text-white">{stock.symbol}</span>
              <span className="text-slate-300">{formatPrice(stock.price)}</span>
              <div className={`flex items-center gap-1 ${changeColor}`}>
                {React.createElement(changeIcon, { className: 'w-3 h-3' })}
                <span className="text-sm font-medium">
                  {formatChange(stock.change)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default StockTicker