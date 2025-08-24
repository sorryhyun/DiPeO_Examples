import React, { Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../shared/components/Layout';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { QuizForm } from '../features/quiz/QuizForm';
import { AssignmentUploader } from '../features/assignments/AssignmentUploader';
import { VideoPlayer } from '../features/video/VideoPlayer';
import { useApi } from '../shared/hooks/useApi';
import { useAuth } from '../shared/hooks/useAuth';
import { Course, Lesson, Quiz, Assignment } from '../types';

export const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!courseId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Course Not Found
            </h1>
            <Button onClick={() => navigate('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CourseContent courseId={courseId} user={user} navigate={navigate} />
        </Suspense>
      </div>
    </Layout>
  );
};

interface CourseContentProps {
  courseId: string;
  user: any;
  navigate: (path: string) => void;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseId, user, navigate }) => {
  const { data: course, error } = useApi<Course>(['course', courseId], () =>
    fetch(`/api/courses/${courseId}`).then(res => res.json())
  );

  if (error) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Course
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || 'Failed to load course details'}
        </p>
        <Button onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  if (!course) {
    return <LoadingSpinner />;
  }

  const handleStartLesson = (lessonId: string) => {
    navigate(`/player/${lessonId}`);
  };

  const handleOpenQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  const isEnrolled = user && Array.isArray(course.enrolledStudents) ? course.enrolledStudents.includes(user.id) : false;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                {course.level}
              </span>
              <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                {course.duration} hours
              </span>
              <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                {course.category}
              </span>
            </div>
            {!isEnrolled && (
              <Button className="mb-4">
                Enroll in Course
              </Button>
            )}
          </div>
          <div className="lg:w-1/3">
            {course.previewVideo && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">Course Preview</h3>
                <VideoPlayer
                  src={course.previewVideo}
                  title={`${course.title} Preview`}
                  poster={course.thumbnail}
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Lessons Section */}
          {course.lessons && course.lessons.length > 0 && (
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Lessons
                </h2>
                <div className="space-y-4">
                  {course.lessons.map((lesson: Lesson, index: number) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded">
                              Lesson {index + 1}
</span>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {lesson.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Duration: {lesson.duration} min</span>
                            {lesson.completed && (
                              <span className="text-green-600 dark:text-green-400">✓ Completed</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStartLesson(lesson.id)}
                            disabled={!isEnrolled}
                          >
                            {lesson.completed ? 'Review' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Quizzes Section */}
          {course.quizzes && course.quizzes.length > 0 && (
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Quizzes
                </h2>
                <div className="space-y-6">
                  {course.quizzes.map((quiz: Quiz) => (
                    <div key={quiz.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {quiz.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {quiz.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Questions: {quiz.questions?.length || 0}</span>
                            <span>Time Limit: {quiz.timeLimit} min</span>
                            {quiz.score && (
                              <span className="text-green-600 dark:text-green-400">
                                Score: {quiz.score}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenQuiz(quiz.id)}
                          disabled={!isEnrolled}
                        >
                          {quiz.score ? 'Retake' : 'Start Quiz'}
                        </Button>
                      </div>
                      {isEnrolled && !quiz.score && (
                        <QuizForm quiz={quiz} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Assignments Section */}
          {course.assignments && course.assignments.length > 0 && (
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Assignments
                </h2>
                <div className="space-y-6">
                  {course.assignments.map((assignment: Assignment) => (
                    <div key={assignment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {assignment.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                          <span>Max Score: {assignment.maxScore}</span>
                          {assignment.submitted && (
                            <span className="text-green-600 dark:text-green-400">✓ Submitted</span>
                          )}
                        </div>
                      </div>
                      {isEnrolled && (
                        <AssignmentUploader 
                          assignmentId={assignment.id}
                          assignment={assignment} 
                          onUploaded={(submission) => {
                            // Handle successful submission
                            console.log('Assignment submitted:', submission);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Overall Progress</span>
                    <span>{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lessons</span>
                    <span className="text-gray-900 dark:text-white">
                      {course.lessons?.filter((l: Lesson) => l.completed).length || 0} / {course.lessons?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quizzes</span>
                    <span className="text-gray-900 dark:text-white">
                      {course.quizzes?.filter((q: Quiz) => q.score).length || 0} / {course.quizzes?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assignments</span>
                    <span className="text-gray-900 dark:text-white">
                      {course.assignments?.filter((a: Assignment) => a.submitted).length || 0} / {course.assignments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
