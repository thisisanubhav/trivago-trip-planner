import { useState } from 'react'
import.meta.env.VITE_ANTHROPIC_API_KEY
import DestinationCard from './components/DestinationCard'
import HotelCard from './components/HotelCard'
import BudgetSummary from './components/BudgetSummary'
import ItineraryView from './components/ItineraryView'
import { searchHotelsForDestination } from './api/claude'
import { defaultCheckin, calcCheckout, addDays } from './utils/dates'
import styles from './App.module.css'

const INITIAL_CHECKIN = defaultCheckin()
const INITIAL_CHECKOUT = calcCheckout(INITIAL_CHECKIN, 3)

function makeDestination(checkin = INITIAL_CHECKIN, nights = 3) {
  return { city: '', nights, checkin, checkout: calcCheckout(checkin, nights) }
}

const TABS = ['plan', 'results', 'itinerary']

export default function App() {
  const [tab, setTab] = useState('plan')
  const [destinations, setDestinations] = useState([makeDestination()])
  const [adults, setAdults] = useState(2)
  const [rooms, setRooms] = useState(1)

  const [loading, setLoading] = useState(false)
  const [loadingCity, setLoadingCity] = useState('')
  const [results, setResults] = useState({})
  const [selectedHotels, setSelectedHotels] = useState({})
  const [error, setError] = useState('')

  const [visibleTabs, setVisibleTabs] = useState({ results: false, itinerary: false })

  function handleDestChange(index, updated) {
    setDestinations((prev) => prev.map((d, i) => (i === index ? updated : d)))
  }

  function addDestination() {
    setDestinations((prev) => {
      const last = prev[prev.length - 1]
      const nextCheckin = last.checkout || addDays(last.checkin, parseInt(last.nights) || 3)
      return [...prev, makeDestination(nextCheckin, 3)]
    })
  }

  function removeDestination(index) {
    setDestinations((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSearch() {
    setError('')
    const validDests = destinations.filter((d) => d.city.trim())
    if (validDests.length === 0) {
      setError('Please enter at least one destination.')
      return
    }
    for (const d of validDests) {
      if (!d.checkin || !d.checkout) {
        setError(`Please set check-in and check-out dates for ${d.city}.`)
        return
      }
    }

    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setError('Missing VITE_ANTHROPIC_API_KEY. Copy .env.example to .env and add your key.')
      return
    }

    setLoading(true)
    setResults({})
    setSelectedHotels({})
    setVisibleTabs({ results: true, itinerary: false })
    setTab('results')

    const newResults = {}
    for (const d of validDests) {
      setLoadingCity(d.city)
      try {
        const hotels = await searchHotelsForDestination({
          city: d.city,
          checkin: d.checkin,
          checkout: d.checkout,
          nights: parseInt(d.nights) || 3,
          adults,
          rooms,
        })
        newResults[d.city] = { hotels, dest: d }
      } catch (e) {
        newResults[d.city] = { hotels: [], dest: d, error: e.message }
      }
      setResults({ ...newResults })
    }

    setLoading(false)
    setLoadingCity('')
  }

  function selectHotel(city, idx) {
    setSelectedHotels((prev) => ({ ...prev, [city]: idx }))
  }

  const allCities = Object.keys(results)
  const allSelected = allCities.length > 0 && allCities.every(
    (c) => selectedHotels[c] !== undefined || results[c]?.hotels?.length === 0
  )

  function handleBuildItinerary() {
    setVisibleTabs((prev) => ({ ...prev, itinerary: true }))
    setTab('itinerary')
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.mcpBadge}>
            <span className={styles.mcpDot} />
            Powered by trivago MCP
          </div>
          <h1>Trip Intelligence Planner</h1>
          <p>Search hotels across multiple cities, compare options, and get a personalised itinerary.</p>
        </header>

        <div className={styles.tabs}>
          {TABS.map((t) => {
            if (t !== 'plan' && !visibleTabs[t]) return null
            return (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'plan' ? 'Plan trip' : t === 'results' ? 'Results' : 'Itinerary'}
              </button>
            )
          })}
        </div>

        {tab === 'plan' && (
          <div className={styles.panel}>
            {destinations.map((dest, i) => (
              <DestinationCard
                key={i}
                dest={dest}
                index={i}
                total={destinations.length}
                onChange={handleDestChange}
                onRemove={removeDestination}
              />
            ))}
            <button className={styles.addBtn} onClick={addDestination}>
              + Add another destination
            </button>
            <div className={styles.travellerRow}>
              <div className={styles.field}>
                <label>Adults</label>
                <input type="number" min="1" max="10" value={adults} onChange={(e) => setAdults(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Rooms</label>
                <input type="number" min="1" max="5" value={rooms} onChange={(e) => setRooms(e.target.value)} />
              </div>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
              Search hotels across all destinations
            </button>
          </div>
        )}

        {tab === 'results' && (
          <div className={styles.panel}>
            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Searching hotels across {destinations.filter((d) => d.city).length} destination(s)…</p>
                {loadingCity && <p className={styles.loadingCity}>Querying trivago for {loadingCity}…</p>}
              </div>
            )}

            {allCities.map((city) => {
              const { hotels, dest, error: cityErr } = results[city]
              return (
                <div key={city} className={styles.citySection}>
                  <div className={styles.cityLabel}>
                    <span>{city}</span>
                    <span className={styles.cityDates}>{dest.checkin} → {dest.checkout} · {dest.nights} nights</span>
                  </div>
                  {cityErr && <div className={styles.error}>Could not load results for {city}: {cityErr}</div>}
                  {!cityErr && hotels.length === 0 && (
                    <div className={styles.noResults}>No hotels found for {city}.</div>
                  )}
                  {hotels.length > 0 && (
                    <div className={styles.hotelGrid}>
                      {hotels.map((hotel, idx) => (
                        <HotelCard
                          key={idx}
                          hotel={hotel}
                          nights={dest.nights}
                          selected={selectedHotels[city] === idx}
                          onSelect={() => selectHotel(city, idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {!loading && allCities.length > 0 && (
              <>
                <BudgetSummary results={results} selectedHotels={selectedHotels} />
                {allSelected ? (
                  <button className={styles.searchBtn} style={{ marginTop: '1rem' }} onClick={handleBuildItinerary}>
                    Build itinerary →
                  </button>
                ) : (
                  <p className={styles.hint}>Select one hotel per destination to continue.</p>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'itinerary' && (
          <div className={styles.panel}>
            <ItineraryView results={results} selectedHotels={selectedHotels} />
          </div>
        )}

        <footer className={styles.footer}>
          Built with the{' '}
          <a href="https://mcp.trivago.com/docs" target="_blank" rel="noopener noreferrer">
            trivago MCP Server
          </a>{' '}
          · Hotel data via trivago
        </footer>
      </div>
    </div>
  )
}
