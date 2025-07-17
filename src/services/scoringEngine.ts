import { StockPerformance, TeamStock, TeamPerformance, ContestScoring, ROLE_MULTIPLIERS, SCORING_RULES } from '../types/scoring'
import { supabase } from '../lib/supabase'

export class ScoringEngine {
  /**
   * Calculate points for a single stock based on performance and role
   */
  static calculateStockPoints(stock: TeamStock, performance: StockPerformance): number {
    const { changePercent, volume } = performance
    const { multiplier } = stock
    
    // Base points calculation
    let points = SCORING_RULES.BASE_POINTS
    
    // Performance-based points
    const performancePoints = changePercent * SCORING_RULES.PERFORMANCE_MULTIPLIER
    points += performancePoints
    
    // Volume bonus for high-volume stocks
    if (volume > SCORING_RULES.VOLUME_BONUS_THRESHOLD) {
      points += SCORING_RULES.VOLUME_BONUS_POINTS
    }
    
    // Apply role multiplier
    points *= multiplier
    
    // Apply penalty for negative performance
    if (changePercent < 0) {
      points *= SCORING_RULES.NEGATIVE_PERFORMANCE_PENALTY
    }
    
    return Math.round(points * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Calculate total team points
   */
  static calculateTeamPoints(teamStocks: TeamStock[], stockPerformances: StockPerformance[]): number {
    let totalPoints = 0
    
    teamStocks.forEach(stock => {
      const performance = stockPerformances.find(p => p.symbol === stock.symbol)
      if (performance) {
        const stockPoints = this.calculateStockPoints(stock, performance)
        totalPoints += stockPoints
      }
    })
    
    return Math.round(totalPoints * 100) / 100
  }

  /**
   * Calculate sector leader bonus
   */
  static calculateSectorBonus(teamStocks: TeamStock[], allPerformances: StockPerformance[]): number {
    const sectorLeaders = new Map<string, number>()
    
    // Find best performing stock in each sector
    allPerformances.forEach(perf => {
      const currentBest = sectorLeaders.get(perf.sector) || -Infinity
      if (perf.changePercent > currentBest) {
        sectorLeaders.set(perf.sector, perf.changePercent)
      }
    })
    
    let bonusPoints = 0
    teamStocks.forEach(stock => {
      const performance = allPerformances.find(p => p.symbol === stock.symbol)
      if (performance && sectorLeaders.get(performance.sector) === performance.changePercent) {
        bonusPoints += SCORING_RULES.SECTOR_LEADER_BONUS * stock.multiplier
      }
    })
    
    return bonusPoints
  }

  /**
   * Update contest scores for all participants
   */
  static async updateContestScores(contestId: string): Promise<void> {
    try {
      // Get all participants for the contest
      const { data: participants, error: participantsError } = await supabase
        .from('contest_participants')
        .select(`
          id,
          user_id,
          team_id,
          teams:team_id (
            name,
            stocks
          )
        `)
        .eq('contest_id', contestId)

      if (participantsError) throw participantsError

      // Get current stock performances (mock data for now)
      const stockPerformances = await this.getCurrentStockPerformances()

      // Calculate scores for each participant
      const scoringUpdates = participants.map(participant => {
        const teamStocks = participant.teams?.stocks || []
        const totalPoints = this.calculateTeamPoints(teamStocks, stockPerformances)
        const sectorBonus = this.calculateSectorBonus(teamStocks, stockPerformances)
        const finalPoints = totalPoints + sectorBonus

        return {
          participant_id: participant.id,
          contest_id: contestId,
          current_points: finalPoints,
          last_calculated: new Date().toISOString()
        }
      })

      // Sort by points to assign ranks
      scoringUpdates.sort((a, b) => b.current_points - a.current_points)
      scoringUpdates.forEach((update, index) => {
        update.rank = index + 1
      })

      // Update scores in database
      for (const update of scoringUpdates) {
        await supabase
          .from('contest_scoring')
          .upsert(update)
      }

    } catch (error) {
      console.error('Error updating contest scores:', error)
      throw error
    }
  }

  /**
   * Get current stock performances (mock implementation)
   */
  private static async getCurrentStockPerformances(): Promise<StockPerformance[]> {
    // This would typically fetch from a real stock API
    return [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 182.52,
        previousPrice: 180.18,
        change: 2.34,
        changePercent: 1.30,
        volume: 45678900,
        marketCap: 2800000000000,
        sector: 'Technology'
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 378.85,
        previousPrice: 380.08,
        change: -1.23,
        changePercent: -0.32,
        volume: 23456789,
        marketCap: 2750000000000,
        sector: 'Technology'
      },
      // Add more mock data as needed
    ]
  }

  /**
   * Calculate global leaderboard rankings
   */
  static async calculateGlobalRankings(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<void> {
    try {
      // Get all auth users (since we don't have a users table)
      // This is a simplified approach - in production you'd want a proper users table
      const { data: { users }, error } = await supabase.auth.admin.listUsers()

      if (error) throw error

      // Calculate performance for each user
      const stockPerformances = await this.getCurrentStockPerformances()
      const userPerformances = users.map(user => {
        let totalPoints = 0
        let totalEarnings = 0
        let contestsWon = 0
        let totalContests = 0

        // For now, use mock data since we don't have teams linked to auth users
        totalPoints = Math.random() * 1000

        return {
          userId: user.id,
          username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
          avatar: user.user_metadata?.avatar_url || null,
          totalPoints,
          totalEarnings,
          contestsWon,
          totalContests,
          winRate: totalContests > 0 ? (contestsWon / totalContests) * 100 : 0
        }
      })

      // Sort by total points and assign ranks
      userPerformances.sort((a, b) => b.totalPoints - a.totalPoints)
      
      // Note: Skipping database update since we don't have global_rankings table
      console.log('Global rankings calculated:', userPerformances)

    } catch (error) {
      console.error('Error calculating global rankings:', error)
      throw error
    }
  }
}