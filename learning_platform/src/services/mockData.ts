// Mock data for development mode
import type { 
  User, 
  Course, 
  Lesson, 
  Quiz, 
  Assignment, 
  Grade, 
  ForumPost, 
  Certificate,
  QuizQuestion,
  LessonResource,
  AssignmentSubmission,
  AssignmentAttachment,
  ForumReply
} from '../types';

// Mock users matching authentication requirements
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@example.com',
    firstName: 'John',
    lastName: 'Student',
    name: 'John Student',
    password: 'password123', // Plain text for dev mode
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
    enrolledCourses: ['1', '2'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    email: 'teacher@example.com',
    firstName: 'Sarah',
    lastName: 'Teacher',
    name: 'Sarah Teacher',
    password: 'teacher123',
    role: 'instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    enrolledCourses: [],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: '3',
    email: 'admin@example.com',
    firstName: 'Mike',
    lastName: 'Admin',
    name: 'Mike Admin',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    enrolledCourses: [],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  }
];

// Mock quiz questions
const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is React?',
    type: 'multiple-choice',
    options: ['A library', 'A framework', 'A language', 'A database'],
    correctAnswer: 'A library',
    points: 10
  },
  {
    id: 'q2',
    question: 'What is JSX?',
    type: 'multiple-choice',
    options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript eXtension'],
    correctAnswer: 'JavaScript XML',
    points: 10
  },
  {
    id: 'q3',
    question: 'Explain the concept of state in React.',
    type: 'text',
    points: 20
  }
];

// Mock quizzes
export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'React Basics Quiz',
    description: 'Test your knowledge of React fundamentals',
    courseId: '1',
    lessonId: '2',
    questions: mockQuizQuestions,
    timeLimit: 1800, // 30 minutes
    attempts: 3,
    passingScore: 70,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    title: 'JavaScript Advanced Quiz',
    description: 'Advanced JavaScript concepts',
    courseId: '2',
    lessonId: '4',
    questions: [
      {
        id: 'q4',
        question: 'What is closure in JavaScript?',
        type: 'text',
        points: 25
      },
      {
        id: 'q5',
        question: 'Which method creates a new array?',
        type: 'multiple-choice',
        options: ['map()', 'forEach()', 'filter()', 'Both map() and filter()'],
        correctAnswer: 'Both map() and filter()',
        points: 15
      }
    ],
    timeLimit: 2400, // 40 minutes
    attempts: 2,
    passingScore: 80,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  }
];

// Mock lessons
export const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'Learn the basics of React library',
    courseId: '1',
    order: 1,
    duration: 1800, // 30 minutes
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    content: 'React is a JavaScript library for building user interfaces...',
    type: 'video',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString()
  },
  {
    id: '2',
    title: 'JSX and Components',
    description: 'Understanding JSX syntax and React components',
    courseId: '1',
    order: 2,
    duration: 2400, // 40 minutes
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    content: 'JSX allows you to write HTML-like syntax in JavaScript...',
    type: 'video',
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString()
  },
  {
    id: '3',
    title: 'JavaScript Fundamentals',
    description: 'Core JavaScript concepts',
    courseId: '2',
    order: 1,
    duration: 3600, // 60 minutes
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    content: 'JavaScript is a programming language that adds interactivity...',
    type: 'video',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: '4',
    title: 'Advanced JavaScript',
    description: 'Advanced concepts and patterns',
    courseId: '2',
    order: 2,
    duration: 4200, // 70 minutes
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    content: 'Advanced JavaScript includes closures, promises, async/await...',
    type: 'video',
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString()
  }
];

// Mock courses
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React for Beginners',
    description: 'Learn React from scratch with hands-on examples',
    instructor: mockUsers[1],
    instructorId: '2',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    category: 'Web Development',
    level: 'beginner',
    duration: 4200, // 70 minutes total
    price: 99.99,
    rating: 4.5,
    studentsCount: 1250,
    lessonsCount: 2,
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    isPublished: true
  },
  {
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts and patterns',
    instructor: mockUsers[1],
    instructorId: '2',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    category: 'Programming',
    level: 'advanced',
    duration: 7800, // 130 minutes total
    price: 149.99,
    rating: 4.8,
    studentsCount: 890,
    lessonsCount: 2,
    createdAt: new Date('2024-01-18').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
    isPublished: true
  },
  {
    id: '3',
    title: 'Python Basics',
    description: 'Introduction to Python programming',
    instructor: mockUsers[2],
    instructorId: '3',
    thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400',
    category: 'Programming',
    level: 'beginner',
    duration: 5400, // 90 minutes total
    price: 79.99,
    rating: 4.3,
    studentsCount: 2100,
    lessonsCount: 0,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
    isPublished: false
  }
];

// Mock assignments
export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Build a React Component',
    description: 'Create a reusable React component with props and state',
    courseId: '1',
    dueDate: new Date('2024-03-01').toISOString(),
    maxPoints: 100,
    instructions: 'Build a counter component that accepts initial value as prop...',
    submissionFormat: 'code',
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-16').toISOString()
  },
  {
    id: '2',
    title: 'JavaScript ES6 Features',
    description: 'Demonstrate understanding of modern JavaScript features',
    courseId: '2',
    dueDate: new Date('2024-03-15').toISOString(),
    maxPoints: 150,
    instructions: 'Write examples using arrow functions, destructuring, and async/await...',
    submissionFormat: 'code',
    createdAt: new Date('2024-02-02').toISOString(),
    updatedAt: new Date('2024-02-02').toISOString()
  }
];

// Mock grades
export const mockGrades: Grade[] = [
  {
    id: '1',
    studentId: '1',
    courseId: '1',
    assignmentId: '1',
    quizId: null,
    score: 85,
    maxScore: 100,
    feedback: 'Good work! Consider adding error handling.',
    gradedAt: new Date('2024-02-20').toISOString(),
    gradedBy: '2'
  },
  {
    id: '2',
    studentId: '1',
    courseId: '1',
    assignmentId: null,
    quizId: '1',
    score: 80,
    maxScore: 100,
    feedback: 'Well done on the quiz!',
    gradedAt: new Date('2024-02-18').toISOString(),
    gradedBy: '2'
  }
];

// Mock forum posts
export const mockForumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'How to handle state in React?',
    content: 'I am confused about when to use useState vs useReducer...',
    authorId: '1',
    authorName: 'John Student',
    courseId: '1',
    replies: [
      {
        id: '1-1',
        content: 'useState is great for simple state, useReducer for complex state logic.',
        authorId: '2',
        authorName: 'Sarah Teacher',
        createdAt: new Date('2024-02-11').toISOString()
      }
    ],
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-11').toISOString()
  },
  {
    id: '2',
    title: 'Best practices for JavaScript?',
    content: 'What are some coding best practices I should follow?',
    authorId: '1',
    authorName: 'John Student',
    courseId: '2',
    replies: [],
    createdAt: new Date('2024-02-12').toISOString(),
    updatedAt: new Date('2024-02-12').toISOString()
  }
];

// Mock certificates
export const mockCertificates: Certificate[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Student',
    courseId: '1',
    courseTitle: 'React for Beginners',
    issuedDate: new Date('2024-02-25').toISOString(),
    certificateUrl: '/certificates/react-beginner-john-student.pdf',
    verificationCode: 'CERT-REACT-2024-001'
  }
];

// Helper functions for querying mock data
export const authenticate = (email: string, password: string): User | null => {
  return mockUsers.find(user => user.email === email && user.password === password) || null;
};

export const getUserById = (id: string): User | null => {
  return mockUsers.find(user => user.id === id) || null;
};

export const listCourses = (page = 1, limit = 10, category?: string, level?: string) => {
  let filtered = mockCourses.filter(course => course.isPublished);
  
  if (category) {
    filtered = filtered.filter(course => course.category.toLowerCase() === category.toLowerCase());
  }
  
  if (level) {
    filtered = filtered.filter(course => course.level === level);
  }
  
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);
  
  return {
    items,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
};

export const getCourseById = (id: string): Course | null => {
  return mockCourses.find(course => course.id === id) || null;
};

export const getLessonsByCourseId = (courseId: string): Lesson[] => {
  return mockLessons
    .filter(lesson => lesson.courseId === courseId)
    .sort((a, b) => a.order - b.order);
};

export const getLessonById = (id: string): Lesson | null => {
  return mockLessons.find(lesson => lesson.id === id) || null;
};

export const getQuizzesByCourseId = (courseId: string): Quiz[] => {
  return mockQuizzes.filter(quiz => quiz.courseId === courseId);
};

export const getQuizById = (id: string): Quiz | null => {
  return mockQuizzes.find(quiz => quiz.id === id) || null;
};

export const getAssignmentsByCourseId = (courseId: string): Assignment[] => {
  return mockAssignments.filter(assignment => assignment.courseId === courseId);
};

export const getAssignmentById = (id: string): Assignment | null => {
  return mockAssignments.find(assignment => assignment.id === id) || null;
};

export const getGradesByStudentId = (studentId: string): Grade[] => {
  return mockGrades.filter(grade => grade.studentId === studentId);
};

export const getGradesByCourseId = (courseId: string): Grade[] => {
  return mockGrades.filter(grade => grade.courseId === courseId);
};

export const getForumPostsByCourseId = (courseId: string): ForumPost[] => {
  return mockForumPosts
    .filter(post => post.courseId === courseId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getForumPostById = (id: string): ForumPost | null => {
  return mockForumPosts.find(post => post.id === id) || null;
};

export const getCertificatesByStudentId = (studentId: string): Certificate[] => {
  return mockCertificates.filter(cert => cert.studentId === studentId);
};

export const getCertificateById = (id: string): Certificate | null => {
  return mockCertificates.find(cert => cert.id === id) || null;
};

// Export all mock data arrays
export {
  mockUsers as users,
  mockCourses as courses,
  mockLessons as lessons,
  mockQuizzes as quizzes,
  mockAssignments as assignments,
  mockGrades as grades,
  mockForumPosts as forums,
  mockCertificates as certificates
};

// Export mockData object for object-based usage
export const mockData = {
  // User methods
  getUsers: () => mockUsers,
  getUserById,
  authenticate,
  
  // Course methods  
  getCourses: () => listCourses(1, 100).items, // Get all courses
  getCourseById,
  
  // Lesson methods
  getLessons: () => mockLessons,
  getLessonsByCourse: getLessonsByCourseId,
  getLessonById,
  
  // Quiz methods
  getQuizzes: () => mockQuizzes,
  getQuizzesByLesson: getQuizzesByCourseId, // Reuse course method for lessons
  getQuizById,
  
  // Assignment methods
  getAssignments: () => mockAssignments,
  getAssignmentById,
  
  // Grade methods
  getGrades: () => mockGrades,
  getGradesByUser: getGradesByStudentId,
  
  // Certificate methods
  getCertificates: () => mockCertificates,
  getCertificatesByUser: getCertificatesByStudentId,
  getCertificateById,
  
  // Forum methods (for completeness)
  getForumPosts: () => mockForumPosts,
  getForumPostsByCourseId,
  getForumPostById,
};
