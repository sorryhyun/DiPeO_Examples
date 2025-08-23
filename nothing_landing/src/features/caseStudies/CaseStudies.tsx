import React from 'react';
import { useIntersectionObserver } from '../../shared/hooks/useIntersectionObserver';
import { mockCaseStudies } from '../../mock/data/mockCaseStudies';

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  summary: string;
  metrics: {
    label: string;
    value: string;
    improvement: string;
  }[];
  testimonial: string;
  author: string;
  role: string;
  link: string;
}

export const CaseStudies: React.FC = () => {
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900" ref={elementRef}>
      <div className="container mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Case Studies in Nothing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Real companies achieving extraordinary results through the strategic implementation of absolutely nothing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCaseStudies.map((caseStudy: CaseStudy, index) => (
            <CaseStudyCard 
              key={caseStudy.id} 
              caseStudy={caseStudy} 
              delay={index * 0.2}
              isVisible={isVisible}
            />
          ))}
        </div>

        <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <a 
            href="/press-kit"
            className="inline-flex items-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
          >
            View Full Press Kit
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  delay: number;
  isVisible: boolean;
}

const CaseStudyCard: React.FC<CaseStudyCardProps> = ({ caseStudy, delay, isVisible }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {caseStudy.title}
        </h3>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
          {caseStudy.company}
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {caseStudy.summary}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        {caseStudy.metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-black dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {metric.label}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              {metric.improvement}
            </div>
          </div>
        ))}
      </div>

      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          "{caseStudy.testimonial}"
        </p>
      </blockquote>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
            {caseStudy.author}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {caseStudy.role}
          </div>
        </div>
        <a 
          href={caseStudy.link}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
        >
          Read More →
        </a>
      </div>
    </div>
  );
};
