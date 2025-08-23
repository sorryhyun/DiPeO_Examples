import React from 'react';
import { Button } from '../../shared/components/Button';
import { Icon } from '../../shared/components/Icon';

interface ComparisonFeature {
  feature: string;
  nothing: boolean | string;
  something: boolean | string;
  everything: boolean | string;
}

const comparisonData: ComparisonFeature[] = [
  {
    feature: 'Storage Space',
    nothing: '∞ (Infinite void)',
    something: '1TB',
    everything: '100TB'
  },
  {
    feature: 'Loading Time',
    nothing: '0ms (Instant nothingness)',
    something: '2.3s',
    everything: '45s'
  },
  {
    feature: 'Bugs & Issues',
    nothing: '0 (Nothing to break)',
    something: '127 known issues',
    everything: '∞ (Infinite complexity)'
  },
  {
    feature: 'User Confusion',
    nothing: 'Maximum clarity',
    something: 'Moderate',
    everything: 'Complete bewilderment'
  },
  {
    feature: 'Environmental Impact',
    nothing: '0% (Pure sustainability)',
    something: 'Medium',
    everything: 'Catastrophic'
  },
  {
    feature: 'Learning Curve',
    nothing: 'Instant mastery',
    something: '3 months',
    everything: '∞ years'
  },
  {
    feature: 'Price',
    nothing: '$0/month',
    something: '$99/month',
    everything: '$9,999/month'
  },
  {
    feature: 'Support Needed',
    nothing: false,
    something: true,
    everything: true
  },
  {
    feature: 'Updates Required',
    nothing: false,
    something: true,
    everything: true
  },
  {
    feature: 'Existential Clarity',
    nothing: true,
    something: false,
    everything: false
  }
];

const ComparisonChart: React.FC = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderFeatureValue = (value: boolean | string, isNothing: boolean = false) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex justify-center">
          <Icon 
            name={value ? 'check' : 'x'} 
            className={`w-5 h-5 ${
              value 
                ? isNothing 
                  ? 'text-purple-500' 
                  : 'text-green-500'
                : 'text-red-500'
            }`}
          />
        </div>
      );
    }
    return (
      <span className={`text-sm ${isNothing ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
        {value}
      </span>
    );
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Nothing?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Compare the revolutionary advantages of absolutely nothing
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Features
                  </span>
                </th>
                <th className="px-6 py-4 text-center bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      Nothing™
                    </span>
                    <span className="text-sm text-purple-500 dark:text-purple-300">
                      (Recommended)
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Something
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Everything
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr 
                  key={row.feature}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-25 dark:bg-gray-800/50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center bg-purple-25 dark:bg-purple-900/10">
                    {renderFeatureValue(row.nothing, true)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderFeatureValue(row.something)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderFeatureValue(row.everything)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-6">
          {comparisonData.map((row) => (
            <div 
              key={row.feature}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {row.feature}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Nothing - Highlighted */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      Nothing™
                    </span>
                    <div className="text-right">
                      {renderFeatureValue(row.nothing, true)}
                    </div>
                  </div>
                </div>
                
                {/* Something */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Something
                    </span>
                    <div className="text-right">
                      {renderFeatureValue(row.something)}
                    </div>
                  </div>
                </div>
                
                {/* Everything */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Everything
                    </span>
                    <div className="text-right">
                      {renderFeatureValue(row.everything)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              The Choice is Clear
            </h3>
            <p className="text-purple-100 mb-6 text-lg">
              Join millions who have already embraced the simplicity of nothing
            </p>
            <Button
              onClick={scrollToPricing}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Choose Nothing Today
            </Button>
          </div>
        </div>

        {/* Fine Print */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            * Results may vary. Side effects of choosing nothing include: enlightenment, 
            clarity, and the occasional existential crisis.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonChart;
