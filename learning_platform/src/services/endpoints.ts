// API endpoint constants used throughout the application
export const COURSES = '/api/courses';
export const LESSONS = '/api/lessons';
export const QUIZZES = '/api/quizzes';
export const ASSIGNMENTS = '/api/assignments';
export const GRADES = '/api/grades';
export const FORUMS = '/api/forums';
export const CERTIFICATES = '/api/certificates';
export const AUTH = '/api/auth';

// Nested endpoint helpers for specific resources
export const COURSE_ENDPOINTS = {
  LIST: COURSES,
  DETAIL: (id: string) => `${COURSES}/${id}`,
  ENROLL: (id: string) => `${COURSES}/${id}/enroll`,
  PROGRESS: (id: string) => `${COURSES}/${id}/progress`,
} as const;

export const LESSON_ENDPOINTS = {
  LIST: LESSONS,
  DETAIL: (id: string) => `${LESSONS}/${id}`,
  COMPLETE: (id: string) => `${LESSONS}/${id}/complete`,
} as const;

export const QUIZ_ENDPOINTS = {
  LIST: QUIZZES,
  DETAIL: (id: string) => `${QUIZZES}/${id}`,
  SUBMIT: (id: string) => `${QUIZZES}/${id}/submit`,
  RESULTS: (id: string) => `${QUIZZES}/${id}/results`,
} as const;

export const ASSIGNMENT_ENDPOINTS = {
  LIST: ASSIGNMENTS,
  DETAIL: (id: string) => `${ASSIGNMENTS}/${id}`,
  SUBMIT: (id: string) => `${ASSIGNMENTS}/${id}/submit`,
  FEEDBACK: (id: string) => `${ASSIGNMENTS}/${id}/feedback`,
} as const;

export const GRADE_ENDPOINTS = {
  LIST: GRADES,
  COURSE: (courseId: string) => `${GRADES}/course/${courseId}`,
  STUDENT: (studentId: string) => `${GRADES}/student/${studentId}`,
} as const;

export const FORUM_ENDPOINTS = {
  LIST: FORUMS,
  THREADS: (forumId: string) => `${FORUMS}/${forumId}/threads`,
  POSTS: (threadId: string) => `${FORUMS}/threads/${threadId}/posts`,
  CREATE_THREAD: (forumId: string) => `${FORUMS}/${forumId}/threads`,
  CREATE_POST: (threadId: string) => `${FORUMS}/threads/${threadId}/posts`,
} as const;

export const CERTIFICATE_ENDPOINTS = {
  LIST: CERTIFICATES,
  DETAIL: (id: string) => `${CERTIFICATES}/${id}`,
  GENERATE: (courseId: string) => `${CERTIFICATES}/generate/${courseId}`,
  DOWNLOAD: (id: string) => `${CERTIFICATES}/${id}/download`,
} as const;

export const AUTH_ENDPOINTS = {
  LOGIN: `${AUTH}/login`,
  LOGOUT: `${AUTH}/logout`,
  REGISTER: `${AUTH}/register`,
  PROFILE: `${AUTH}/profile`,
  REFRESH: `${AUTH}/refresh`,
} as const;

// Export endpoints object for object-based usage
export const endpoints = {
  auth: {
    login: AUTH_ENDPOINTS.LOGIN,
    logout: AUTH_ENDPOINTS.LOGOUT,
    register: AUTH_ENDPOINTS.REGISTER,
    profile: AUTH_ENDPOINTS.PROFILE,
    refresh: AUTH_ENDPOINTS.REFRESH,
  },
  courses: {
    list: COURSES,
    create: COURSES,
    detail: (id: string) => COURSE_ENDPOINTS.DETAIL(id),
    enroll: (id: string) => COURSE_ENDPOINTS.ENROLL(id),
    progress: (id: string) => COURSE_ENDPOINTS.PROGRESS(id),
  },
  lessons: {
    list: LESSONS,
    detail: (id: string) => LESSON_ENDPOINTS.DETAIL(id),
    complete: (id: string) => LESSON_ENDPOINTS.COMPLETE(id),
  },
  quizzes: {
    list: QUIZZES,
    detail: (id: string) => QUIZ_ENDPOINTS.DETAIL(id),
    submit: (id: string) => QUIZ_ENDPOINTS.SUBMIT(id),
    results: (id: string) => QUIZ_ENDPOINTS.RESULTS(id),
  },
  assignments: {
    list: ASSIGNMENTS,
    detail: (id: string) => ASSIGNMENT_ENDPOINTS.DETAIL(id),
    submit: (id: string) => ASSIGNMENT_ENDPOINTS.SUBMIT(id),
    feedback: (id: string) => ASSIGNMENT_ENDPOINTS.FEEDBACK(id),
  },
  grades: {
    list: GRADES,
    course: (courseId: string) => GRADE_ENDPOINTS.COURSE(courseId),
    student: (studentId: string) => GRADE_ENDPOINTS.STUDENT(studentId),
  },
  certificates: {
    list: CERTIFICATES,
    detail: (id: string) => CERTIFICATE_ENDPOINTS.DETAIL(id),
    generate: (courseId: string) => CERTIFICATE_ENDPOINTS.GENERATE(courseId),
    download: (id: string) => CERTIFICATE_ENDPOINTS.DOWNLOAD(id),
  },
  forums: {
    list: FORUMS,
    threads: (forumId: string) => FORUM_ENDPOINTS.THREADS(forumId),
    posts: (threadId: string) => FORUM_ENDPOINTS.POSTS(threadId),
    createThread: (forumId: string) => FORUM_ENDPOINTS.CREATE_THREAD(forumId),
    createPost: (threadId: string) => FORUM_ENDPOINTS.CREATE_POST(threadId),
  },
};
