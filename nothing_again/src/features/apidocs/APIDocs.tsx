import React, { useState } from 'react';

interface CodeExample {
  title: string;
  description: string;
  code: string;
  response?: string;
}

const codeExamples: CodeExample[] = [
  {
    title: 'GET /api/nothing',
    description: 'Retrieve absolutely nothing with remarkable efficiency',
    code: `curl -X GET "https://api.absolutelynothing.com/api/nothing" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json"`,
    response: `{
  "data": null,
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "void_level": 9.7,
  "existential_state": "profoundly empty"
}`
  },
  {
    title: 'POST /api/checkout/nothing',
    description: 'Purchase premium nothing with full transaction processing',
    code: `curl -X POST "https://api.absolutelynothing.com/api/checkout/nothing" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tier": "premium",
    "quantity": 0,
    "payment_method": "void_card"
  }'`,
    response: `{
  "checkout_id": "nothing_12345",
  "amount": 99.99,
  "currency": "USD",
  "status": "successfully_empty",
  "nothing_delivered": true,
  "tracking_number": null
}`
  },
  {
    title: 'POST /api/auth/login',
    description: 'Authenticate to access premium void services',
    code: `curl -X POST "https://api.absolutelynothing.com/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'`,
    response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "subscription": "premium_void"
  },
  "expires_in": 3600
}`
  },
  {
    title: 'GET /api/void/status',
    description: 'Check the current void levels and emptiness metrics',
    code: `curl -X GET "https://api.absolutelynothing.com/api/void/status" \\
  -H "Authorization: Bearer your-api-key"`,
    response: `{
  "void_percentage": 100.0,
  "emptiness_score": 10.0,
  "quantum_absence": true,
  "last_something_detected": null,
  "uptime": "∞ seconds"
}`
  }
];

export const APIDocs: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.warn('Failed to copy to clipboard:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive documentation for integrating with the Nothing API. 
            Achieve unprecedented levels of emptiness through our RESTful endpoints.
          </p>
        </div>

        {/* Getting Started */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Getting Started
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Authentication
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              All API requests require authentication using Bearer tokens. 
              Include your API key in the Authorization header of each request.
            </p>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 text-sm">
                Authorization: Bearer your-api-key-here
              </code>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Important Notice
            </h3>
            <p className="text-amber-700 dark:text-amber-300">
              Our API is designed to deliver nothing with 99.99% reliability. 
              Any unexpected something in the response should be reported immediately 
              to our Void Engineering team.
            </p>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            API Endpoints
          </h2>
          
          <div className="space-y-12">
            {codeExamples.map((example, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {example.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {example.description}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Request
                      </h4>
                      <button
                        onClick={() => copyToClipboard(example.code, index * 2)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                        aria-label={`Copy request example for ${example.title}`}
                      >
                        {copiedIndex === index * 2 ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg overflow-x-auto">
                      <pre className="p-4 text-sm text-green-400">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>

                  {example.response && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          Response
                        </h4>
                        <button
                          onClick={() => copyToClipboard(example.response!, index * 2 + 1)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                          aria-label={`Copy response example for ${example.title}`}
                        >
                          {copiedIndex === index * 2 + 1 ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded-lg overflow-x-auto">
                        <pre className="p-4 text-sm text-blue-400">
                          <code>{example.response}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Error Codes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Error Codes
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-red-600 dark:text-red-400">
                    200
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    Success - Nothing delivered successfully
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-red-600 dark:text-red-400">
                    401
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    Unauthorized - Invalid API key or expired token
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-red-600 dark:text-red-400">
                    404
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    Not Found - Perfect! This is what we aim for
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-red-600 dark:text-red-400">
                    500
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    Server Error - Something went wrong (very concerning)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Rate Limits
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our API has generous rate limits because nothing takes very little server resources:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>Free Tier:</strong> 1,000 requests per hour</li>
              <li><strong>Premium Nothing:</strong> 10,000 requests per hour</li>
              <li><strong>Enterprise Void:</strong> Unlimited nothingness</li>
            </ul>
          </div>
        </section>

        {/* SDKs */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Official SDKs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'JavaScript/Node.js', status: 'Available' },
              { name: 'Python', status: 'Available' },
              { name: 'Ruby', status: 'Available' },
              { name: 'Go', status: 'Coming Soon' },
              { name: 'Java', status: 'In Development' },
              { name: 'PHP', status: 'Considering' }
            ].map((sdk, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {sdk.name}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  sdk.status === 'Available' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {sdk.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 italic">
            "Documentation so comprehensive, it documents nothing perfectly." - Satisfied Customer
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIDocs;
