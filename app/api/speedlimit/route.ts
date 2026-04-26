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
    // Query nearest road with maxspeed tag via Overpass API
    const query = `
      [out:json][timeout:10];
      way(around:30,${lat},${lon})[highway][maxspeed];
      out 1;
    `
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      next: { revalidate: 30 }, // 30s cache
    })

    if (!res.ok) throw new Error(`Overpass error: ${res.status}`)

    const data = await res.json()
    const way = data.elements?.[0]
    const maxspeed: string | undefined = way?.tags?.maxspeed
    const roadName: string = way?.tags?.name ?? way?.tags?.ref ?? 'Unknown road'

    if (!maxspeed) {
      return NextResponse.json({ limit_kmh: null, limit_mph: null, road_name: roadName })
    }

    // Parse "50", "50 mph", "50 km/h", "30 mph"
    let kmh: number | null = null
    if (maxspeed.includes('mph')) {
      kmh = Math.round(parseFloat(maxspeed) * 1.60934)
    } else {
      kmh = parseFloat(maxspeed)
    }

    return NextResponse.json({
      limit_kmh: isNaN(kmh) ? null : kmh,
      limit_mph: kmh ? Math.round(kmh / 1.60934) : null,
      road_name: roadName,
    })
  } catch {
    return NextResponse.json({ limit_kmh: null, limit_mph: null, road_name: null })
  }
}
