import { useEffect, useState } from 'react'
import { generateTravelBrief } from '../api/claude'
import { formatDate } from '../utils/dates'
import styles from './ItineraryView.module.css'

export default function ItineraryView({ results, selectedHotels }) {
  const [brief, setBrief] = useState(null)
  const [briefLoading, setBriefLoading] = useState(true)
  const [briefWarning, setBriefWarning] = useState('')

  const selections = Object.entries(results)
    .map(([city, { hotels, dest }]) => {
      const index = selectedHotels[city]
      if (index === undefined || !hotels[index]) return null

      return {
        city,
        hotel: hotels[index],
        nights: dest.nights,
        checkin: dest.checkin,
        checkout: dest.checkout,
      }
    })
    .filter(Boolean)

  useEffect(() => {
    let cancelled = false

    async function fetchBrief() {
      if (selections.length === 0) {
        setBriefLoading(false)
        setBrief(null)
        return
      }

      setBriefLoading(true)

      const response = await generateTravelBrief(selections)

      if (!cancelled) {
        setBrief(response.text)
        setBriefWarning(response.warning || '')
        setBriefLoading(false)
      }
    }

    fetchBrief()

    return () => {
      cancelled = true
    }
  }, [])

  if (selections.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>Your itinerary is still empty.</h3>
        <p>Select one hotel for each destination in the Results tab to generate the final trip view.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Your trip at a glance</div>
        <div className={styles.timeline}>
          {selections.map((selection, index) => {
            const isLast = index === selections.length - 1

            return (
              <div key={selection.city} className={styles.timelineItem}>
                <div className={styles.timelineLine}>
                  <div className={styles.dot} />
                  {!isLast && <div className={styles.bar} />}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.cityName}>{selection.city}</div>
                  <div className={styles.hotelName}>{selection.hotel.name} · {selection.hotel.area}</div>
                  <div className={styles.meta}>
                    {formatDate(selection.checkin)} → {formatDate(selection.checkout)} · {selection.nights} nights · €
                    {Math.round((selection.hotel.pricePerNight || 0) * selection.nights)} total
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>AI travel brief</div>
        {briefWarning && <div className={styles.inlineNotice}>{briefWarning}</div>}
        {briefLoading ? (
          <div className={styles.loadingBrief}>
            <div className={styles.spinner} />
            <span>Generating your personalised travel brief...</span>
          </div>
        ) : brief ? (
          <div className={styles.brief}>{brief}</div>
        ) : (
          <div className={styles.briefFallback}>
            Your trip spans {selections.length} cities. Book intercity transport early, double-check arrival times against hotel check-in windows, and keep one light buffer block for delays or weather changes.
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Selected hotels</div>
        <div className={styles.hotelTable}>
          {selections.map((selection) => (
            <div key={selection.city} className={styles.hotelRow}>
              <div className={styles.hotelRowLeft}>
                <span className={styles.hotelRowCity}>{selection.city}</span>
                <span className={styles.hotelRowName}>{selection.hotel.name}</span>
              </div>
              <div className={styles.hotelRowRight}>
                <span className={styles.hotelRowStars}>{'★'.repeat(Math.min(5, selection.hotel.stars || 3))}</span>
                <span className={styles.hotelRowRating}>{selection.hotel.rating}/10</span>
                <span className={styles.hotelRowPrice}>€{selection.hotel.pricePerNight}/night</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
