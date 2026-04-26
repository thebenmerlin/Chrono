import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const AQI_LABELS: Record<number, string> = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })
  }

  const key = process.env.OPENWEATHERMAP_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
    const res = await fetch(url, {
      next: { revalidate: 600 }, // 10 min cache
    })

    if (!res.ok) throw new Error(`OWM AQI error: ${res.status}`)

    const data = await res.json()
    const components = data.list?.[0]?.components ?? {}
    const aqiIndex: number = data.list?.[0]?.main?.aqi ?? 1

    // Convert OWM 1–5 index to approximate EPA 0–500 scale
    const epaMap: Record<number, number> = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 300 }

    return NextResponse.json({
      aqi: epaMap[aqiIndex] ?? 25,
      aqi_index: aqiIndex,
      pm2_5: components.pm2_5,
      pm10: components.pm10,
      label: AQI_LABELS[aqiIndex] ?? 'Unknown',
    })
  } catch {
    return NextResponse.json({ error: 'AQI unavailable' }, { status: 502 })
  }
}
