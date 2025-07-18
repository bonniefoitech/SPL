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

export const JoinContestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
    </>
  )
}