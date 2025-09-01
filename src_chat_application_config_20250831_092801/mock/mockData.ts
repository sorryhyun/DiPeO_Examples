import { 
  User, 
  Channel, 
  ChannelType,
  Message, 
  MessageType,
  Thread, 
  Reaction, 
  PresenceStatus,
  FileMeta,
  Role
} from '@/core/contracts';
import { appConfig, shouldUseMockData, LSKeys } from '@/app/config';
import { safeParseJSON, safeStringify, generateId } from '@/core/utils';

// Storage helpers using localStorage directly (no DOM side effects in functions)
function getFromStorage<T>(key: string): T | null {
  try {
    const item = globalThis.localStorage?.getItem(key);
    return item ? safeParseJSON<T>(item) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, data: any): void {
  try {
    globalThis.localStorage?.setItem(key, safeStringify(data));
  } catch {
    // Silently fail in environments without localStorage
  }
}

// Mock users dataset
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    displayName: 'Admin User',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin' as Role,
    createdAt: new Date('2024-01-01').toISOString(),
    metadata: { isOnline: true, lastSeen: new Date().toISOString() }
  },
  {
    id: 'user-2',
    email: 'doctor@hospital.com',
    displayName: 'Dr. Sarah Wilson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor',
    role: 'doctor' as Role,
    createdAt: new Date('2024-01-02').toISOString(),
    metadata: { 
      isOnline: true, 
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      specialty: 'Cardiology',
      licenseNumber: 'MD12345'
    }
  },
  {
    id: 'user-3',
    email: 'nurse@hospital.com',
    displayName: 'Nurse Johnson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nurse',
    role: 'nurse' as Role,
    createdAt: new Date('2024-01-03').toISOString(),
    metadata: { 
      isOnline: false, 
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      department: 'Emergency'
    }
  },
  {
    id: 'user-4',
    email: 'patient@example.com',
    displayName: 'John Doe',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patient',
    role: 'patient' as Role,
    createdAt: new Date('2024-01-04').toISOString(),
    metadata: { 
      isOnline: true, 
      lastSeen: new Date().toISOString(),
      dob: '1985-06-15',
      medicalRecordId: 'MR001'
    }
  },
  {
    id: 'user-5',
    email: 'member@team.com',
    displayName: 'Team Member',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member',
    role: 'member' as Role,
    createdAt: new Date('2024-01-05').toISOString(),
    metadata: { isOnline: true, lastSeen: new Date().toISOString() }
  },
  {
    id: 'user-6',
    email: 'guest@example.com',
    displayName: 'Guest User',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
    role: 'guest' as Role,
    createdAt: new Date('2024-01-06').toISOString(),
    metadata: { isOnline: false, lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
  }
];

// Mock channels dataset
const mockChannels: Channel[] = [
  {
    id: 'channel-1',
    name: 'general',
    type: 'public' as ChannelType,
    memberIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01').toISOString(),
    metadata: { description: 'General discussion for all team members' }
  },
  {
    id: 'channel-2',
    name: 'medical-staff',
    type: 'private' as ChannelType,
    memberIds: ['user-2', 'user-3'],
    createdBy: 'user-2',
    createdAt: new Date('2024-01-02').toISOString(),
    metadata: { description: 'Private channel for medical staff only' }
  },
  {
    id: 'dm-1',
    name: '',
    type: 'dm' as ChannelType,
    memberIds: ['user-2', 'user-4'],
    createdBy: 'user-2',
    createdAt: new Date('2024-01-05').toISOString(),
    metadata: { isDirect: true }
  }
];

// Mock messages dataset
const mockMessages: Message[] = [
  {
    id: 'msg-1',
    channelId: 'channel-1',
    authorId: 'user-1',
    type: 'text' as MessageType,
    text: 'Welcome to our healthcare team chat! 👋',
    files: [],
    reactions: [
      { emoji: '👋', userId: 'user-2', createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
      { emoji: '❤️', userId: 'user-3', createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    editedAt: null,
    metadata: {}
  },
  {
    id: 'msg-2',
    channelId: 'channel-1',
    authorId: 'user-2',
    type: 'text' as MessageType,
    text: 'Thanks! Excited to collaborate with everyone 🚀',
    files: [],
    reactions: [],
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    editedAt: null,
    metadata: {}
  },
  {
    id: 'msg-3',
    channelId: 'channel-2',
    authorId: 'user-2',
    type: 'text' as MessageType,
    text: 'Patient rounds start at 8 AM tomorrow. Please review the cases.',
    files: [],
    reactions: [
      { emoji: '✅', userId: 'user-3', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    editedAt: null,
    metadata: {}
  },
  {
    id: 'msg-4',
    channelId: 'dm-1',
    authorId: 'user-4',
    type: 'text' as MessageType,
    text: 'Hi Dr. Wilson, I have some questions about my test results.',
    files: [],
    reactions: [],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    editedAt: null,
    metadata: {}
  },
  {
    id: 'msg-5',
    channelId: 'dm-1',
    authorId: 'user-2',
    type: 'text' as MessageType,
    text: 'Of course! I\'ll review them and get back to you shortly.',
    files: [],
    reactions: [],
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    editedAt: null,
    metadata: {}
  }
];

// Mock threads dataset
const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    parentMessageId: 'msg-1',
    channelId: 'channel-1',
    participants: ['user-1', 'user-2', 'user-5'],
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
  }
];

// Mock files dataset
const mockFiles: FileMeta[] = [
  {
    id: 'file-1',
    fileName: 'patient-report.pdf',
    mimeType: 'application/pdf',
    size: 245760, // ~240KB
    url: '/mock-files/patient-report.pdf',
    uploadedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];

// In-memory database state
interface MockDatabase {
  users: User[];
  channels: Channel[];
  messages: Message[];
  threads: Thread[];
  files: FileMeta[];
  currentUserId: string | null;
}

let mockDb: MockDatabase = {
  users: [...mockUsers],
  channels: [...mockChannels],
  messages: [...mockMessages],
  threads: [...mockThreads],
  files: [...mockFiles],
  currentUserId: 'user-1' // Default current user
};

// Load mock data from localStorage on initialization
function loadMockData(): void {
  if (!shouldUseMockData) return;
  
  const savedData = getFromStorage<Partial<MockDatabase>>(LSKeys.MOCK_DB);
  const savedUserId = getFromStorage<string>(LSKeys.AUTH_USER);
  
  if (savedData) {
    mockDb = { ...mockDb, ...savedData };
  }
  
  if (savedUserId) {
    mockDb.currentUserId = savedUserId;
  }
}

// Save mock data to localStorage
function saveMockData(): void {
  if (!shouldUseMockData) return;
  
  saveToStorage(LSKeys.MOCK_DB, {
    users: mockDb.users,
    channels: mockDb.channels,
    messages: mockDb.messages,
    threads: mockDb.threads,
    files: mockDb.files
  });
  
  if (mockDb.currentUserId) {
    saveToStorage(LSKeys.AUTH_USER, mockDb.currentUserId);
  }
}

// User CRUD operations
export const mockUserOperations = {
  findAll: (): User[] => [...mockDb.users],
  
  findById: (id: string): User | null => 
    mockDb.users.find(user => user.id === id) || null,
  
  findByEmail: (email: string): User | null =>
    mockDb.users.find(user => user.email === email) || null,
  
  create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const user: User = {
      ...userData,
      id: generateId('user'),
      createdAt: new Date().toISOString()
    };
    
    mockDb.users.push(user);
    saveMockData();
    return user;
  },
  
  update: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null => {
    const index = mockDb.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    mockDb.users[index] = {
      ...mockDb.users[index],
      ...updates
    };
    
    saveMockData();
    return mockDb.users[index];
  },
  
  delete: (id: string): boolean => {
    const index = mockDb.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    mockDb.users.splice(index, 1);
    saveMockData();
    return true;
  }
};

// Channel CRUD operations
export const mockChannelOperations = {
  findAll: (): Channel[] => [...mockDb.channels],
  
  findById: (id: string): Channel | null =>
    mockDb.channels.find(channel => channel.id === id) || null,
  
  findByUserId: (userId: string): Channel[] =>
    mockDb.channels.filter(channel => channel.memberIds.includes(userId)),
  
  create: (channelData: Omit<Channel, 'id' | 'createdAt'>): Channel => {
    const channel: Channel = {
      ...channelData,
      id: generateId('channel'),
      createdAt: new Date().toISOString()
    };
    
    mockDb.channels.push(channel);
    saveMockData();
    return channel;
  },
  
  update: (id: string, updates: Partial<Omit<Channel, 'id' | 'createdAt'>>): Channel | null => {
    const index = mockDb.channels.findIndex(channel => channel.id === id);
    if (index === -1) return null;
    
    mockDb.channels[index] = {
      ...mockDb.channels[index],
      ...updates
    };
    
    saveMockData();
    return mockDb.channels[index];
  },
  
  delete: (id: string): boolean => {
    const index = mockDb.channels.findIndex(channel => channel.id === id);
    if (index === -1) return false;
    
    mockDb.channels.splice(index, 1);
    saveMockData();
    return true;
  }
};

// Message CRUD operations
export const mockMessageOperations = {
  findByChannelId: (channelId: string, limit = 50, before?: string): Message[] => {
    let messages = mockDb.messages
      .filter(msg => msg.channelId === channelId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (before) {
      const beforeIndex = messages.findIndex(msg => msg.id === before);
      if (beforeIndex > -1) {
        messages = messages.slice(beforeIndex + 1);
      }
    }
    
    return messages.slice(0, limit);
  },
  
  findById: (id: string): Message | null =>
    mockDb.messages.find(msg => msg.id === id) || null,
  
  create: (messageData: Omit<Message, 'id' | 'createdAt'>): Message => {
    const message: Message = {
      ...messageData,
      id: generateId('msg'),
      createdAt: new Date().toISOString()
    };
    
    mockDb.messages.push(message);
    saveMockData();
    return message;
  },
  
  update: (id: string, updates: Partial<Omit<Message, 'id' | 'channelId' | 'authorId' | 'createdAt'>>): Message | null => {
    const index = mockDb.messages.findIndex(msg => msg.id === id);
    if (index === -1) return null;
    
    mockDb.messages[index] = {
      ...mockDb.messages[index],
      ...updates,
      editedAt: updates.text ? new Date().toISOString() : mockDb.messages[index].editedAt
    };
    
    saveMockData();
    return mockDb.messages[index];
  },
  
  delete: (id: string): boolean => {
    const index = mockDb.messages.findIndex(msg => msg.id === id);
    if (index === -1) return false;
    
    mockDb.messages.splice(index, 1);
    saveMockData();
    return true;
  },
  
  addReaction: (messageId: string, reaction: Reaction): Message | null => {
    const message = mockDb.messages.find(msg => msg.id === messageId);
    if (!message) return null;
    
    // Remove existing reaction from this user if it exists
    message.reactions = message.reactions?.filter(r => 
      !(r.userId === reaction.userId && r.emoji === reaction.emoji)
    ) || [];
    
    // Add new reaction
    message.reactions.push(reaction);
    saveMockData();
    return message;
  },
  
  removeReaction: (messageId: string, userId: string, emoji: string): Message | null => {
    const message = mockDb.messages.find(msg => msg.id === messageId);
    if (!message) return null;
    
    message.reactions = message.reactions?.filter(r => 
      !(r.userId === userId && r.emoji === emoji)
    ) || [];
    
    saveMockData();
    return message;
  }
};

// Thread CRUD operations
export const mockThreadOperations = {
  findById: (id: string): Thread | null =>
    mockDb.threads.find(thread => thread.id === id) || null,
  
  findByParentMessageId: (parentMessageId: string): Thread | null =>
    mockDb.threads.find(thread => thread.parentMessageId === parentMessageId) || null,
  
  create: (threadData: Omit<Thread, 'id' | 'createdAt'>): Thread => {
    const thread: Thread = {
      ...threadData,
      id: generateId('thread'),
      createdAt: new Date().toISOString()
    };
    
    mockDb.threads.push(thread);
    saveMockData();
    return thread;
  },
  
  update: (id: string, updates: Partial<Omit<Thread, 'id' | 'parentMessageId' | 'channelId' | 'createdAt'>>): Thread | null => {
    const index = mockDb.threads.findIndex(thread => thread.id === id);
    if (index === -1) return null;
    
    mockDb.threads[index] = {
      ...mockDb.threads[index],
      ...updates
    };
    
    saveMockData();
    return mockDb.threads[index];
  }
};

// File CRUD operations
export const mockFileOperations = {
  findAll: (): FileMeta[] => [...mockDb.files],
  
  findById: (id: string): FileMeta | null =>
    mockDb.files.find(file => file.id === id) || null,
  
  create: (fileData: Omit<FileMeta, 'id' | 'uploadedAt'>): FileMeta => {
    const file: FileMeta = {
      ...fileData,
      id: generateId('file'),
      uploadedAt: new Date().toISOString()
    };
    
    mockDb.files.push(file);
    saveMockData();
    return file;
  },
  
  delete: (id: string): boolean => {
    const index = mockDb.files.findIndex(file => file.id === id);
    if (index === -1) return false;
    
    mockDb.files.splice(index, 1);
    saveMockData();
    return true;
  }
};

// Current user operations
export const mockCurrentUser = {
  get: (): User | null => {
    if (!mockDb.currentUserId) return null;
    return mockUserOperations.findById(mockDb.currentUserId);
  },
  
  set: (userId: string): void => {
    mockDb.currentUserId = userId;
    saveMockData();
  },
  
  clear: (): void => {
    mockDb.currentUserId = null;
    saveToStorage(LSKeys.AUTH_USER, null);
  }
};

// Seed function to initialize/reset mock data
export function seedMockData(): void {
  mockDb = {
    users: [...mockUsers],
    channels: [...mockChannels],
    messages: [...mockMessages],
    threads: [...mockThreads],
    files: [...mockFiles],
    currentUserId: 'user-1'
  };
  
  saveMockData();
}

// Get presence status for a user
export function getUserPresence(userId: string): PresenceStatus {
  const user = mockDb.users.find(u => u.id === userId);
  if (!user?.metadata?.isOnline) return 'offline';
  
  const lastSeen = user.metadata?.lastSeen;
  if (!lastSeen) return 'offline';
  
  const timeDiff = Date.now() - new Date(lastSeen).getTime();
  const fiveMinutes = 5 * 60 * 1000;
  
  return timeDiff > fiveMinutes ? 'offline' : 'online';
}

// Update user presence
export function updateUserPresence(userId: string, status: PresenceStatus): void {
  const user = mockDb.users.find(u => u.id === userId);
  if (!user) return;
  
  user.metadata = {
    ...user.metadata,
    isOnline: status === 'online',
    lastSeen: new Date().toISOString()
  };
  
  saveMockData();
}

// Main mock database export
export const mockDb = {
  users: mockUserOperations,
  channels: mockChannelOperations,
  messages: mockMessageOperations,
  threads: mockThreadOperations,
  files: mockFileOperations,
  currentUser: mockCurrentUser,
  
  // Direct access to collections (read-only)
  data: {
    get users() { return [...mockDb.users]; },
    get channels() { return [...mockDb.channels]; },
    get messages() { return [...mockDb.messages]; },
    get threads() { return [...mockDb.threads]; },
    get files() { return [...mockDb.files]; },
    get currentUserId() { return mockDb.currentUserId; }
  },
  
  // Utility functions
  reset: seedMockData,
  save: saveMockData,
  getUserPresence,
  updateUserPresence
};

// Auto-load data on module import (only in development)
if (shouldUseMockData) {
  loadMockData();
}
