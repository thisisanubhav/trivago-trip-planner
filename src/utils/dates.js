export function toDateString(date) {
  return date.toISOString().split('T')[0]
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

export function defaultCheckin() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return toDateString(d)
}

export function calcCheckout(checkin, nights) {
  return addDays(checkin, nights)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function totalNights(destinations) {
  return destinations.reduce((sum, d) => sum + (parseInt(d.nights) || 0), 0)
}
