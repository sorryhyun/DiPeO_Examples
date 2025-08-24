import { Certificate } from '../../types';

interface CertificatePreviewProps {
  certificate: Certificate;
  onDownload?: () => void;
}

export const CertificatePreview = ({ certificate, onDownload }: CertificatePreviewProps) => {
  const handlePrint = () => {
    window.print();
    onDownload?.();
  };

  const handleDownload = () => {
    // Create a new window for printing/PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const certificateHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate.studentName}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              margin: 0;
              padding: 40px;
              background: white;
              color: #1a1a1a;
            }
            .certificate {
              max-width: 800px;
              margin: 0 auto;
              border: 8px solid #2563eb;
              padding: 60px;
              text-align: center;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            }
            .header {
              margin-bottom: 40px;
            }
            .title {
              font-size: 48px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 20px;
              text-transform: uppercase;
              letter-spacing: 4px;
            }
            .subtitle {
              font-size: 20px;
              color: #64748b;
              margin-bottom: 40px;
            }
            .recipient {
              font-size: 32px;
              font-weight: bold;
              color: #1a1a1a;
              margin: 30px 0;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .course {
              font-size: 24px;
              color: #2563eb;
              font-style: italic;
              margin: 20px 0;
            }
            .achievement {
              font-size: 18px;
              color: #059669;
              font-weight: bold;
              margin: 20px 0;
            }
            .date {
              font-size: 16px;
              color: #64748b;
              margin-top: 40px;
            }
            .decoration {
              margin: 30px 0;
              font-size: 24px;
              color: #d97706;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="title">Certificate of Achievement</div>
              <div class="subtitle">This is to certify that</div>
            </div>
            
            <div class="recipient">${certificate.studentName}</div>
            
            <div class="subtitle">has successfully completed</div>
            
            <div class="course">${certificate.courseName}</div>
            
            <div class="achievement">
              Achievement Level: ${certificate.achievementLevel}
            </div>
            
            <div class="decoration">★ ★ ★</div>
            
            <div class="date">
              Issued on ${new Date(certificate.issuedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(certificateHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    
    // Close the print window after printing
    setTimeout(() => {
      printWindow.close();
      onDownload?.();
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Print/Download Controls */}
        <div className="flex justify-end mb-6 print:hidden">
          <div className="space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Print certificate"
            >
              Print Certificate
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Download certificate as PDF"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="certificate-preview bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 border-8 border-blue-600 dark:border-blue-400 rounded-lg p-16 text-center shadow-2xl print:shadow-none print:border-blue-600">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-200 mb-6 tracking-widest uppercase">
              Certificate of Achievement
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
              This is to certify that
            </p>
          </div>

          {/* Recipient Name */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-8 shadow-lg print:shadow-none">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {certificate.studentName}
            </h2>
          </div>

          {/* Course Info */}
          <div className="mb-8">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              has successfully completed
            </p>
            <h3 className="text-3xl font-semibold text-blue-700 dark:text-blue-300 italic mb-6">
              {certificate.courseName}
            </h3>
          </div>

          {/* Achievement Level */}
          <div className="mb-8">
            <div className="inline-block bg-green-100 dark:bg-green-900 px-6 py-3 rounded-full">
              <p className="text-lg font-bold text-green-800 dark:text-green-200">
                Achievement Level: {certificate.achievementLevel}
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="text-4xl text-yellow-500 mb-8">
            ★ ★ ★
          </div>

          {/* Date */}
          <div className="text-gray-600 dark:text-gray-400">
            <p className="text-lg">
              Issued on {formatDate(certificate.issuedDate)}
            </p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .certificate-preview,
            .certificate-preview * {
              visibility: visible;
            }
            .certificate-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100vh;
              margin: 0;
              padding: 40px;
              background: white !important;
              color: black !important;
              border: 8px solid #2563eb !important;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
