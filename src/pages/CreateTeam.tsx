import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation'
import StockSearch from '../components/StockSearch'
import StockCard from '../components/StockCard'
import TeamFormation from '../components/TeamFormation'
import TeamBudgetTracker from '../components/TeamBudgetTracker'
import TeamValidation from '../components/TeamValidation'
import { TeamStock, StockRole, ROLE_CONFIGS, TEAM_BUDGET } from '../types/team'
import { StockQuote, StockSearchResult, stockApi } from '../services/stockApi'
import { Save, Eye, ArrowLeft, Shuffle, RefreshCw, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const CreateTeam: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [contestId, setContestId] = useState<string | null>(null)
  const [contestDetails, setContestDetails] = useState<any>(null)
  const [isTeamBuildingActive, setIsTeamBuildingActive] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [team, setTeam] = useState<TeamStock[]>([])
  const [availableStocks, setAvailableStocks] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    // Check for contest ID in query params
    const params = new URLSearchParams(location.search)
    const id = params.get('contestId')
    if (id) {
      setContestId(id)
      fetchContestDetails(id)
    } else {
      // Redirect if no contest ID provided
      toast.error('Please join a contest first to create a team')
      navigate('/contests')
    }
    
    fetchAvailableStocks()
  }, [])

  const fetchContestDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      setContestDetails(data)
      
      // Check if team building phase is active
      const teamBuildingEndTime = new Date(data.team_building_end_time)
      const now = new Date()
      
      if (now > teamBuildingEndTime) {
        setIsTeamBuildingActive(false)
        toast.error('Team building phase has ended for this contest')
      }
    } catch (error) {
      console.error('Error fetching contest details:', error)
      toast.error('Failed to load contest details')
      navigate('/contests')
    }
  }

  const fetchAvailableStocks = async () => {
    try {
      setLoading(true)
      const stocks = await stockApi.getTrendingStocks()
      setAvailableStocks(stocks)
    } catch (error) {
      console.error('Error fetching stocks:', error)
      toast.error('Failed to load stocks')
    } finally {
      setLoading(false)
    }
  }

  const getNextAvailableRole = (): StockRole => {
    const roleCounts = Object.keys(ROLE_CONFIGS).reduce((acc, role) => {
      acc[role as StockRole] = team.filter(stock => stock.role === role).length
      return acc
    }, {} as Record<StockRole, number>)

    // Find the first role that isn't full
    for (const [role, config] of Object.entries(ROLE_CONFIGS)) {
      if (roleCounts[role as StockRole] < config.maxCount) {
        return role as StockRole
      }
    }

    return 'batsman' // Default fallback
  }

  const handleStockSelect = async (searchResult: StockSearchResult) => {
    try {
      const stockQuote = await stockApi.getStockQuote(searchResult.symbol)
      if (!stockQuote) {
        toast.error('Failed to load stock details')
        return
      }

      handleAddStock(stockQuote)
    } catch (error) {
      toast.error('Failed to add stock to team')
    }
  }

  const handleAddStock = (stock: StockQuote) => {
    // Check if stock is already in team
    if (team.some(s => s.symbol === stock.symbol)) {
      toast.error('Stock already in your team')
      return
    }

    // Check team size limit
    if (team.length >= 11) {
      toast.error('Team is full! Maximum 11 stocks allowed')
      return
    }

    // Check budget
    const totalSpent = team.reduce((sum, s) => sum + s.price, 0)
    if (totalSpent + stock.price > TEAM_BUDGET) {
      toast.error('Adding this stock would exceed your budget')
      return
    }

    const role = getNextAvailableRole()
    const teamStock: TeamStock = {
      id: `${stock.symbol}-${Date.now()}`,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      sector: stock.sector || 'Unknown',
      logo: stock.logo,
      role,
      multiplier: ROLE_CONFIGS[role].multiplier
    }

    setTeam(prev => [...prev, teamStock])
    toast.success(`${stock.symbol} added to your team!`)
  }

  const handleRemoveStock = (stockId: string) => {
    setTeam(prev => prev.filter(stock => stock.id !== stockId))
    toast.success('Stock removed from team')
  }

  const handleUpdateTeam = (updatedTeam: TeamStock[]) => {
    setTeam(updatedTeam)
  }

  const handleAutoFill = () => {
    if (team.length >= 11) {
      toast.error('Team is already full')
      return
    }

    const remainingSlots = 11 - team.length
    const usedSymbols = team.map(s => s.symbol)
    const availableForTeam = availableStocks.filter(stock => 
      !usedSymbols.includes(stock.symbol)
    )

    if (availableForTeam.length < remainingSlots) {
      toast.error('Not enough stocks available to auto-fill')
      return
    }

    // Sort by performance and select top stocks within budget
    const totalSpent = team.reduce((sum, s) => sum + s.price, 0)
    const remainingBudget = TEAM_BUDGET - totalSpent
    const avgBudgetPerStock = remainingBudget / remainingSlots

    const suitableStocks = availableForTeam
      .filter(stock => stock.price <= avgBudgetPerStock * 1.5) // Allow some flexibility
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, remainingSlots)

    const newTeamStocks: TeamStock[] = suitableStocks.map(stock => {
      const role = getNextAvailableRole()
      return {
        id: `${stock.symbol}-${Date.now()}-${Math.random()}`,
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        sector: stock.sector || 'Unknown',
        logo: stock.logo,
        role,
        multiplier: ROLE_CONFIGS[role].multiplier
      }
    })

    setTeam(prev => [...prev, ...newTeamStocks])
    toast.success(`Auto-filled ${newTeamStocks.length} stocks!`)
  }

  const handleSaveTeam = useCallback(async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name')
      return
    }

    if (team.length !== 11) {
      toast.error('Team must have exactly 11 stocks')
      return
    }

    const totalSpent = team.reduce((sum, stock) => sum + stock.price, 0)
    if (totalSpent > TEAM_BUDGET) {
      toast.error('Team exceeds budget limit')
      return
    }
    
    if (!contestId) {
      toast.error('No contest selected')
      return
    }
    
    if (!isTeamBuildingActive) {
      toast.error('Team building phase has ended for this contest')
      return
    }

    setSaving(true)
    try {
      // Save team to database
      const teamData = {
        name: teamName,
        user_id: user?.id,
        stocks: team,
        total_value: totalSpent
      }
      
      const { data: savedTeam, error: teamError } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single()
      
      if (teamError) throw teamError
      
      // Join contest with the new team
      const { error: participantError } = await supabase
        .from('contest_participants')
        .upsert({
          contest_id: contestId,
          user_id: user?.id,
          team_id: savedTeam.id
        })
      
      if (participantError) throw participantError
      
      toast.success('Team saved and entered into contest!')
      navigate(`/contests/${contestId}`)
    } catch (error) {
      console.error('Error saving team:', error)
      toast.error('Failed to save team and join contest')
    } finally {
      setSaving(false)
    }
  }, [teamName, team, contestId, isTeamBuildingActive, user, navigate])

  const isTeamValid = () => {
    if (!teamName.trim() || team.length !== 11) return false
    
    const totalSpent = team.reduce((sum, stock) => sum + stock.price, 0)
    if (totalSpent > TEAM_BUDGET) return false

    // Check role requirements
    for (const [role, config] of Object.entries(ROLE_CONFIGS)) {
      const roleCount = team.filter(stock => stock.role === role).length
      if (roleCount !== config.maxCount) return false
    }

    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Create Your Dream Team
                {contestDetails && ` for ${contestDetails.title}`}
              </h1>
              <p className="text-slate-300">
                Build your portfolio of 11 stocks with strategic roles
                {contestDetails?.team_building_end_time && (
                  <span className="ml-2 text-amber-400">
                    (Deadline: {new Date(contestDetails.team_building_end_time).toLocaleString()})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-3 sm:px-4 py-2 rounded-lg transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={handleAutoFill}
              disabled={team.length >= 11}
              className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle className="w-4 h-4" />
              Auto Fill
            </button>
          </div>
        </div>

        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Team Building */}
            <div className="lg:col-span-2 space-y-8">
              {!isTeamBuildingActive && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-semibold">Team Building Phase Ended</span>
                  </div>
                  <p className="text-red-300 text-sm">
                    The team building phase for this contest has ended. You can view your team but cannot make changes.
                  </p>
                </div>
              )}
              
              {/* Team Name */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name..."
                  disabled={!isTeamBuildingActive}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
                />
              </div>

              {/* Stock Search */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add Stocks to Your Team</h3>
                <StockSearch
                  onStockSelect={handleStockSelect}
                  disabled={!isTeamBuildingActive}
                  placeholder="Search for stocks to add to your team..."
                />
              </div>

              {/* Available Stocks */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Trending Stocks</h3>
                  <button
                    onClick={fetchAvailableStocks}
                    disabled={!isTeamBuildingActive}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, index) => (
                      <StockCard key={index} stock={{} as StockQuote} loading={true} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {availableStocks.map((stock, index) => (
                      <div
                        key={stock.symbol}
                        className="animate-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <StockCard
                          stock={stock}
                          onAddToTeam={handleAddStock}
                          disabled={!isTeamBuildingActive}
                          isInTeam={team.some(s => s.symbol === stock.symbol)}
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team Formation */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Team Formation</h3>
                <TeamFormation
                  team={team}
                  onUpdateTeam={handleUpdateTeam}
                  disabled={!isTeamBuildingActive}
                  onRemoveStock={handleRemoveStock}
                />
              </div>
            </div>

            {/* Right Column - Team Management */}
            <div className="space-y-6">
              <TeamBudgetTracker team={team} />
              <TeamValidation team={team} teamName={teamName} />
              
              {/* Save Button */}
              <button
                onClick={handleSaveTeam}
                disabled={!isTeamValid() || saving || !isTeamBuildingActive}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Team...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Team
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {teamName || 'Unnamed Team'} - Preview
              </h2>
              
              <TeamFormation
                team={team}
                onUpdateTeam={() => {}} // Read-only in preview
                onRemoveStock={() => {}} // Read-only in preview
              />
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <TeamBudgetTracker team={team} />
                <TeamValidation team={team} teamName={teamName} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateTeam