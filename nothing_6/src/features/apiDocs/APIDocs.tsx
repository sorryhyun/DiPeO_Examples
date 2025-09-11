// filepath: src/features/apiDocs/APIDocs.tsx

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ApiResult, User, NothingProduct, Testimonial, PricingTier } from '@/core/contracts'
import { appConfig } from '@/app/config'
import { eventBus } from '@/core/events'
import { nothingService } from '@/services/nothingService'

/* src/features/apiDocs/APIDocs.tsx

   Interactive API documentation viewer showing how to integrate nothing into any application.
   Generates copyable code samples and live examples from core contracts.
*/

interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  parameters?: Array<{ name: string; type: string; required: boolean; description: string }>
  requestBody?: string
  responseType: string
  example: {
    request?: string
    response: string
  }
}

interface CodeSample {
  id: string
  language: string
  label: string
  code: string
}

// Generate API documentation from contracts
function generateAPIEndpoints(): APIEndpoint[] {
  return [
    {
      id: 'get-nothing',
      method: 'GET',
      path: '/api/nothing',
      description: 'Retrieve nothing in its purest form',
      responseType: 'ApiResult<null>',
      example: {
        response: JSON.stringify({
          ok: true,
          data: null,
          error: null
        }, null, 2)
      }
    },
    {
      id: 'get-products',
      method: 'GET',
      path: '/api/products/nothing',
      description: 'List all available nothing products',
      responseType: 'ApiResult<NothingProduct[]>',
      example: {
        response: JSON.stringify({
          ok: true,
          data: [
            {
              id: 'nothing-basic',
              sku: 'NOTHING-001',
              title: 'Basic Nothing',
              description: 'The essential nothing experience',
              priceCents: 0,
              features: ['Pure void', 'Unlimited emptiness']
            }
          ]
        }, null, 2)
      }
    },
    {
      id: 'get-testimonials',
      method: 'GET',
      path: '/api/testimonials/nothing',
      description: 'Fetch testimonials from satisfied nothing users',
      responseType: 'ApiResult<Testimonial[]>',
      example: {
        response: JSON.stringify({
          ok: true,
          data: [
            {
              id: 'test-1',
              author: 'Nothing Enthusiast',
              quote: 'This nothing exceeded my expectations of nothingness',
              rating: 5,
              createdAt: new Date().toISOString()
            }
          ]
        }, null, 2)
      }
    },
    {
      id: 'post-subscribe',
      method: 'POST',
      path: '/api/newsletter/nothing',
      description: 'Subscribe to nothing updates',
      parameters: [
        { name: 'email', type: 'string', required: true, description: 'Email address for nothing updates' }
      ],
      requestBody: 'SubscribeRequest',
      responseType: 'ApiResult<{ subscribed: boolean }>',
      example: {
        request: JSON.stringify({ email: 'user@void.com' }, null, 2),
        response: JSON.stringify({
          ok: true,
          data: { subscribed: true }
        }, null, 2)
      }
    }
  ]
}

// Generate code samples for different languages
function generateCodeSamples(endpoint: APIEndpoint): CodeSample[] {
  const samples: CodeSample[] = []

  // JavaScript/TypeScript fetch example
  const jsCode = `
// TypeScript example using fetch
import { ApiResult, ${endpoint.responseType.includes('NothingProduct') ? 'NothingProduct' : 'Testimonial'} } from './types'

async function ${endpoint.id.replace(/-/g, '')}() {
  try {
    const response = await fetch('${appConfig.apiBase}${endpoint.path}'${endpoint.method === 'POST' ? `, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(${endpoint.example.request || '{}'})
    }` : ''})
    
    const result: ${endpoint.responseType} = await response.json()
    
    if (result.ok) {
      return result.data
    } else {
      throw new Error(result.error?.message || 'API request failed')
    }
  } catch (error) {
    console.error('Nothing API error:', error)
    throw error
  }
}
`.trim()

  samples.push({
    id: `${endpoint.id}-js`,
    language: 'typescript',
    label: 'TypeScript',
    code: jsCode
  })

  // cURL example
  const curlCode = endpoint.method === 'POST' 
    ? `curl -X POST "${appConfig.apiBase}${endpoint.path}" \\
  -H "Content-Type: application/json" \\
  -d '${endpoint.example.request || '{}'}'`
    : `curl "${appConfig.apiBase}${endpoint.path}"`

  samples.push({
    id: `${endpoint.id}-curl`,
    language: 'bash',
    label: 'cURL',
    code: curlCode
  })

  // Python example
  const pythonCode = `
import requests
from typing import Optional, Dict, Any

def ${endpoint.id.replace(/-/g, '_')}() -> Optional[Dict[str, Any]]:
    """${endpoint.description}"""
    try:
        ${endpoint.method === 'POST' 
          ? `response = requests.post(
            "${appConfig.apiBase}${endpoint.path}",
            json=${endpoint.example.request || '{}'},
            headers={"Content-Type": "application/json"}
        )`
          : `response = requests.get("${appConfig.apiBase}${endpoint.path}")`
        }
        
        response.raise_for_status()
        result = response.json()
        
        if result.get('ok'):
            return result.get('data')
        else:
            raise Exception(result.get('error', {}).get('message', 'API request failed'))
            
    except requests.exceptions.RequestException as e:
        print(f"Nothing API error: {e}")
        raise
`.trim()

  samples.push({
    id: `${endpoint.id}-python`,
    language: 'python',
    label: 'Python',
    code: pythonCode
  })

  return samples
}

export default function APIDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('typescript')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const endpoints = useMemo(() => generateAPIEndpoints(), [])
  const selectedEndpointData = useMemo(() => 
    endpoints.find(ep => ep.id === selectedEndpoint),
    [endpoints, selectedEndpoint]
  )
  const codeSamples = useMemo(() => 
    selectedEndpointData ? generateCodeSamples(selectedEndpointData) : [],
    [selectedEndpointData]
  )

  const handleCopyCode = useCallback(async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
      
      eventBus.emit('analytics:event', {
        name: 'api_docs_code_copied',
        properties: { endpoint: selectedEndpoint, language: selectedLanguage, codeId: id }
      })
    } catch (error) {
      console.warn('Failed to copy code:', error)
    }
  }, [selectedEndpoint, selectedLanguage])

  const handleTestEndpoint = useCallback(async (endpoint: APIEndpoint) => {
    try {
      eventBus.emit('analytics:event', {
        name: 'api_docs_test_clicked',
        properties: { endpoint: endpoint.id }
      })

      // Use the actual nothing service for testing
      let result: ApiResult<any>
      switch (endpoint.id) {
        case 'get-nothing':
          result = await nothingService.getNothing()
          break
        case 'get-products':
          result = await nothingService.getProducts()
          break
        case 'get-testimonials':
          result = await nothingService.getTestimonials()
          break
        default:
          result = { ok: true, data: null }
      }

      console.log(`Test result for ${endpoint.path}:`, result)
      
      eventBus.emit('analytics:event', {
        name: 'api_docs_test_completed',
        properties: { 
          endpoint: endpoint.id, 
          success: result.ok,
          hasData: !!result.data
        }
      })
    } catch (error) {
      console.error('API test failed:', error)
      eventBus.emit('analytics:event', {
        name: 'api_docs_test_failed',
        properties: { endpoint: endpoint.id, error: String(error) }
      })
    }
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-16"
      role="main"
      aria-label="Nothing API Documentation"
    >
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4"
        >
          Nothing API Documentation
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-300 max-w-3xl mx-auto"
        >
          Integrate the power of absolutely nothing into your applications. 
          Our REST API provides programmatic access to nothingness.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Endpoint List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <h2 className="text-2xl font-bold text-white mb-6">API Endpoints</h2>
          <div className="space-y-3">
            {endpoints.map((endpoint) => (
              <motion.button
                key={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedEndpoint === endpoint.id
                    ? 'bg-purple-900/30 border-purple-400 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-900/70'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={selectedEndpoint === endpoint.id}
                aria-describedby={`endpoint-${endpoint.id}-description`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-sm px-2 py-1 rounded ${
                    endpoint.method === 'GET' ? 'bg-green-900 text-green-300' :
                    endpoint.method === 'POST' ? 'bg-blue-900 text-blue-300' :
                    endpoint.method === 'PUT' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {endpoint.method}
                  </span>
                </div>
                <div className="font-mono text-sm text-gray-300 mb-1">
                  {endpoint.path}
                </div>
                <div 
                  id={`endpoint-${endpoint.id}-description`}
                  className="text-sm text-gray-400"
                >
                  {endpoint.description}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Endpoint Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <AnimatePresence mode="wait">
            {selectedEndpointData ? (
              <motion.div
                key={selectedEndpointData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedEndpointData.path}
                    </h3>
                    <p className="text-gray-300">{selectedEndpointData.description}</p>
                  </div>
                  <button
                    onClick={() => handleTestEndpoint(selectedEndpointData)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
                    aria-label={`Test ${selectedEndpointData.path} endpoint`}
                  >
                    Test API
                  </button>
                </div>

                {/* Parameters */}
                {selectedEndpointData.parameters && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 text-gray-300">Name</th>
                            <th className="text-left py-2 text-gray-300">Type</th>
                            <th className="text-left py-2 text-gray-300">Required</th>
                            <th className="text-left py-2 text-gray-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEndpointData.parameters.map((param) => (
                            <tr key={param.name} className="border-b border-gray-800">
                              <td className="py-2 font-mono text-purple-300">{param.name}</td>
                              <td className="py-2 font-mono text-blue-300">{param.type}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  param.required 
                                    ? 'bg-red-900 text-red-300' 
                                    : 'bg-gray-700 text-gray-300'
                                }`}>
                                  {param.required ? 'Required' : 'Optional'}
                                </span>
                              </td>
                              <td className="py-2 text-gray-300">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Response Example */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Response Example</h4>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-300">
                      {selectedEndpointData.example.response}
                    </pre>
                  </div>
                </div>

                {/* Code Samples */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Code Examples</h4>
                    <div className="flex gap-2">
                      {codeSamples.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => setSelectedLanguage(sample.language)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            selectedLanguage === sample.language
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                          aria-pressed={selectedLanguage === sample.language}
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {codeSamples
                      .filter(sample => sample.language === selectedLanguage)
                      .map((sample) => (
                        <motion.div
                          key={sample.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="relative bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto"
                        >
                          <button
                            onClick={() => handleCopyCode(sample.code, sample.id)}
                            className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                            aria-label="Copy code to clipboard"
                          >
                            {copiedCode === sample.id ? 'Copied!' : 'Copy'}
                          </button>
                          <pre className="text-gray-300 pr-16">
                            {sample.code}
                          </pre>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-gray-400 text-lg mb-4">
                  Select an endpoint to view documentation
                </div>
                <div className="text-gray-500 text-sm">
                  Choose from the list of available Nothing API endpoints
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Getting Started Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-8 border border-purple-500/20"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Base URL</h3>
            <p className="font-mono bg-black/30 rounded px-3 py-2 text-purple-300">
              {appConfig.apiBase}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Authentication</h3>
            <p>No authentication required for nothing. Nothing is free for everyone.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Rate Limiting</h3>
            <p>Unlimited requests. Nothing has no limits.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
            <p>For help with nothing, contact our support team who will provide nothing.</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}
