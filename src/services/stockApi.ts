// Stock API service for Alpha Vantage integration
import axios from 'axios'

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo'
const BASE_URL = 'https://www.alphavantage.co/query'

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  peRatio?: number
  sector?: string
  logo?: string
}

export interface StockSearchResult {
  symbol: string
  name: string
  type: string
  region: string
  marketOpen: string
  marketClose: string
  timezone: string
  currency: string
  matchScore: string
}

export interface StockTimeSeries {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Mock data for demo purposes (replace with real API calls)
const mockStocks: StockQuote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.52,
    change: 2.34,
    changePercent: 1.30,
    volume: 45678900,
    marketCap: 2800000000000,
    peRatio: 28.5,
    sector: 'Technology',
    logo: 'https://logo.clearbit.com/apple.com'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: -1.23,
    changePercent: -0.32,
    volume: 23456789,
    marketCap: 2750000000000,
    peRatio: 32.1,
    sector: 'Technology',
    logo: 'https://logo.clearbit.com/microsoft.com'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: 3.45,
    changePercent: 2.48,
    volume: 34567890,
    marketCap: 1800000000000,
    peRatio: 25.3,
    sector: 'Technology',
    logo: 'https://logo.clearbit.com/google.com'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.42,
    change: -5.67,
    changePercent: -2.23,
    volume: 67890123,
    marketCap: 790000000000,
    peRatio: 65.2,
    sector: 'Automotive',
    logo: 'https://logo.clearbit.com/tesla.com'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 151.94,
    change: 1.87,
    changePercent: 1.25,
    volume: 45123678,
    marketCap: 1550000000000,
    peRatio: 45.8,
    sector: 'E-commerce',
    logo: 'https://logo.clearbit.com/amazon.com'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.28,
    change: 12.45,
    changePercent: 1.44,
    volume: 23789456,
    marketCap: 2150000000000,
    peRatio: 68.4,
    sector: 'Technology',
    logo: 'https://logo.clearbit.com/nvidia.com'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 484.20,
    change: -2.15,
    changePercent: -0.44,
    volume: 18765432,
    marketCap: 1230000000000,
    peRatio: 24.7,
    sector: 'Technology',
    logo: 'https://logo.clearbit.com/meta.com'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 178.45,
    change: 0.89,
    changePercent: 0.50,
    volume: 12345678,
    marketCap: 520000000000,
    peRatio: 12.3,
    sector: 'Finance',
    logo: 'https://logo.clearbit.com/jpmorganchase.com'
  }
]

class StockApiService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query || query.length < 2) return []

    const cacheKey = `search_${query}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // For demo, filter mock data
      const results = mockStocks
        .filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          type: 'Equity',
          region: 'United States',
          marketOpen: '09:30',
          marketClose: '16:00',
          timezone: 'UTC-04',
          currency: 'USD',
          matchScore: '1.0000'
        }))

      this.setCachedData(cacheKey, results)
      return results
    } catch (error) {
      console.error('Error searching stocks:', error)
      return []
    }
  }

  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `quote_${symbol}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // For demo, return mock data
      const stock = mockStocks.find(s => s.symbol === symbol)
      if (stock) {
        // Add some random variation to simulate real-time updates
        const variation = (Math.random() - 0.5) * 2 // -1 to 1
        const updatedStock = {
          ...stock,
          price: stock.price + variation,
          change: stock.change + variation * 0.5,
          changePercent: ((stock.price + variation) / stock.price - 1) * 100
        }
        
        this.setCachedData(cacheKey, updatedStock)
        return updatedStock
      }
      return null
    } catch (error) {
      console.error('Error fetching stock quote:', error)
      return null
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(symbol => this.getStockQuote(symbol))
    const results = await Promise.all(promises)
    return results.filter(Boolean) as StockQuote[]
  }

  async getStockTimeSeries(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' = 'daily'): Promise<StockTimeSeries[]> {
    const cacheKey = `timeseries_${symbol}_${interval}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // Generate mock time series data
      const data: StockTimeSeries[] = []
      const basePrice = mockStocks.find(s => s.symbol === symbol)?.price || 100
      const now = new Date()
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        
        const variation = (Math.random() - 0.5) * 10
        const price = basePrice + variation
        
        data.push({
          timestamp: date.toISOString(),
          open: price - Math.random() * 2,
          high: price + Math.random() * 3,
          low: price - Math.random() * 3,
          close: price,
          volume: Math.floor(Math.random() * 1000000) + 500000
        })
      }

      this.setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error fetching time series:', error)
      return []
    }
  }

  async getTrendingStocks(): Promise<StockQuote[]> {
    const cacheKey = 'trending'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // Return shuffled mock stocks as trending
      const trending = [...mockStocks]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
        .map(stock => ({
          ...stock,
          // Add some random variation
          price: stock.price + (Math.random() - 0.5) * 5,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5
        }))

      this.setCachedData(cacheKey, trending)
      return trending
    } catch (error) {
      console.error('Error fetching trending stocks:', error)
      return []
    }
  }

  async getStocksByCategory(category: string): Promise<StockQuote[]> {
    const cacheKey = `category_${category}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const filtered = mockStocks.filter(stock => 
        stock.sector?.toLowerCase() === category.toLowerCase()
      )

      this.setCachedData(cacheKey, filtered)
      return filtered
    } catch (error) {
      console.error('Error fetching stocks by category:', error)
      return []
    }
  }

  // Simulate real-time price updates
  subscribeToRealTimeUpdates(symbols: string[], callback: (updates: StockQuote[]) => void) {
    const interval = setInterval(async () => {
      const updates = await this.getMultipleQuotes(symbols)
      callback(updates)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }
}

export const stockApi = new StockApiService()