// filepath: src/features/casestudies/CaseStudies.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaseStudy, LoadingState } from '@/core/contracts'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import CaseStudyCard from './CaseStudyCard'
import { nothingService } from '@/services/nothingService'
import LoadingSpinner from '@/shared/components/LoadingSpinner'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

interface CaseStudiesState {
  caseStudies: CaseStudy[]
  loadingState: LoadingState
  error?: string
  selectedStudy?: CaseStudy
  showModal: boolean
}

interface CaseStudiesProps {
  className?: string
  limit?: number
  showLoadMore?: boolean
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ 
  className = '',
  limit,
  showLoadMore = true 
}) => {
  const [state, setState] = useState<CaseStudiesState>({
    caseStudies: [],
    loadingState: 'idle',
    showModal: false
  })

  const [visibleCount, setVisibleCount] = useState(limit || 6)

  // Load case studies on mount
  useEffect(() => {
    loadCaseStudies()
  }, [])

  // Track analytics on view
  useEffect(() => {
    if (state.caseStudies.length > 0) {
      eventBus.emit('analytics:event', {
        name: 'case_studies_viewed',
        properties: { count: state.caseStudies.length }
      })
    }
  }, [state.caseStudies.length])

  const loadCaseStudies = async () => {
    setState(prev => ({ ...prev, loadingState: 'loading', error: undefined}))
    
    try {
      const result = await nothingService.getCaseStudies()
      
      if (result.ok && result.data) {
        setState(prev => ({
          ...prev,
          caseStudies: result.data || [],
          loadingState: 'success'
        }))
      } else {
        throw new Error(result.error?.message || 'Failed to load case studies')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setState(prev => ({
        ...prev,
        loadingState: 'error',
        error: errorMessage
      }))
      
      eventBus.emit('analytics:event', {
        name: 'case_studies_load_error',
        properties: { error: errorMessage }
      })
    }
  }

  const handleStudyClick = (study: CaseStudy) => {
    setState(prev => ({
      ...prev,
      selectedStudy: study,
      showModal: true
    }))
    
    eventBus.emit('analytics:event', {
      name: 'case_study_opened',
      properties: { studyId: study.id, title: study.title }
    })
  }

  const handleModalClose = () => {
    setState(prev => ({
      ...prev,
      showModal: false,
      selectedStudy: undefined
    }))
  }

  const handleLoadMore = () => {
    const newCount = Math.min(visibleCount + 6, state.caseStudies.length)
    setVisibleCount(newCount)
    
    eventBus.emit('analytics:event', {
      name: 'case_studies_load_more',
      properties: { newVisibleCount: newCount }
    })
  }

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.showModal && e.key === 'Escape') {
        handleModalClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.showModal])

  const visibleStudies = state.caseStudies.slice(0, visibleCount)
  const hasMore = visibleCount < state.caseStudies.length

  if (state.loadingState === 'loading') {
    return (
      <section className={`py-16 ${className}`} aria-label="Case Studies">
        <div className="container mx-auto px-4 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading nothing implementations...
          </p>
        </div>
      </section>
    )
  }

  if (state.loadingState === 'error') {
    return (
      <section className={`py-16 ${className}`} aria-label="Case Studies">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Failed to Load Case Studies
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {state.error || 'Something went wrong while loading nothing implementations.'}
            </p>
            <button
              onClick={loadCaseStudies}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Retry loading case studies"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <ErrorBoundary>
      <section className={`py-16 ${className}`} aria-label="Case Studies">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h2
              className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Success Stories
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Discover how leading organizations have successfully implemented nothing
              to achieve extraordinary results in absolute minimalism.
            </motion.p>
          </div>

          {/* Case Studies Grid */}
          {visibleStudies.length > 0 ? (
            <>
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {visibleStudies.map((study, index) => (
                  <motion.div
                    key={study.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <CaseStudyCard
                      caseStudy={study}
                      onClick={() => handleStudyClick(study)}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {showLoadMore && hasMore && (
                <div className="text-center">
                  <motion.button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Load more case studies"
                  >
                    Load More Success Stories
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No case studies available at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {state.showModal && state.selectedStudy && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleModalClose}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {state.selectedStudy.title}
                    </h3>
                    <button
                      onClick={handleModalClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Close case study details"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {state.selectedStudy.publishedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Published {new Date(state.selectedStudy.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {state.selectedStudy.heroImage && (
                    <img
                      src={state.selectedStudy.heroImage}
                      alt={state.selectedStudy.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed mb-6">
                      {state.selectedStudy.summary || 'This case study demonstrates the successful implementation of nothing in a real-world scenario, showcasing the transformative power of embracing absolute minimalism.'}
                    </p>
                    
                    {/* Placeholder content for full case study */}
                    <div className="space-y-6">
                      <section>
                        <h4 className="text-xl font-semibold mb-3">Challenge</h4>
                        <p>The organization was overwhelmed with complexity and needed a solution that could deliver maximum impact with minimal overhead.</p>
                      </section>
                      
                      <section>
                        <h4 className="text-xl font-semibold mb-3">Solution</h4>
                        <p>By implementing our nothing framework, they were able to eliminate all unnecessary components and focus on what truly matters: absolutely nothing.</p>
                      </section>
                      
                      <section>
                        <h4 className="text-xl font-semibold mb-3">Results</h4>
                        <ul className="list-disc list-inside space-y-2">
                          <li>100% reduction in complexity</li>
                          <li>Infinite% improvement in simplicity</li>
                          <li>Zero maintenance overhead</li>
                          <li>Perfect minimalism achieved</li>
                        </ul>
                      </section>
                    </div>
                    
                    {state.selectedStudy.authors && state.selectedStudy.authors.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold mb-2">Authors</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {state.selectedStudy.authors.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </ErrorBoundary>
  )
}

export default CaseStudies
