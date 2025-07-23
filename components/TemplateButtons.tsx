// components/TemplateButtons.tsx
"use client";

type Props = {
  onSelect: (text: string) => void;
};

const templates = [
  "頭が痛い",
  "のどが痛い",
  "咳が出る",
  "吐き気がする",
  "めまいがある",
  "腹痛がある",
  "下痢している",
  "胸が苦しい",
];

export default function TemplateButtons({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {templates.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
