import React from 'react';
import Button from '../../shared/components/Button';

export const AffiliateCTA: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-lg p-6 text-center">
      <h3 className="text-xl font-bold text-white mb-2">
        Share the Void, Earn the Rewards
      </h3>
      <p className="text-gray-300 mb-4 max-w-md mx-auto">
        Join our affiliate program and get paid for spreading absolutely nothing. 
        Because if you're going to recommend nothing, you might as well get something for it.
      </p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => window.location.href = '/press'}
        aria-label="Learn more about our affiliate program"
        className="bg-purple-600 hover:bg-purple-700"
      >
        Become an Affiliate
      </Button>
      <p className="text-xs text-gray-400 mt-3">
        Earn up to 50% commission on every nothing sold through your referral*
      </p>
      <p className="text-xs text-gray-500 mt-1">
        *50% of nothing is still nothing, but it's the thought that counts
      </p>
    </div>
  );
};
