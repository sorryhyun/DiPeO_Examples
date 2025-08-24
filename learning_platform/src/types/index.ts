// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  enrolledCourses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Course Related Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: User;
  thumbnail?: string;
  duration: number; // in minutes
  totalDuration?: number; // Total duration in minutes
  lessons: Lesson[];
  lessonsCount?: number;
  enrollmentCount: number;
  rating: number;
  price: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  enrolledStudents?: number;
  previewVideo?: string;
  quizzes?: Quiz[];
  assignments?: Assignment[];
  progress?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  resources: LessonResource[];
  quiz?: Quiz;
  isCompleted: boolean;
  createdAt: string;
  content?: string;
  type?: string;
  completed?: boolean;
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  size?: number; // in bytes
}

// Quiz Types
export interface Quiz {
  id: string;
  lessonId?: string;
  courseId?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  isCompleted: boolean;
  score?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  text?: string;
  required?: boolean;
  answers?: string[];
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
}

// Assignment Types
export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: string;
  maxPoints: number;
  submissions: AssignmentSubmission[];
  requirements: string[];
  attachments: AssignmentAttachment[];
  createdAt: string;
  submissionFormat?: string;
  updatedAt?: string;
  maxScore?: number;
  submitted?: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: AssignmentAttachment[];
  submittedAt: string;
  grade?: Grade;
  files?: any[];
  feedback?: string;
}

export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number; // in bytes
}

// Grade Types
export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  assignmentId?: string;
  assignmentTitle: string;
  quizId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  gradedBy: string;
  gradedAt: string;
  // Additional properties used in components
  grade: number;
  submittedAt: string;
  maxGrade?: number;
  status: 'graded' | 'pending' | 'submitted' | 'overdue';
}

// Forum Types
export interface ForumPost {
  id: string;
  courseId: string;
  authorId: string;
  author: User;
  authorName: string;
  title: string;
  content: string;
  replies: ForumReply[];
  tags: string[];
  isPinned: boolean;
  isResolved: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  authorName: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

// Certificate Types
export interface Certificate {
  id: string;
  studentId: string;
  student: User;
  studentName: string;
  courseId: string;
  course: Course;
  courseName: string;
  certificateUrl: string;
  completionDate: string;
  validUntil?: string;
  credentialId: string;
  isVerified: boolean;
  achievementLevel: string;
  issuedDate: string;
  courseTitle?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
  timestamp: string;
}

// Utility Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface ProgressEvent extends WebSocketEvent {
  type: 'progress';
  payload: {
    courseId: string;
    lessonId: string;
    progress: number; // 0-100
  };
}

export interface NotificationEvent extends WebSocketEvent {
  type: 'notification';
  payload: NotificationMessage;
}
