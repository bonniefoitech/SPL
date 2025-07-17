import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FloatingInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type
  const hasValue = value.length > 0
  const isFloating = isFocused || hasValue

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full px-4 pt-6 pb-2 bg-white/10 backdrop-blur-sm border rounded-xl
            text-white placeholder-transparent transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400 focus:ring-red-500/50 focus:border-red-400' : 'border-white/20'}
            ${type === 'password' ? 'pr-12' : ''}
          `}
          placeholder={label}
          required={required}
        />
        
        <label
          htmlFor={id}
          className={`
            absolute left-4 transition-all duration-300 pointer-events-none
            ${isFloating 
              ? 'top-2 text-xs text-purple-300' 
              : 'top-1/2 -translate-y-1/2 text-slate-400'
            }
            ${error ? 'text-red-300' : ''}
          `}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  )
}

export default FloatingInput