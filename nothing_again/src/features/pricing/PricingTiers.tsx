import React from 'react';

export const PricingTiers: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Basic Nothing</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$0</p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Per month</p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Absolutely nothing
          </li>
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Zero features
          </li>
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            No support
          </li>
        </ul>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Get Nothing
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-600">
        <div className="bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded-full inline-block mb-4">
          Most Popular
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Premium Nothing</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$0</p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Per month</p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Premium nothing
          </li>
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Advanced nothingness
          </li>
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Priority nothing delivery
          </li>
        </ul>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Get Premium Nothing
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enterprise Nothing</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$0</p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Per month</p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Enterprise-grade nothing
          </li>
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Scalable void architecture
          </li>
          <li className="flex items-center text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            24/7 nothing support
          </li>
        </ul>
        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
};