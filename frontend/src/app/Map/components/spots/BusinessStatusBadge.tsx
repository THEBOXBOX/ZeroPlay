'use client';

import React from 'react';

interface BusinessStatusResult {
  status: string;
  color: string;
}

interface BusinessStatusBadgeProps {
  operatingHours?: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  className?: string;
}

const BusinessStatusBadge: React.FC<BusinessStatusBadgeProps> = ({ 
  operatingHours, 
  className = "" 
}) => {
  const getBusinessStatus = (operatingHours?: {
    [key: string]: { open: string; close: string; closed?: boolean };
  }): BusinessStatusResult => {
    if (!operatingHours) {
      return { status: '시간 미확인', color: 'text-gray-500' };
    }

    const now = new Date();
    const currentHour = now.getHours();

    // 간단한 영업시간 체크 (9-22시 가정)
    if (currentHour >= 9 && currentHour < 22) {
      // 마감 1시간 전이면 '곧 마감'
      if (currentHour >= 21) {
        return { status: '곧 마감', color: 'text-orange-600' };
      }
      return { status: '영업 중', color: 'text-green-600' };
    } else {
      return { status: '영업 종료', color: 'text-red-600' };
    }
  };

  const businessStatus = getBusinessStatus(operatingHours);

  return (
    <span className={`text-sm font-medium ${businessStatus.color} ${className}`}>
      {businessStatus.status}
    </span>
  );
};

export default BusinessStatusBadge;