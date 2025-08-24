import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  quote: string;
  author: string;
  authorTitle: string;
  image: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

const mockCaseStudies: CaseStudy[] = [
  {
    id: 'tech-startup',
    title: 'TechFlow Solutions Achieves Nothing',
    company: 'TechFlow Solutions',
    industry: 'Software Development',
    challenge: 'Our startup was drowning in feature requests and complexity. We needed to simplify.',
    solution: 'We implemented Absolutely Nothing™ across all our products and processes.',
    results: [
      'Reduced feature complexity by 100%',
      'Eliminated all customer complaints about missing features',
      'Achieved perfect uptime through non-existence',
      'Zero security vulnerabilities reported'
    ],
    quote: 'Nothing has transformed our business. Our customers finally understand what they truly need: absolutely nothing.',
    author: 'Sarah Chen',
    authorTitle: 'CEO, TechFlow Solutions',
    image: '/images/case-studies/techflow.jpg',
    metrics: [
      { label: 'Features Removed', value: '847' },
      { label: 'Complexity Score', value: '0' },
      { label: 'Customer Satisfaction', value: '∞' }
    ]
  },
  {
    id: 'retail-giant',
    title: 'RetailMax Embraces the Void',
    company: 'RetailMax Corporation',
    industry: 'E-commerce',
    challenge: 'Overwhelming product catalog was confusing customers and increasing return rates.',
    solution: 'Replaced entire inventory with Nothing™ - the perfect product for everyone.',
    results: [
      'Return rate dropped to 0%',
      'Inventory costs eliminated completely',
      'Customer decision fatigue cured',
      'Warehouse space freed for meditation'
    ],
    quote: 'Nothing sells itself. Literally. We don\'t even need salespeople anymore.',
    author: 'Michael Rodriguez',
    authorTitle: 'VP of Operations, RetailMax',
    image: '/images/case-studies/retailmax.jpg',
    metrics: [
      { label: 'Products Sold', value: '0' },
      { label: 'Revenue Growth', value: 'N/A' },
      { label: 'Profit Margin', value: '100%' }
    ]
  },
  {
    id: 'consulting-firm',
    title: 'ConsultPro Discovers True Wisdom',
    company: 'ConsultPro Advisory',
    industry: 'Management Consulting',
    challenge: 'Clients kept asking for complex solutions to simple problems.',
    solution: 'Started recommending Nothing™ as the ultimate business strategy.',
    results: [
      'Client satisfaction through the roof',
      'Implementation time reduced to zero',
      'Project success rate: undefined (which is perfect)',
      'Became the most zen consulting firm'
    ],
    quote: 'The best advice we ever gave was to do absolutely nothing. Our clients have never been happier.',
    author: 'Dr. Jennifer Walsh',
    authorTitle: 'Principal Consultant, ConsultPro',
    image: '/images/case-studies/consultpro.jpg',
    metrics: [
      { label: 'Recommendations Made', value: '1' },
      { label: 'Implementation Failures', value: '0' },
      { label: 'Enlightenment Level', value: 'Maximum' }
    ]
  }
];

export const CaseStudies: React.FC = () => {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  const openCaseStudy = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
  };

  const closeCaseStudy = () => {
    setSelectedCaseStudy(null);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how leading companies achieved extraordinary results by implementing Absolutely Nothing™
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCaseStudies.map((caseStudy) => (
            <article
              key={caseStudy.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
              onClick={() => openCaseStudy(caseStudy)}
              role="button"
              tabIndex={0}
              aria-label={`Read case study: ${caseStudy.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openCaseStudy(caseStudy);
                }
              }}
            >
              <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">{caseStudy.company}</h3>
                    <p className="text-sm opacity-90">{caseStudy.industry}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {caseStudy.title}
                </h4>
                
                <blockquote className="text-gray-600 dark:text-gray-300 italic mb-4 line-clamp-3">
                  "{caseStudy.quote}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{caseStudy.author}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{caseStudy.authorTitle}</p>
                  </div>
                  <button
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm flex items-center gap-1"
                    aria-label="Read more about this case study"
                  >
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {selectedCaseStudy && (
          <Modal
            isOpen={true}
            onClose={closeCaseStudy}
            title={selectedCaseStudy.title}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCaseStudy.company}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    {selectedCaseStudy.industry}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {selectedCaseStudy.metrics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {metric.value}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">The Challenge</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedCaseStudy.challenge}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">The Solution</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedCaseStudy.solution}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Results Achieved</h4>
                  <ul className="space-y-2">
                    {selectedCaseStudy.results.map((result, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-l-4 border-purple-500">
                  <blockquote className="text-lg italic text-gray-700 dark:text-gray-200 mb-3">
                    "{selectedCaseStudy.quote}"
                  </blockquote>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedCaseStudy.author}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedCaseStudy.authorTitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </section>
  );
};

export default CaseStudies;
