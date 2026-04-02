import styles from './DestinationCard.module.css'
import { calcCheckout } from '../utils/dates'

export default function DestinationCard({ dest, index, total, onChange, onRemove }) {
  function handleField(field, value) {
    const updated = { ...dest, [field]: value }
    if (field === 'nights' || field === 'checkin') {
      updated.checkout = calcCheckout(
        field === 'checkin' ? value : dest.checkin,
        field === 'nights' ? parseInt(value) || 3 : parseInt(dest.nights) || 3
      )
    }
    onChange(index, updated)
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.badge}>Destination {index + 1}</span>
        {total > 1 && (
          <button className={styles.removeBtn} onClick={() => onRemove(index)} aria-label="Remove destination">
            ×
          </button>
        )}
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>City or area</label>
          <input
            type="text"
            placeholder="e.g. Paris, France"
            value={dest.city}
            onChange={(e) => handleField('city', e.target.value)}
          />
        </div>
        <div className={styles.fieldSmall}>
          <label>Nights</label>
          <input
            type="number"
            min="1"
            max="30"
            value={dest.nights}
            onChange={(e) => handleField('nights', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>Check-in</label>
          <input
            type="date"
            value={dest.checkin}
            onChange={(e) => handleField('checkin', e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>Check-out</label>
          <input type="date" value={dest.checkout} readOnly style={{ opacity: 0.7 }} />
        </div>
      </div>
    </div>
  )
}
