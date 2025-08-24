import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { formatDuration } from '../../utils/formatters';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  onOpen?: (id: string) => void;
  href?: string;
}

export const CourseCard = ({ course, onOpen, href }: CourseCardProps) => {
  const handleClick = () => {
    if (onOpen) {
      onOpen(course.id);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const durationText = course.totalDuration 
    ? formatDuration(course.totalDuration)
    : `${course.lessonsCount || 0} lessons`;

  return (
    <Card 
      className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={!href ? handleClick : undefined}
      onKeyDown={!href ? handleKeyDown : undefined}
      tabIndex={!href ? 0 : undefined}
      role={!href ? "button" : undefined}
      aria-label={`Open course: ${course.title}`}
    >
      {course.thumbnail && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={course.thumbnail} 
            alt={`${course.title} thumbnail`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {course.title}
          </h3>
          
          {course.instructor && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              by {typeof course.instructor === 'string' ? course.instructor : course.instructor?.name}
            </p>
          )}
          
          {course.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
              {course.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>{durationText}</span>
            {course.difficulty && (
              <span className="capitalize">{course.difficulty}</span>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          {href ? (
            <Button
              as="a"
              href={href}
              variant="primary"
              className="w-full"
              aria-label={`Open course: ${course.title}`}
            >
              View Course
            </Button>
          ) : (
            <Button
              onClick={handleClick}
              variant="primary"
              className="w-full"
              aria-label={`Open course: ${course.title}`}
            >
              View Course
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
