import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Team {
  id: string
  name: string
  created_at: string
  stocks: Array<{
    symbol: string
    name: string
    price: number
  }>
  total_value: number
  performance: {
    daily_change: number
    weekly_change: number
    total_return: number
  }
}

export interface Contest {
  id: string
  title: string
  entry_fee: number
  prize_pool: number
  max_participants: number
  current_participants: number
  contest_type: string
  start_time: string
  end_time: string
  status: string
}

export interface JoinContestState {
  step: number
  contest: Contest | null
  selectedTeam: Team | null
  paymentMethod: 'wallet' | 'add_money' | 'direct'
  isLoading: boolean
  error: string | null
  transactionId: string | null
}

interface JoinContestContextType {
  state: JoinContestState
  setStep: (step: number) => void
  setContest: (contest: Contest) => void
  setSelectedTeam: (team: Team | null) => void
  setPaymentMethod: (method: 'wallet' | 'add_money' | 'direct') => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setTransactionId: (id: string | null) => void
  resetFlow: () => void
}

const JoinContestContext = createContext<JoinContestContextType | undefined>(undefined)

export const useJoinContest = () => {
  const context = useContext(JoinContestContext)
  if (!context) {
    throw new Error('useJoinContest must be used within a JoinContestProvider')
  }
  return context
}

const initialState: JoinContestState = {
  step: 1,
  contest: null,
  selectedTeam: null,
  paymentMethod: 'wallet',
  isLoading: false,
  error: null,
  transactionId: null
}

export const JoinContestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<JoinContestState>(initialState)

  const setStep = (step: number) => {
    setState(prev => ({ ...prev, step }))
  }

  const setContest = (contest: Contest) => {
    setState(prev => ({ ...prev, contest }))
  }

  const setSelectedTeam = (team: Team | null) => {
    setState(prev => ({ ...prev, selectedTeam: team }))
  }

  const setPaymentMethod = (method: 'wallet' | 'add_money' | 'direct') => {
    setState(prev => ({ ...prev, paymentMethod: method }))
  }

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }

  const setTransactionId = (id: string | null) => {
    setState(prev => ({ ...prev, transactionId: id }))
  }

  const resetFlow = () => {
    setState(initialState)
  }

  return (
    <JoinContestContext.Provider
      value={{
        state,
        setStep,
        setContest,
        setSelectedTeam,
        setPaymentMethod,
        setLoading,
        setError,
        setTransactionId,
        resetFlow
      }}
    >
      {children}
    </JoinContestContext.Provider>
  )
}