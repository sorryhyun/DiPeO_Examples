import { useParams } from 'react-router-dom';
import { useApi } from '../shared/hooks/useApi';
import { CertificatePreview } from '../features/certificates/CertificatePreview';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Certificate } from '../types';

export const CertificatePage = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  
  const { data: certificate, isLoading, error } = useApi<Certificate>({
    endpoint: `/certificates/${certificateId}`,
    queryKey: ['certificate', certificateId]
  });

  const handleDownload = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Certificate</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Unable to load certificate. Please try again later.
          </p>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Certificate Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The requested certificate could not be found.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Certificate
          </h1>
          <div className="flex justify-center gap-4 print:hidden">
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              aria-label="Download certificate"
            >
              Download
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Print certificate"
            >
              Print
            </Button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CertificatePreview certificate={certificate} />
        </div>

        {/* Certificate Details */}
        <div className="mt-8 print:hidden">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Certificate Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Certificate ID:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {certificate.id}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Issue Date:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {new Date(certificate.issuedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Course:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {certificate.courseName}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Student:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {certificate.studentName}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
