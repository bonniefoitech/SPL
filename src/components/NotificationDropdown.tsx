import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { NotificationService, Notification } from '../services/notificationService'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trophy, 
  DollarSign, 
  Users, 
  AlertCircle,
  Gift,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const NotificationDropdown: React.FC = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
      
      // Set up real-time subscription
      const unsubscribe = NotificationService.subscribeToNotifications(
        user.id,
        (newNotification) => {
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          toast.success(newNotification.title)
        }
      )

      return unsubscribe
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await NotificationService.getUserNotifications(user.id)
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    if (!user) return
    
    try {
      const count = await NotificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await NotificationService.markAsRead(notificationId)
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    
    const success = await NotificationService.markAllAsRead(user.id)
    if (success) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contest': return Trophy
      case 'payment': return DollarSign
      case 'achievement': return Gift
      case 'system': return AlertCircle
      default: return Users
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'contest': return 'from-purple-400 to-pink-500'
      case 'payment': return 'from-emerald-400 to-green-500'
      case 'achievement': return 'from-amber-400 to-orange-500'
      case 'system': return 'from-red-400 to-pink-500'
      default: return 'from-blue-400 to-cyan-500'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-1 p-2">
                {notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type)
                  const gradient = getNotificationColor(notification.type)
                  
                  return (
                    <div
                      key={notification.id}
                      className={`group p-3 rounded-lg transition-all duration-300 hover:bg-white/10 animate-in slide-in-from-left-2 ${
                        !notification.is_read ? 'bg-purple-500/10 border-l-2 border-purple-400' : 'bg-white/5'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-white text-sm leading-tight">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-slate-400 hover:text-emerald-400 transition-colors duration-300 opacity-0 group-hover:opacity-100"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-slate-500 text-xs">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            
                            {notification.link && (
                              <Link
                                to={notification.link}
                                onClick={() => {
                                  setIsOpen(false)
                                  if (!notification.is_read) {
                                    handleMarkAsRead(notification.id)
                                  }
                                }}
                                className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition-colors duration-300"
                              >
                                View
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-white font-medium mb-2">No notifications</h3>
                <p className="text-slate-400 text-sm">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/20 bg-white/5">
              <Link 
                to="/notifications" 
                className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-300 block"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown