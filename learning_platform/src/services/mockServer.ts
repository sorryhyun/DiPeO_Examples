import { mockData } from './mockData';
import { endpoints } from './endpoints';
import type { ApiResponse, User, Course } from '../types';

interface MockServerConfig {
  enable: boolean;
  latency?: number;
  errorRate?: number;
}

let originalFetch: typeof fetch;
let isEnabled = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createResponse = <T>(data: T, status = 200): Response => {
  const response: ApiResponse<T> = {
    data,
    success: status >= 200 && status < 300,
    message: status >= 400 ? 'Error' : 'Success'
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

const createErrorResponse = (message: string, status = 500): Response => {
  const response: ApiResponse<null> = {
    data: null,
    success: false,
    message
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

const mockFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method || 'GET';
  
  // Add latency simulation
  await delay(100 + Math.random() * 200);
  
  // Simulate random errors (5% chance)
  if (Math.random() < 0.05) {
    return createErrorResponse('Network error', 500);
  }

  // Parse URL and extract path and query params
  const urlObj = new URL(url, window.location.origin);
  const path = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  try {
    // Authentication endpoints
    if (path === endpoints.auth.login && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const { email, password } = body;
      
      if (email === 'demo@example.com' && password === 'demo123') {
        return createResponse({
          token: 'mock-jwt-token-' + Date.now(),
          user: mockData.getUsers()[0]
        });
      } else {
        return createErrorResponse('Invalid credentials', 401);
      }
    }

    if (path === endpoints.auth.register && method === 'POST') {
      const newUser: User = {
        id: 'user-' + Date.now(),
        email: 'new@example.com',
        name: 'New User',
        role: 'student',
        avatar: null,
        enrolledCourses: [],
        completedLessons: [],
        certificates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return createResponse({
        token: 'mock-jwt-token-' + Date.now(),
        user: newUser
      });
    }

    if (path === endpoints.auth.profile && method === 'GET') {
      return createResponse(mockData.getUsers()[0]);
    }

    if (path === endpoints.auth.logout && method === 'POST') {
      return createResponse({ message: 'Logged out successfully' });
    }

    // Course endpoints
    if (path === endpoints.courses.list && method === 'GET') {
      return createResponse(mockData.getCourses());
    }

    if (path.startsWith('/api/courses/') && method === 'GET') {
      const courseId = path.split('/').pop();
      const course = mockData.getCourseById(courseId!);
      if (course) {
        return createResponse(course);
      } else {
        return createErrorResponse('Course not found', 404);
      }
    }

    if (path === endpoints.courses.create && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const newCourse: Course = {
        id: 'course-' + Date.now(),
        title: body.title || 'New Course',
        description: body.description || 'Course description',
        instructor: mockData.getUsers().find(u => u.role === 'instructor')!,
        thumbnail: null,
        duration: '8 weeks',
        difficulty: 'beginner',
        category: 'general',
        tags: [],
        lessons: [],
        enrolled: 0,
        rating: 0,
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return createResponse(newCourse, 201);
    }

    // Lesson endpoints
    if (path === endpoints.lessons.list && method === 'GET') {
      const courseId = searchParams.get('courseId');
      if (courseId) {
        return createResponse(mockData.getLessonsByCourse(courseId));
      }
      return createResponse(mockData.getLessons());
    }

    if (path.startsWith('/api/lessons/') && method === 'GET') {
      const lessonId = path.split('/').pop();
      const lesson = mockData.getLessonById(lessonId!);
      if (lesson) {
        return createResponse(lesson);
      } else {
        return createErrorResponse('Lesson not found', 404);
      }
    }

    // Quiz endpoints
    if (path === endpoints.quizzes.list && method === 'GET') {
      const lessonId = searchParams.get('lessonId');
      if (lessonId) {
        return createResponse(mockData.getQuizzesByLesson(lessonId));
      }
      return createResponse(mockData.getQuizzes());
    }

    if (path.startsWith('/api/quizzes/') && method === 'GET') {
      const quizId = path.split('/').pop();
      const quiz = mockData.getQuizById(quizId!);
      if (quiz) {
        return createResponse(quiz);
      } else {
        return createErrorResponse('Quiz not found', 404);
      }
    }

    if (path.startsWith('/api/quizzes/') && path.endsWith('/submit') && method === 'POST') {
      // Mock quiz grading
      const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      return createResponse({
        score,
        passed: score >= 70,
        feedback: 'Quiz completed successfully'
      });
    }

    // Assignment endpoints
    if (path === endpoints.assignments.list && method === 'GET') {
      return createResponse(mockData.getAssignments());
    }

    if (path.startsWith('/api/assignments/') && method === 'GET') {
      const assignmentId = path.split('/').pop();
      const assignment = mockData.getAssignmentById(assignmentId!);
      if (assignment) {
        return createResponse(assignment);
      } else {
        return createErrorResponse('Assignment not found', 404);
      }
    }

    if (path.startsWith('/api/assignments/') && path.endsWith('/submit') && method === 'POST') {
      return createResponse({ message: 'Assignment submitted successfully' }, 201);
    }

    // Grade endpoints
    if (path === endpoints.grades.list && method === 'GET') {
      const userId = searchParams.get('userId');
      if (userId) {
        return createResponse(mockData.getGradesByUser(userId));
      }
      return createResponse(mockData.getGrades());
    }

    // Certificate endpoints
    if (path === endpoints.certificates.list && method === 'GET') {
      const userId = searchParams.get('userId');
      if (userId) {
        return createResponse(mockData.getCertificatesByUser(userId));
      }
      return createResponse(mockData.getCertificates());
    }

    if (path.startsWith('/api/certificates/') && method === 'GET') {
      const certificateId = path.split('/').pop();
      const certificate = mockData.getCertificateById(certificateId!);
      if (certificate) {
        return createResponse(certificate);
      } else {
        return createErrorResponse('Certificate not found', 404);
      }
    }

    // Forum endpoints (basic mock)
    if (path === '/api/forum/threads' && method === 'GET') {
      return createResponse([]);
    }

    if (path === '/api/forum/threads' && method === 'POST') {
      return createResponse({ id: 'thread-' + Date.now(), message: 'Thread created' }, 201);
    }

    // Progress tracking
    if (path === '/api/progress' && method === 'GET') {
      const userId = searchParams.get('userId');
      return createResponse({
        coursesCompleted: 2,
        lessonsCompleted: 15,
        totalLessons: 20,
        overallProgress: 75
      });
    }

    if (path === '/api/progress' && method === 'POST') {
      return createResponse({ message: 'Progress updated' });
    }

    // If no mock route matches, delegate to original fetch
    return originalFetch(input, init);

  } catch (error) {
    console.error('Mock server error:', error);
    return createErrorResponse('Internal server error', 500);
  }
};

export const startMockServer = (config: MockServerConfig): void => {
  if (!config.enable || isEnabled) {
    return;
  }

  // Store original fetch if not already stored
  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  // Replace window.fetch with mock implementation
  window.fetch = mockFetch;
  isEnabled = true;

  console.log('🎭 Mock server started - intercepting fetch requests');
};

export const stopMockServer = (): void => {
  if (!isEnabled || !originalFetch) {
    return;
  }

  // Restore original fetch
  window.fetch = originalFetch;
  isEnabled = false;

  console.log('🎭 Mock server stopped - using real fetch');
};

export const isMockServerEnabled = (): boolean => {
  return isEnabled;
};
