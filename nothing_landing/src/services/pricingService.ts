import { apiClient } from '../utils/apiClient';
import { PricingTier, CheckoutResponse } from '../types';

interface PricingService {
  getAll(): Promise<PricingTier[]>;
  checkout(tierId: string): Promise<CheckoutResponse>;
}

const getAll = async (): Promise<PricingTier[]> => {
  try {
    const response = await apiClient.get('/api/pricing/nothing');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pricing tiers:', error);
    throw new Error('Unable to load pricing information. Please try again later.');
  }
};

const checkout = async (tierId: string): Promise<CheckoutResponse> => {
  try {
    const response = await apiClient.post('/api/checkout/nothing', {
      tierId,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Checkout failed:', error);
    throw new Error('Checkout process failed. Please try again.');
  }
};

const pricingService: PricingService = {
  getAll,
  checkout
};

export default pricingService;
