import React from 'react'
import { AlertCircle } from 'lucide-react'

interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories: number | null
  protein_g: number | null
  fat_g: number | null
  carbs_g: number | null
  fiber_g: number | null
  source: string
  confidence: string
  warning?: string
}

export function FoodItemCard({ item }: { item: FoodItem }) {
  const needsClarification = item.calories === null;

  return (
    <div className={`bg-card/50 backdrop-blur-md border p-4 rounded-xl shadow-sm ${needsClarification ? 'border-amber-500/50' : 'border-border'}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-foreground capitalize">
          {item.name}
        </h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {item.quantity} {item.unit}
        </span>
      </div>
      
      {needsClarification ? (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-600 dark:text-amber-400">
            {item.warning || 'Nutrition information missing. Please provide more specific details.'}
          </div>
        </div>
      ) : (
        <>
          {/* Calories - Big & Bold */}
          <div className="text-3xl font-bold text-primary mb-4 flex items-baseline gap-1">
            {item.calories} <span className="text-sm font-normal text-muted-foreground">kcal</span>
          </div>
          
          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center transition-colors hover:bg-blue-500/20">
              <div className="text-blue-500 font-semibold mb-1">Protein</div>
              <div className="text-foreground font-bold">{item.protein_g}g</div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center transition-colors hover:bg-amber-500/20">
              <div className="text-amber-500 font-semibold mb-1">Fat</div>
              <div className="text-foreground font-bold">{item.fat_g}g</div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center transition-colors hover:bg-green-500/20">
              <div className="text-green-500 font-semibold mb-1">Carbs</div>
              <div className="text-foreground font-bold">{item.carbs_g}g</div>
            </div>
          </div>
        </>
      )}
      
      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span>Source: <span className="capitalize font-medium text-foreground/70">{item.source}</span></span>
          <span className={`px-1.5 py-0.5 rounded text-background ${item.confidence === 'high' ? 'bg-green-500/80' : item.confidence === 'medium' ? 'bg-amber-500/80' : 'bg-red-500/80'}`}>
            {item.confidence} confidence
          </span>
        </div>
      </div>
    </div>
  )
}
