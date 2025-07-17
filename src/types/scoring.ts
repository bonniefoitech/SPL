export interface StockPerformance {
  symbol: string
  name: string
  price: number
  previousPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  sector: string
}

export interface TeamStock {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sector: string
  role: StockRole
  multiplier: number
  points: number
}

export interface TeamPerformance {
  teamId: string
  teamName: string
  userId: string
  username: string
  totalPoints: number
  dailyChange: number
  weeklyChange: number
  monthlyChange: number
  totalValue: number
  rank: number
  previousRank: number
  stocks: TeamStock[]
  lastUpdated: Date
}

export interface ContestScoring {
  contestId: string
  participantId: string
  teamId: string
  currentPoints: number
  dailyPoints: number
  totalPoints: number
  rank: number
  previousRank: number
  prizeAmount: number
  lastCalculated: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}

export interface LeaderboardEntry {
  id: string
  rank: number
  previousRank: number
  userId: string
  username: string
  avatar?: string
  teamName: string
  points: number
  pointsChange: number
  earnings: number
  winRate: number
  contestsWon: number
  totalContests: number
  achievements: Achievement[]
  isCurrentUser?: boolean
  trend: 'up' | 'down' | 'same'
  streakDays: number
}

export type StockRole = 
  | 'captain' 
  | 'vice-captain' 
  | 'all-rounder' 
  | 'wicket-keeper' 
  | 'batsman' 
  | 'bowler'

export const ROLE_MULTIPLIERS: Record<StockRole, number> = {
  'captain': 2.5,
  'all-rounder': 2.25,
  'vice-captain': 2.0,
  'wicket-keeper': 1.5,
  'batsman': 1.25,
  'bowler': 1.2
}

export const SCORING_RULES = {
  BASE_POINTS: 100,
  PERFORMANCE_MULTIPLIER: 10,
  VOLUME_BONUS_THRESHOLD: 1000000,
  VOLUME_BONUS_POINTS: 5,
  SECTOR_LEADER_BONUS: 20,
  NEGATIVE_PERFORMANCE_PENALTY: 0.5
}