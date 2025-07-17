import { supabase } from '../lib/supabase'

export interface Wallet {
  id: string
  user_id: string
  balance: number
  locked_balance: number
  available_balance: number
  total_deposited: number
  total_withdrawn: number
  total_winnings: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  amount: number
  type: 'deposit' | 'withdrawal' | 'contest_entry' | 'contest_win' | 'refund' | 'bonus'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description: string
  reference_id?: string
  payment_method_id?: string
  contest_id?: string
  created_at: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking' | 'wallet'
  name: string
  details: any
  is_default: boolean
  last_used_at?: string
  created_at: string
}

export interface WithdrawalRequest {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  payment_method_id?: string
  bank_details?: any
  created_at: string
}

export interface TransactionListResponse {
  data: Transaction[]
  totalCount: number
}

export class WalletService {
  /**
   * Get user wallet information
   */
  static async getUserWallet(): Promise<Wallet | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) return null

      const { data, error } = await supabase
        .rpc('get_user_wallet', { p_user_id: user.user.id })
        .single()

      if (error) throw error
      return data as Wallet
    } catch (error) {
      console.error('Error fetching wallet:', error)
      return null
    }
  }

  /**
   * Get user transactions with filtering and pagination
   */
  static async getUserTransactions(
    options: {
      type?: string
      status?: string
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    } = {}
  ): Promise<TransactionListResponse> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('User not authenticated')

      const { 
        type = null, 
        status = null, 
        startDate = null, 
        endDate = null, 
        limit = 50, 
        offset = 0 
      } = options

      const { data, error } = await supabase
        .rpc('get_user_transactions', {
          p_user_id: user.user.id,
          p_type: type,
          p_status: status,
          p_start_date: startDate?.toISOString(),
          p_end_date: endDate?.toISOString(),
          p_limit: limit,
          p_offset: offset
        })

      if (error) throw error
      
      const totalCount = data.length > 0 ? Number(data[0].total_count) : 0
      
      return {
        data: data as Transaction[],
        totalCount
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return { data: [], totalCount: 0 }
    }
  }

  /**
   * Get user payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) return []

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as PaymentMethod[]
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }

  /**
   * Add a payment method
   */
  static async addPaymentMethod(
    type: 'card' | 'upi' | 'netbanking' | 'wallet',
    name: string,
    details: any,
    isDefault: boolean = false
  ): Promise<PaymentMethod | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('User not authenticated')

      // If setting as default, unset any existing default
      if (isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.user.id)
          .eq('is_default', true)
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.user.id,
          type,
          name,
          details,
          is_default: isDefault
        })
        .select()
        .single()

      if (error) throw error
      return data as PaymentMethod
    } catch (error) {
      console.error('Error adding payment method:', error)
      return null
    }
  }

  /**
   * Process a deposit
   */
  static async processDeposit(
    amount: number,
    paymentMethodId?: string,
    referenceId?: string,
    description: string = 'Wallet deposit'
  ): Promise<string | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .rpc('process_deposit', {
          p_user_id: user.user.id,
          p_amount: amount,
          p_payment_method_id: paymentMethodId,
          p_reference_id: referenceId,
          p_description: description
        })

      if (error) throw error
      return data as string
    } catch (error) {
      console.error('Error processing deposit:', error)
      return null
    }
  }

  /**
   * Request a withdrawal
   */
  static async requestWithdrawal(
    amount: number,
    paymentMethodId?: string,
    bankDetails?: any
  ): Promise<string | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .rpc('request_withdrawal', {
          p_user_id: user.user.id,
          p_amount: amount,
          p_payment_method_id: paymentMethodId,
          p_bank_details: bankDetails
        })

      if (error) throw error
      return data as string
    } catch (error) {
      console.error('Error requesting withdrawal:', error)
      return null
    }
  }

  /**
   * Get withdrawal requests
   */
  static async getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) return []

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as WithdrawalRequest[]
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error)
      return []
    }
  }

  /**
   * Get transaction summary
   */
  static async getTransactionSummary(): Promise<{
    totalDeposits: number
    totalWithdrawals: number
    totalWinnings: number
    totalEntryFees: number
  }> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        return {
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalWinnings: 0,
          totalEntryFees: 0
        }
      }

      const { data: deposits, error: depositsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.user.id)
        .eq('type', 'deposit')
        .eq('status', 'completed')

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.user.id)
        .eq('type', 'withdrawal')
        .eq('status', 'completed')

      const { data: winnings, error: winningsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.user.id)
        .eq('type', 'contest_win')
        .eq('status', 'completed')

      const { data: entryFees, error: entryFeesError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.user.id)
        .eq('type', 'contest_entry')
        .eq('status', 'completed')

      if (depositsError || withdrawalsError || winningsError || entryFeesError) {
        throw new Error('Error fetching transaction summary')
      }

      const totalDeposits = deposits?.reduce((sum, t) => sum + t.amount, 0) || 0
      const totalWithdrawals = withdrawals?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
      const totalWinnings = winnings?.reduce((sum, t) => sum + t.amount, 0) || 0
      const totalEntryFees = entryFees?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

      return {
        totalDeposits,
        totalWithdrawals,
        totalWinnings,
        totalEntryFees
      }
    } catch (error) {
      console.error('Error fetching transaction summary:', error)
      return {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalWinnings: 0,
        totalEntryFees: 0
      }
    }
  }
}