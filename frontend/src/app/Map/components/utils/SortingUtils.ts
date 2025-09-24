import { LocalSpot } from '../../lib/api';
import { SortOption } from '../UI/SortDropdown';
import { hasLocalDeal } from '../localdeals/LocalDealsData';

/**
 * 거리 계산 함수 (Haversine formula)
 */
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * 거리 포맷 함수
 */
export const formatDistance = (
  userLocation: { lat: number; lng: number } | null,
  spot: LocalSpot
): string => {
  if (!userLocation) return '';
  
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    spot.latitude,
    spot.longitude
  );
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

/**
 * 스팟 정렬 함수
 */
export const sortSpots = (
  spots: LocalSpot[], 
  sortBy: SortOption, 
  userLocation?: { lat: number; lng: number } | null
): LocalSpot[] => {
  const sortedSpots = [...spots];

  switch (sortBy) {
    case 'recommended':
      return sortedSpots.sort((a, b) => {
        const aHasLocalDeal = hasLocalDeal(a.id);
        const bHasLocalDeal = hasLocalDeal(b.id);
        
        const aScore = (a.rating || 0) * 0.6 + 
                      Math.log(Math.max(a.review_count || 1, 1)) * 0.3 +
                      (aHasLocalDeal ? 0.5 : 0);
        const bScore = (b.rating || 0) * 0.6 + 
                      Math.log(Math.max(b.review_count || 1, 1)) * 0.3 +
                      (bHasLocalDeal ? 0.5 : 0);
        return bScore - aScore;
      });

    case 'distance':
      if (!userLocation) return sortedSpots;
      
      return sortedSpots.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          a.latitude, 
          a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          b.latitude, 
          b.longitude
        );
        return distanceA - distanceB;
      });

    case 'rating':
      return sortedSpots.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingA === ratingB) {
          return (b.review_count || 0) - (a.review_count || 0);
        }
        return ratingB - ratingA;
      });

    default:
      return sortedSpots;
  }
};