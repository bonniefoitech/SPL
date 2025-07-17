import { supabase } from '../lib/supabase'

export interface Contest {
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
  featured?: boolean
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
  is_favorited?: boolean
}

export interface ContestTag {
  id: string
  name: string
  description: string
  color: string
  created_at: string
}

export interface ContestFilterOptions {
  search?: string
  contestTypes?: string[]
  minEntryFee?: number
  maxEntryFee?: number
  minPrizePool?: number
  statuses?: string[]
  difficultyLevels?: string[]
  featured?: boolean
  tags?: string[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface ContestListResponse {
  data: Contest[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
}

export class ContestService {
  /**
   * Get contests with filtering, sorting, and pagination
   */
  static async getContests(options: ContestFilterOptions = {}): Promise<ContestListResponse> {
    const {
      search = '',
      contestTypes = [],
      minEntryFee = 0,
      maxEntryFee = 10000,
      minPrizePool = 0,
      statuses = ['upcoming', 'live'],
      difficultyLevels = [],
      featured = null,
      tags = [],
      sortBy = 'created_at',
      sortDirection = 'desc',
      page = 1,
      pageSize = 12
    } = options

    try {
      const { data, error } = await supabase.rpc('search_contests', {
        search_term: search,
        contest_types: contestTypes.length > 0 ? contestTypes : null,
        min_entry_fee: minEntryFee,
        max_entry_fee: maxEntryFee,
        min_prize_pool: minPrizePool,
        statuses: statuses.length > 0 ? statuses : null,
        difficulty_levels: difficultyLevels.length > 0 ? difficultyLevels : null,
        is_featured: featured,
        tag_filter: tags.length > 0 ? tags : null,
        sort_by: sortBy,
        sort_direction: sortDirection,
        page_number: page,
        page_size: pageSize
      })

      if (error) throw error

      // Get total count from the first result
      const totalCount = data.length > 0 ? Number(data[0].total_count) : 0
      const totalPages = Math.ceil(totalCount / pageSize)

      return {
        data: data as Contest[],
        totalCount,
        currentPage: page,
        pageSize,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching contests:', error)
      throw error
    }
  }

  /**
   * Get a single contest by ID
   */
  static async getContestById(id: string): Promise<Contest | null> {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select(`
          *,
          is_favorited:user_contest_favorites!inner(
            user_id
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Contest
    } catch (error) {
      console.error('Error fetching contest:', error)
      return null
    }
  }

  /**
   * Get all contest tags
   */
  static async getContestTags(): Promise<ContestTag[]> {
    try {
      const { data, error } = await supabase
        .from('contest_tags')
        .select('*')
        .order('name')

      if (error) throw error
      return data as ContestTag[]
    } catch (error) {
      console.error('Error fetching contest tags:', error)
      return []
    }
  }

  /**
   * Toggle favorite status for a contest
   */
  static async toggleFavorite(contestId: string): Promise<boolean> {
    try {
      // Check if already favorited
      const { data: existing, error: checkError } = await supabase
        .from('user_contest_favorites')
        .select('id')
        .eq('contest_id', contestId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existing) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from('user_contest_favorites')
          .delete()
          .eq('id', existing.id)

        if (deleteError) throw deleteError
        return false
      } else {
        // Add favorite
        const { error: insertError } = await supabase
          .from('user_contest_favorites')
          .insert({
            contest_id: contestId,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })

        if (insertError) throw insertError
        return true
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  /**
   * Get user's favorite contests
   */
  static async getFavoriteContests(): Promise<Contest[]> {
    try {
      const { data, error } = await supabase
        .from('user_contest_favorites')
        .select(`
          contest_id,
          contests:contest_id(*)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (error) throw error
      return data.map(item => ({
        ...item.contests,
        is_favorited: true
      })) as Contest[]
    } catch (error) {
      console.error('Error fetching favorite contests:', error)
      return []
    }
  }

  /**
   * Join a contest
   */
  static async joinContest(contestId: string, teamId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contest_participants')
        .insert({
          contest_id: contestId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          team_id: teamId
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error joining contest:', error)
      throw error
    }
  }

  /**
   * Check if user has joined a contest
   */
  static async hasJoinedContest(contestId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('contest_participants')
        .select('id')
        .eq('contest_id', contestId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking contest participation:', error)
      return false
    }
  }
}