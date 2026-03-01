import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { api } from '../lib/api'
import { lastNDays } from '../lib/dates'
import type { Meal, ExerciseLog, SleepLog, MoodLog, NauseaLog } from '../../../../shared/types'

type Range = 7 | 30 | 90

interface DayPoint {
  date: string
  label: string
  sleepHours?: number
  sleepQuality?: number
  mood?: number
  energy?: number
  exerciseMinutes?: number
  mealsLogged?: number
  nausea?: number
}

function buildPoints(
  days: string[],
  meals: Meal[],
  exercise: ExerciseLog[],
  sleep: SleepLog[],
  mood: MoodLog[],
  nausea: NauseaLog[]
): DayPoint[] {
  const mealsMap: Record<string, number> = {}
  meals.forEach((m) => { mealsMap[m.date] = (mealsMap[m.date] ?? 0) + 1 })

  const exMap: Record<string, number> = {}
  exercise.forEach((e) => { exMap[e.date] = (exMap[e.date] ?? 0) + e.duration })

  const sleepMap: Record<string, SleepLog> = {}
  sleep.forEach((s) => { sleepMap[s.date] = s })

  const moodMap: Record<string, MoodLog> = {}
  mood.forEach((m) => { moodMap[m.date] = m })

  const nauseaMap: Record<string, number> = {}
  nausea.forEach((n) => {
    nauseaMap[n.date] = Math.max(nauseaMap[n.date] ?? 0, n.level)
  })

  return days.map((d) => ({
    date: d,
    label: format(parseISO(d), 'MMM d'),
    sleepHours: sleepMap[d]?.hours,
    sleepQuality: sleepMap[d]?.quality,
    mood: moodMap[d]?.mood,
    energy: moodMap[d]?.energy,
    exerciseMinutes: exMap[d],
    mealsLogged: mealsMap[d] ?? 0,
    nausea: nauseaMap[d]
  }))
}

const tickStyle = { fontSize: 11 }

// ── Insights ──────────────────────────────────────────────────────────────────

interface Insight {
  label: string
  value: string
  detail: string
}

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function computeInsights(points: DayPoint[]): Insight[] {
  const insights: Insight[] = []

  const withSleep = points.filter((p) => p.sleepHours != null)
  const withMood  = points.filter((p) => p.mood != null)
  const withNausea = points.filter((p) => p.nausea != null)
  const activeDays = points.filter((p) => p.exerciseMinutes != null && p.exerciseMinutes > 0)
  const restDays   = points.filter((p) => p.exerciseMinutes == null || p.exerciseMinutes === 0)

  // Sleep vs mood
  if (withSleep.length >= 4 && withMood.length >= 4) {
    const goodSleep = points.filter((p) => p.sleepHours != null && p.sleepHours >= 7 && p.mood != null)
    const poorSleep = points.filter((p) => p.sleepHours != null && p.sleepHours < 7  && p.mood != null)
    if (goodSleep.length >= 2 && poorSleep.length >= 2) {
      const gMood = avg(goodSleep.map((p) => p.mood!))
      const pMood = avg(poorSleep.map((p) => p.mood!))
      const diff = gMood - pMood
      if (Math.abs(diff) >= 0.3) {
        insights.push({
          label: 'Sleep & mood',
          value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} mood on 7h+ nights`,
          detail: `${gMood.toFixed(1)}/5 after good sleep vs ${pMood.toFixed(1)}/5 after poor sleep`
        })
      }
    }
  }

  // Sleep vs nausea
  if (withSleep.length >= 4 && withNausea.length >= 4) {
    const goodSleep = points.filter((p) => p.sleepHours != null && p.sleepHours >= 7 && p.nausea != null)
    const poorSleep = points.filter((p) => p.sleepHours != null && p.sleepHours < 7  && p.nausea != null)
    if (goodSleep.length >= 2 && poorSleep.length >= 2) {
      const gNausea = avg(goodSleep.map((p) => p.nausea!))
      const pNausea = avg(poorSleep.map((p) => p.nausea!))
      const diff = gNausea - pNausea
      if (Math.abs(diff) >= 0.5) {
        insights.push({
          label: 'Sleep & nausea',
          value: `${diff < 0 ? '' : '+'}${diff.toFixed(1)} nausea on 7h+ nights`,
          detail: `Avg ${gNausea.toFixed(1)}/10 after good sleep vs ${pNausea.toFixed(1)}/10 after poor sleep`
        })
      }
    }
  }

  // Exercise vs mood
  if (activeDays.length >= 2 && restDays.length >= 2) {
    const activeMoods = activeDays.filter((p) => p.mood != null)
    const restMoods   = restDays.filter((p) => p.mood != null)
    if (activeMoods.length >= 2 && restMoods.length >= 2) {
      const aMood = avg(activeMoods.map((p) => p.mood!))
      const rMood = avg(restMoods.map((p) => p.mood!))
      const diff = aMood - rMood
      if (Math.abs(diff) >= 0.3) {
        insights.push({
          label: 'Exercise & mood',
          value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} mood on active days`,
          detail: `${aMood.toFixed(1)}/5 on active days vs ${rMood.toFixed(1)}/5 on rest days`
        })
      }
    }
  }

  // Average sleep
  if (withSleep.length >= 3) {
    const a = avg(withSleep.map((p) => p.sleepHours!))
    insights.push({ label: 'Avg sleep', value: `${a.toFixed(1)}h / night`, detail: `Over ${withSleep.length} nights logged` })
  }

  // Average mood
  if (withMood.length >= 3) {
    const a = avg(withMood.map((p) => p.mood!))
    insights.push({ label: 'Avg mood', value: `${a.toFixed(1)} / 5`, detail: `Over ${withMood.length} days logged` })
  }

  // Exercise frequency
  if (points.length >= 5) {
    const pct = Math.round((activeDays.length / points.length) * 100)
    insights.push({ label: 'Active days', value: `${activeDays.length} of ${points.length}`, detail: `${pct}% of days with exercise logged` })
  }

  // High-nausea days
  if (withNausea.length >= 3) {
    const high = withNausea.filter((p) => p.nausea! >= 6).length
    insights.push({ label: 'High nausea days', value: `${high} of ${withNausea.length}`, detail: 'Days with nausea level ≥ 6' })
  }

  return insights
}

export default function Trends(): JSX.Element {
  const [range, setRange] = useState<Range>(7)
  const [points, setPoints] = useState<DayPoint[]>([])

  useEffect(() => {
    const days = lastNDays(range)
    const from = days[0]
    const to = days[days.length - 1]
    Promise.all([
      api.meals.getRange(from, to),
      api.exercise.getRange(from, to),
      api.sleep.getRange(from, to),
      api.mood.getRange(from, to),
      api.nausea.getRange(from, to)
    ]).then(([meals, exercise, sleep, mood, nausea]) => {
      setPoints(buildPoints(days, meals, exercise, sleep, mood, nausea))
    })
  }, [range])

  const xInterval = range === 7 ? 0 : range === 30 ? 4 : 13

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trends</h1>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {([7, 30, 90] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                range === r
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <ChartCard title="Sleep — Hours per night">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" interval={xInterval} tick={tickStyle} />
              <YAxis domain={[0, 12]} tick={tickStyle} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sleepHours" name="Hours" stroke="#8b5cf6" strokeWidth={2} dot={range <= 30} connectNulls />
              <Line type="monotone" dataKey="sleepQuality" name="Quality (1-5)" stroke="#c4b5fd" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mood & Energy">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" interval={xInterval} tick={tickStyle} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={tickStyle} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood" name="Mood" stroke="#f97316" strokeWidth={2} dot={range <= 30} connectNulls />
              <Line type="monotone" dataKey="energy" name="Energy" stroke="#fbbf24" strokeWidth={2} dot={range <= 30} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Exercise — Minutes active per day">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" interval={xInterval} tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip />
              <Bar dataKey="exerciseMinutes" name="Minutes" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Meals logged per day">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" interval={xInterval} tick={tickStyle} />
              <YAxis allowDecimals={false} tick={tickStyle} />
              <Tooltip />
              <Bar dataKey="mealsLogged" name="Meals" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nausea level (1–10)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" interval={xInterval} tick={tickStyle} />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={tickStyle} />
              <Tooltip />
              <Line type="monotone" dataKey="nausea" name="Nausea" stroke="#14b8a6" strokeWidth={2} dot={range <= 30} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <InsightsCard points={points} />
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  )
}

const TILE_COLORS = [
  { bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'text-purple-500 dark:text-purple-400', value: 'text-purple-800 dark:text-purple-200' },
  { bg: 'bg-teal-50 dark:bg-teal-900/20',     label: 'text-teal-500 dark:text-teal-400',     value: 'text-teal-800 dark:text-teal-200' },
  { bg: 'bg-blue-50 dark:bg-blue-900/20',     label: 'text-blue-500 dark:text-blue-400',     value: 'text-blue-800 dark:text-blue-200' },
  { bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'text-orange-500 dark:text-orange-400', value: 'text-orange-800 dark:text-orange-200' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'text-emerald-500 dark:text-emerald-400', value: 'text-emerald-800 dark:text-emerald-200' },
  { bg: 'bg-rose-50 dark:bg-rose-900/20',     label: 'text-rose-500 dark:text-rose-400',     value: 'text-rose-800 dark:text-rose-200' },
  { bg: 'bg-amber-50 dark:bg-amber-900/20',   label: 'text-amber-500 dark:text-amber-400',   value: 'text-amber-800 dark:text-amber-200' },
]

function InsightsCard({ points }: { points: DayPoint[] }): JSX.Element {
  const insights = computeInsights(points)

  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Insights</h3>
        <p className="text-sm text-gray-400">Log more data across several days to see patterns here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Insights</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {insights.map((ins, i) => {
          const c = TILE_COLORS[i % TILE_COLORS.length]
          return (
            <div key={ins.label} className={`${c.bg} rounded-xl px-4 py-3`}>
              <p className={`text-xs font-medium mb-0.5 ${c.label}`}>{ins.label}</p>
              <p className={`text-sm font-semibold ${c.value}`}>{ins.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ins.detail}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
