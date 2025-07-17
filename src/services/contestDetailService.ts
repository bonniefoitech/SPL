import { supabase } from '../lib/supabase'

export interface ContestRule {
  id: string
  rule_text: string
  rule_order: number
}

export interface PrizeDistribution {
  rank: number
  prize_amount: number
  prize_percentage: number
}

export interface UserTeam {
  id: string
  name: string
  stocks_count: number
  total_value: number
  is_selected: boolean
}

export interface ContestDetails {
  contest: {
    id: string
    title: string
    description: string
    entry_fee: number
    prize_pool: number
    max_participants: number
    current_participants: number
    contest_type: 'head-to-head' | 'tournament' | 'mega-contest'
    start_time: string
    end_time: string
    status: 'upcoming' | 'live' | 'completed' | 'cancelled'
    created_by: string
    created_at: string
    updated_at: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    featured?: boolean
    entry_fee_breakdown?: {
      platform_fee: number
      prize_pool_contribution: number
      taxes?: number
    }
    is_favorited?: boolean
  }
  rules: ContestRule[]
  prize_distribution: PrizeDistribution[]
  user_teams: UserTeam[]
  is_joined: boolean
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  username: string
  team_name: string
  current_rank: number
  previous_rank: number
  points: number
  points_change: number
  avatar_url?: string
}

export class ContestDetailService {
  /**
   * Get detailed information about a contest
   */
  static async getContestDetails(contestId: string): Promise<ContestDetails | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      const userId = user?.user?.id

      const { data, error } = await supabase.rpc(
        'get_contest_details',
        { 
          p_contest_id: contestId,
          p_user_id: userId || null
        }
      )

      if (error) throw error
      return data as ContestDetails
    } catch (error) {
      console.error('Error fetching contest details:', error)
      return null
    }
  }

  /**
   * Get leaderboard for a contest
   */
  static async getContestLeaderboard(contestId: string): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('contest_leaderboard')
        .select(`
          id,
          user_id,
          current_rank,
          previous_rank,
          points,
          points_change,
          users:user_id (
            username,
            avatar_url
          ),
          teams:team_id (
            name
          )
        `)
        .eq('contest_id', contestId)
        .order('current_rank', { ascending: true })
        .limit(100)

      if (error) throw error

      return data.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        username: 'Player ' + entry.user_id.slice(0, 8), // Simplified since no users table
        team_name: 'Team ' + entry.user_id.slice(0, 8),
        current_rank: entry.current_rank,
        previous_rank: entry.previous_rank || entry.current_rank,
        points: entry.points,
        points_change: entry.points_change || 0,
        avatar_url: null
      }))
    } catch (error) {
      console.error('Error fetching contest leaderboard:', error)
      return []
    }
  }

  /**
   * Join a contest with a team
   */
  static async joinContest(contestId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if contest exists and is joinable
      const { data: contest, error: contestError } = await supabase
        .from('contests')
        .select('status, current_participants, max_participants, entry_fee')
        .eq('id', contestId)
        .single()

      if (contestError) {
        return { success: false, error: 'Contest not found' }
      }

      if (contest.status !== 'upcoming') {
        return { success: false, error: 'Contest has already started or ended' }
      }

      if (contest.current_participants >= contest.max_participants) {
        return { success: false, error: 'Contest is full' }
      }

      // Check if user has already joined
      const { data: existingParticipation, error: participationError } = await supabase
        .from('contest_participants')
        .select('id')
        .eq('contest_id', contestId)
        .eq('user_id', user.user.id)
        .maybeSingle()

      if (existingParticipation) {
        return { success: false, error: 'You have already joined this contest' }
      }

      // Check if team exists and belongs to user
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .eq('user_id', user.user.id)
        .single()

      if (teamError) {
        return { success: false, error: 'Team not found or does not belong to you' }
      }

      // Join the contest
      const { error: joinError } = await supabase
        .from('contest_participants')
        .insert({
          contest_id: contestId,
          user_id: user.user.id,
          team_id: teamId
        })

      if (joinError) {
        if (joinError.code === '23505') {
          return { success: false, error: 'You have already joined this contest' }
        }
        throw joinError
      }

      return { success: true }
    } catch (error) {
      console.error('Error joining contest:', error)
      return { success: false, error: 'Failed to join contest' }
    }
  }

  /**
   * Switch team for a contest
   */
  static async switchTeam(contestId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if contest exists and is upcoming
      const { data: contest, error: contestError } = await supabase
        .from('contests')
        .select('status')
        .eq('id', contestId)
        .single()

      if (contestError) {
        return { success: false, error: 'Contest not found' }
      }

      if (contest.status !== 'upcoming') {
        return { success: false, error: 'Cannot change team after contest has started' }
      }

      // Check if team exists and belongs to user
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .eq('user_id', user.user.id)
        .single()

      if (teamError) {
        return { success: false, error: 'Team not found or does not belong to you' }
      }

      // Update the participant record
      const { error: updateError } = await supabase
        .from('contest_participants')
        .update({ team_id: teamId })
        .eq('contest_id', contestId)
        .eq('user_id', user.user.id)

      if (updateError) {
        throw updateError
      }

      return { success: true }
    } catch (error) {
      console.error('Error switching team:', error)
      return { success: false, error: 'Failed to switch team' }
    }
  }
}