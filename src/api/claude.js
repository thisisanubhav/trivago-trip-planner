function fallbackHotels(city) {
  return [
    {
      name: `Central ${city} Hotel`,
      area: 'City Centre',
      pricePerNight: 115,
      stars: 4,
      rating: 8.1,
      highlights: 'Great central location, modern rooms',
    },
    {
      name: `${city} Boutique Suites`,
      area: 'Old Town',
      pricePerNight: 88,
      stars: 3,
      rating: 7.9,
      highlights: 'Charming decor, close to attractions',
    },
    {
      name: `Grand ${city} Resort`,
      area: 'Riverside',
      pricePerNight: 210,
      stars: 5,
      rating: 9.2,
      highlights: 'Spa, rooftop pool, fine dining',
    },
  ]
}

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`)
  }

  return data
}

export async function searchHotelsForDestination(request) {
  try {
    return await postJson('/api/search-hotels', request)
  } catch (error) {
    console.warn(`Backend hotel search failed for ${request.city}:`, error.message)

    return {
      hotels: fallbackHotels(request.city),
      source: 'fallback',
      warning: 'The backend could not be reached, so local demo hotel results are shown instead.',
      error: error.message,
    }
  }
}

export async function generateTravelBrief(selections) {
  try {
    return await postJson('/api/travel-brief', { selections })
  } catch (error) {
    console.warn('Backend travel brief generation failed:', error.message)

    return {
      text: null,
      source: 'fallback',
      warning: 'The backend could not generate an AI travel brief, so a local summary is shown instead.',
      error: error.message,
    }
  }
}
