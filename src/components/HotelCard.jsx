import styles from './HotelCard.module.css'

export default function HotelCard({ hotel, nights, selected, onSelect }) {
  const stars = '★'.repeat(Math.min(5, hotel.stars || 3)) + '☆'.repeat(Math.max(0, 5 - (hotel.stars || 3)))
  const total = Math.round((hotel.pricePerNight || 0) * (nights || 1))

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={selected}
    >
      {selected && <div className={styles.selectedBadge}>✓ Selected</div>}
      <div className={styles.name}>{hotel.name}</div>
      <div className={styles.area}>{hotel.area}</div>
      <div className={styles.highlights}>{hotel.highlights}</div>
      <div className={styles.footer}>
        <div className={styles.priceRow}>
          <span className={styles.price}>€{hotel.pricePerNight}</span>
          <span className={styles.perNight}>/night</span>
        </div>
        <span className={styles.rating}>{hotel.rating}/10</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.stars}>{stars}</span>
        <span className={styles.total}>€{total} total</span>
      </div>
    </div>
  )
}
