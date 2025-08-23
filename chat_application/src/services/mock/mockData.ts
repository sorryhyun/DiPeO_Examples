import { generateId } from '../../utils/generateId';
import { AppConfig } from '../../config/appConfig';
import type { User, Channel, Message, FileMeta, Role } from '../../types';

// Create users based on AppConfig mock_auth_users
const users: User[] = AppConfig.mock_auth_users?.map(mockUser => ({
  id: mockUser.id,
  email: mockUser.username + '@example.com', // Generate email from username
  displayName: mockUser.displayName,
  avatar: mockUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.username}`,
  role: 'member' as Role // Default role since MockUser doesn't have role
})) || [];

// Create channels
const channels: Channel[] = [
  {
    id: generateId(),
    name: 'general',
    description: 'General discussion',
    private: false,
    members: users.map(u => u.id),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: generateId(),
    name: 'team',
    description: 'Team coordination',
    private: true,
    members: users.slice(0, 3).map(u => u.id),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  }
];

// Create messages for channels
const messages: Message[] = [
  // Recent messages in general channel
  {
    id: generateId(),
    channelId: channels[0].id,
    senderId: users[0].id,
    content: 'Welcome to the team! 👋',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    edited: false,
    reactions: {
      '👋': users.slice(1).map(u => ({
        emoji: '👋',
        userId: u.id,
        createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString()
      }))
    }
  },
  {
    id: generateId(),
    channelId: channels[0].id,
    senderId: users[1]?.id || users[0].id,
    content: 'Thanks! Excited to be here!',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    edited: false
  },
  {
    id: generateId(),
    channelId: channels[0].id,
    senderId: users[2]?.id || users[0].id,
    content: 'Has anyone seen the latest project updates?',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    edited: false,
    reactions: {
      '👀': users.slice(0, 2).map(u => ({
        emoji: '👀',
        userId: u.id,
        createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString()
      }))
    }
  },
  // Older message in general
  {
    id: generateId(),
    channelId: channels[0].id,
    senderId: users[0].id,
    content: 'Good morning everyone! Let\'s make today productive 💪',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    edited: false,
    reactions: {
      '☀️': [{
        emoji: '☀️',
        userId: users[1]?.id || users[0].id,
        createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString()
      }],
      '💪': users.slice(1, 3).map(u => ({
        emoji: '💪',
        userId: u.id,
        createdAt: new Date(Date.now() - 105 * 60 * 1000).toISOString()
      }))
    }
  },
  // Messages in team channel
  {
    id: generateId(),
    channelId: channels[1].id,
    senderId: users[0].id,
    content: 'Team meeting in 30 minutes, don\'t forget!',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    edited: false,
    reactions: {
      '✅': users.slice(1, 3).map(u => ({
        emoji: '✅',
        userId: u.id,
        createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString()
      }))
    }
  },
  {
    id: generateId(),
    channelId: channels[1].id,
    senderId: users[1]?.id || users[0].id,
    content: 'I\'ll be there!',
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(), // 28 minutes ago
    edited: false
  }
];

// Create some file items
const files: FileMeta[] = [
  {
    id: generateId(),
    name: 'project-spec.pdf',
    type: 'application/pdf',
    size: 2456789,
    mimeType: 'application/pdf',
    url: '/api/files/project-spec.pdf',
    uploadedBy: users[0].id,
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    channelId: channels[0].id
  },
  {
    id: generateId(),
    name: 'team-photo.jpg',
    type: 'image/jpeg',
    size: 1234567,
    mimeType: 'image/jpeg',
    url: '/api/files/team-photo.jpg',
    uploadedBy: users[1]?.id || users[0].id,
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    channelId: channels[0].id
  },
  {
    id: generateId(),
    name: 'meeting-notes.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 567890,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/api/files/meeting-notes.docx',
    uploadedBy: users[2]?.id || users[0].id,
    uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    channelId: channels[1].id
  }
];

// Create presence data for users (using extended interface for mock)
const presence = users.map(user => ({
  userId: user.id,
  channelId: channels[0].id, // Default to general channel
  online: true,
  lastSeen: new Date().toISOString(),
  status: 'available' as const
}));

// Create some sample reactions  
const reactions = [
  {
    id: generateId(),
    messageId: messages[0].id,
    emoji: '👍',
    userId: users[1]?.id || users[0].id,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: generateId(),
    messageId: messages[0].id,
    emoji: '👍',
    userId: users[2]?.id || users[0].id,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  }
];

// Create some sample threads
const threads = [
  {
    id: generateId(),
    channelId: channels[0].id,
    parentMessageId: messages[2].id,
    messageIds: [],
    title: 'Discussion thread',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    messageCount: 0
  }
];

// Export seed data
export const mockData = {
  users,
  channels,
  messages,
  files,
  presence,
  reactions,
  threads
};

// Function to get a deep clone of all mock data to prevent mutation
export function getMockData() {
  return JSON.parse(JSON.stringify(mockData));
}

