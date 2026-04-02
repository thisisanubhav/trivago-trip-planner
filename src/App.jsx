import { useState } from 'react'
import DestinationCard from './components/DestinationCard'
import HotelCard from './components/HotelCard'
import BudgetSummary from './components/BudgetSummary'
import ItineraryView from './components/ItineraryView'
import { searchHotelsForDestination } from './api/claude'
import { appConfig } from './config'
import { defaultCheckin, calcCheckout, addDays, totalNights } from './utils/dates'
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
  const [warning, setWarning] = useState('')
  const [visibleTabs, setVisibleTabs] = useState({ results: false, itinerary: false })

  function handleDestChange(index, updated) {
    setDestinations((prev) => prev.map((destination, itemIndex) => (itemIndex === index ? updated : destination)))
  }

  function addDestination() {
    setDestinations((prev) => {
      const last = prev[prev.length - 1]
      const nextCheckin = last.checkout || addDays(last.checkin, parseInt(last.nights, 10) || 3)
      return [...prev, makeDestination(nextCheckin, 3)]
    })
  }

  function removeDestination(index) {
    setDestinations((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  function validateSearch() {
    const trimmedDestinations = destinations.map((destination) => ({
      ...destination,
      city: destination.city.trim(),
      nights: parseInt(destination.nights, 10) || 0,
    }))

    const activeDestinations = trimmedDestinations.filter((destination) => destination.city)

    if (activeDestinations.length === 0) {
      return { valid: false, message: 'Add at least one destination before searching.' }
    }

    for (const destination of activeDestinations) {
      if (destination.city.length < 2) {
        return { valid: false, message: `Destination names should be at least 2 characters long. Please update ${destination.city}.` }
      }

      if (!destination.checkin || !destination.checkout) {
        return { valid: false, message: `Please set both dates for ${destination.city}.` }
      }

      if (destination.nights < 1 || destination.nights > 30) {
        return { valid: false, message: `Nights for ${destination.city} must be between 1 and 30.` }
      }
    }

    if (Number(adults) < 1 || Number(adults) > 10) {
      return { valid: false, message: 'Adults must be between 1 and 10.' }
    }

    if (Number(rooms) < 1 || Number(rooms) > 5) {
      return { valid: false, message: 'Rooms must be between 1 and 5.' }
    }

    return { valid: true, activeDestinations }
  }

  async function handleSearch() {
    setError('')
    setWarning('')

    const validation = validateSearch()
    if (!validation.valid) {
      setError(validation.message)
      return
    }

    const validDestinations = validation.activeDestinations
    setLoading(true)
    setResults({})
    setSelectedHotels({})
    setVisibleTabs({ results: true, itinerary: false })
    setTab('results')

    const nextResults = {}
    const warningMessages = []

    for (const destination of validDestinations) {
      setLoadingCity(destination.city)

      const response = await searchHotelsForDestination({
        city: destination.city,
        checkin: destination.checkin,
        checkout: destination.checkout,
        nights: destination.nights,
        adults: Number(adults),
        rooms: Number(rooms),
      })

      nextResults[destination.city] = {
        hotels: response.hotels,
        dest: destination,
        source: response.source,
        warning: response.warning || '',
        error: response.error || '',
      }

      if (response.warning) {
        warningMessages.push(response.warning)
      }

      setResults({ ...nextResults })
    }

    setWarning(Array.from(new Set(warningMessages)).join(' '))
    setLoading(false)
    setLoadingCity('')
  }

  function selectHotel(city, index) {
    setSelectedHotels((prev) => ({ ...prev, [city]: index }))
  }

  function handleBuildItinerary() {
    setVisibleTabs((prev) => ({ ...prev, itinerary: true }))
    setTab('itinerary')
  }

  const allCities = Object.keys(results)
  const allSelected = allCities.length > 0 && allCities.every(
    (city) => selectedHotels[city] !== undefined || results[city]?.hotels?.length === 0
  )
  const plannedStops = destinations.filter((destination) => destination.city.trim()).length || destinations.length
  const searchCount = destinations.filter((destination) => destination.city.trim()).length
  const selectedCount = Object.keys(selectedHotels).length
  const totalTripNights = totalNights(destinations)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.mcpBadge}>
                <span className={styles.mcpDot} />
                Powered by trivago MCP
              </div>
              <h1>Design a sharper multi-city stay in minutes.</h1>
              <p>
                Map each stop, compare hotel options city by city, and turn your selections into a clean travel brief.
              </p>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Trip stops</span>
                <strong>{plannedStops}</strong>
                <span className={styles.statMeta}>{totalTripNights || 0} total nights across the route</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Current stage</span>
                <strong>{tab === 'plan' ? 'Planning' : tab === 'results' ? 'Comparing' : 'Finalising'}</strong>
                <span className={styles.statMeta}>Move from route planning to hotel selection</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.topBar}>
          <div className={styles.tabs}>
            {TABS.map((currentTab) => {
              if (currentTab !== 'plan' && !visibleTabs[currentTab]) return null

              return (
                <button
                  key={currentTab}
                  className={`${styles.tab} ${tab === currentTab ? styles.tabActive : ''}`}
                  onClick={() => setTab(currentTab)}
                >
                  <span className={styles.tabEyebrow}>Step</span>
                  <span>{currentTab === 'plan' ? 'Plan trip' : currentTab === 'results' ? 'Results' : 'Itinerary'}</span>
                </button>
              )
            })}
          </div>
          <div className={styles.statusStrip}>
            <span>{searchCount} destination{searchCount === 1 ? '' : 's'} ready</span>
            <span>{selectedCount} hotel pick{selectedCount === 1 ? '' : 's'}</span>
            {appConfig.isDemoMode && <span>Demo data mode</span>}
          </div>
        </div>

        {tab === 'plan' && (
          <div className={styles.panel}>
            <div className={styles.sectionIntro}>
              <div>
                <span className={styles.sectionLabel}>Trip Setup</span>
                <h2>Build the route you want to price and compare.</h2>
              </div>
              <p>Each destination auto-links to the next one, so you can sketch a full trip quickly and refine later.</p>
            </div>

            {appConfig.useMockData && (
              <div className={styles.noticeAlt}>
                <strong>Demo mode is on.</strong> The backend will use safe local fallbacks instead of live API calls.
              </div>
            )}

            {destinations.map((dest, index) => (
              <DestinationCard
                key={index}
                dest={dest}
                index={index}
                total={destinations.length}
                onChange={handleDestChange}
                onRemove={removeDestination}
              />
            ))}

            <button className={styles.addBtn} onClick={addDestination}>
              + Add another destination
            </button>

            <div className={styles.settingsCard}>
              <div className={styles.settingsHeader}>
                <div>
                  <span className={styles.sectionLabel}>Traveller Setup</span>
                  <h3>Adjust the search details once for every stop.</h3>
                </div>
                <p>Use this to keep pricing consistent across all destinations in the route.</p>
              </div>
              <div className={styles.travellerRow}>
                <div className={styles.field}>
                  <label>Adults</label>
                  <input type="number" min="1" max="10" value={adults} onChange={(event) => setAdults(event.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Rooms</label>
                  <input type="number" min="1" max="5" value={rooms} onChange={(event) => setRooms(event.target.value)} />
                </div>
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
            <div className={styles.sectionIntro}>
              <div>
                <span className={styles.sectionLabel}>Shortlist Hotels</span>
                <h2>Compare by city, then lock in one option per stop.</h2>
              </div>
              <p>The planner keeps everything grouped by destination so it is easy to build a balanced route.</p>
            </div>

            {warning && <div className={styles.noticeAlt}>{warning}</div>}
            {error && <div className={styles.error}>{error}</div>}

            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Searching hotels across {searchCount} destination(s)…</p>
                {loadingCity && <p className={styles.loadingCity}>Querying trivago for {loadingCity}…</p>}
              </div>
            )}

            {!loading && allCities.length === 0 && (
              <div className={styles.emptyState}>
                <h3>No results yet</h3>
                <p>Build your route on the Plan tab, then run a search to start comparing stays.</p>
              </div>
            )}

            {allCities.map((city) => {
              const { hotels, dest, error: cityError, warning: cityWarning, source } = results[city]

              return (
                <div key={city} className={styles.citySection}>
                  <div className={styles.cityLabel}>
                    <span>{city}</span>
                    <span className={styles.cityDates}>{dest.checkin} → {dest.checkout} · {dest.nights} nights</span>
                  </div>

                  {source === 'fallback' && cityWarning && (
                    <div className={styles.cityNotice}>{cityWarning}</div>
                  )}

                  {cityError && (
                    <div className={styles.error}>
                      Could not load live results for {city}: {cityError}
                    </div>
                  )}

                  {!cityError && hotels.length === 0 && (
                    <div className={styles.noResults}>No hotels found for {city}.</div>
                  )}

                  {hotels.length > 0 && (
                    <div className={styles.hotelGrid}>
                      {hotels.map((hotel, index) => (
                        <HotelCard
                          key={index}
                          hotel={hotel}
                          nights={dest.nights}
                          selected={selectedHotels[city] === index}
                          onSelect={() => selectHotel(city, index)}
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
                    Build itinerary
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
            <div className={styles.sectionIntro}>
              <div>
                <span className={styles.sectionLabel}>Trip Story</span>
                <h2>Turn your hotel selections into a clear itinerary view.</h2>
              </div>
              <p>A quick summary, selected properties, and an AI travel brief all live together here.</p>
            </div>
            <ItineraryView results={results} selectedHotels={selectedHotels} />
          </div>
        )}

        <footer className={styles.footer}>
          Built with trivago MCP. For production, move Anthropic calls behind a server route so the API key never ships to the browser.
        </footer>
      </div>
    </div>
  )
}
