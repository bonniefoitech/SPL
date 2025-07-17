import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthProviderOptions {
  redirectTo?: string;
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInAsAdmin: (email: string, password: string) => Promise<any>
  signInWithGoogle: (options?: AuthProviderOptions) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Check if user is admin
      if (session?.user) {
        getUserRole(session.user.id)
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Check if user is admin
      if (session?.user) {
        getUserRole(session.user.id)
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  
  const getUserRole = async (userId: string) => {
    try {
      // Get user details
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      // Check if user is admin (admin@spl.com)
      const isAdmin = userData.user?.email === 'admin@spl.com' || 
                     userData.user?.email?.endsWith('@admin.spl.com') ||
                     userData.user?.user_metadata?.is_admin === true
      
      setUserRole(isAdmin ? 'admin' : 'user')
    } catch (error) {
      console.error('Error getting user role:', error)
      setUserRole('user') // Default to user role if error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInAsAdmin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.user) {
      // Verify this user is an admin and set role immediately
      const isAdmin = data.user.email === 'admin@spl.com' || 
                     data.user.email.endsWith('@admin.spl.com') ||
                     data.user.user_metadata?.is_admin === true
      
      if (!isAdmin) {
        // Sign out if not admin
        await supabase.auth.signOut()
        return { data: null, error: { message: 'Unauthorized: Admin access required' } }
      } else {
        // Set admin role immediately to ensure proper redirection
        setUserRole('admin')
      }
    }
    
    return { data, error }
  }

  const signInWithGoogle = async (options?: AuthProviderOptions) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: options?.redirectTo || `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      throw error
    }
    
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signInAsAdmin,
    signInWithGoogle,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}