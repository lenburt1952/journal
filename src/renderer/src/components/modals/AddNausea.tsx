import { useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { api } from '../../lib/api'
import { useStore } from '../../store/useStore'

const levelLabels: Record<number, string> = {
  1: 'Barely noticeable',
  2: 'Mild',
  3: 'Mild–moderate',
  4: 'Moderate',
  5: 'Uncomfortable',
  6: 'Distressing',
  7: 'Severe',
  8: 'Very severe',
  9: 'Overwhelming',
  10: 'Incapacitating'
}

function levelColor(level: number): string {
  if (level <= 3) return 'bg-green-500'
  if (level <= 5) return 'bg-yellow-400'
  if (level <= 7) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function AddNausea(): JSX.Element | null {
  const { nauseaModal, closeModal, addNausea } = useStore()
  const [level, setLevel] = useState(1)
  const [time, setTime] = useState(() => format(new Date(), 'HH:mm'))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!nauseaModal.open) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    try {
      const log = await api.nausea.add({ date: nauseaModal.date, time, level, note: note.trim() })
      addNausea(log)
      setLevel(1)
      setNote('')
      setTime(format(new Date(), 'HH:mm'))
      closeModal('nausea')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Log Nausea</h2>
          <button onClick={() => closeModal('nausea')} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Time */}
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Scale buttons 1–10 */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Nausea level</label>
              <span className="text-sm font-semibold">{level} / 10</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLevel(n)}
                  className={`h-9 rounded-md text-sm font-semibold transition-all ${
                    n === level
                      ? `${levelColor(n)} text-white shadow-md scale-110`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">{levelLabels[level]}</p>
          </div>

          {/* Colour bar */}
          <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-700 shadow transition-all"
              style={{ left: `${((level - 1) / 9) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. After eating, in the morning…"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => closeModal('nausea')}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
