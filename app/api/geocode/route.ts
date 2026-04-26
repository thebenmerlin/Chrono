import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Chrono-Watch/1.0' },
      next: { revalidate: 3600 }, // 1hr cache
    })

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`)

    const data = await res.json()
    const addr = data.address ?? {}

    return NextResponse.json({
      place_name: data.display_name,
      city: addr.city ?? addr.town ?? addr.village ?? addr.county ?? '',
      country: addr.country ?? '',
      country_code: addr.country_code ?? '',
    })
  } catch {
    return NextResponse.json({ place_name: null, city: null, country: null })
  }
}
