import { apiPost } from '@/utils/apiClient';
import type { ApiResponse } from '@/types';

interface CheckoutRequest {
  tierId: string;
}

interface CheckoutResponse {
  checkoutUrl?: string;
  success?: boolean;
  message?: string;
}

export const initiateCheckout = async (tierId: string): Promise<CheckoutResponse> => {
  try {
    const response: ApiResponse<CheckoutResponse> = await apiPost<CheckoutResponse, CheckoutRequest>(
      '/api/checkout/nothing',
      { tierId }
    );

    if (!response.success) {
      throw new Error(response.error || 'Checkout initiation failed');
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Checkout failed: ${error.message}`
        : 'Unknown checkout error occurred'
    );
  }
};
