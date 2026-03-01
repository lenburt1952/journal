/**
 * JSON file-based storage layer.
 * Each table is stored as a separate .json file in the Electron userData directory.
 * Adequate for ~thousands of records per year; no native compilation required.
 */
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import type { Meal, ExerciseLog, SleepLog, MoodLog, NauseaLog, DailyNote, NewMeal, NewExerciseLog, NewSleepLog, NewMoodLog, NewNauseaLog } from '../../shared/types'

const dataDir = app.getPath('userData')

// ── Generic JSON store ───────────────────────────────────────────────────────

function storePath(name: string): string {
  return path.join(dataDir, `${name}.json`)
}

function readStore<T>(name: string): T[] {
  const p = storePath(name)
  if (!fs.existsSync(p)) return []
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T[]
}

function writeStore<T>(name: string, data: T[]): void {
  fs.writeFileSync(storePath(name), JSON.stringify(data, null, 2), 'utf-8')
}

let _nextIds: Record<string, number> = {}

function nextId(store: string, records: { id: number }[]): number {
  if (!_nextIds[store]) {
    _nextIds[store] = records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1
  }
  return _nextIds[store]++
}

// ── Meals ────────────────────────────────────────────────────────────────────

export const mealsDb = {
  add: (entry: NewMeal): Meal => {
    const records = readStore<Meal>('meals')
    const meal: Meal = { id: nextId('meals', records), ...entry }
    records.push(meal)
    writeStore('meals', records)
    return meal
  },
  getByDate: (date: string): Meal[] => {
    return readStore<Meal>('meals')
      .filter((m) => m.date === date)
      .sort((a, b) => a.time.localeCompare(b.time))
  },
  getRange: (from: string, to: string): Meal[] => {
    return readStore<Meal>('meals')
      .filter((m) => m.date >= from && m.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  },
  delete: (id: number): void => {
    writeStore('meals', readStore<Meal>('meals').filter((m) => m.id !== id))
  }
}

// ── Exercise ─────────────────────────────────────────────────────────────────

export const exerciseDb = {
  add: (entry: NewExerciseLog): ExerciseLog => {
    const records = readStore<ExerciseLog>('exercise')
    const log: ExerciseLog = { id: nextId('exercise', records), ...entry }
    records.push(log)
    writeStore('exercise', records)
    return log
  },
  getByDate: (date: string): ExerciseLog[] => {
    return readStore<ExerciseLog>('exercise').filter((e) => e.date === date)
  },
  getRange: (from: string, to: string): ExerciseLog[] => {
    return readStore<ExerciseLog>('exercise')
      .filter((e) => e.date >= from && e.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date))
  },
  delete: (id: number): void => {
    writeStore('exercise', readStore<ExerciseLog>('exercise').filter((e) => e.id !== id))
  }
}

// ── Sleep ─────────────────────────────────────────────────────────────────────

export const sleepDb = {
  upsert: (entry: NewSleepLog): SleepLog => {
    const records = readStore<SleepLog>('sleep')
    const idx = records.findIndex((s) => s.date === entry.date)
    if (idx >= 0) {
      records[idx] = { ...records[idx], hours: entry.hours, quality: entry.quality }
      writeStore('sleep', records)
      return records[idx]
    }
    const log: SleepLog = { id: nextId('sleep', records), ...entry }
    records.push(log)
    writeStore('sleep', records)
    return log
  },
  getByDate: (date: string): SleepLog | null => {
    return readStore<SleepLog>('sleep').find((s) => s.date === date) ?? null
  },
  getRange: (from: string, to: string): SleepLog[] => {
    return readStore<SleepLog>('sleep')
      .filter((s) => s.date >= from && s.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date))
  },
  delete: (date: string): void => {
    writeStore('sleep', readStore<SleepLog>('sleep').filter((s) => s.date !== date))
  }
}

// ── Mood ──────────────────────────────────────────────────────────────────────

export const moodDb = {
  upsert: (entry: NewMoodLog): MoodLog => {
    const records = readStore<MoodLog>('mood')
    const idx = records.findIndex((m) => m.date === entry.date)
    if (idx >= 0) {
      records[idx] = { ...records[idx], mood: entry.mood, energy: entry.energy, note: entry.note }
      writeStore('mood', records)
      return records[idx]
    }
    const log: MoodLog = { id: nextId('mood', records), ...entry }
    records.push(log)
    writeStore('mood', records)
    return log
  },
  getByDate: (date: string): MoodLog | null => {
    return readStore<MoodLog>('mood').find((m) => m.date === date) ?? null
  },
  getRange: (from: string, to: string): MoodLog[] => {
    return readStore<MoodLog>('mood')
      .filter((m) => m.date >= from && m.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date))
  },
  delete: (date: string): void => {
    writeStore('mood', readStore<MoodLog>('mood').filter((m) => m.date !== date))
  }
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export const notesDb = {
  upsert: (entry: DailyNote): DailyNote => {
    const records = readStore<DailyNote>('notes')
    const idx = records.findIndex((n) => n.date === entry.date)
    if (idx >= 0) {
      records[idx] = entry
    } else {
      records.push(entry)
    }
    writeStore('notes', records)
    return entry
  },
  getByDate: (date: string): DailyNote | null => {
    return readStore<DailyNote>('notes').find((n) => n.date === date) ?? null
  },
  getRange: (from: string, to: string): DailyNote[] => {
    return readStore<DailyNote>('notes')
      .filter((n) => n.date >= from && n.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}

// ── Nausea ────────────────────────────────────────────────────────────────────

export const nauseaDb = {
  add: (entry: NewNauseaLog): NauseaLog => {
    const records = readStore<NauseaLog>('nausea')
    const log: NauseaLog = { id: nextId('nausea', records), ...entry }
    records.push(log)
    writeStore('nausea', records)
    return log
  },
  getByDate: (date: string): NauseaLog[] => {
    return readStore<NauseaLog>('nausea')
      .filter((n) => n.date === date)
      .sort((a, b) => a.time.localeCompare(b.time))
  },
  getRange: (from: string, to: string): NauseaLog[] => {
    return readStore<NauseaLog>('nausea')
      .filter((n) => n.date >= from && n.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  },
  delete: (id: number): void => {
    writeStore('nausea', readStore<NauseaLog>('nausea').filter((n) => n.id !== id))
  }
}
