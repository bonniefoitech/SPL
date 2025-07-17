export interface TeamStock {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sector: string
  logo?: string
  role: StockRole
  multiplier: number
}

export interface Team {
  id: string
  name: string
  stocks: TeamStock[]
  totalValue: number
  captain: string | null
  viceCaptain: string | null
  allRounder: string | null
  wicketKeeper: string | null
  batsmen: string[]
  bowlers: string[]
  createdAt: Date
  updatedAt: Date
}

export type StockRole = 
  | 'captain' 
  | 'vice-captain' 
  | 'all-rounder' 
  | 'wicket-keeper' 
  | 'batsman' 
  | 'bowler'

export interface RoleConfig {
  name: string
  multiplier: number
  maxCount: number
  color: string
  gradient: string
  description: string
}

export const ROLE_CONFIGS: Record<StockRole, RoleConfig> = {
  'captain': {
    name: 'Captain',
    multiplier: 2.5,
    maxCount: 1,
    color: 'text-amber-400',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Earns 2.5x points from stock performance'
  },
  'all-rounder': {
    name: 'All Rounder',
    multiplier: 2.25,
    maxCount: 1,
    color: 'text-purple-400',
    gradient: 'from-purple-400 to-pink-500',
    description: 'Earns 2.25x points from stock performance'
  },
  'vice-captain': {
    name: 'Vice-Captain',
    multiplier: 2.0,
    maxCount: 1,
    color: 'text-blue-400',
    gradient: 'from-blue-400 to-cyan-500',
    description: 'Earns 2x points from stock performance'
  },
  'wicket-keeper': {
    name: 'Wicket Keeper',
    multiplier: 1.5,
    maxCount: 1,
    color: 'text-emerald-400',
    gradient: 'from-emerald-400 to-green-500',
    description: 'Earns 1.5x points from stock performance'
  },
  'batsman': {
    name: 'Batsman',
    multiplier: 1.25,
    maxCount: 4,
    color: 'text-indigo-400',
    gradient: 'from-indigo-400 to-blue-500',
    description: 'Earns 1.25x points from stock performance'
  },
  'bowler': {
    name: 'Bowler',
    multiplier: 1.2,
    maxCount: 3,
    color: 'text-red-400',
    gradient: 'from-red-400 to-pink-500',
    description: 'Earns 1.20x points from stock performance'
  }
}

export const TEAM_BUDGET = 100000000 // $100M budget
export const MAX_TEAM_SIZE = 11