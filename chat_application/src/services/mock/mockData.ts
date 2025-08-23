import { generateId } from '../../utils/generateId';
import { devConfig } from '../../config/devConfig';
import type { User, Channel, Message, FileItem, PresenceStatus } from '../../types';

// Create users based on devConfig mock_auth_users
const users: User[] = devConfig.mock_auth_users.map(mockUser => ({
  id: generateId(),
  email: mockUser.email,
  displayName: mockUser.displayName,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.email}`,
  role: mockUser.role,
  status: 'online' as const,
  lastSeen: new Date().toISOString(),
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
}));

// Create channels
const channels: Channel[] = [
  {
    id: generateId(),
    name: 'general',
    description: 'General discussion',
    type: 'public',
    memberCount: users.length,
    lastActivity: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    createdBy: users[0].id
  },
  {
    id: generateId(),
    name: 'team',
    description: 'Team coordination',
    type: 'private',
    memberCount: Math.min(3, users.length),
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdBy: users[0].id
  }
];

// Create messages for channels
const messages: Message[] = [
  // Recent messages in general channel
  {
    id: generateId(),
    channelId: channels[0].id,
    userId: users[0].id,
    content: 'Welcome to the team! 👋',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    edited: false,
    reactions: [
      {
        emoji: '👋',
        count: users.length - 1,
        userIds: users.slice(1).map(u => u.id)
      }
    ],
    threadCount: 0
  },
  {
    id: generateId(),
    channelId: channels[0].id,
    userId: users[1]?.id || users[0].id,
    content: 'Thanks! Excited to be here!',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    edited: false,
    reactions: [],
    threadCount: 0
  },
  {
    id: generateId(),
    channelId: channels[0].id,
    userId: users[2]?.id || users[0].id,
    content: 'Has anyone seen the latest project updates?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    edited: false,
    reactions: [
      {
        emoji: '👀',
        count: 2,
        userIds: users.slice(0, 2).map(u => u.id)
      }
    ],
    threadCount: 2
  },
  // Older message in general
  {
    id: generateId(),
    channelId: channels[0].id,
    userId: users[0].id,
    content: 'Good morning everyone! Let\'s make today productive 💪',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    edited: false,
    reactions: [
      {
        emoji: '☀️',
        count: 1,
        userIds: [users[1]?.id || users[0].id]
      },
      {
        emoji: '💪',
        count: 2,
        userIds: users.slice(1, 3).map(u => u.id)
      }
    ],
    threadCount: 0
  },
  // Messages in team channel
  {
    id: generateId(),
    channelId: channels[1].id,
    userId: users[0].id,
    content: 'Team meeting in 30 minutes, don\'t forget!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    edited: false,
    reactions: [
      {
        emoji: '✅',
        count: 2,
        userIds: users.slice(1, 3).map(u => u.id)
      }
    ],
    threadCount: 0
  },
  {
    id: generateId(),
    channelId: channels[1].id,
    userId: users[1]?.id || users[0].id,
    content: 'I\'ll be there!',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), // 28 minutes ago
    edited: false,
    reactions: [],
    threadCount: 0
  }
];

// Create some file items
const files: FileItem[] = [
  {
    id: generateId(),
    name: 'project-spec.pdf',
    size: 2456789,
    type: 'application/pdf',
    url: '/api/files/project-spec.pdf',
    uploadedBy: users[0].id,
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    channelId: channels[0].id
  },
  {
    id: generateId(),
    name: 'team-photo.jpg',
    size: 1234567,
    type: 'image/jpeg',
    url: '/api/files/team-photo.jpg',
    uploadedBy: users[1]?.id || users[0].id,
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    channelId: channels[0].id
  },
  {
    id: generateId(),
    name: 'meeting-notes.docx',
    size: 567890,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/api/files/meeting-notes.docx',
    uploadedBy: users[2]?.id || users[0].id,
    uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    channelId: channels[1].id
  }
];

// Create presence data for users
const presence: PresenceStatus[] = users.map(user => ({
  userId: user.id,
  status: user.status,
  lastSeen: user.lastSeen,
  isTyping: false,
  currentChannel: Math.random() > 0.5 ? channels[0].id : null
}));

// Seed data interface
interface SeedData {
  users: User[];
  channels: Channel[];
  messages: Message[];
  files: FileItem[];
  presence: PresenceStatus[];
}

// Export seed data
export const seedUsers = users;
export const seedChannels = channels;
export const seedMessages = messages;
export const seedFiles = files;
export const seedPresence = presence;

// Function to get a deep clone of all seed data to prevent mutation
export function getSeed(): SeedData {
  return {
    users: JSON.parse(JSON.stringify(users)),
    channels: JSON.parse(JSON.stringify(channels)),
    messages: JSON.parse(JSON.stringify(messages)),
    files: JSON.parse(JSON.stringify(files)),
    presence: JSON.parse(JSON.stringify(presence))
  };
}

// Helper to get user by email (useful for auth mock)
export function getUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

// Helper to get channel by name
export function getChannelByName(name: string): Channel | undefined {
  return channels.find(channel => channel.name === name);
}
