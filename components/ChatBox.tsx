"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SYMPTOM_CATEGORIES: Record<string, string[]> = {
  "呼吸器": ["咳が出る", "息苦しい", "鼻水が出る"],
  "消化器": ["お腹が痛い", "下痢している", "吐き気がする"],
  "神経系": ["頭が痛い", "めまいがある"],
  "全身": ["発熱がある", "体がだるい"],
  "循環器": ["胸が痛い"],
  "その他": ["関節が痛い", "皮膚に発疹がある", "目が充血している"]
};

const TIMING_OPTIONS = ["今朝から", "昨日から", "数日前から", "1週間以上前から"];
const COURSE_OPTIONS = ["症状が悪化している", "改善傾向", "変化なし"];
const HISTORY_OPTIONS = ["高血圧あり", "糖尿病あり", "心疾患あり", "持病なし"];

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
const MAX_FREE_DIAGNOSES = 3;
const getCurrentMonthKey = () => {
  const now = new Date();
  return `diagnosis-count-${now.getFullYear()}-${now.getMonth() + 1}`;
};

type Props = {
  onSend: (text: string) => void;
  onCloseForm?: () => void;
  disabled?: boolean;
};

export default function ChatBox({ onSend, onCloseForm, disabled = false }: Props) {
  const router = useRouter();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [timing, setTiming] = useState("");
  const [course, setCourse] = useState("");
  const [history, setHistory] = useState("");
  const [freeText, setFreeText] = useState("");

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    if (disabled) return;

    if (!IS_DEV_MODE) {
      const monthKey = getCurrentMonthKey();
      const currentCount = parseInt(localStorage.getItem(monthKey) || "0");

      if (currentCount >= MAX_FREE_DIAGNOSES) {
        alert("今月の無料診断回数（3回）を超えました。\n無制限で使うにはプレミアム登録が必要です。");
        router.push("/upgrade");
        return;
      }

      localStorage.setItem(monthKey, String(currentCount + 1));
    }

    const combined = [
      ...selectedSymptoms,
      timing && `発症タイミング: ${timing}`,
      course && `症状の経過: ${course}`,
      history && `持病: ${history}`,
      freeText.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    if (!combined) return;

    onCloseForm?.();
    onSend(combined);

    setSelectedSymptoms([]);
    setTiming("");
    setCourse("");
    setHistory("");
    setFreeText("");
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="text-sm text-gray-600">症状をカテゴリごとに選んでください（複数可）</div>
      {Object.entries(SYMPTOM_CATEGORIES).map(([category, symptoms]) => (
        <div key={category}>
          <div className="font-semibold text-sm text-gray-700">{category}</div>
          <div className="flex flex-wrap gap-3 mt-1">
            {symptoms.map((symptom) => (
              <label key={symptom} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedSymptoms.includes(symptom)}
                  onChange={() => toggleSymptom(symptom)}
                  disabled={disabled}
                  className="accent-blue-500"
                />
                {symptom}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <select
          value={timing}
          onChange={(e) => setTiming(e.target.value)}
          disabled={disabled}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">発症タイミングを選択</option>
          {TIMING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          disabled={disabled}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">症状の経過を選択</option>
          {COURSE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <select
          value={history}
          onChange={(e) => setHistory(e.target.value)}
          disabled={disabled}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">持病の有無を選択</option>
          {HISTORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <input
        type="text"
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder="その他の補足（例：39度の発熱がある、など）"
        disabled={disabled}
        className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
      />

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="bg-blue-500 text-white text-sm rounded px-4 py-2 hover:bg-blue-600 disabled:opacity-50"
      >
        診断する
      </button>
    </div>
  );
}
