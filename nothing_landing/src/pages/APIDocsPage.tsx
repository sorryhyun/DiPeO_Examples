import React from 'react';
import { Layout } from '../shared/components/Layout';

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  requestExample: string;
  responseExample: string;
}

const APIDocsPage: React.FC = () => {
  const endpoints: APIEndpoint[] = [
    {
      method: 'GET',
      path: '/api/nothing',
      description: 'Returns absolutely nothing in the most efficient way possible',
      requestExample: `curl -X GET "https://nothing.com/api/nothing" \\
  -H "Accept: application/json"`,
      responseExample: `{
  "data": null,
  "message": "Here is your nothing",
  "timestamp": "2024-01-15T10:30:00Z"
}`
    },
    {
      method: 'POST',
      path: '/api/nothing',
      description: 'Submit your nothing to our void',
      requestExample: `curl -X POST "https://nothing.com/api/nothing" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "nothing": null,
    "void": true
  }'`,
      responseExample: `{
  "data": null,
  "message": "Your nothing has been successfully processed into nothing",
  "timestamp": "2024-01-15T10:30:00Z",
  "id": "void-12345"
}`
    },
    {
      method: 'GET',
      path: '/api/testimonials',
      description: 'Retrieve testimonials about nothing',
      requestExample: `curl -X GET "https://nothing.com/api/testimonials" \\
  -H "Accept: application/json"`,
      responseExample: `{
  "data": [
    {
      "id": "testimonial-1",
      "name": "John Doe",
      "company": "Void Corp",
      "text": "This nothing changed my life",
      "rating": 5
    }
  ],
  "count": 1
}`
    },
    {
      method: 'GET',
      path: '/api/pricing',
      description: 'Get pricing information for nothing',
      requestExample: `curl -X GET "https://nothing.com/api/pricing" \\
  -H "Accept: application/json"`,
      responseExample: `{
  "data": [
    {
      "id": "basic",
      "name": "Basic Nothing",
      "price": 0,
      "features": ["Basic void", "Standard emptiness"]
    },
    {
      "id": "premium",
      "name": "Premium Nothing",
      "price": 9.99,
      "features": ["Advanced void", "Premium emptiness", "Priority nothing"]
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/newsletter',
      description: 'Subscribe to our newsletter about nothing',
      requestExample: `curl -X POST "https://nothing.com/api/newsletter" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "email": "user@example.com"
  }'`,
      responseExample: `{
  "data": {
    "email": "user@example.com",
    "subscribed": true
  },
  "message": "Successfully subscribed to nothing updates"
}`
    },
    {
      method: 'POST',
      path: '/api/analytics/nothing',
      description: 'Track analytics events for nothing interactions',
      requestExample: `curl -X POST "https://nothing.com/api/analytics/nothing" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "event": "nothing_clicked",
    "properties": {
      "location": "hero",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }'`,
      responseExample: `{
  "data": {
    "tracked": true
  },
  "message": "Event successfully recorded in the void"
}`
    }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              API Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Welcome to the most comprehensive API for absolutely nothing. 
              These endpoints will help you achieve unprecedented levels of nothingness.
            </p>
          </div>

          {/* Navigation TOC */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Navigation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {endpoints.map((endpoint, index) => (
                <a
                  key={index}
                  href={`#endpoint-${index}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    endpoint.method === 'GET' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {endpoint.path}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="space-y-8">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                id={`endpoint-${index}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      endpoint.method === 'GET' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {endpoint.method}
                    </span>
                    <h3 className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                      {endpoint.path}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {endpoint.description}
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Request Example */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Request Example
                        </h4>
                        <button
                          onClick={() => copyToClipboard(endpoint.requestExample)}
                          className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{endpoint.requestExample}</code>
                      </pre>
                    </div>

                    {/* Response Example */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Response Example
                        </h4>
                        <button
                          onClick={() => copyToClipboard(endpoint.responseExample)}
                          className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{endpoint.responseExample}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Authentication Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our API uses the revolutionary "no authentication" approach. Simply make requests and receive nothing - no API keys, no tokens, no barriers between you and the void.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> This perfectly aligns with our philosophy of providing absolutely nothing with maximum simplicity.
              </p>
            </div>
          </div>

          {/* Rate Limits Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Rate Limits
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We don't impose rate limits because limiting nothing would be paradoxical. Request nothing as frequently as you'd like.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Pro Tip:</strong> The more you request nothing, the more nothing you'll receive. It's mathematically perfect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default APIDocsPage;
