import React, { useState } from 'react';
import { Icon } from '../../shared/components/Icon';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'what-is-nothing',
    question: 'What exactly am I getting for my money?',
    answer: 'Absolutely nothing! And we guarantee it\'s the highest quality nothing you\'ve ever experienced. Our nothing is sourced from the finest vacuum of space and hand-crafted by monks who have taken a vow of silence about everything.'
  },
  {
    id: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Since we\'re shipping nothing, it arrives instantly! In fact, you probably already have it. Check your empty pockets - that\'s our premium nothing right there.'
  },
  {
    id: 'refund-policy',
    question: 'What\'s your refund policy?',
    answer: 'We offer a 100% satisfaction guarantee. If you\'re not completely satisfied with your nothing, we\'ll gladly refund your nothing and let you keep the original nothing as well.'
  },
  {
    id: 'compatibility',
    question: 'Is this nothing compatible with my existing nothing?',
    answer: 'Our nothing is universally compatible with all forms of nothing, something, and everything in between. It also works great with other brands of nothing, though we can\'t guarantee the same level of premium nothingness.'
  },
  {
    id: 'technical-specs',
    question: 'What are the technical specifications?',
    answer: 'Weight: 0g, Dimensions: 0×0×0cm, Color: Transparent/Invisible, Material: Pure vacuum, Power consumption: 0W, Warranty: Eternal (void where prohibited)'
  },
  {
    id: 'bulk-orders',
    question: 'Do you offer bulk discounts?',
    answer: 'Absolutely! Buy 10 nothings and get 10 more absolutely free. Buy 100 and we\'ll throw in our premium empty box (box not included). Corporate nothing packages available upon request.'
  },
  {
    id: 'customer-support',
    question: 'What if I need help with my nothing?',
    answer: 'Our customer support team is standing by 24/7 to help you with any questions about your nothing. They\'re experts at saying nothing helpful and will respond to your inquiries with the utmost nothing.'
  }
];

interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItemComponent: React.FC<FAQItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset rounded-lg"
      >
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100 pr-4">
          {item.question}
        </span>
        <Icon 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      {isOpen && (
        <div
          id={`faq-answer-${item.id}`}
          className="px-6 pb-4 pt-0"
          role="region"
          aria-labelledby={`faq-question-${item.id}`}
        >
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(itemId);
    }
  };

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about nothing (and then some)
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item) => (
            <FAQItemComponent
              key={item.id}
              item={item}
              isOpen={openItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions about nothing?
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
            Contact Our Nothing Experts
            <Icon name="arrow-right" className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
