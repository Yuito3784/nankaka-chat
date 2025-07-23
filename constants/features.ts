export type PlanTier = 'free' | 'premium' | 'gold'

export const planPriority: Record<PlanTier, number> = {
  free: 0,
  premium: 1,
  gold: 2,
}

export const features = [
  {
    title: '診断回数',
    icon: '🧠',
    paths: [],
    free: '月3回まで',
    premium: '無制限',
    gold: '無制限',
  },
  {
    title: '症状の履歴保存',
    icon: '📜',
    paths: ['/history'],
    free: '❌ 保存不可',
    premium: '✅ 過去1ヶ月分',
    gold: '✅ 無期限保存',
    requiredPlan: 'premium' as PlanTier,
  },
  {
    title: '病院情報の閲覧',
    icon: '🏥',
    paths: ['/hospitals'],
    free: '❌ 不可',
    premium: '✅ 最寄り病院を表示',
    gold: '✅ 評価・混雑も表示可能',
    requiredPlan: 'premium' as PlanTier,
  },
  {
    title: 'カレンダー連携',
    icon: '📅',
    paths: ['/calendar'],
    free: '❌ 非対応',
    premium: '❌ 非対応',
    gold: '✅ Googleカレンダー連携',
    requiredPlan: 'gold' as PlanTier,
  },
  {
    title: '地域別トレンド通知',
    icon: '🔔',
    paths: ['/notifications'],
    free: '❌ 非対応',
    premium: '❌ 非対応',
    gold: '✅ 対応',
    requiredPlan: 'gold' as PlanTier,
  },
  {
    title: 'チャットボット制限',
    icon: '💬',
    paths: [],
    free: '制限あり（5ターン）',
    premium: '制限緩和（30ターン）',
    gold: '完全開放（無制限）',
  },
]