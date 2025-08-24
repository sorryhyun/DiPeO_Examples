import React, { useRef, useEffect } from 'react';
import { useGSAP } from '@/shared/hooks/useGSAP';

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
  version?: string;
}

const roadmapData: RoadmapMilestone[] = [
  {
    id: '1',
    title: 'Nothing 1.0',
    description: 'The original void. Pure, unadulterated nothing in its most basic form.',
    date: 'Q4 2023',
    status: 'completed',
    version: 'v1.0'
  },
  {
    id: '2',
    title: 'Nothing Pro',
    description: 'Enhanced nothing with premium features like advanced emptiness and quantum void.',
    date: 'Q1 2024',
    status: 'completed',
    version: 'v2.0'
  },
  {
    id: '3',
    title: 'Nothing Enterprise',
    description: 'Scalable nothing for businesses. Includes team void management and SLA guarantees.',
    date: 'Q2 2024',
    status: 'in-progress',
    version: 'v3.0'
  },
  {
    id: '4',
    title: 'Nothing AI',
    description: 'Machine learning powered nothing that learns your emptiness preferences.',
    date: 'Q3 2024',
    status: 'planned',
    version: 'v4.0'
  },
  {
    id: '5',
    title: 'Nothing Cloud',
    description: 'Cloud-based nothing as a service with 99.99% uptime guarantee.',
    date: 'Q4 2024',
    status: 'planned',
    version: 'v5.0'
  },
  {
    id: '6',
    title: 'Nothing Universe',
    description: 'The ultimate nothing experience across multiple dimensions and realities.',
    date: 'Q1 2025',
    status: 'planned',
    version: 'v6.0'
  }
];

const getStatusIcon = (status: RoadmapMilestone['status']) => {
  switch (status) {
    case 'completed':
      return '✓';
    case 'in-progress':
      return '⟳';
    case 'planned':
      return '○';
    default:
      return '○';
  }
};

const getStatusColor = (status: RoadmapMilestone['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-500 border-green-500';
    case 'in-progress':
      return 'text-blue-500 border-blue-500';
    case 'planned':
      return 'text-gray-400 border-gray-400';
    default:
      return 'text-gray-400 border-gray-400';
  }
};

export const Roadmap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current || !timelineRef.current) return;

    const timeline = timelineRef.current;
    const items = itemsRef.current.filter(Boolean);

    // Initial state
    timeline.style.height = '0px';
    items.forEach(item => {
      if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
      }
    });

    // Intersection observer for scroll-triggered animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate timeline line
            timeline.style.transition = 'height 1.5s ease-out';
            timeline.style.height = '100%';

            // Animate items with stagger
            items.forEach((item, index) => {
              if (item) {
                setTimeout(() => {
                  item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                  item.style.opacity = '1';
                  item.style.transform = 'translateY(0)';
                }, index * 200);
              }
            });

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const setItemRef = (index: number) => (el: HTMLDivElement | null) => {
    itemsRef.current[index] = el;
  };

  return (
    <section 
      ref={containerRef}
      className="py-16 px-4 max-w-6xl mx-auto"
      aria-labelledby="roadmap-heading"
    >
      <div className="text-center mb-12">
        <h2 
          id="roadmap-heading"
          className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          The Road to Absolute Nothing
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Our journey toward perfect emptiness continues with groundbreaking releases 
          that push the boundaries of what nothing can be.
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div 
          className="absolute left-1/2 transform -translate-x-0.5 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500 md:block hidden"
          style={{ top: '2rem', bottom: '2rem' }}
        >
          <div
            ref={timelineRef}
            className="w-full bg-gradient-to-b from-purple-500 to-pink-500 origin-top"
          />
        </div>

        {/* Mobile timeline line */}
        <div className="md:hidden absolute left-8 top-0 bottom-0 w-0.5">
          <div
            ref={timelineRef}
            className="w-full bg-gradient-to-b from-purple-500 to-pink-500 origin-top"
          />
        </div>

        <ol className="space-y-12 md:space-y-16" role="list">
          {roadmapData.map((milestone, index) => (
            <li key={milestone.id} className="relative">
              <div
                ref={setItemRef(index)}
                className={`flex flex-col md:flex-row items-start md:items-center gap-6 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 -translate-x-1/2 md:translate-x-0">
                  <div
                    className={`w-6 h-6 rounded-full border-2 bg-white dark:bg-gray-900 flex items-center justify-center ${getStatusColor(
                      milestone.status
                    )}`}
                  >
                    <span className="text-xs font-bold" aria-hidden="true">
                      {getStatusIcon(milestone.status)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`ml-16 md:ml-0 flex-1 ${
                    index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'
                  }`}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col md:items-start items-start gap-2 mb-3">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {milestone.date}
                      </span>
                      {milestone.version && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {milestone.version}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {milestone.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          milestone.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : milestone.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {milestone.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500 dark:text-gray-400 italic">
          * Roadmap subject to change based on the fundamental nature of nothingness
        </p>
      </div>
    </section>
  );
};

export default Roadmap;
