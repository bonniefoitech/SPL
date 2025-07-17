import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationDropdown from './NotificationDropdown'
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Wallet,
  ChevronDown,
  Crown,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TopNavigationProps {
  sidebarCollapsed: boolean
}

const TopNavigation: React.FC<TopNavigationProps> = ({ sidebarCollapsed }) => {
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  return (
    <header className={`fixed top-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 z-30 transition-all duration-300 ${
      sidebarCollapsed ? 'left-16' : 'left-64'
    }`}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search stocks, contests..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Wallet Balance */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 px-4 py-2 rounded-lg border border-emerald-400/30">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">₹12,450</span>
          </div>

          {/* Rank Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-2 rounded-lg border border-amber-400/30">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-semibold">#42</span>
          </div>

          {/* Performance Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-2 rounded-lg border border-purple-400/30">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-semibold">+2.8%</span>
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block font-medium">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl py-2 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm text-slate-300">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/wallet"
                    className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Wallet className="w-4 h-4" />
                    Wallet
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </div>
                
                <div className="border-t border-white/10 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNavigation