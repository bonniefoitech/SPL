import React, { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
  className?: string
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  type?: 'starts' | 'ends'
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  className = "",
  showLabels = true,
  size = 'md',
  type = 'starts'
}) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      
      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true
        })
        
        if (onComplete) {
          onComplete()
        }
        
        return
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isComplete: false
      })
    }
    
    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)
    
    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0')
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          box: 'p-1 min-w-[40px]',
          time: 'text-base',
          label: 'text-xs'
        }
      case 'lg':
        return {
          container: 'p-6',
          box: 'p-3 min-w-[70px]',
          time: 'text-3xl',
          label: 'text-sm'
        }
      default: // md
        return {
          container: 'p-4',
          box: 'p-2 min-w-[50px]',
          time: 'text-xl',
          label: 'text-xs'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (timeRemaining.isComplete) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl ${sizeClasses.container} text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 text-emerald-400">
          <Clock className="w-5 h-5" />
          <span className="font-medium">{type === 'starts' ? 'Started' : 'Ended'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl ${sizeClasses.container} ${className}`}>
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2 text-slate-300 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{type === 'starts' ? 'Starts In' : 'Ends In'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Days', value: timeRemaining.days },
          { label: 'Hours', value: timeRemaining.hours },
          { label: 'Mins', value: timeRemaining.minutes },
          { label: 'Secs', value: timeRemaining.seconds }
        ].map((item) => (
          <div key={item.label} className={`bg-white/10 rounded-lg ${sizeClasses.box}`}>
            <div className={`${sizeClasses.time} font-bold text-white font-mono`}>
              {formatTime(item.value)}
            </div>
            {showLabels && (
              <div className={`${sizeClasses.label} text-slate-400`}>{item.label}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CountdownTimer