import { PlanTier } from '@/constants/features'
import React from 'react'

const SPECIALTIES = ['内科', '精神科', '皮膚科', '外科']
const DISTANCE_OPTIONS = ['~2km', '2~5km', '5~10km', '10~20km'] as const

type SortOption = 'distance_asc' | 'distance_desc' | 'rating' | 'crowded'
type DistanceRange = (typeof DISTANCE_OPTIONS)[number]

export function SortFilterBar({
  sortBy,
  setSortBy,
  selectedSpecialties,
  setSelectedSpecialties,
  distanceRange,
  setDistanceRange,
  plan,
}: {
  sortBy: SortOption
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>
  selectedSpecialties: string[]
  setSelectedSpecialties: React.Dispatch<React.SetStateAction<string[]>>
  distanceRange: DistanceRange
  setDistanceRange: React.Dispatch<React.SetStateAction<DistanceRange>>
  plan: PlanTier
}) {
  const isGold = plan === 'gold'

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev: string[]) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap items-center">
        <label className="text-sm">ソート：</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border px-2 py-1 rounded"
        >
          <option value="distance_asc">距離順（近い順）</option>
          <option value="distance_desc">距離順（遠い順）</option>
          <option value="rating" disabled={!isGold}>評価順</option>
          <option value="crowded" disabled={!isGold}>空いている順</option>
        </select>

        <label className="text-sm ml-4">距離フィルター：</label>
        <select
          value={distanceRange}
          onChange={(e) => setDistanceRange(e.target.value as DistanceRange)}
          className="border px-2 py-1 rounded"
        >
          {DISTANCE_OPTIONS.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <span className="text-sm">診療科：</span>
        {SPECIALTIES.map((s) => (
          <label key={s} className="text-sm flex items-center gap-1">
            <input
              type="checkbox"
              checked={selectedSpecialties.includes(s)}
              onChange={() => toggleSpecialty(s)}
            />
            {s}
          </label>
        ))}
      </div>
    </div>
  )
}
