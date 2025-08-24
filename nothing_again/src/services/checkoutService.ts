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

export const initiateCheckout = async (_cartItems: any[]): Promise<CheckoutResponse> => {
  try {
    // Mock checkout process for demonstration
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    // Simulate successful checkout
    return {
      success: true,
      message: 'Successfully purchased absolutely nothing! Your nothing will be delivered never, as expected.',
      checkoutUrl: undefined // No need for external checkout URL
    };
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Checkout failed: ${error.message}`
        : 'Unknown checkout error occurred'
    );
  }
};

// Alternative signature for backward compatibility
export const initiateCheckoutForTier = async (tierId: string): Promise<CheckoutResponse> => {
  try {
    const response: ApiResponse<CheckoutResponse> = await apiPost<CheckoutResponse, CheckoutRequest>(
      '/api/checkout/nothing',
      { tierId }
    );

    if (!response.data.success) {
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

// Export as default object for easier consumption
const checkoutService = {
  initiateCheckout,
  initiateCheckoutForTier
};

export default checkoutService;
