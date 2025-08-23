import React from 'react';
import { Avatar } from '../../shared/components/Avatar';
import { useIntersectionObserver } from '../../shared/hooks/useIntersectionObserver';
import { mockTeam } from '../../mock/data/mockTeam';
import type { TeamMember } from '../../types';

export const TeamSection: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Meet Our Team of Nothing Experts
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Dedicated professionals who have mastered the art of absolutely nothing
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-all duration-700 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          {mockTeam.map((member: TeamMember, index: number) => (
            <div
              key={member.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
              }}
            >
              <div className="mb-4">
                <Avatar
                  src={member.avatar}
                  alt={`${member.name} - ${member.role}`}
                  size="lg"
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {member.name}
              </h3>
              
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {member.role}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {member.bio}
              </p>
              
              {member.expertise && member.expertise.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap justify-center gap-1">
                    {member.expertise.slice(0, 3).map((skill: string, skillIndex: number) => (
                      <span
                        key={skillIndex}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.expertise.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        +{member.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
