import React, { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import StockSearch from '../components/StockSearch'
import StockCard from '../components/StockCard'
import StockModal from '../components/StockModal'
import StockTicker from '../components/StockTicker'
import StockCategories from '../components/StockCategories'
import { StockQuote, StockSearchResult, stockApi } from '../services/stockApi'
import { Search, TrendingUp, Filter, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const Stocks: React.FC = () => {
  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockQuote[]>([])
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [myTeam, setMyTeam] = useState<string[]>([])

  useEffect(() => {
    fetchStocks()
    
    // Set up real-time updates
    const unsubscribe = stockApi.subscribeToRealTimeUpdates(
      stocks.map(s => s.symbol),
      (updates) => {
        setStocks(prevStocks => 
          prevStocks.map(stock => {
            const update = updates.find(u => u.symbol === stock.symbol)
            return update || stock
          })
        )
      }
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    filterStocks()
  }, [stocks, activeCategory])

  const fetchStocks = async () => {
    try {
      setLoading(true)
      const trending = await stockApi.getTrendingStocks()
      setStocks(trending)
    } catch (error) {
      console.error('Error fetching stocks:', error)
      toast.error('Failed to load stocks')
    } finally {
      setLoading(false)
    }
  }

  const filterStocks = () => {
    if (activeCategory === 'all') {
      setFilteredStocks(stocks)
    } else {
      const filtered = stocks.filter(stock => 
        stock.sector?.toLowerCase() === activeCategory.toLowerCase()
      )
      setFilteredStocks(filtered)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const updated = await stockApi.getMultipleQuotes(stocks.map(s => s.symbol))
      setStocks(updated)
      toast.success('Stocks updated!')
    } catch (error) {
      toast.error('Failed to refresh stocks')
    } finally {
      setRefreshing(false)
    }
  }

  const handleStockSelect = async (searchResult: StockSearchResult) => {
    try {
      const stockQuote = await stockApi.getStockQuote(searchResult.symbol)
      if (stockQuote) {
        setSelectedStock(stockQuote)
        setIsModalOpen(true)
      }
    } catch (error) {
      toast.error('Failed to load stock details')
    }
  }

  const handleViewDetails = (stock: StockQuote) => {
    setSelectedStock(stock)
    setIsModalOpen(true)
  }

  const handleAddToTeam = (stock: StockQuote) => {
    if (myTeam.includes(stock.symbol)) {
      toast.error('Stock already in your team')
      return
    }

    if (myTeam.length >= 11) {
      toast.error('Team is full! Maximum 11 stocks allowed')
      return
    }

    setMyTeam(prev => [...prev, stock.symbol])
    toast.success(`${stock.symbol} added to your team!`)
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <StockTicker />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Stock Market
          </h1>
          <p className="text-slate-300">Discover and add stocks to your dream team</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <StockSearch
              onStockSelect={handleStockSelect}
              placeholder="Search for stocks to add to your team..."
              className="w-full"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Categories */}
        <StockCategories
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          className="overflow-x-auto pb-2"
        />

        {/* Team Status */}
        {myTeam.length > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Your Team Progress</span>
            </div>
            <p className="text-white">
              {myTeam.length}/11 stocks selected
              {myTeam.length < 11 && ` • ${11 - myTeam.length} more needed`}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {myTeam.map(symbol => (
                <span key={symbol} className="px-2 py-1 bg-white/10 rounded-lg text-sm text-white">
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stocks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, index) => (
              <StockCard
                key={index}
                stock={{} as StockQuote}
                loading={true}
              />
            ))}
          </div>
        ) : filteredStocks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredStocks.map((stock, index) => (
              <div
                key={stock.symbol}
                className="animate-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StockCard
                  stock={stock}
                  onViewDetails={handleViewDetails}
                  onAddToTeam={handleAddToTeam}
                  isInTeam={myTeam.includes(stock.symbol)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No stocks found</h3>
            <p className="text-slate-400 mb-6">
              {activeCategory === 'all' 
                ? 'Try refreshing or check back later'
                : `No stocks found in ${activeCategory} category`
              }
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Stocks
            </button>
          </div>
        )}
      </div>

      {/* Stock Details Modal */}
      <StockModal
        stock={selectedStock}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToTeam={handleAddToTeam}
        isInTeam={selectedStock ? myTeam.includes(selectedStock.symbol) : false}
      />
    </div>
  )
}

export default Stocks