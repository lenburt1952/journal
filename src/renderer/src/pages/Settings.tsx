import { useState } from 'react'
import { Download } from 'lucide-react'
import { api } from '../lib/api'
import { lastNDays } from '../lib/dates'

export default function Settings(): JSX.Element {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')

  const exportData = async (format: 'json' | 'csv'): Promise<void> => {
    setExporting(true)
    setStatus('')
    try {
      const days = lastNDays(365)
      const from = days[0]
      const to = days[days.length - 1]

      const [meals, exercise, sleep, mood] = await Promise.all([
        api.meals.getRange(from, to),
        api.exercise.getRange(from, to),
        api.sleep.getRange(from, to),
        api.mood.getRange(from, to)
      ])

      let content: string
      let filename: string
      let mime: string

      if (format === 'json') {
        content = JSON.stringify({ meals, exercise, sleep, mood }, null, 2)
        filename = `health-journal-export-${from}-to-${to}.json`
        mime = 'application/json'
      } else {
        const rows: string[] = ['type,date,field1,field2,field3,field4']
        meals.forEach((m) => rows.push(`meal,${m.date},${m.time},"${m.name}",,`))
        exercise.forEach((e) => rows.push(`exercise,${e.date},"${e.activity}",${e.duration},"${e.notes}",`))
        sleep.forEach((s) => rows.push(`sleep,${s.date},${s.hours},${s.quality},,`))
        mood.forEach((m) => rows.push(`mood,${m.date},${m.mood},${m.energy},"${m.note}",`))
        content = rows.join('\n')
        filename = `health-journal-export-${from}-to-${to}.csv`
        mime = 'text/csv'
      }

      const blob = new Blob([content], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      setStatus(`Exported ${filename}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-800">
        <div className="p-5">
          <h2 className="font-semibold mb-1">Export Data</h2>
          <p className="text-sm text-gray-500 mb-4">Download all your logged data from the past year.</p>
          <div className="flex gap-3">
            <button
              onClick={() => exportData('json')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
            <button
              onClick={() => exportData('csv')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          {status && <p className="text-xs text-primary-600 mt-2">{status}</p>}
        </div>

        <div className="p-5">
          <h2 className="font-semibold mb-1">Data Storage</h2>
          <p className="text-sm text-gray-500">
            All data is stored locally in a SQLite database in your system's app data folder. Nothing leaves your device.
          </p>
        </div>

        <div className="p-5">
          <h2 className="font-semibold mb-1">About</h2>
          <p className="text-sm text-gray-500">Health Journal v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
