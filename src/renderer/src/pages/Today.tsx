import { useEffect, useRef, useState } from 'react'
import { UtensilsCrossed, Dumbbell, Moon, Smile, Trash2, Plus, Waves, ChevronLeft, ChevronRight, NotebookPen } from 'lucide-react'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { api } from '../lib/api'
import { today, formatDisplay, formatTime } from '../lib/dates'
import { useStore } from '../store/useStore'
import AddMeal from '../components/modals/AddMeal'
import AddExercise from '../components/modals/AddExercise'
import AddSleep from '../components/modals/AddSleep'
import AddMood from '../components/modals/AddMood'
import AddNausea from '../components/modals/AddNausea'

const moodLabels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great']
const energyLabels = ['', 'Exhausted', 'Tired', 'Neutral', 'Energetic', 'Pumped']

function nauseaColor(level: number): string {
  if (level <= 3) return 'text-green-600'
  if (level <= 5) return 'text-yellow-600'
  if (level <= 7) return 'text-orange-500'
  return 'text-red-500'
}

export default function Today(): JSX.Element {
  const [date, setDate] = useState(today)
  const isToday = date === today()
  const goBack = (): void => setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))
  const goForward = (): void => { if (!isToday) setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd')) }

  const {
    meals, exercise, sleep, mood, nausea,
    setMeals, setExercise, setSleep, setMood, setNausea,
    removeMeal, removeExercise, removeNausea,
    openModal
  } = useStore()

  useEffect(() => {
    api.meals.getByDate(date).then(setMeals)
    api.exercise.getByDate(date).then(setExercise)
    api.sleep.getByDate(date).then(setSleep)
    api.mood.getByDate(date).then(setMood)
    api.nausea.getByDate(date).then((logs) => setNausea(logs))
  }, [date])

  const [noteText, setNoteText] = useState('')
  const noteDirty = useRef(false)

  useEffect(() => {
    noteDirty.current = false
    api.notes.getByDate(date).then((n) => setNoteText(n?.text ?? ''))
  }, [date])

  useEffect(() => {
    if (!noteDirty.current) return
    const timer = setTimeout(() => {
      api.notes.upsert({ date, text: noteText })
    }, 800)
    return () => clearTimeout(timer)
  }, [noteText, date])

  const handleNoteChange = (text: string): void => {
    noteDirty.current = true
    setNoteText(text)
  }

  const handleDeleteMeal = async (id: number): Promise<void> => {
    await api.meals.delete(id)
    removeMeal(id)
  }

  const handleDeleteExercise = async (id: number): Promise<void> => {
    await api.exercise.delete(id)
    removeExercise(id)
  }

  const handleDeleteNausea = async (id: number): Promise<void> => {
    await api.nausea.delete(id)
    removeNausea(id)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          <button onClick={goBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goForward} disabled={isToday} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{isToday ? 'Today' : formatDisplay(date)}</h1>
          {isToday
            ? <p className="text-gray-500 text-sm mt-1">{formatDisplay(date)}</p>
            : <button onClick={() => setDate(today())} className="text-xs text-primary-600 hover:underline mt-0.5">Back to today</button>
          }
        </div>
      </div>

      {/* Quick-add buttons */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Meal',     icon: UtensilsCrossed, type: 'meal'     as const, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-400' },
          { label: 'Exercise', icon: Dumbbell,         type: 'exercise' as const, iconBg: 'bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',          iconColor: 'text-blue-600 dark:text-blue-400',       border: 'hover:border-blue-400' },
          { label: 'Sleep',    icon: Moon,             type: 'sleep'    as const, iconBg: 'bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50',    iconColor: 'text-purple-600 dark:text-purple-400',   border: 'hover:border-purple-400' },
          { label: 'Mood',     icon: Smile,            type: 'mood'     as const, iconBg: 'bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50',    iconColor: 'text-orange-600 dark:text-orange-400',   border: 'hover:border-orange-400' },
          { label: 'Nausea',   icon: Waves,            type: 'nausea'   as const, iconBg: 'bg-teal-50 dark:bg-teal-900/30 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50',            iconColor: 'text-teal-600 dark:text-teal-400',       border: 'hover:border-teal-400' }
        ].map(({ label, icon: Icon, type, iconBg, iconColor, border }) => (
          <button
            key={type}
            onClick={() => openModal(type, date)}
            className={`flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl ${border} hover:shadow-sm transition-all group`}
          >
            <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center transition-colors`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">+ {label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Meals */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Meals</h2>
          </div>
          {meals.length === 0 ? (
            <EmptyCard label="No meals logged yet" onAdd={() => openModal('meal', date)} />
          ) : (
            <div className="space-y-2">
              {meals.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-gray-400">{formatTime(m.time)}</p>
                  </div>
                  <button onClick={() => handleDeleteMeal(m.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => openModal('meal', date)} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1">
                <Plus className="w-3 h-3" /> Add another
              </button>
            </div>
          )}
        </section>

        {/* Exercise */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Exercise</h2>
          </div>
          {exercise.length === 0 ? (
            <EmptyCard label="No exercise logged yet" onAdd={() => openModal('exercise', date)} />
          ) : (
            <div className="space-y-2">
              {exercise.map((e) => (
                <div key={e.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{e.activity}</p>
                    <p className="text-xs text-gray-400">{e.duration} min{e.notes ? ` · ${e.notes}` : ''}</p>
                  </div>
                  <button onClick={() => handleDeleteExercise(e.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => openModal('exercise', date)} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1">
                <Plus className="w-3 h-3" /> Add another
              </button>
            </div>
          )}
        </section>

        {/* Sleep, Mood, Nausea */}
        <div className="grid grid-cols-3 gap-4">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-4 h-4 text-purple-500" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Sleep</h2>
            </div>
            {sleep ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-t-2 border-t-purple-400 rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{sleep.hours}h</p>
                <p className="text-xs text-gray-400">Quality: {'★'.repeat(sleep.quality)}{'☆'.repeat(5 - sleep.quality)}</p>
                <button onClick={() => openModal('sleep', date)} className="text-xs text-primary-600 hover:underline mt-2 block">Edit</button>
              </div>
            ) : (
              <EmptyCard label="Not logged" onAdd={() => openModal('sleep', date)} />
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Mood & Energy</h2>
            </div>
            {mood ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-t-2 border-t-orange-400 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{moodLabels[mood.mood]} mood</p>
                <p className="text-sm text-gray-500">{energyLabels[mood.energy]} energy</p>
                {mood.note && <p className="text-xs text-gray-400 mt-1 italic">"{mood.note}"</p>}
                <button onClick={() => openModal('mood', date)} className="text-xs text-primary-600 hover:underline mt-2 block">Edit</button>
              </div>
            ) : (
              <EmptyCard label="Not logged" onAdd={() => openModal('mood', date)} />
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Waves className="w-4 h-4 text-teal-500" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Nausea</h2>
            </div>
            {nausea.length === 0 ? (
              <EmptyCard label="Not logged" onAdd={() => openModal('nausea', date)} />
            ) : (
              <div className="space-y-2">
                {nausea.map((n) => (
                  <div key={n.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2">
                    <div>
                      <p className={`text-lg font-bold ${nauseaColor(n.level)}`}>{n.level}<span className="text-xs font-normal text-gray-400"> / 10</span></p>
                      <p className="text-xs text-gray-400">{n.time}{n.note ? ` · ${n.note}` : ''}</p>
                    </div>
                    <button onClick={() => handleDeleteNausea(n.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => openModal('nausea', date)} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" /> Add another
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Notes */}
      <section className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <NotebookPen className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Notes</h2>
        </div>
        <textarea
          value={noteText}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Any observations for the day…"
          rows={4}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder:text-gray-300 dark:placeholder:text-gray-700"
        />
      </section>

      {/* Modals */}
      <AddMeal />
      <AddExercise />
      <AddSleep />
      <AddMood />
      <AddNausea />
    </div>
  )
}

function EmptyCard({ label, onAdd }: { label: string; onAdd: () => void }): JSX.Element {
  return (
    <button
      onClick={onAdd}
      className="w-full border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl px-4 py-5 text-sm text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors text-center"
    >
      {label} — tap to add
    </button>
  )
}
