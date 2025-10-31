'use client'

import { useUserInfo } from '@/lib/hooks/useUserInfo'
import { HospitalCard } from '@/components/HospitalCard'
import { SortFilterBar } from '@/components/SortFilterBar'
import { PlanTier } from '@/constants/features'
import { useEffect, useState } from 'react'

// 距離計算関数（haversine）
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (v: number) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// 距離フィルター：区間ラベル → [min, max]
const DISTANCE_RANGES: Record<string, [number, number]> = {
  '~2km': [0, 2],
  '2~5km': [2, 5],
  '5~10km': [5, 10],
  '10~20km': [10, 20],
}

export default function HospitalsPage() {
  const { plan = 'free' } = useUserInfo()
  const [hospitals, setHospitals] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<'distance_asc' | 'distance_desc' | 'rating' | 'crowded'>('distance_asc')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['内科'])
  const [distanceRange, setDistanceRange] = useState<'~2km' | '2~5km' | '5~10km' | '10~20km'>('~2km')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setIsLoading(true)

      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: '20000', // 常に最大取得範囲
      })
      selectedSpecialties.forEach((s) => params.append('keywords', s))

      const res = await fetch(`/api/hospitals?${params.toString()}`)
      const json = await res.json()

      const enriched = json.hospitals.map((h: any) => {
        const d = haversine(lat, lng, h.lat, h.lng)
        return { ...h, distance: d }
      })

      setHospitals(enriched)
      setIsLoading(false)
    })
  }, [selectedSpecialties])

  // 距離フィルター適用
  const [min, max] = DISTANCE_RANGES[distanceRange]
  const filteredHospitals = hospitals
    .filter((h) => h.distance !== undefined)
    .filter((h) => h.distance >= min && h.distance <= max)

  // ソート
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (sortBy === 'distance_asc') return a.distance - b.distance
    if (sortBy === 'distance_desc') return b.distance - a.distance
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
    return 0
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        🏥 病院情報
        {isLoading && <span className="ml-4 text-sm text-gray-500">🌀 病院情報を取得中です…</span>}
      </h1>
      <SortFilterBar
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedSpecialties={selectedSpecialties}
        setSelectedSpecialties={setSelectedSpecialties}
        distanceRange={distanceRange}
        setDistanceRange={setDistanceRange}
        plan={plan as PlanTier}
      />
      <div className="mt-4 space-y-4">
        {sortedHospitals.length === 0 ? (
          <p className="text-sm text-gray-500">この条件では病院が見つかりませんでした。</p>
        ) : (
          sortedHospitals.map((hospital, index) => (
            <HospitalCard
              key={index}
              hospital={{
                name: hospital.name,
                address: hospital.address,
                specialties: selectedSpecialties,
                rating: hospital.rating,
                crowded: '未取得',
                distance: hospital.distance.toFixed(1),
              }}
              plan={plan as PlanTier}
            />
          ))
        )}
      </div>
    </div>
  )
}
