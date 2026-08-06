import { Activity, Flame, Wheat, Beef, Droplet } from 'lucide-react'

interface NutritionCardProps {
  totalMin: number
  totalMax: number
  proteinG: number
  fatG: number
  carbsG: number
}

export function NutritionCard({ totalMin, totalMax, proteinG, fatG, carbsG }: NutritionCardProps) {
  const avgCalories = Math.round((totalMin + totalMax) / 2)
  const totalMacros = proteinG + fatG + carbsG || 1

  const pPct = Math.round((proteinG / totalMacros) * 100)
  const fPct = Math.round((fatG / totalMacros) * 100)
  const cPct = Math.round((carbsG / totalMacros) * 100)

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-sm mt-3 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-card-foreground">Energy</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-foreground">{avgCalories}</span>
          <span className="text-xs text-muted-foreground ml-1">kcal</span>
          <div className="text-[10px] text-muted-foreground">Est: {totalMin} - {totalMax}</div>
        </div>
      </div>

      {/* Macros */}
      <div className="p-4 space-y-4">
        {/* Protein */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="flex items-center gap-1 text-blue-500"><Beef className="w-3 h-3"/> Protein</span>
            <span>{proteinG}g <span className="text-muted-foreground font-normal">({pPct}%)</span></span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${pPct}%` }} />
          </div>
        </div>

        {/* Fat */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="flex items-center gap-1 text-amber-500"><Droplet className="w-3 h-3"/> Fat</span>
            <span>{fatG}g <span className="text-muted-foreground font-normal">({fPct}%)</span></span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${fPct}%` }} />
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="flex items-center gap-1 text-green-500"><Wheat className="w-3 h-3"/> Carbs</span>
            <span>{carbsG}g <span className="text-muted-foreground font-normal">({cPct}%)</span></span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${cPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
