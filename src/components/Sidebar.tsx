import React, { useState } from 'react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  TrendingUp, 
  Trophy, 
  Users, 
  Wallet, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Crown,
  Zap
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Stocks', path: '/stocks', icon: TrendingUp },
    { name: 'Contests', path: '/contests', icon: Trophy },
    { name: 'Teams', path: '/portfolio', icon: Users },
    { name: 'Leaderboard', path: '/leaderboard', icon: Crown },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
  ]

  const bottomItems = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/profile', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
    <div className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 ${
      isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0 w-64') : (isCollapsed ? 'w-16' : 'w-64')
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            SPL
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 group ${
                  active
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-300 ${
                  active ? 'text-purple-400' : 'group-hover:scale-110'
                }`} />
                {!isCollapsed && (
                  <span className="transition-all duration-300">{item.name}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <div className="space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 group ${
                  active
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-300 ${
                  active ? 'text-purple-400' : 'group-hover:scale-110'
                }`} />
                {!isCollapsed && (
                  <span className="transition-all duration-300">{item.name}</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions (when expanded) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="space-y-3">
            <Link
              to="/create-team"
              className="flex items-center gap-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Target className="w-4 h-4" />
              Create Team
            </Link>
            <Link
              to="/contests"
              className="flex items-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300"
            >
              <Zap className="w-4 h-4" />
              Join Contest
            </Link>
          </div>
        </div>
      )}
    </div>
    
    {/* Mobile Overlay */}
    {isMobile && !isCollapsed && (
      <div 
        className="fixed inset-0 bg-black/50 z-30"
        onClick={onToggle}
      />
    )}
    </>
  )
}

export default Sidebar