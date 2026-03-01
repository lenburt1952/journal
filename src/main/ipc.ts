import { ipcMain } from 'electron'
import { mealsDb, exerciseDb, sleepDb, moodDb, nauseaDb, notesDb } from './db'
import type { NewMeal, NewExerciseLog, NewSleepLog, NewMoodLog, NewNauseaLog, DailyNote } from '../../shared/types'

export function registerIpcHandlers(): void {
  // ── Meals ──────────────────────────────────────────────────────────────
  ipcMain.handle('meals:add', (_e, entry: NewMeal) => mealsDb.add(entry))
  ipcMain.handle('meals:getByDate', (_e, date: string) => mealsDb.getByDate(date))
  ipcMain.handle('meals:getRange', (_e, from: string, to: string) => mealsDb.getRange(from, to))
  ipcMain.handle('meals:delete', (_e, id: number) => mealsDb.delete(id))

  // ── Exercise ───────────────────────────────────────────────────────────
  ipcMain.handle('exercise:add', (_e, entry: NewExerciseLog) => exerciseDb.add(entry))
  ipcMain.handle('exercise:getByDate', (_e, date: string) => exerciseDb.getByDate(date))
  ipcMain.handle('exercise:getRange', (_e, from: string, to: string) => exerciseDb.getRange(from, to))
  ipcMain.handle('exercise:delete', (_e, id: number) => exerciseDb.delete(id))

  // ── Sleep ──────────────────────────────────────────────────────────────
  ipcMain.handle('sleep:upsert', (_e, entry: NewSleepLog) => sleepDb.upsert(entry))
  ipcMain.handle('sleep:getByDate', (_e, date: string) => sleepDb.getByDate(date))
  ipcMain.handle('sleep:getRange', (_e, from: string, to: string) => sleepDb.getRange(from, to))
  ipcMain.handle('sleep:delete', (_e, date: string) => sleepDb.delete(date))

  // ── Mood ───────────────────────────────────────────────────────────────
  ipcMain.handle('mood:upsert', (_e, entry: NewMoodLog) => moodDb.upsert(entry))
  ipcMain.handle('mood:getByDate', (_e, date: string) => moodDb.getByDate(date))
  ipcMain.handle('mood:getRange', (_e, from: string, to: string) => moodDb.getRange(from, to))
  ipcMain.handle('mood:delete', (_e, date: string) => moodDb.delete(date))

  // ── Nausea ─────────────────────────────────────────────────────────────
  ipcMain.handle('nausea:add', (_e, entry: NewNauseaLog) => nauseaDb.add(entry))
  ipcMain.handle('nausea:getByDate', (_e, date: string) => nauseaDb.getByDate(date))
  ipcMain.handle('nausea:getRange', (_e, from: string, to: string) => nauseaDb.getRange(from, to))
  ipcMain.handle('nausea:delete', (_e, id: number) => nauseaDb.delete(id))

  // ── Notes ──────────────────────────────────────────────────────────────
  ipcMain.handle('notes:upsert', (_e, entry: DailyNote) => notesDb.upsert(entry))
  ipcMain.handle('notes:getByDate', (_e, date: string) => notesDb.getByDate(date))
  ipcMain.handle('notes:getRange', (_e, from: string, to: string) => notesDb.getRange(from, to))
}
