import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { api } from '../../lib/api'
import { useStore } from '../../store/useStore'

export default function AddSleep(): JSX.Element | null {
  const { sleepModal, closeModal, setSleep } = useStore()
  const [hours, setHours] = useState('7.5')
  const [quality, setQuality] = useState(3)
  const [saving, setSaving] = useState(false)

  if (!sleepModal.open) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    try {
      const log = await api.sleep.upsert({ date: sleepModal.date, hours: Number(hours), quality })
      setSleep(log)
      closeModal('sleep')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Log Sleep</h2>
          <button onClick={() => closeModal('sleep')} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Hours slept</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-32 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sleep quality</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuality(n)}
                  className={`transition-colors ${n <= quality ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                >
                  <Star className="w-7 h-7 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][quality]}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => closeModal('sleep')}
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
