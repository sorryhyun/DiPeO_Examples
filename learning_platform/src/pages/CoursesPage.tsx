import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseCard } from '../features/courses/CourseCard';
import { useApi } from '../shared/hooks/useApi';
import { Input } from '../shared/components/Input';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { Course } from '../types';

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: courses, isLoading, error } = useApi<Course[]>(['courses'], '/api/courses');

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    if (!searchTerm.trim()) {
      return courses;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(lowercaseSearch) ||
      course.description.toLowerCase().includes(lowercaseSearch) ||
      course.instructor.toLowerCase().includes(lowercaseSearch)
    );
  }, [courses, searchTerm]);

  const handleCourseOpen = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              Error loading courses: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Courses
          </h1>
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'No courses found matching your search.' : 'No courses available.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onOpen={handleCourseOpen}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
