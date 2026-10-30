export function formatHeaderDate(d: Date = new Date()): string {
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const month = d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase()
  const day = d.getDate()
  return `${weekday}, ${month} ${day}`
}

export function formatEntryDate(d: Date = new Date()): string {
  const day = d.getDate()
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / 180)
  return `${minutes} min read`
}
