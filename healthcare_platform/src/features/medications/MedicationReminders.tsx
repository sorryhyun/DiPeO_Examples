import React, { useState } from 'react';
import { useQueryWithAuth } from '@/shared/hooks/useQueryWithAuth';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Button } from '@/shared/components/Button';
import type { Medication } from '@/types';

interface MedicationReminderSettings {
  [medicationId: string]: boolean;
}

export const MedicationReminders: React.FC = () => {
  const [reminderSettings, setReminderSettings] = useLocalStorage<MedicationReminderSettings>(
    'medication-reminders',
    {}
  );
  const [showUpcoming, setShowUpcoming] = useState(false);

  const { data: medications, isLoading, error } = useQueryWithAuth<Medication[]>({
    queryKey: ['medications'],
    endpoint: '/api/medications'
  });

  const toggleReminder = (medicationId: string) => {
    setReminderSettings(prev => ({
      ...prev,
      [medicationId]: !prev[medicationId]
    }));
  };

  const formatNextDose = (nextTime: string) => {
    const date = new Date(nextTime);
    const now = new Date();
    const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
      return diffMinutes <= 0 ? 'Now' : `${diffMinutes}m`;
    }
    
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    
    return date.toLocaleDateString();
  };

  const getUpcomingReminders = () => {
    if (!medications) return [];
    
    return medications
      .filter(med => reminderSettings[med.id] && med.nextTime)
      .sort((a, b) => new Date(a.nextTime!).getTime() - new Date(b.nextTime!).getTime())
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8" role="status" aria-label="Loading medications">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg" role="alert">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Medications</h3>
        <p className="text-red-600 dark:text-red-300">Unable to load your medications. Please try again later.</p>
      </div>
    );
  }

  if (!medications || medications.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        <h3 className="text-gray-600 dark:text-gray-300 font-medium mb-2">No Medications</h3>
        <p className="text-gray-500 dark:text-gray-400">You don't have any medications configured yet.</p>
      </div>
    );
  }

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="space-y-6" role="main" aria-label="Medication reminders">
      {/* Upcoming Reminders Section */}
      {upcomingReminders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-blue-800 dark:text-blue-200 font-semibold">Upcoming Reminders</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpcoming(!showUpcoming)}
              aria-expanded={showUpcoming}
              aria-controls="upcoming-reminders-list"
            >
              {showUpcoming ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showUpcoming && (
            <div id="upcoming-reminders-list" className="space-y-2">
              {upcomingReminders.map(med => (
                <div
                  key={`upcoming-${med.id}`}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{med.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{med.dosage}</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {formatNextDose(med.nextTime!)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Medications List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          All Medications
        </h2>
        
        <div className="space-y-3">
          {medications.map(medication => (
            <div
              key={medication.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {medication.name}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {medication.dosage}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      <span className="font-medium">Schedule:</span> {medication.schedule}
                    </p>
                    {medication.nextTime && (
                      <p>
                        <span className="font-medium">Next dose:</span>{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {formatNextDose(medication.nextTime)}
                        </span>
                      </p>
                    )}
                    {medication.instructions && (
                      <p>
                        <span className="font-medium">Instructions:</span> {medication.instructions}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderSettings[medication.id] || false}
                      onChange={() => toggleReminder(medication.id)}
                      className="sr-only"
                      aria-describedby={`reminder-label-${medication.id}`}
                    />
                    <div className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${reminderSettings[medication.id] 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `}>
                      <span className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${reminderSettings[medication.id] ? 'translate-x-6' : 'translate-x-1'}
                      `} />
                    </div>
                  </label>
                  <span 
                    id={`reminder-label-${medication.id}`}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {reminderSettings[medication.id] ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicationReminders;

/*
SELF-CHECK:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
