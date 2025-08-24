import { Suspense } from 'react';
import { Card } from '../shared/components/Card';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { useApi } from '../shared/hooks/useApi';
import { useWebSocket } from '../shared/hooks/useWebSocket';
import { formatDate } from '../utils/formatters';

interface DashboardData {
  enrolledCourses: number;
  completedCourses: number;
  totalProgress: number;
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
}

interface ActivityItem {
  id: string;
  type: 'course_progress' | 'quiz_completed' | 'assignment_submitted' | 'forum_post';
  title: string;
  timestamp: string;
  metadata?: {
    courseName?: string;
    score?: number;
    progress?: number;
  };
}

interface DeadlineItem {
  id: string;
  title: string;
  type: 'assignment' | 'quiz';
  dueDate: string;
  courseName: string;
}

export function DashboardPage() {
  const { data: dashboardData, isLoading, error } = useApi<DashboardData>(['dashboard'], async () => {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  });

  // Subscribe to real-time activity updates
  useWebSocket('dashboard-activity', (message) => {
    // This would trigger a refetch of dashboard data in a real implementation
    console.log('New activity:', message);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Unable to load dashboard data. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's your learning progress overview.
          </p>
        </header>

        <Suspense fallback={<LoadingSpinner />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Enrolled Courses
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboardData?.enrolledCourses ?? 0}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Completed Courses
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {dashboardData?.completedCourses ?? 0}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Overall Progress
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {dashboardData?.totalProgress ? `${dashboardData.totalProgress}%` : '0%'}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Completion Rate
              </h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {dashboardData?.enrolledCourses 
                  ? `${Math.round((dashboardData.completedCourses / dashboardData.enrolledCourses) * 100)}%`
                  : '0%'
                }
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                        </p>
                        {activity.metadata && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            {activity.metadata.courseName && (
                              <span>Course: {activity.metadata.courseName}</span>
                            )}
                            {activity.metadata.score && (
                              <span className="ml-2">Score: {activity.metadata.score}%</span>
                            )}
                            {activity.metadata.progress && (
                              <span className="ml-2">Progress: {activity.metadata.progress}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent activity to display
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Deadlines
              </h2>
              {dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {deadline.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {deadline.courseName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {formatDate(deadline.dueDate)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {deadline.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No upcoming deadlines
                </p>
              )}
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Browse Courses
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Explore available courses and enroll in new learning paths
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                View Grades
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Check your performance and track your academic progress
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Join Forum
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect with peers and participate in course discussions
              </p>
            </Card>
          </div>
        </Suspense>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const iconClass = "w-5 h-5";
  
  switch (type) {
    case 'course_progress':
      return (
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
          <svg className={`${iconClass} text-blue-600 dark:text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    case 'quiz_completed':
      return (
        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
          <svg className={`${iconClass} text-green-600 dark:text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'assignment_submitted':
      return (
        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
          <svg className={`${iconClass} text-purple-600 dark:text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    case 'forum_post':
      return (
        <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
          <svg className={`${iconClass} text-orange-600 dark:text-orange-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
          <svg className={`${iconClass} text-gray-600 dark:text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
}
