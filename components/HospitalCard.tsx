import { PlanTier } from '@/constants/features'

type Hospital = {
  name: string
  address: string
  specialties: string[]
  rating?: number
  crowded?: string
  distance?: string
}

export function HospitalCard({
  hospital,
  plan,
}: {
  hospital: Hospital
  plan: PlanTier
}) {
  const isGold = plan === 'gold'

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="font-bold text-lg">{hospital.name}</div>
      <div className="text-sm text-gray-600 mb-1">{hospital.address}</div>
      <div className="text-sm mb-1">診療科: {hospital.specialties.join(', ')}</div>
      {hospital.distance && <div className="text-sm mb-1">現在地から約 {hospital.distance} km</div>}

      <div className="text-sm">
        <strong>評価：</strong>
        {isGold ? (
          <span>⭐ {hospital.rating}</span>
        ) : (
          <button className="text-blue-600 underline text-sm" onClick={() => window.location.href = '/upgrade'}>
            ゴールドで表示
          </button>
        )}
      </div>

      <div className="text-sm">
        <strong>混雑状況：</strong>
        {isGold ? (
          <span>{hospital.crowded}</span>
        ) : (
          <button className="text-blue-600 underline text-sm" onClick={() => window.location.href = '/upgrade'}>
            ゴールドで表示
          </button>
        )}
      </div>
    </div>
  )
}
