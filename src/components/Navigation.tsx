import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, LogOut, Settings, Wallet, Trophy, Bell, Shield,
  ChevronDown, Menu, X, BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

const Navigation: React.FC = () => {
  const { user, userRole, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
      navigate('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Trophy },
    { name: 'Stocks', path: '/stocks', icon: BarChart3 },
    { name: 'Contests', path: '/contests', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            SPL
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Admin Dashboard Link (only for admins) */}
            {user && userRole === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wallet Balance */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 px-4 py-2 rounded-lg border border-emerald-400/30">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">$12,450</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:flex items-center gap-2 font-medium">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  {userRole === 'admin' && (
                    <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                      Admin
                    </span>
                  )}
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
                      className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 animate-in slide-in-from-top-2 duration-200 absolute left-0 right-0 bg-slate-900/95 backdrop-blur-xl z-50 shadow-lg">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <>
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </>
                )
              })}
              
              {/* Admin Dashboard Link (only for admins) */}
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActive('/admin')
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </Link>
              )}
              
              {/* Mobile Wallet Balance */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg border border-emerald-400/30 mx-4 mt-4">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">$12,450</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation