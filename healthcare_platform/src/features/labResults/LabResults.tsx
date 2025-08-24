import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryWithAuth } from '@/shared/hooks/useQueryWithAuth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Button } from '@/shared/components/Button';
import { LabResult } from '@/types';

export const LabResults: React.FC = () => {
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);
  
  const { data: labResults, isLoading, error } = useQueryWithAuth<LabResult[]>({
    queryKey: ['labResults'],
    queryFn: () => fetch('/api/lab-results').then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8" role="status" aria-label="Loading lab results">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" role="alert">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Lab Results</h3>
        <p className="text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : 'Failed to load lab results. Please try again.'}
        </p>
      </div>
    );
  }

  if (!labResults || labResults.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No lab results found.</p>
      </div>
    );
  }

  // Sort by date (most recent first) and filter if needed
  const filteredResults = labResults
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(result => showAbnormalOnly ? !result.isNormal : true);

  const isResultAbnormal = (result: LabResult): boolean => {
    return !result.isNormal;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Results</h2>
        
        <div className="flex items-center gap-4">
          <Button
            variant={showAbnormalOnly ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowAbnormalOnly(!showAbnormalOnly)}
            aria-pressed={showAbnormalOnly}
            className="whitespace-nowrap"
          >
            {showAbnormalOnly ? 'Show All Results' : 'Show Abnormal Only'}
          </Button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredResults.length} of {labResults.length} results
          </span>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
            <thead className="bg-gray-50 dark:bg-gray-900" role="rowgroup">
              <tr role="row">
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Date
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Test Name
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Value
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Normal Range
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" role="rowgroup">
              {filteredResults.map((result) => (
                <tr 
                  key={`${result.id}-${result.date}`}
                  role="row"
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(result.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {result.testName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.value} {result.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {result.normalRange}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isResultAbnormal(result)
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                      role="status"
                      aria-label={isResultAbnormal(result) ? 'Abnormal result' : 'Normal result'}
                    >
                      {isResultAbnormal(result) ? 'Abnormal' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.medicalRecordId && (
                      <Link
                        to={`/medical-records/${result.medicalRecordId}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                        aria-label={`View medical record for ${result.testName} test`}
                      >
                        View Record
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredResults.length === 0 && showAbnormalOnly && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No abnormal results found. All your lab values are within normal ranges.
          </p>
        </div>
      )}
    </div>
  );
};

export defaultLabResults;

/*
Self-check:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
