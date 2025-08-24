import React from 'react';
import { GuaranteeBadge } from '@/features/guarantee/GuaranteeBadge';

interface ComparisonFeature {
  feature: string;
  nothing: string | number;
  something: string | number;
  everything: string | number;
  description?: string;
}

const comparisonData: ComparisonFeature[] = [
  {
    feature: 'Price',
    nothing: '$0',
    something: '$99/mo',
    everything: '$∞/mo',
    description: 'Cost of absolutely nothing vs alternatives'
  },
  {
    feature: 'Features',
    nothing: '∅',
    something: '47',
    everything: '∞',
    description: 'Feature count comparison'
  },
  {
    feature: 'Storage',
    nothing: '0 bytes',
    something: '1TB',
    everything: '∞ PB',
    description: 'Storage space provided'
  },
  {
    feature: 'Support Tickets',
    nothing: '0',
    something: '24/7',
    everything: '∞',
    description: 'Customer support availability'
  },
  {
    feature: 'Complexity',
    nothing: 'None',
    something: 'Medium',
    everything: 'Overwhelming',
    description: 'User experience complexity'
  },
  {
    feature: 'Learning Curve',
    nothing: '0 minutes',
    something: '2-4 weeks',
    everything: '∞ years',
    description: 'Time to master the product'
  },
  {
    feature: 'Distractions',
    nothing: '0',
    something: '∞',
    everything: '∞²',
    description: 'Level of cognitive interference'
  },
  {
    feature: 'Peace of Mind',
    nothing: '∞',
    something: '42%',
    everything: '0%',
    description: 'Mental tranquility achieved'
  }
];

export const ComparisonChart: React.FC = () => {
  return (
    <section 
      className="py-16 px-4 bg-gray-50 dark:bg-gray-900"
      role="region"
      aria-labelledby="comparison-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            id="comparison-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Why Nothing Beats Everything
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A comprehensive comparison of our revolutionary Nothing™ against traditional alternatives.
            Witness the mathematical beauty of zero.
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table 
            className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            role="table"
            aria-label="Product comparison table"
          >
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th 
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Feature
                </th>
                <th 
                  scope="col"
                  className="px-6 py-4 text-center text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                >
                  Absolutely Nothing™
                  <div className="mt-1">
                    <GuaranteeBadge size="sm" />
                  </div>
                </th>
                <th 
                  scope="col"
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
                >
                  Something Else
                </th>
                <th 
                  scope="col"
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
                >
                  Everything Bloated
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr 
                  key={item.feature}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.feature}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center bg-purple-50 dark:bg-purple-900/20">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {item.nothing}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.something}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.everything}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-6">
          {comparisonData.map((item) => (
            <div 
              key={item.feature}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.feature}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {item.description}
                </p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                    Absolutely Nothing™
                  </div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {item.nothing}
                  </div>
                  <div className="mt-2">
                    <GuaranteeBadge size="sm" />
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Something Else
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {item.something}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Everything Bloated
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {item.everything}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Certified Authentic Nothing™</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Zero Content</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Void Guarantee</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Ready to experience the perfect emptiness?
          </p>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Get started with Absolutely Nothing"
          >
            Choose Nothing Today
          </button>
        </div>
      </div>
    </section>
  );
};
