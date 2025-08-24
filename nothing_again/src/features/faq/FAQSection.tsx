import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-nothing',
    question: 'What exactly is "Absolutely Nothing™"?',
    answer: 'Absolutely Nothing™ is the purest form of digital void you can purchase. It\'s not an empty file, not a blank page, not even the concept of emptiness. It\'s literally nothing, perfected through years of not doing anything.'
  },
  {
    id: 'how-it-works',
    question: 'How does Absolutely Nothing™ work?',
    answer: 'It doesn\'t. That\'s the beauty of it. While other products burden you with features, functionality, and value, Absolutely Nothing™ liberates you from all expectations. Simply purchase it and enjoy the complete absence of everything.'
  },
  {
    id: 'system-requirements',
    question: 'What are the system requirements?',
    answer: 'Absolutely Nothing™ is compatible with every system because it requires no system at all. It works on Windows, Mac, Linux, your toaster, and even devices that don\'t exist yet. Minimum requirements: the ability to appreciate nothingness.'
  },
  {
    id: 'installation',
    question: 'How do I install Absolutely Nothing™?',
    answer: 'There\'s nothing to install! Upon purchase, you immediately own nothing. No downloads, no setup, no configuration. It\'s the most efficient software installation process ever created - because it isn\'t one.'
  },
  {
    id: 'refund-policy',
    question: 'What\'s your refund policy?',
    answer: 'We offer a 30-day money-back guarantee. However, since you\'re purchasing nothing and receiving exactly what you paid for (nothing), refunds are philosophically complex. Our support team will happily discuss the metaphysical implications with you.'
  },
  {
    id: 'technical-support',
    question: 'Do you provide technical support?',
    answer: 'Our award-winning support team is standing by to not help you with any issues you\'re not having. Common solutions include doing nothing, which solves 100% of problems related to Absolutely Nothing™.'
  },
  {
    id: 'enterprise-edition',
    question: 'Is there an Enterprise Edition?',
    answer: 'Yes! Enterprise Nothing™ includes the same nothing as our standard edition, but with enterprise-grade nothing management, scalable void architecture, and dedicated nothing support. Perfect for organizations that need nothing at scale.'
  },
  {
    id: 'future-updates',
    question: 'Will there be future updates?',
    answer: 'We\'re constantly working on new ways to not improve Absolutely Nothing™. Future updates will include enhanced nothingness, premium void features, and revolutionary advances in the field of not doing anything. All updates remain nothing.'
  }
];

export const FAQSection: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(id);
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="faq-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            id="faq-heading"
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about nothing
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const panelId = `panel-${item.id}`;
            const buttonId = `button-${item.id}`;

            return (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  id={buttonId}
                  className="w-full px-6 py-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  onClick={() => toggleItem(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  type="button"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {item.question}
                  </span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    } group-hover:text-gray-700 dark:group-hover:text-gray-200`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={panelId}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-labelledby={buttonId}
                  role="region"
                >
                  <div className="px-6 py-4 bg-white dark:bg-gray-900">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Still have questions about nothing?
          </p>
          <button
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            type="button"
          >
            Contact Our Nothing Experts
          </button>
        </div>
      </div>
    </section>
  );
};
