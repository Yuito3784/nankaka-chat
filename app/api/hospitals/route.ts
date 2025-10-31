// /app/api/hospitals/route.ts
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const keywords = searchParams.getAll('keywords') // 複数診療科
  const radius = searchParams.get('radius') || '3000' // メートル

  if (!lat || !lng) {
    return NextResponse.json({ error: '緯度経度が必要です' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  const keywordQuery = keywords.length > 0 ? keywords.join(' ') : '病院'
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
    keywordQuery
  )}&type=hospital&key=${apiKey}&language=ja`

  const res = await fetch(url)
  const data = await res.json()

  const hospitals = data.results.slice(0, 10).map((place: any) => ({
    name: place.name,
    address: place.vicinity,
    location: place.geometry.location,
    rating: place.rating,
    user_ratings_total: place.user_ratings_total,
    place_id: place.place_id,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }))

  return NextResponse.json({ hospitals })
}
