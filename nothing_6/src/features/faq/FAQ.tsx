// filepath: src/features/faq/FAQ.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react'
import { config } from '@/app/config'
import { FAQ as FAQType } from '@/core/contracts'
import FAQItem from '@/features/faq/FAQItem'
import { useFetch } from '@/hooks/useFetch'
import { nothingService } from '@/services/nothingService'

// FAQ data for nothing
const DEFAULT_FAQS: FAQType[] = [
  {
    id: '1',
    question: 'What exactly is nothing?',
    answer: 'Nothing is the absence of something. Our premium nothing contains zero features, zero functionality, and zero value - delivered with maximum precision.',
  },
  {
    id: '2',
    question: 'How much does nothing cost?',
    answer: 'Our nothing starts at $0/month for the Basic Nothing plan. Premium Nothing is $9.99/month with enhanced emptiness and priority void access.',
  },
  {
    id: '3',
    question: 'What\'s included with my nothing subscription?',
    answer: 'Absolutely nothing! You get unlimited access to our void, zero customer support, and the satisfaction of owning nothing.',
  },
  {
    id: '4',
    question: 'Can I cancel my nothing subscription?',
    answer: 'You can cancel anytime, but why would you? You\'d be giving up nothing, which means you\'d have something, which defeats the purpose.',
  },
  {
    id: '5',
    question: 'Is there a free trial?',
    answer: 'Every moment of your existence before purchasing nothing has been a free trial of nothing. You\'ve been experiencing nothing for free your entire life!',
  },
  {
    id: '6',
    question: 'What makes your nothing different from other nothing?',
    answer: 'Our nothing is artisanally crafted by experts in emptiness. Each void is hand-selected for maximum nothingness and certified by the International Nothing Authority.',
  },
  {
    id: '7',
    question: 'Do you offer enterprise nothing solutions?',
    answer: 'Yes! Our Enterprise Nothing includes dedicated void management, SLA guaranteeing 99.99% nothing uptime, and 24/7 support for your absence of needs.',
  },
  {
    id: '8',
    question: 'Can I integrate nothing with my existing systems?',
    answer: 'Nothing integrates seamlessly with everything by doing absolutely nothing. Our REST API returns empty responses and our webhooks never fire.',
  }
]

export interface FAQProps {
  className?: string
  title?: string
  subtitle?: string
}

export default function FAQ({ 
  className = '',
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about nothing'
}: FAQProps) {
  const { 
    data: faqs, 
    loading, 
    error 
  } = useFetch<FAQType[]>({
    queryKey: ['faqs'],
    fetcher: config.shouldUseMockData 
      ? () => Promise.resolve(DEFAULT_FAQS)
      : () => nothingService.getFAQs(),
    fallbackData: DEFAULT_FAQS
  })

  if (error) {
    return (
      <section 
        className={`py-24 px-6 ${className}`}
        aria-labelledby="faq-title"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="faq-title" className="text-3xl font-bold text-red-500 mb-4">
            Error Loading FAQs
          </h2>
          <p className="text-gray-600">
            We couldn't load the frequently asked questions about nothing. 
            Even our errors are nothing!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section 
      className={`py-24 px-6 bg-gradient-to-b from-gray-50 to-white ${className}`}
      aria-labelledby="faq-title"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            id="faq-title" 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-6"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4" role="status" aria-label="Loading FAQs">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg mb-2" />
                <div className="h-20 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          /* FAQ Items */
          <div 
            className="space-y-4"
            role="region"
            aria-label="Frequently asked questions"
          >
            {faqs?.map((faq, index) => (
              <FAQItem 
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                defaultOpen={index === 0} // First item open by default
              />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions about nothing?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is standing by to provide you with absolutely no help whatsoever.
          </p>
          <button 
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            onClick={() => {
              // This does nothing, as expected
              window.alert('Thank you for contacting nothing support! We\'ll get back to you with nothing shortly.')
            }}
            aria-label="Contact nothing support"
          >
            Contact Nothing Support
          </button>
        </div>
      </div>
    </section>
  )
}
