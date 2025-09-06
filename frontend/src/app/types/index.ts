export interface TravelRecommendation {
    id: number;
    title: string;
    budget: number;
    duration: string;
    highlights: string[];
    estimatedCost: {
      transportation: number;
      accommodation: number;
      food: number;
    };
  }
  
  export interface LocalExperience {
    id: number;
    name: string;
    region: string;
    price: number;
    duration: string;
    rating: number;
    isYouthOwned: boolean;
  }
  
  export interface YouthBenefit {
    id: number;
    title: string;
    category: string;
    discount: string;
    eligibility: string;
    description: string;
  }