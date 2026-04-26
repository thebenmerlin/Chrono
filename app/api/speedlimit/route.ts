import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Default speed limits by road type (km/h) — used only when OSM has no maxspeed tag
const ROAD_TYPE_LIMITS: Record<string, number> = {
  motorway:       130,
  motorway_link:   80,
  trunk:          100,
  trunk_link:      70,
  primary:         80,
  primary_link:    60,
  secondary:       60,
  secondary_link:  50,
  tertiary:        50,
  tertiary_link:   40,
  unclassified:    50,
  residential:     30,
  living_street:   20,
  service:         20,
}

// Higher = more significant road (used as a secondary sort after proximity)
const ROAD_PRIORITY: Record<string, number> = {
  motorway: 10, trunk: 9, primary: 8, secondary: 7,
  tertiary: 6, unclassified: 5, residential: 4,
  living_street: 3, service: 2,
  motorway_link: 1, trunk_link: 1, primary_link: 1, secondary_link: 1, tertiary_link: 1,
}

function parseMaxspeed(ms: string): number | null {
  const s = ms.toLowerCase().trim()
  if (s === 'walk' || s === 'foot') return 10
  if (s === 'none' || s === 'unlimited') return null   // no enforced limit
  if (s === 'signals' || s === 'variable') return null // variable — skip
  const mph = s.match(/^(\d+\.?\d*)\s*mph$/)
  if (mph) return Math.round(parseFloat(mph[1]) * 1.60934)
  const num = s.match(/^(\d+\.?\d*)(\s*(km\/h))?$/)
  if (num) { const v = parseFloat(num[1]); return isNaN(v) ? null : v }
  return null  // country-tagged or conditional — caller will infer from road type
}

function distMeters(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLon - aLon)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 })
  }

  const qLat = parseFloat(lat)
  const qLon = parseFloat(lon)

  try {
    // Get all nearby roads with center coordinates for proximity sorting
    const query = `
      [out:json][timeout:15];
      way(around:50,${lat},${lon})[highway~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street|service)$"];
      out center 10;
    `
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    const res = await fetch(url, { next: { revalidate: 30 } })
    if (!res.ok) throw new Error(`Overpass ${res.status}`)

    const data = await res.json()
    const ways: Array<{ tags: Record<string, string>; center?: { lat: number; lon: number } }> = data.elements ?? []

    if (ways.length === 0) {
      return NextResponse.json({ limit_kmh: null, limit_mph: null, road_name: null, inferred: false })
    }

    // Sort: nearest center first; use road priority as tiebreaker within 5 m
    ways.sort((a, b) => {
      const da = a.center ? distMeters(qLat, qLon, a.center.lat, a.center.lon) : 9999
      const db = b.center ? distMeters(qLat, qLon, b.center.lat, b.center.lon) : 9999
      if (Math.abs(da - db) < 5) {
        return (ROAD_PRIORITY[b.tags?.highway] ?? 0) - (ROAD_PRIORITY[a.tags?.highway] ?? 0)
      }
      return da - db
    })

    // Prefer the nearest road that has an explicit maxspeed tag, fall back to nearest overall
    const withMaxspeed = ways.find(w => w.tags?.maxspeed)
    const best = withMaxspeed && (() => {
      const nearest = ways[0]
      if (!nearest.center || !withMaxspeed.center) return withMaxspeed
      const dNearest  = distMeters(qLat, qLon, nearest.center.lat, nearest.center.lon)
      const dTagged   = distMeters(qLat, qLon, withMaxspeed.center.lat, withMaxspeed.center.lon)
      // Only prefer the tagged road if it's within 15 m of the nearest road
      return dTagged - dNearest <= 15 ? withMaxspeed : nearest
    })() || ways[0]

    const highway  = best.tags?.highway ?? ''
    const roadName = best.tags?.name ?? best.tags?.ref ?? highway ?? 'Road'
    let kmh: number | null = null
    let inferred = false

    if (best.tags?.maxspeed) {
      kmh = parseMaxspeed(best.tags.maxspeed)
      if (kmh === null) {
        // Un-parseable tag (e.g. country-tagged) — fall back to road type
        kmh = ROAD_TYPE_LIMITS[highway] ?? null
        inferred = kmh !== null
      }
    } else {
      kmh = ROAD_TYPE_LIMITS[highway] ?? null
      inferred = kmh !== null
    }

    return NextResponse.json({
      limit_kmh: kmh,
      limit_mph: kmh ? Math.round(kmh / 1.60934) : null,
      road_name: roadName,
      inferred,
    })
  } catch {
    return NextResponse.json({ limit_kmh: null, limit_mph: null, road_name: null, inferred: false })
  }
}
