import React, { useState } from 'react'
import { Building2, Cpu, Heart, Zap, Car, Home, ShoppingBag, Banknote } from 'lucide-react'

interface StockCategoriesProps {
  onCategoryChange: (category: string) => void
  activeCategory: string
  className?: string
}

const categories = [
  { id: 'all', name: 'All Stocks', icon: Building2 },
  { id: 'technology', name: 'Technology', icon: Cpu },
  { id: 'healthcare', name: 'Healthcare', icon: Heart },
  { id: 'energy', name: 'Energy', icon: Zap },
  { id: 'automotive', name: 'Automotive', icon: Car },
  { id: 'real-estate', name: 'Real Estate', icon: Home },
  { id: 'consumer', name: 'Consumer', icon: ShoppingBag },
  { id: 'finance', name: 'Finance', icon: Banknote },
]

const StockCategories: React.FC<StockCategoriesProps> = ({ 
  onCategoryChange, 
  activeCategory,
  className = ""
}) => {
  return (
    <div className={`flex flex-nowrap md:flex-wrap gap-3 mb-6 sm:mb-8 ${className}`}>
      {categories.map((category) => {
        const Icon = category.icon
        const isActive = activeCategory === category.id
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap flex-shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.name}
          </button>
        )
      })}
    </div>
  )
}

export default StockCategories