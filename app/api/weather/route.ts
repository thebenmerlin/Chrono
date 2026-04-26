import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5 min cache
    })

    if (!res.ok) throw new Error(`OWM error: ${res.status}`)

    const data = await res.json()

    return NextResponse.json({
      temp_c: data.main.temp,
      temp_f: (data.main.temp * 9) / 5 + 32,
      feels_like: data.main.feels_like,
      condition: data.weather?.[0]?.description ?? '',
    })
  } catch (e) {
    return NextResponse.json({ error: 'Weather unavailable' }, { status: 502 })
  }
}
