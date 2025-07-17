import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import { 
  Trophy,
  Users, 
  DollarSign, 
  Calendar,
  Clock,
  Target,
  Crown,
  Star,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Edit,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import "react-datepicker/dist/react-datepicker.css"

// Validation schema
const contestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  contestType: z.enum(['head-to-head', 'tournament', 'mega-contest']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  entryFee: z.number().min(0, 'Entry fee cannot be negative').max(10000, 'Entry fee too high'),
  maxParticipants: z.number().min(2, 'Minimum 2 participants').max(10000, 'Too many participants'),
  startTime: z.date().min(new Date(), 'Start time must be in the future'),
  teamBuildingEndTime: z.date(),
  endTime: z.date(),
  prizeDistribution: z.object({
    firstPlace: z.number().min(30, 'First place minimum 30%').max(70, 'First place maximum 70%'),
    secondPlace: z.number().min(10, 'Second place minimum 10%').max(40, 'Second place maximum 40%'),
    thirdPlace: z.number().min(5, 'Third place minimum 5%').max(30, 'Third place maximum 30%'),
    platformFee: z.number().min(15, 'Platform fee minimum 15%').max(25, 'Platform fee maximum 25%')
  })
}).refine((data) => data.endTime > data.startTime, {
  message: "Contest end time must be after start time",
  path: ["endTime"]
}).refine((data) => data.startTime > data.teamBuildingEndTime, {
  message: "Start time must be after team building end time",
  path: ["startTime"]
}).refine((data) => {
  const { firstPlace, secondPlace, thirdPlace, platformFee } = data.prizeDistribution
  return firstPlace + secondPlace + thirdPlace + platformFee <= 100
}, {
  message: "Prize distribution cannot exceed 100%",
  path: ["prizeDistribution"]
})

type ContestFormData = z.infer<typeof contestSchema>

interface ContestCreationFormProps {
  onClose: () => void
  onSuccess?: () => void
}

const ContestCreationForm: React.FC<ContestCreationFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  // Function to get next trading day (Mon-Fri) at specified hour and minute
  function getNextTradingDay(hour: number, minute: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Start with tomorrow
    
    // Adjust to next weekday if weekend
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0) date.setDate(date.getDate() + 1); // If Sunday, move to Monday
    if (day === 6) date.setDate(date.getDate() + 2); // If Saturday, move to Monday
    
    // Set time
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger
  } = useForm<ContestFormData>({
    resolver: zodResolver(contestSchema),
    defaultValues: {
      title: '',
      description: '',
      contestType: 'tournament',
      difficulty: 'intermediate',
      entryFee: 100,
      maxParticipants: 100,
      // Set default times for next trading day
      teamBuildingEndTime: getNextTradingDay(9, 0), // 9:00 AM
      startTime: getNextTradingDay(9, 30), // 9:30 AM
      endTime: getNextTradingDay(15, 30), // 3:30 PM
      prizeDistribution: {
        firstPlace: 50,
        secondPlace: 25,
        thirdPlace: 10,
        platformFee: 15
      }
    },
    mode: 'onChange'
  })

  const watchedValues = watch()
  const contestType = watch('contestType')
  const entryFee = watch('entryFee')
  const maxParticipants = watch('maxParticipants')
  const prizeDistribution = watch('prizeDistribution')

  // Auto-calculate prize pool
  const prizePool = entryFee * maxParticipants
  const platformFeeAmount = (prizePool * prizeDistribution.platformFee) / 100
  const totalPrizeAmount = prizePool - platformFeeAmount

  const steps = [
    { id: 1, name: 'Basic Info', icon: Trophy },
    { id: 2, name: 'Settings', icon: Users },
    { id: 3, name: 'Schedule', icon: Calendar },
    { id: 4, name: 'Prizes', icon: DollarSign },
    { id: 5, name: 'Review', icon: CheckCircle }
  ]

  const contestTypes = [
    {
      id: 'head-to-head',
      name: 'Head-to-Head',
      description: 'Direct competition between 2 players',
      icon: Target,
      gradient: 'from-blue-400 to-cyan-500',
      maxParticipants: 2
    },
    {
      id: 'tournament',
      name: 'Tournament',
      description: 'Multiple players compete for rankings',
      icon: Trophy,
      gradient: 'from-purple-400 to-pink-500',
      maxParticipants: 1000
    },
    {
      id: 'mega-contest',
      name: 'Mega Contest',
      description: 'Large-scale competition with big prizes',
      icon: Crown,
      gradient: 'from-amber-400 to-orange-500',
      maxParticipants: 10000
    }
  ]

  // Auto-adjust max participants based on contest type
  useEffect(() => {
    const selectedType = contestTypes.find(type => type.id === contestType)
    if (selectedType && contestType === 'head-to-head') {
      setValue('maxParticipants', 2)
    }
  }, [contestType, setValue])

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)
    
    if (isStepValid && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['title', 'description', 'contestType', 'difficulty'] as const
      case 2:
        return ['entryFee', 'maxParticipants'] as const
      case 3:
        return ['teamBuildingEndTime', 'startTime', 'endTime'] as const
      case 4:
        return ['prizeDistribution'] as const
      default:
        return []
    }
  }

  const saveDraft = async () => {
    setIsDraft(true)
    try {
      // Save to local storage or database as draft
      localStorage.setItem('contestDraft', JSON.stringify(watchedValues))
      toast.success('Draft saved successfully!')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setIsDraft(false)
    }
  }

  const onSubmit = async (data: ContestFormData) => {
    if (!user) {
      toast.error('You must be logged in to create contests')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('contests')
        .insert({
          title: data.title,
          description: data.description,
          entry_fee: data.entryFee,
          difficulty: data.difficulty,
          prize_pool: prizePool,
          max_participants: data.maxParticipants,
          contest_type: data.contestType,
          team_building_end_time: data.teamBuildingEndTime.toISOString(),
          start_time: data.startTime.toISOString(),
          end_time: data.endTime.toISOString(),
          status: 'upcoming',
          created_by: user.id
        })

      if (error) throw error

      // Clear draft
      localStorage.removeItem('contestDraft')
      
      toast.success('Contest created successfully!')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contest')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Create New Contest
            </h2>
            <p className="text-purple-200/80 mt-1">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            ✕
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 sm:px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500' 
                        : isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className={`font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-purple-200/60'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                      isCompleted ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Contest Title *
                  </label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Enter contest title..."
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                      />
                    )}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Description *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <textarea
                          {...field}
                          rows={4}
                          placeholder="Describe your contest..."
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 resize-none"
                        />
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-purple-300/60">
                            {field.value?.length || 0}/500 characters
                          </span>
                        </div>
                      </div>
                    )}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2 sm:mb-4">
                    Difficulty Level *
                  </label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'beginner', name: 'Beginner', color: 'from-green-400 to-emerald-500' },
                          { id: 'intermediate', name: 'Intermediate', color: 'from-blue-400 to-cyan-500' },
                          { id: 'advanced', name: 'Advanced', color: 'from-purple-400 to-pink-500' }
                        ].map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => field.onChange(level.id)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              field.value === level.id
                                ? `bg-gradient-to-r ${level.color} border-transparent text-white`
                                : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                            }`}
                          >
                            <h3 className="font-semibold">{level.name}</h3>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2 sm:mb-4">
                    Contest Type *
                  </label>
                  <Controller
                    name="contestType"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {contestTypes.map((type) => {
                          const Icon = type.icon
                          const isSelected = field.value === type.id
                          
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => field.onChange(type.id)}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                isSelected
                                  ? `bg-gradient-to-r ${type.gradient} border-transparent text-white`
                                  : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                              }`}
                            >
                              <Icon className="w-8 h-8 mx-auto mb-3" />
                              <h3 className="font-semibold mb-2">{type.name}</h3>
                              <p className="text-sm opacity-80">{type.description}</p>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contest Settings */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Entry Fee *
                    </label>
                    <Controller
                      name="entryFee"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                          <input
                            {...field}
                            type="number"
                            min="0"
                            step="1"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                          />
                        </div>
                      )}
                    />
                    {errors.entryFee && (
                      <p className="mt-2 text-sm text-red-400">{errors.entryFee.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Max Participants *
                    </label>
                    <Controller
                      name="maxParticipants"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-3">
                          <input
                            type="range"
                            min="2"
                            max={contestTypes.find(t => t.id === contestType)?.maxParticipants || 1000}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={contestType === 'head-to-head'}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-sm text-purple-300">
                            <span>2</span>
                            <span className="font-semibold text-white">{field.value}</span>
                            <span>{contestTypes.find(t => t.id === contestType)?.maxParticipants}</span>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Prize Pool Preview */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-emerald-400">Estimated Prize Pool</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(prizePool)}
                  </p>
                  <p className="text-emerald-300 text-sm">
                    {maxParticipants} participants × {formatCurrency(entryFee)} entry fee
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Contest Schedule Requirements</h4>
                      <ul className="text-amber-300/80 text-sm space-y-1">
                        <li>• Contests must be created at least one day in advance</li>
                        <li>• Team building must end by 9:00 AM on contest day</li>
                        <li>• Contest results will be displayed after 3:30 PM</li>
                        <li>• Contests can only be held on weekdays (Monday-Friday)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Team Building Deadline *
                    </label>
                    <Controller
                      name="teamBuildingEndTime"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                        />
                      )}
                    />
                    {errors.teamBuildingEndTime && (
                      <p className="mt-2 text-sm text-red-400">{errors.teamBuildingEndTime.message}</p>
                    )}
                    <p className="mt-1 text-xs text-purple-300/60">
                      Users must submit teams by this time
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Contest Start Time *
                    </label>
                    <Controller
                      name="startTime"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={watchedValues.teamBuildingEndTime}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                        />
                      )}
                    />
                    {errors.startTime && (
                      <p className="mt-2 text-sm text-red-400">{errors.startTime.message}</p>
                    )}
                    <p className="mt-1 text-xs text-purple-300/60">
                      When the contest officially begins
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Results Time *
                    </label>
                    <Controller
                      name="endTime"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={watchedValues.startTime}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                        />
                      )}
                    />
                    {errors.endTime && (
                      <p className="mt-2 text-sm text-red-400">{errors.endTime.message}</p>
                    )}
                    <p className="mt-1 text-xs text-purple-300/60">
                      When results will be displayed (after 3:30 PM)
                    </p>
                  </div>
                </div>

                {/* Schedule Timeline */}
                <div className="bg-white/5 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Contest Timeline</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/20"></div>
                    
                    <div className="relative pl-10 pb-8">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Contest Created</h4>
                        <p className="text-purple-300/60 text-sm">
                          {format(new Date(), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative pl-10 pb-8">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Team Building Ends</h4>
                        <p className="text-purple-300/60 text-sm">
                          {format(watchedValues.teamBuildingEndTime, "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative pl-10 pb-8">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Contest Starts</h4>
                        <p className="text-purple-300/60 text-sm">
                          {format(watchedValues.startTime, "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative pl-10">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Results Announced</h4>
                        <p className="text-purple-300/60 text-sm">
                          {format(watchedValues.endTime, "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Prize Distribution */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Prize Distribution
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-purple-200">
                          1st Place
                        </label>
                        <span className="text-white font-semibold">
                          {prizeDistribution.firstPlace}% - {formatCurrency((totalPrizeAmount * prizeDistribution.firstPlace) / 100)}
                        </span>
                      </div>
                      <Controller
                        name="prizeDistribution.firstPlace"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="range"
                            min="30"
                            max="70"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        )}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-purple-200">
                          2nd Place
                        </label>
                        <span className="text-white font-semibold">
                          {prizeDistribution.secondPlace}% - {formatCurrency((totalPrizeAmount * prizeDistribution.secondPlace) / 100)}
                        </span>
                      </div>
                      <Controller
                        name="prizeDistribution.secondPlace"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="range"
                            min="10"
                            max="40"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        )}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-purple-200">
                          3rd Place
                        </label>
                        <span className="text-white font-semibold">
                          {prizeDistribution.thirdPlace}% - {formatCurrency((totalPrizeAmount * prizeDistribution.thirdPlace) / 100)}
                        </span>
                      </div>
                      <Controller
                        name="prizeDistribution.thirdPlace"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="range"
                            min="5"
                            max="30"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        )}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-purple-200">
                          Platform Fee
                        </label>
                        <span className="text-amber-400 font-semibold">
                          {prizeDistribution.platformFee}% - {formatCurrency(platformFeeAmount)}
                        </span>
                      </div>
                      <Controller
                        name="prizeDistribution.platformFee"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="range"
                            min="15"
                            max="25"
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Distribution Summary */}
                  <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-purple-200">Total Distribution:</span>
                      <span className={`font-semibold ${
                        prizeDistribution.firstPlace + prizeDistribution.secondPlace + prizeDistribution.thirdPlace + prizeDistribution.platformFee === 100
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {prizeDistribution.firstPlace + prizeDistribution.secondPlace + prizeDistribution.thirdPlace + prizeDistribution.platformFee}%
                      </span>
                    </div>
                  </div>

                  {errors.prizeDistribution && (
                    <p className="mt-2 text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
                      {errors.prizeDistribution.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Contest Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white">{watchedValues.title}</h4>
                        <p className="text-purple-200/80 text-sm mt-1">{watchedValues.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-200 text-sm">Contest Type</span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="p-1 text-purple-300 hover:text-white transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-white font-semibold capitalize">
                          {watchedValues.contestType.replace('-', ' ')}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-200 text-sm">Entry Fee</span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="p-1 text-purple-300 hover:text-white transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-white font-semibold">
                          {formatCurrency(watchedValues.entryFee)}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <span className="text-purple-200 text-sm">Max Participants</span>
                        <p className="text-white font-semibold">{watchedValues.maxParticipants}</p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <span className="text-purple-200 text-sm">Prize Pool</span>
                        <p className="text-white font-semibold">{formatCurrency(prizePool)}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-200 text-sm">Duration</span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="p-1 text-purple-300 hover:text-white transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-white font-semibold">
                        {formatDuration(watchedValues.startTime, watchedValues.endTime)}
                      </p>
                      <p className="text-purple-200/60 text-xs mt-1">
                        {watchedValues.startTime.toLocaleDateString()} - {watchedValues.endTime.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Terms & Conditions</h4>
                      <ul className="text-amber-300/80 text-sm space-y-1">
                        <li>• Contest cannot be modified once participants join</li>
                        <li>• Platform fee is automatically deducted from prize pool</li>
                        <li>• Minimum 2 participants required to start contest</li>
                        <li>• Contest will be cancelled if minimum not met</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-t border-white/20 gap-4 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            
            <button
              type="button"
              onClick={saveDraft}
              disabled={isDraft}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {isDraft ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Draft
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-4 sm:px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Contest...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    Create Contest
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .react-datepicker-wrapper {
          width: 100%;
        }

        .react-datepicker__input-container input {
          width: 100% !important;
        }
      `}</style>
    </div>
  )
}

export default ContestCreationForm