import { apiGet } from '@/utils/apiClient';
import { PricingTier } from '@/types';

/**
 * Fetches pricing tiers for Nothing products from the API.
 * Returns Basic Nothing, Pro Nothing, and Enterprise Nothing tiers.
 * Note: react-query will handle caching at the component level.
 */
export const fetchPricingTiers = async (): Promise<PricingTier[]> => {
  const response = await apiGet<PricingTier[]>('/api/pricing/nothing');
  return response.data;
};
