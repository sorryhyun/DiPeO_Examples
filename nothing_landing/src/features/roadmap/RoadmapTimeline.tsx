import React from 'react';
import { useIntersectionObserver } from '../../shared/hooks/useIntersectionObserver';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
  icon: string;
}

const roadmapItems: RoadmapItem[] = [
  {
    id: '1',
    title: 'Nothing 1.0',
    description: 'The original nothing - pure, unfiltered emptiness',
    date: 'Q1 2024',
    status: 'completed',
    icon: '🕳️'
  },
  {
    id: '2',
    title: 'Nothing Plus',
    description: 'Premium nothing with extra void features',
    date: 'Q2 2024',
    status: 'in-progress',
    icon: '⚫'
  },
  {
    id: '3',
    title: 'Nothing Pro',
    description: 'Professional-grade emptiness for enterprises',
    date: 'Q3 2024',
    status: 'planned',
    icon: '🌑'
  },
  {
    id: '4',
    title: 'Nothing Ultra',
    description: 'The ultimate void experience with AI-powered nothingness',
    date: 'Q4 2024',
    status: 'planned',
    icon: '🌌'
  },
  {
    id: '5',
    title: 'Nothing 2.0',
    description: 'Revolutionary nothing with quantum emptiness',
    date: 'Q1 2025',
    status: 'planned',
    icon: '✨'
  }
];

const StatusPill: React.FC<{ status: RoadmapItem['status'] }> = ({ status }) => {
  const statusConfig = {
    completed: {
      text: 'Completed',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    },
    'in-progress': {
      text: 'In Progress',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    planned: {
      text: 'Planned',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.text}
    </span>
  );
};

const TimelineItem: React.FC<{ item: RoadmapItem; index: number; isVisible: boolean }> = ({ 
  item, 
  index, 
  isVisible 
}) => {
  const isEven = index % 2 === 0;

  return (
    <div 
      className={`relative flex items-center mb-8 transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Timeline line and dot */}
      <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full border-4 ${
          item.status === 'completed' 
            ? 'bg-green-500 border-green-200 dark:border-green-900' 
            : item.status === 'in-progress'
            ? 'bg-blue-500 border-blue-200 dark:border-blue-900'
            : 'bg-gray-300 border-gray-200 dark:bg-gray-600 dark:border-gray-700'
        } z-10 relative`} />
        {index < roadmapItems.length - 1 && (
          <div className="w-0.5 h-16 bg-gray-200 dark:bg-gray-700 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className={`w-full md:w-5/12 ${
        isEven 
          ? 'md:pr-8 md:text-right md:ml-0 ml-12' 
          : 'md:pl-8 md:ml-auto ml-12'
      }`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.title}
</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.date}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            {item.description}
          </p>
          
          <StatusPill status={item.status} />
        </div>
      </div>
    </div>
  );
};

export const RoadmapTimeline: React.FC = () => {
  const { ref: containerRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  return (
    <section id="roadmap" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            The Future of Nothing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our roadmap to achieving absolute nothingness across all dimensions of existence.
          </p>
        </div>

        {/* Mobile warning */}
        <div className="md:hidden mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Scroll horizontally to see the full timeline on mobile devices
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative overflow-x-auto md:overflow-visible"
        >
          <div className="min-w-max md:min-w-0">
            {roadmapItems.map((item, index) => (
              <TimelineItem
                key={item.id}
                item={item}
                index={index}
                isVisible={isIntersecting}
              />
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Want to contribute to the nothing revolution?
          </p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-200">
            Join the Void
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RoadmapTimeline;
