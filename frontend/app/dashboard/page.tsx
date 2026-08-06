'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Flame, TrendingDown, Target, Activity } from 'lucide-react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { Logo } from '@/components/logo'

// Mock data for the dashboard since we don't have a real DB history yet
const weeklyData = [
  { name: 'Mon', calories: 1850, goal: 2000 },
  { name: 'Tue', calories: 2100, goal: 2000 },
  { name: 'Wed', calories: 1950, goal: 2000 },
  { name: 'Thu', calories: 1800, goal: 2000 },
  { name: 'Fri', calories: 2200, goal: 2000 },
  { name: 'Sat', calories: 2400, goal: 2000 },
  { name: 'Sun', calories: 1900, goal: 2000 },
]

const macroData = [
  { name: 'Protein', value: 30, fill: '#3b82f6' }, // blue-500
  { name: 'Fat', value: 25, fill: '#f59e0b' },    // amber-500
  { name: 'Carbs', value: 45, fill: '#22c55e' },   // green-500
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch for charts
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Link href="/chat" className="mr-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Chat</span>
          </Link>
          <div className="ml-auto">
            <Logo size="sm" />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
          <p className="text-muted-foreground">Here is a summary of your nutrition and activity this week.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Avg. Daily Calories</h3>
            </div>
            <div className="text-3xl font-bold">2,028 <span className="text-sm font-normal text-muted-foreground">kcal</span></div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-green-500" /> 1.2% from last week
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Goal Adherence</h3>
            </div>
            <div className="text-3xl font-bold">85<span className="text-sm font-normal text-muted-foreground">%</span></div>
            <p className="text-xs text-muted-foreground mt-2">5 days under limit</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Macro Distribution</h3>
            </div>
            <div className="mt-4 flex h-8 w-full overflow-hidden rounded-full bg-secondary">
              {macroData.map((macro) => (
                <div
                  key={macro.name}
                  style={{ width: `${macro.value}%`, backgroundColor: macro.fill }}
                  className="h-full transition-all duration-1000"
                  title={`${macro.name}: ${macro.value}%`}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs font-medium px-2">
              <span className="text-blue-500">Protein (30%)</span>
              <span className="text-amber-500">Fat (25%)</span>
              <span className="text-green-500">Carbs (45%)</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Weekly Calorie Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Calorie Intake (Past 7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goal vs Actual */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Intake vs Goal</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="goal" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" fillOpacity={0} />
                  <Area type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorCalories)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
