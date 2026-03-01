export interface Meal {
  id: number
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
  name: string
}

export interface ExerciseLog {
  id: number
  date: string
  activity: string
  duration: number  // minutes
  notes: string
}

export interface SleepLog {
  id: number
  date: string      // date you woke up
  hours: number
  quality: number   // 1–5
}

export interface MoodLog {
  id: number
  date: string
  mood: number      // 1–5
  energy: number    // 1–5
  note: string
}

export interface NauseaLog {
  id: number
  date: string
  time: string      // HH:MM
  level: number     // 1–10
  note: string
}

export interface DaySummary {
  date: string
  meals: Meal[]
  exercise: ExerciseLog[]
  sleep: SleepLog | null
  mood: MoodLog | null
  nausea: NauseaLog[]
}

export interface DailyNote {
  date: string  // YYYY-MM-DD
  text: string
}

export type NewMeal = Omit<Meal, 'id'>
export type NewExerciseLog = Omit<ExerciseLog, 'id'>
export type NewSleepLog = Omit<SleepLog, 'id'>
export type NewMoodLog = Omit<MoodLog, 'id'>
export type NewNauseaLog = Omit<NauseaLog, 'id'>
