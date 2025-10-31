// app/success/success-content.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan');

  const message =
    plan === 'premium'
      ? 'プレミアムプランにアップグレードされました。'
      : plan === 'gold'
      ? 'ゴールドプランにアップグレードされました。'
      : 'ご利用ありがとうございます。';

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">🎉 ご登録ありがとうございます！</h1>
        <p className="mb-6">{message}</p>
        <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
