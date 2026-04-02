import { useState, useEffect } from 'react'
import { generateTravelBrief } from '../api/claude'
import { formatDate } from '../utils/dates'
import styles from './ItineraryView.module.css'

export default function ItineraryView({ results, selectedHotels }) {
  const [brief, setBrief] = useState(null)
  const [briefLoading, setBriefLoading] = useState(true)

  const selections = Object.entries(results)
    .map(([city, { hotels, dest }]) => {
      const idx = selectedHotels[city]
      if (idx === undefined || !hotels[idx]) return null
      return { city, hotel: hotels[idx], nights: dest.nights, checkin: dest.checkin, checkout: dest.checkout }
    })
    .filter(Boolean)

  useEffect(() => {
    let cancelled = false
    async function fetchBrief() {
      setBriefLoading(true)
      const text = await generateTravelBrief(selections)
      if (!cancelled) {
        setBrief(text)
        setBriefLoading(false)
      }
    }
    fetchBrief()
    return () => { cancelled = true }
  }, [])

  let dayCounter = 1

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Your trip at a glance</div>
        <div className={styles.timeline}>
          {selections.map((s, i) => {
            const startDay = dayCounter
            dayCounter += s.nights
            const isLast = i === selections.length - 1
            return (
              <div key={s.city} className={styles.timelineItem}>
                <div className={styles.timelineLine}>
                  <div className={styles.dot} />
                  {!isLast && <div className={styles.bar} />}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.cityName}>{s.city}</div>
                  <div className={styles.hotelName}>{s.hotel.name} · {s.hotel.area}</div>
                  <div className={styles.meta}>
                    {formatDate(s.checkin)} → {formatDate(s.checkout)} · {s.nights} nights · €{Math.round((s.hotel.pricePerNight || 0) * s.nights)} total
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>AI travel brief</div>
        {briefLoading ? (
          <div className={styles.loadingBrief}>
            <div className={styles.spinner} />
            <span>Generating your personalised travel brief...</span>
          </div>
        ) : brief ? (
          <div className={styles.brief}>{brief}</div>
        ) : (
          <div className={styles.briefFallback}>
            Your trip spans {selections.length} cities. Remember to book trains or flights between destinations early — prices rise quickly, especially in summer.
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Selected hotels</div>
        <div className={styles.hotelTable}>
          {selections.map((s) => (
            <div key={s.city} className={styles.hotelRow}>
              <div className={styles.hotelRowLeft}>
                <span className={styles.hotelRowCity}>{s.city}</span>
                <span className={styles.hotelRowName}>{s.hotel.name}</span>
              </div>
              <div className={styles.hotelRowRight}>
                <span className={styles.hotelRowStars}>{'★'.repeat(Math.min(5, s.hotel.stars || 3))}</span>
                <span className={styles.hotelRowRating}>{s.hotel.rating}/10</span>
                <span className={styles.hotelRowPrice}>€{s.hotel.pricePerNight}/night</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
