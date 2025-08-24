import React, { useState } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import checkoutService from '@/services/checkoutService';
import { PricingTier } from '@/types';
import { Button } from '@/shared/components/Button';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  tier: string;
}

interface ShoppingCartProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  className = '', 
  isOpen = false, 
  onClose 
}) => {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart_nothing', []);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const addItem = (tier: PricingTier) => {
    const existingItem = cartItems.find(item => item.tier === tier.name);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.tier === tier.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `nothing-${tier.name}-${Date.now()}`,
        name: `${tier.name} Nothing`,
        price: tier.price,
        quantity: 1,
        tier: tier.name
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      await checkoutService.initiateCheckout(cartItems);
      // Clear cart after successful checkout
      setCartItems([]);
      onClose?.();
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 ${className}`}
      role="dialog"
      aria-labelledby="cart-title"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 id="cart-title" className="text-xl font-bold text-gray-900 dark:text-white">
              Cart of Nothingness ({getTotalItems()})
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Your cart contains absolutely nothing
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Which is exactly what we're selling!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  Total:
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3"
                  variant="primary"
                >
                  {isCheckingOut ? 'Processing...' : 'Checkout Nothing'}
                </Button>
                
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                * You're literally buying nothing. This is not a mistake.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Expose methods for external use
export const useShoppingCart = () => {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart_nothing', []);
  
  const addItem = (tier: PricingTier) => {
    const existingItem = cartItems.find(item => item.tier === tier.name);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.tier === tier.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `nothing-${tier.name}-${Date.now()}`,
        name: `${tier.name} Nothing`,
        price: tier.price,
        quantity: 1,
        tier: tier.name
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    addItem,
    totalItems: getTotalItems()
  };
};

export default ShoppingCart;
