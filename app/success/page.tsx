// app/success/page.tsx
import { Suspense } from 'react';
import SuccessContent from './success-content';

// 事前レンダリングを避ける（検索クエリ依存のため）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
