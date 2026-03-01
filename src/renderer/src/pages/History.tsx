import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, UtensilsCrossed, Dumbbell, Moon, Smile, Waves } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, subMonths, addMonths } from 'date-fns'
import { api } from '../lib/api'
import { formatDisplay } from '../lib/dates'
import type { Meal, ExerciseLog, SleepLog, MoodLog, NauseaLog } from '../../../../shared/types'

interface DayData {
  meals: Meal[]
  exercise: ExerciseLog[]
  sleep: SleepLog | null
  mood: MoodLog | null
  nausea: NauseaLog[]
}

export default function History(): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayData, setDayData] = useState<DayData | null>(null)
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  useEffect(() => {
    const from = format(monthStart, 'yyyy-MM-dd')
    const to = format(monthEnd, 'yyyy-MM-dd')
    Promise.all([
      api.meals.getRange(from, to),
      api.exercise.getRange(from, to),
      api.sleep.getRange(from, to),
      api.mood.getRange(from, to),
      api.nausea.getRange(from, to)
    ]).then(([meals, exercise, sleep, mood, nausea]) => {
      const dates = new Set<string>()
      meals.forEach((m) => dates.add(m.date))
      exercise.forEach((e) => dates.add(e.date))
      sleep.forEach((s) => dates.add(s.date))
      mood.forEach((m) => dates.add(m.date))
      nausea.forEach((n) => dates.add(n.date))
      setActiveDates(dates)
    })
  }, [currentMonth])

  const loadDay = async (date: string): Promise<void> => {
    setSelectedDate(date)
    const [meals, exercise, sleep, mood, nausea] = await Promise.all([
      api.meals.getByDate(date),
      api.exercise.getByDate(date),
      api.sleep.getByDate(date),
      api.mood.getByDate(date),
      api.nausea.getByDate(date)
    ])
    setDayData({ meals, exercise, sleep, mood, nausea })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">History</h1>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day grid — offset first day */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={`pad-${i}`} />)}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const hasData = activeDates.has(dateStr)
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
                return (
                  <button
                    key={dateStr}
                    onClick={() => loadDay(dateStr)}
                    className={`relative aspect-square rounded-lg text-sm flex items-center justify-center font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : isToday
                        ? 'border-2 border-primary-400 text-primary-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
                  >
                    {format(day, 'd')}
                    {hasData && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Day detail panel */}
        <div className="w-72 flex-shrink-0">
          {selectedDate && dayData ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold">{formatDisplay(selectedDate)}</h3>

              <DetailSection icon={<UtensilsCrossed className="w-4 h-4 text-emerald-500" />} title="Meals">
                {dayData.meals.length ? dayData.meals.map((m) => (
                  <p key={m.id} className="text-sm">{m.name} <span className="text-gray-400 text-xs">· {m.time}</span></p>
                )) : <p className="text-sm text-gray-400">None logged</p>}
              </DetailSection>

              <DetailSection icon={<Dumbbell className="w-4 h-4 text-blue-500" />} title="Exercise">
                {dayData.exercise.length ? dayData.exercise.map((e) => (
                  <p key={e.id} className="text-sm">{e.activity} <span className="text-gray-400 text-xs">· {e.duration}min</span></p>
                )) : <p className="text-sm text-gray-400">None logged</p>}
              </DetailSection>

              <DetailSection icon={<Moon className="w-4 h-4 text-purple-500" />} title="Sleep">
                {dayData.sleep ? (
                  <p className="text-sm">{dayData.sleep.hours}h · {'★'.repeat(dayData.sleep.quality)}</p>
                ) : <p className="text-sm text-gray-400">Not logged</p>}
              </DetailSection>

              <DetailSection icon={<Smile className="w-4 h-4 text-orange-500" />} title="Mood & Energy">
                {dayData.mood ? (
                  <>
                    <p className="text-sm">Mood: {dayData.mood.mood}/5 · Energy: {dayData.mood.energy}/5</p>
                    {dayData.mood.note && <p className="text-xs text-gray-400 italic">"{dayData.mood.note}"</p>}
                  </>
                ) : <p className="text-sm text-gray-400">Not logged</p>}
              </DetailSection>

              <DetailSection icon={<Waves className="w-4 h-4 text-teal-500" />} title="Nausea">
                {dayData.nausea.length ? dayData.nausea.map((n) => (
                  <p key={n.id} className="text-sm">
                    Level {n.level}/10 <span className="text-gray-400 text-xs">· {n.time}{n.note ? ` · ${n.note}` : ''}</span>
                  </p>
                )) : <p className="text-sm text-gray-400">Not logged</p>}
              </DetailSection>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-center text-sm text-gray-400">
              Select a day to see details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailSection({ icon, title, children }: { icon: JSX.Element; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</span>
      </div>
      <div className="pl-5 space-y-0.5">{children}</div>
    </div>
  )
}
