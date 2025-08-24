import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQueryWithAuth } from '@/shared/hooks/useQueryWithAuth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Button } from '@/shared/components/Button';
import { useI18n } from '@/providers/I18nProvider';
import type { Prescription } from '@/types';

export const PrescriptionList = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [optimisticRefills, setOptimisticRefills] = useState<Set<string>>(new Set());

  const {
    data: prescriptions = [],
    isLoading,
    error
  } = useQueryWithAuth<Prescription[]>({
    queryKey: ['prescriptions'],
    queryFn: '/api/prescriptions'
  });

  const refillMutation = useMutation({
    mutationFn: async (prescriptionId: string) => {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/refill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to request refill');
      }
      return response.json();
    },
    onMutate: async (prescriptionId: string) => {
      // Optimistic update
      setOptimisticRefills(prev => new Set(prev).add(prescriptionId));
    },
    onSuccess: () => {
      // Invalidate and refetch prescriptions
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error, prescriptionId) => {
      // Remove from optimistic updates on error
      setOptimisticRefills(prev => {
        const newSet = new Set(prev);
        newSet.delete(prescriptionId);
        return newSet;
      });
      console.error('Refill request failed:', error);
    },
    onSettled: (data, error, prescriptionId) => {
      // Clean up optimistic state
      setOptimisticRefills(prev => {
        const newSet = new Set(prev);
        newSet.delete(prescriptionId);
        return newSet;
      });
    }
  });

  const handleRefillRequest = (prescriptionId: string) => {
    refillMutation.mutate(prescriptionId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'expired':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8" role="status" aria-label={t('loading')}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" role="alert">
        <div className="text-red-600 dark:text-red-400 mb-4">
          {t('error.failed_to_load_prescriptions')}
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['prescriptions'] })}
          variant="outline"
        >
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        {t('no_prescriptions_found')}
      </div>
    );
  }

  return (
    <div className="space-y-4" role="main" aria-label={t('prescriptions_list')}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('your_prescriptions')}
      </h2>
      
      {prescriptions.map((prescription) => {
        const isOptimisticRefill = optimisticRefills.has(prescription.id);
        const canRefill = prescription.refillsRemaining > 0 && prescription.status === 'active';
        
        return (
          <div
            key={prescription.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {prescription.medicationName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {prescription.dosage} • {prescription.frequency}
                </p>
              </div>
              
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}
              >
                {t(`prescription_status.${prescription.status.toLowerCase()}`)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">{t('prescribed_by')}:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {prescription.prescribedBy}
                </p>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">{t('date_prescribed')}:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(prescription.datePrescribed).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">{t('refills_remaining')}:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {prescription.refillsRemaining}
                </p>
              </div>
            </div>

            {prescription.instructions && (
              <div className="mb-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm">{t('instructions')}:</span>
                <p className="text-gray-900 dark:text-white text-sm mt-1">
                  {prescription.instructions}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => handleRefillRequest(prescription.id)}
                disabled={!canRefill || isOptimisticRefill || refillMutation.isPending}
                variant={canRefill ? "primary" : "outline"}
                size="sm"
                aria-label={t('request_refill_for', { medication: prescription.medicationName })}
              >
                {isOptimisticRefill || refillMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t('requesting_refill')}
                  </>
                ) : canRefill ? (
                  t('request_refill')
                ) : (
                  t('refill_unavailable')
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrescriptionList;

/*
SELF-CHECK:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
