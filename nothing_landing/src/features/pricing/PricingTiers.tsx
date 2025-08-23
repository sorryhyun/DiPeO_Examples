import React, { useEffect, useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Spinner } from '../../shared/components/Spinner';
import { pricingService } from '../../services/pricingService';
import { analyticsService } from '../../services/analyticsService';
import { PricingTier } from '../../types';

interface PricingCardProps {
  tier: PricingTier;
  onCheckout: (tierId: string) => void;
  isCheckingOut: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ tier, onCheckout, isCheckingOut }) => {
  const handleCheckout = () => {
    analyticsService.track('pricing_tier_selected', { tier: tier.id });
    onCheckout(tier.id);
  };

  return (
    <div
      id={`pricing-${tier.id}`}
      className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
        tier.featured
          ? 'border-purple-500 bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-2xl scale-105'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
      }`}
    >
      {tier.featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {tier.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {tier.description}
        </p>
        <div className="mb-6">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            ${tier.price}
          </span>
          {tier.period && (
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              /{tier.period}
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleCheckout}
        disabled={isCheckingOut}
        className={`w-full ${
          tier.featured
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
        }`}
        aria-label={`Purchase ${tier.name} tier for $${tier.price}`}
      >
        {isCheckingOut ? (
          <>
            <Spinner size="small" className="mr-2" />
            Processing...
          </>
        ) : (
          'Purchase Nothing'
        )}
      </Button>

      {tier.badge && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {tier.badge}
          </span>
        </div>
      )}
    </div>
  );
};

export const PricingTiers: React.FC = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingTiers = async () => {
      try {
        setLoading(true);
        const pricingTiers = await pricingService.getAll();
        setTiers(pricingTiers);
        analyticsService.track('pricing_page_viewed', { tiers_count: pricingTiers.length });
      } catch (err) {
        setError('Failed to load pricing tiers. Please try again later.');
        console.error('Error fetching pricing tiers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingTiers();
  }, []);

  const handleCheckout = async (tierId: string) => {
    try {
      setCheckingOut(tierId);
      const result = await pricingService.checkout(tierId);
      
      if (result.success) {
        analyticsService.track('checkout_completed', { tier: tierId });
        // Show success feedback
        alert('Congratulations! You have successfully purchased absolutely nothing. Your receipt for nothing will arrive never.');
      } else {
        throw new Error(result.error || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      analyticsService.track('checkout_failed', { tier: tierId, error: err instanceof Error ? err.message : 'Unknown error' });
      alert('Something went wrong during checkout. Please try again or contact support for help with nothing.');
    } finally {
      setCheckingOut(null);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Spinner size="large" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading our absolutely nothing pricing tiers...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unable to Load Pricing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your Level of Nothing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            From basic emptiness to premium void experiences, we have the perfect nothing package for everyone.
            All plans include absolutely nothing, guaranteed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              onCheckout={handleCheckout}
              isCheckingOut={checkingOut === tier.id}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All plans include a 30-day money-back guarantee. No questions asked, because there's nothing to ask about.
          </p>
        </div>
      </div>
    </section>
  );
};
