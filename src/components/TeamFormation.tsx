import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { TeamStock, StockRole, ROLE_CONFIGS, Team } from '../types/team'
import { Crown, Star, Shield, Target, Zap, Flame, X, Plus } from 'lucide-react'

interface TeamFormationProps {
  team: TeamStock[]
  onUpdateTeam: (team: TeamStock[]) => void
  disabled?: boolean
  onRemoveStock: (stockId: string) => void
  className?: string
}

const TeamFormation: React.FC<TeamFormationProps> = ({
  team,
  onUpdateTeam,
  disabled = false,
  onRemoveStock,
  className = ""
}) => {
  const [draggedStock, setDraggedStock] = useState<string | null>(null)

  const getRoleIcon = (role: StockRole) => {
    switch (role) {
      case 'captain': return Crown
      case 'all-rounder': return Star
      case 'vice-captain': return Shield
      case 'wicket-keeper': return Target
      case 'batsman': return Zap
      case 'bowler': return Flame
      default: return Plus
    }
  }

  const getStocksByRole = (role: StockRole) => {
    return team.filter(stock => stock.role === role)
  }

  const getRoleSlots = (role: StockRole) => {
    const stocks = getStocksByRole(role)
    const maxCount = ROLE_CONFIGS[role].maxCount
    const slots = []
    
    // Add existing stocks
    stocks.forEach(stock => slots.push(stock))
    
    // Add empty slots
    for (let i = stocks.length; i < maxCount; i++) {
      slots.push(null)
    }
    
    return slots
  }

  const handleDragEnd = (result: DropResult) => {
    if (disabled) return;
    
    setDraggedStock(null)
    
    if (!result.destination) return

    const { source, destination } = result
    const stockId = result.draggableId
    const stock = team.find(s => s.id === stockId)
    
    if (!stock) return

    // Extract role from destination droppableId
    const newRole = destination.droppableId.replace('role-', '') as StockRole
    
    if (stock.role === newRole) return

    // Check if role has available slots
    const roleStocks = getStocksByRole(newRole)
    if (roleStocks.length >= ROLE_CONFIGS[newRole].maxCount) return

    // Update stock role and multiplier
    const updatedTeam = team.map(s => 
      s.id === stockId 
        ? { ...s, role: newRole, multiplier: ROLE_CONFIGS[newRole].multiplier }
        : s
    )

    onUpdateTeam(updatedTeam)
  }

  const handleDragStart = (start: any) => {
    setDraggedStock(start.draggableId)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        {Object.entries(ROLE_CONFIGS).map(([roleKey, config], index) => {
          const role = roleKey as StockRole
          const slots = getRoleSlots(role)
          const Icon = getRoleIcon(role)
          
          return (
            <div 
              key={role} 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 animate-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    {config.name}
                    <span className={`text-sm px-2 py-1 rounded-full bg-white/10 ${config.color}`}>
                      {config.multiplier}x
                    </span>
                  </h3>
                  <p className="text-slate-400 text-sm">{config.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-sm">
                    {getStocksByRole(role).length}/{config.maxCount}
                  </span>
                </div>
              </div>

              <Droppable droppableId={`role-${role}`} direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-wrap gap-2 sm:gap-3 min-h-[80px] p-2 sm:p-3 rounded-lg border-2 border-dashed transition-all duration-300 ${
                      snapshot.isDraggingOver
                        ? 'border-purple-400 bg-purple-500/10'
                        : 'border-white/20'
                    }`}
                  >
                    {slots.map((stock, index) => (
                      <div key={`${role}-${index}`} className="flex-shrink-0">
                        {stock ? (
                          <Draggable draggableId={stock.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative group w-20 sm:w-24 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2 transition-all duration-300 cursor-move ${
                                  snapshot.isDragging
                                    ? 'scale-105 shadow-2xl bg-white/20'
                                    : 'hover:bg-white/20 hover:scale-105'
                                } ${
                                  draggedStock === stock.id ? 'opacity-50' : ''
                                }`}
                              >
                                <button
                                  disabled={disabled}
                                  onClick={() => onRemoveStock(stock.id)}
                                  className={`absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center ${disabled ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 z-10`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                
                                <div className="text-center">
                                  <div className={`w-8 h-8 mx-auto mb-1 rounded bg-gradient-to-r ${config.gradient} flex items-center justify-center`}>
                                    <span className="text-white font-bold text-xs">
                                      {stock.symbol.slice(0, 2)}
                                    </span>
                                  </div>
                                  <p className="text-white text-xs font-medium truncate">
                                    {stock.symbol}
                                  </p>
                                  <p className="text-slate-400 text-xs">
                                    {formatPrice(stock.price)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ) : (
                          <div className="w-20 sm:w-24 h-20 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                            <Plus className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </DragDropContext>
    </div>
  )
}

export default TeamFormation