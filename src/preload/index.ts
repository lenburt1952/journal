import { contextBridge, ipcRenderer } from 'electron'
import type { NewMeal, NewExerciseLog, NewSleepLog, NewMoodLog, NewNauseaLog, DailyNote } from '../../shared/types'

const api = {
  meals: {
    add: (entry: NewMeal) => ipcRenderer.invoke('meals:add', entry),
    getByDate: (date: string) => ipcRenderer.invoke('meals:getByDate', date),
    getRange: (from: string, to: string) => ipcRenderer.invoke('meals:getRange', from, to),
    delete: (id: number) => ipcRenderer.invoke('meals:delete', id)
  },
  exercise: {
    add: (entry: NewExerciseLog) => ipcRenderer.invoke('exercise:add', entry),
    getByDate: (date: string) => ipcRenderer.invoke('exercise:getByDate', date),
    getRange: (from: string, to: string) => ipcRenderer.invoke('exercise:getRange', from, to),
    delete: (id: number) => ipcRenderer.invoke('exercise:delete', id)
  },
  sleep: {
    upsert: (entry: NewSleepLog) => ipcRenderer.invoke('sleep:upsert', entry),
    getByDate: (date: string) => ipcRenderer.invoke('sleep:getByDate', date),
    getRange: (from: string, to: string) => ipcRenderer.invoke('sleep:getRange', from, to),
    delete: (date: string) => ipcRenderer.invoke('sleep:delete', date)
  },
  mood: {
    upsert: (entry: NewMoodLog) => ipcRenderer.invoke('mood:upsert', entry),
    getByDate: (date: string) => ipcRenderer.invoke('mood:getByDate', date),
    getRange: (from: string, to: string) => ipcRenderer.invoke('mood:getRange', from, to),
    delete: (date: string) => ipcRenderer.invoke('mood:delete', date)
  },
  nausea: {
    add: (entry: NewNauseaLog) => ipcRenderer.invoke('nausea:add', entry),
    getByDate: (date: string) => ipcRenderer.invoke('nausea:getByDate', date),
    getRange: (from: string, to: string) => ipcRenderer.invoke('nausea:getRange', from, to),
    delete: (id: number) => ipcRenderer.invoke('nausea:delete', id)
  },
  notes: {
    upsert: (entry: DailyNote) => ipcRenderer.invoke('notes:upsert', entry),
    getByDate: (date: string) => ipcRenderer.invoke('notes:getByDate', date),
    getRange: (from: string, to: string) => ipcRenderer.invoke('notes:getRange', from, to)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
