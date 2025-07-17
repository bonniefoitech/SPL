import React, { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, X, Loader2 } from 'lucide-react'
import { stockApi, StockSearchResult } from '../services/stockApi'
import { useDebounce } from '../hooks/useDebounce'

interface StockSearchProps {
  onStockSelect?: (stock: StockSearchResult) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

const StockSearch: React.FC<StockSearchProps> = ({
  onStockSelect,
  disabled = false,
  placeholder = "Search stocks...",
  className = ""
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchStocks = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        setIsOpen(false)
        return
      }

      setLoading(true)
      try {
        const searchResults = await stockApi.searchStocks(debouncedQuery)
        setResults(searchResults)
        setIsOpen(searchResults.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    searchStocks()
  }, [debouncedQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectStock(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelectStock = (stock: StockSearchResult) => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    onStockSelect?.(stock)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 focus:bg-white/20 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-y-0 right-12 flex items-center">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 max-h-60 sm:max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((stock, index) => (
                <button
                  key={`${stock.symbol}-${index}`}
                  onClick={() => handleSelectStock(stock)}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-200 ${
                    index === selectedIndex
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {stock.symbol.slice(0, 2)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{stock.symbol}</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-400">
                        {stock.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{stock.name}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">{stock.region}</p>
                    <p className="text-xs text-slate-500">{stock.currency}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : query && !loading ? (
            <div className="py-8 text-center">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400 font-medium">No stocks found</p>
              <p className="text-slate-500 text-sm">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default StockSearch