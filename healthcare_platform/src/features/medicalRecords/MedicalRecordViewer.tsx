import React, { useState, useMemo } from 'react';
import { useQueryWithAuth } from '@/shared/hooks/useQueryWithAuth';
import { Input } from '@/shared/components/Input';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { MedicalRecord } from '@/types';

export const MedicalRecordViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const {
    data: records,
    isLoading,
    isError,
    error
  } = useQueryWithAuth<MedicalRecord[]>({
    queryKey: ['medical-records'],
    url: '/api/medical-records'
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    
    if (!searchTerm.trim()) {
      return records;
    }

    return records.filter((record) =>
      record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  const selectedRecord = useMemo(() => {
    if (!selectedRecordId || !records) return null;
    return records.find(record => record.id === selectedRecordId) || null;
  }, [selectedRecordId, records]);

  const handleRecordSelect = (recordId: string) => {
    setSelectedRecordId(recordId);
  };

  const handleKeyPress = (event: React.KeyboardEvent, recordId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRecordSelect(recordId);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-label="Loading medical records">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
        <h3 className="text-red-800 font-medium">Error loading medical records</h3>
        <p className="text-red-600 text-sm mt-1">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No medical records found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Medical Records
        </h2>
        
        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search records by title, diagnosis, doctor, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search medical records"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Records List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Records ({filteredRecords.length})
          </h3>
          
          <div 
            className="space-y-2 max-h-96 overflow-y-auto"
            role="list"
            aria-label="Medical records list"
          >
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRecordId === record.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleRecordSelect(record.id)}
                onKeyDown={(e) => handleKeyPress(e, record.id)}
                tabIndex={0}
                role="listitem"
                aria-selected={selectedRecordId === record.id}
                aria-label={`Medical record: ${record.title || 'Untitled'} from ${formatDate(record.date)}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {record.title || 'Medical Record'}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {formatDate(record.date)}
                    </span>
                  </div>
                  
                  {record.doctor && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Dr. {record.doctor}
                    </p>
                  )}
                  
                  {record.diagnosis && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {record.diagnosis}
                    </p>
                  )}
                  
                  {record.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Record Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Record Details
          </h3>
          
          {selectedRecord ? (
            <div 
              className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              role="region"
              aria-label="Selected record details"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedRecord.title || 'Medical Record'}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatDate(selectedRecord.date)}
                  </p>
                </div>

                {selectedRecord.doctor && (
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Doctor
                    </h5>
                    <p className="text-gray-900 dark:text-white">
                      Dr. {selectedRecord.doctor}
                    </p>
                  </div>
                )}

                {selectedRecord.diagnosis && (
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diagnosis
                    </h5>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {selectedRecord.diagnosis}
                    </p>
                  </div>
                )}

                {selectedRecord.treatment && (
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Treatment
                    </h5>
                    <p className="text-gray-900 dark:text-white">
                      {selectedRecord.treatment}
                    </p>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </h5>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedRecord.notes}
                    </p>
                  </div>
                )}

                {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachments
                    </h5>
                    <ul className="space-y-1">
                      {selectedRecord.attachments.map((attachment, index) => (
                        <li key={index}>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                            aria-label={`Open attachment: ${attachment.name}`}
                          >
                            {attachment.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select a medical record to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordViewer;

/*
Self-check:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
