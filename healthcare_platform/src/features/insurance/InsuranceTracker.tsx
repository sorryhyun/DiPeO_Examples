import React, { useState, useMemo } from 'react';
import { useQueryWithAuth } from '@/shared/hooks/useQueryWithAuth';
import { Input } from '@/shared/components/Input';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { InsuranceClaim } from '@/types';

export const InsuranceTracker: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: claims = [],
    isLoading,
    error
  } = useQueryWithAuth<InsuranceClaim[]>({
    queryKey: ['insurance'],
    endpoint: '/api/insurance'
  });

  const filteredClaims = useMemo(() => {
    if (!searchTerm.trim()) return claims;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return claims.filter(
      claim =>
        claim.claimNumber.toLowerCase().includes(lowercaseSearch) ||
        claim.provider.toLowerCase().includes(lowercaseSearch)
    );
  }, [claims, searchTerm]);

  const getStatusBadgeClass = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'denied':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8" role="status" aria-label="Loading insurance claims">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4 text-center" role="alert">
        Failed to load insurance claims. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Insurance Claims
        </h2>
        <div className="w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search by claim number or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
            aria-label="Search insurance claims"
          />
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center p-8">
          {searchTerm ? 'No claims found matching your search.' : 'No insurance claims found.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {claim.claimNumber}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {claim.provider}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(claim.status)}`}
                  role="status"
                  aria-label={`Claim status: ${claim.status}`}
                >
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {claim.serviceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(claim.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date Filed:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(claim.dateSubmitted)}
                  </span>
                </div>
                {claim.dateProcessed && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date Processed:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(claim.dateProcessed)}
                    </span>
                  </div>
                )}
              </div>

              {claim.description && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {claim.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsuranceTracker;

/*
Self-check:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
