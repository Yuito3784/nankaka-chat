// types/history.ts
export type History = {
  id: string
  userId: string
  symptom: string
  department: string
  urgency: string
  comment: string
  homeCare: string
  warningSymptoms: string
  helpfulToTellDoctor: string
  additionalDepartments: string
  createdAt: string
}

// フロントで使う簡略型（userIdを除外）
export type HistoryItem = Omit<History, 'userId'>