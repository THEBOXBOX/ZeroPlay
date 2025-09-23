'use client'

import { use } from 'react';
import BenefitDetailPage from '@/app/benefits/components/BenefitDetailPage';

export default function BenefitDetail({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15에서는 params를 Promise로 unwrap 해야 함
  const resolvedParams = use(params);

  // 새로운 BenefitDetailPage 컴포넌트는 prop을 받지 않고 
  // 내부에서 URL 파라미터를 직접 처리합니다
  return <BenefitDetailPage />;
}