import React from 'react'

interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories_min: number
  calories_max: number
  protein_g: number
  fat_g: number
  carbs_g: number
  source: string
}

export function FoodItemCard({ item }: { item: FoodItem }) {
  // Average the min/max calories for a single clean display number
  const avgCalories = Math.round((item.calories_min + item.calories_max) / 2)

  return (
    <div className="bg-card/50 backdrop-blur-md border border-border p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-foreground capitalize">
          {item.name}
        </h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {item.quantity} {item.unit}
        </span>
      </div>
      
      {/* Calories - Big & Bold */}
      <div className="text-3xl font-bold text-primary mb-4 flex items-baseline gap-1">
        {avgCalories} <span className="text-sm font-normal text-muted-foreground">kcal</span>
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
      
      {/* Source Badge */}
      <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
        <span>Data source</span>
        <span className="capitalize font-medium text-foreground/70">{item.source}</span>
      </div>
    </div>
  )
}
