import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import FloatingInput from '../components/FloatingInput'
import AvatarUpload from '../components/AvatarUpload'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Loader2,
  Shield,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileData {
  fullName: string
  email: string
  phone: string
  location: string
  bio: string
  dateOfBirth: string
  avatar?: File | null
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    dateOfBirth: '',
    avatar: null
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showStats: true,
    showActivity: false
  })

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (file: File | null) => {
    setProfileData(prev => ({ ...prev, avatar: file }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification preferences updated!')
    } catch (error) {
      toast.error('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-slate-300">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-6 sticky top-24">
              <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-400/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Profile Picture</h2>
                  <AvatarUpload
                    currentAvatar={undefined}
                    onAvatarChange={handleAvatarChange}
                    loading={loading}
                  />
                </div>

                {/* Personal Information */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      id="fullName"
                      label="Full Name"
                      value={profileData.fullName}
                      onChange={(value) => handleInputChange('fullName', value)}
                      disabled={loading}
                    />
                    
                    <FloatingInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      disabled={true}
                    />
                    
                    <FloatingInput
                      id="phone"
                      label="Phone Number"
                      type="tel"
                      value={profileData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      disabled={loading}
                    />
                    
                    <FloatingInput
                      id="location"
                      label="Location"
                      value={profileData.location}
                      onChange={(value) => handleInputChange('location', value)}
                      disabled={loading}
                    />
                    
                    <FloatingInput
                      id="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(value) => handleInputChange('dateOfBirth', value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={loading}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                    { key: 'push', label: 'Push Notifications', description: 'Browser and mobile notifications' },
                    { key: 'sms', label: 'SMS Notifications', description: 'Text message alerts' },
                    { key: 'marketing', label: 'Marketing Communications', description: 'Promotional emails and offers' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h3 className="font-medium text-white">{item.label}</h3>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                            : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                            notifications[item.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  {[
                    { key: 'profileVisible', label: 'Public Profile', description: 'Make your profile visible to other users' },
                    { key: 'showStats', label: 'Show Statistics', description: 'Display your performance stats publicly' },
                    { key: 'showActivity', label: 'Show Activity', description: 'Let others see your recent activity' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h3 className="font-medium text-white">{item.label}</h3>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                          privacy[item.key as keyof typeof privacy]
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                            : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                            privacy[item.key as keyof typeof privacy] ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-400/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-400 mb-1">Data Protection</h3>
                      <p className="text-amber-300/80 text-sm">
                        Your data is encrypted and protected. We never share personal information with third parties without your consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile