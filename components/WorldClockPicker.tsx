'use client'

import { useState, useMemo } from 'react'
import { useMode } from '@/context/ModeContext'
import { WORLD_CLOCK_CITIES } from '@/lib/worldClockCities'

const REGIONS = ['All', 'Americas', 'Europe', 'Africa', 'Middle East', 'Asia', 'Oceania', 'UTC']

export default function WorldClockPicker() {
  const { params, setMode } = useMode()
  const [region, setRegion] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return WORLD_CLOCK_CITIES.filter((c) => {
      const matchesRegion = region === 'All' || c.region === region
      const matchesSearch = !q || c.name.toLowerCase().includes(q)
      return matchesRegion && matchesSearch
    })
  }, [region, search])

  const selected = params.timezone

  return (
    <div className="w-full max-w-sm mx-auto mt-2 mb-1 px-2">
      {/* Search */}
      <input
        type="text"
        placeholder="Search city…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-full px-3 py-1 text-xs mb-2 outline-none"
        style={{
          background: 'var(--face-bg)',
          border: '1px solid var(--bezel-border)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
        }}
      />

      {/* Region tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar mb-2">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className="shrink-0 px-2 py-0.5 rounded-full text-[9px] tracking-wider transition-all"
            style={{
              fontFamily: 'var(--font-mono)',
              background: region === r ? 'var(--accent)' : 'var(--face-bg)',
              color: region === r ? 'var(--face-bg)' : 'var(--text-secondary)',
              border: '1px solid var(--bezel-border)',
            }}
          >
            {r.toUpperCase()}
          </button>
        ))}
      </div>

      {/* City grid */}
      <div
        className="grid gap-1 overflow-y-auto"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          maxHeight: '96px',
        }}
      >
        {filtered.map((city) => {
          const isActive = selected === city.timezone
          return (
            <button
              key={`${city.name}-${city.timezone}`}
              onClick={() => setMode('worldclock', { timezone: city.timezone })}
              className="rounded px-1.5 py-1 text-[9px] text-left transition-all truncate"
              style={{
                fontFamily: 'var(--font-mono)',
                background: isActive ? 'var(--accent)' : 'var(--face-bg)',
                color: isActive ? 'var(--face-bg)' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--bezel-border)'}`,
                letterSpacing: '0.04em',
              }}
              title={city.timezone}
            >
              {city.name.toUpperCase()}
            </button>
          )
        })}
        {filtered.length === 0 && (
          <span
            className="col-span-3 text-center text-[9px] py-2"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
          >
            NO RESULTS
          </span>
        )}
      </div>
    </div>
  )
}
