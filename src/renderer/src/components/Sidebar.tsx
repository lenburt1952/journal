import { NavLink } from 'react-router-dom'
import { CalendarDays, BarChart2, Clock, Settings, Sun, Moon, Leaf } from 'lucide-react'
import { useStore } from '../store/useStore'

const links = [
  { to: '/today', icon: Clock, label: 'Today' },
  { to: '/history', icon: CalendarDays, label: 'History' },
  { to: '/trends', icon: BarChart2, label: 'Trends' },
  { to: '/settings', icon: Settings, label: 'Settings' }
]

export default function Sidebar(): JSX.Element {
  const { darkMode, toggleDarkMode } = useStore()

  return (
    <aside className="w-56 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10">
        <Leaf className="w-6 h-6 text-emerald-500" />
        <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Health Journal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  )
}
