import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../../lib/api'
import { useStore } from '../../store/useStore'

const moodLabels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great']
const energyLabels = ['', 'Exhausted', 'Tired', 'Neutral', 'Energetic', 'Pumped']

function Slider({
  label,
  value,
  onChange,
  labels
}: {
  label: string
  value: number
  onChange: (v: number) => void
  labels: string[]
}): JSX.Element {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-primary-600 font-medium">{labels[value]}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-500"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>1</span><span>5</span>
      </div>
    </div>
  )
}

export default function AddMood(): JSX.Element | null {
  const { moodModal, closeModal, setMood } = useStore()
  const [mood, setMoodVal] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!moodModal.open) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    try {
      const log = await api.mood.upsert({ date: moodModal.date, mood, energy, note: note.trim() })
      setMood(log)
      setNote('')
      closeModal('mood')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Log Mood & Energy</h2>
          <button onClick={() => closeModal('mood')} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Slider label="Mood" value={mood} onChange={setMoodVal} labels={moodLabels} />
          <Slider label="Energy" value={energy} onChange={setEnergy} labels={energyLabels} />
          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything on your mind today?"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => closeModal('mood')}
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
