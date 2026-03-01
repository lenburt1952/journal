import { create } from 'zustand'
import type { Meal, ExerciseLog, SleepLog, MoodLog, NauseaLog } from '../../../../shared/types'

interface Modal {
  open: boolean
  date: string
}

interface AppState {
  // Today's data
  meals: Meal[]
  exercise: ExerciseLog[]
  sleep: SleepLog | null
  mood: MoodLog | null
  nausea: NauseaLog[]

  // Modal visibility
  mealModal: Modal
  exerciseModal: Modal
  sleepModal: Modal
  moodModal: Modal
  nauseaModal: Modal

  // Dark mode
  darkMode: boolean

  // Actions
  setMeals: (meals: Meal[]) => void
  addMeal: (meal: Meal) => void
  removeMeal: (id: number) => void

  setExercise: (logs: ExerciseLog[]) => void
  addExercise: (log: ExerciseLog) => void
  removeExercise: (id: number) => void

  setSleep: (log: SleepLog | null) => void
  setMood: (log: MoodLog | null) => void
  setNausea: (logs: NauseaLog[]) => void
  addNausea: (log: NauseaLog) => void
  removeNausea: (id: number) => void

  openModal: (type: 'meal' | 'exercise' | 'sleep' | 'mood' | 'nausea', date: string) => void
  closeModal: (type: 'meal' | 'exercise' | 'sleep' | 'mood' | 'nausea') => void

  toggleDarkMode: () => void
}

const defaultModal: Modal = { open: false, date: '' }

export const useStore = create<AppState>((set) => ({
  meals: [],
  exercise: [],
  sleep: null,
  mood: null,
  nausea: [],

  mealModal: defaultModal,
  exerciseModal: defaultModal,
  sleepModal: defaultModal,
  moodModal: defaultModal,
  nauseaModal: defaultModal,

  darkMode: false,

  setMeals: (meals) => set({ meals }),
  addMeal: (meal) => set((s) => ({ meals: [...s.meals, meal] })),
  removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

  setExercise: (exercise) => set({ exercise }),
  addExercise: (log) => set((s) => ({ exercise: [...s.exercise, log] })),
  removeExercise: (id) => set((s) => ({ exercise: s.exercise.filter((e) => e.id !== id) })),

  setSleep: (sleep) => set({ sleep }),
  setMood: (mood) => set({ mood }),
  setNausea: (nausea) => set({ nausea }),
  addNausea: (log) => set((s) => ({ nausea: [...s.nausea, log].sort((a, b) => a.time.localeCompare(b.time)) })),
  removeNausea: (id) => set((s) => ({ nausea: s.nausea.filter((n) => n.id !== id) })),

  openModal: (type, date) =>
    set({ [`${type}Modal`]: { open: true, date } } as Partial<AppState>),
  closeModal: (type) =>
    set({ [`${type}Modal`]: defaultModal } as Partial<AppState>),

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode
      document.documentElement.classList.toggle('dark', next)
      return { darkMode: next }
    })
}))
