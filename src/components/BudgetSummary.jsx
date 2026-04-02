import styles from './BudgetSummary.module.css'

export default function BudgetSummary({ results, selectedHotels }) {
  const cities = Object.keys(results)
  let totalCost = 0
  let totalNights = 0

  const rows = cities
    .map((city) => {
      const idx = selectedHotels[city]
      if (idx === undefined) return null
      const { hotels, dest } = results[city]
      const hotel = hotels[idx]
      if (!hotel) return null
      const cost = Math.round((hotel.pricePerNight || 0) * (dest.nights || 1))
      totalCost += cost
      totalNights += dest.nights || 0
      return { city, hotel, nights: dest.nights, cost }
    })
    .filter(Boolean)

  if (rows.length === 0) return null

  const avgPerNight = totalNights > 0 ? Math.round(totalCost / totalNights) : 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.cards}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total accommodation</div>
          <div className={styles.metricValue}>€{totalCost.toLocaleString()}</div>
          <div className={styles.metricSub}>all cities combined</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Average per night</div>
          <div className={styles.metricValue}>€{avgPerNight}</div>
          <div className={styles.metricSub}>{totalNights} nights total</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Destinations</div>
          <div className={styles.metricValue}>{cities.length}</div>
          <div className={styles.metricSub}>cities planned</div>
        </div>
      </div>

      <div className={styles.breakdown}>
        {rows.map(({ city, hotel, nights, cost }) => (
          <div key={city} className={styles.breakdownRow}>
            <div>
              <span className={styles.breakdownCity}>{city}</span>
              <span className={styles.breakdownHotel}>{hotel.name}</span>
            </div>
            <div className={styles.breakdownRight}>
              <span className={styles.breakdownNights}>{nights}n</span>
              <span className={styles.breakdownCost}>€{cost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
