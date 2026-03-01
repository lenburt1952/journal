import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns'

export const today = (): string => format(new Date(), 'yyyy-MM-dd')

export const formatDisplay = (date: string): string =>
  format(parseISO(date), 'MMM d, yyyy')

export const formatTime = (time: string): string => {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 || 12
  return `${display}:${String(m).padStart(2, '0')} ${period}`
}

export const lastNDays = (n: number): string[] => {
  const end = new Date()
  const start = subDays(end, n - 1)
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'))
}

export const currentTime = (): string => format(new Date(), 'HH:mm')
