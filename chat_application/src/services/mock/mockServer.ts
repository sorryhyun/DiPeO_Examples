import { ApiResponse, User, Channel, Message, FileMeta, Reaction, Thread } from '../../types';

// Extended types for mock server that include additional fields needed for backend operations
interface MockReaction extends Reaction {
  id: string;
  messageId: string;
}

interface MockPresenceState {
  userId: string;
  channelId: string;
  online: boolean;
  status: 'available' | 'away' | 'busy' | 'invisible';
  lastSeen: string;
}

interface MockThread extends Thread {
  channelId: string;
  title?: string;
  updatedAt: string;
  messageCount: number;
}
import { mockData, getMockData } from './mockData';
import { mockSocket } from './mockSocket';
import { generateId } from '../../utils/generateId';
import { devConfig } from '../../config/devConfig';

// In-memory store for mock data
interface MockStore {
  users: User[];
  channels: Channel[];
  messages: Message[];
  files: FileMeta[];
  presence: MockPresenceState[];
  reactions: MockReaction[];
  threads: MockThread[];
}

let store: MockStore = {
  users: [...mockData.users],
  channels: [...mockData.channels],
  messages: [...mockData.messages],
  files: [...mockData.files],
  presence: [...mockData.presence],
  reactions: [...mockData.reactions],
  threads: [...mockData.threads]
};

// Helper function to find items by ID
const findById = <T extends { id: string }>(collection: T[], id: string): T | undefined => {
  return collection.find(item => item.id === id);
};

// Helper function to create proper API response with timestamp
const createApiResponse = <T>(data: T, success: boolean = true, error?: string): ApiResponse<T> => {
  return {
    data,
    success,
    error,
    timestamp: new Date().toISOString()
  };
};

// Helper function to paginate results
interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
}

const paginate = <T>(items: T[], cursor?: string, limit: number = 50): PaginatedResult<T> => {
  const startIndex = cursor ? parseInt(cursor, 10) : 0;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const nextCursor = endIndex < items.length ? endIndex.toString() : undefined;
  
  return { items: paginatedItems, nextCursor };
};

// Handler function type
type HandlerFunction = (
  query: URLSearchParams,
  params: Record<string, string>,
  body?: any,
  headers?: Record<string, string>
) => ApiResponse<any>;

// Mock handlers for different endpoints
const handlers: Record<string, HandlerFunction> = {
  // Users endpoints
  'GET /api/users': (query: URLSearchParams, _params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{users: User[], nextCursor?: string}> => {
    const { items, nextCursor } = paginate(store.users, query.get('cursor') || undefined);
    return createApiResponse({ users: items, nextCursor });
  },

  'GET /api/users/:id': (_query: URLSearchParams, params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<User | null> => {
    const user = findById(store.users, params.id);
    if (!user) {
      return createApiResponse(null, false, 'User not found');
    }
    return createApiResponse(user);
  },

  'GET /api/users/me': (_query: URLSearchParams, _params: Record<string, string>, _body?: any, headers?: Record<string, string>): ApiResponse<User | null> => {
    // Check for authorization header
    const authHeader = headers?.['Authorization'] || headers?.['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createApiResponse(null, false, 'Unauthorized');
    }
    
    // In a real app, you'd verify the token. For mock, just return first user if token exists
    const token = authHeader.replace('Bearer ', '');
    if (token && token.startsWith('mock-token-')) {
      // Extract user ID from mock token format: mock-token-{userId}-{timestamp}
      const userId = token.split('-')[2];
      const user = findById(store.users, userId);
      if (user) {
        return createApiResponse(user);
      }
    }
    
    return createApiResponse(null, false, 'Invalid token');
  },

  // Channels endpoints
  'GET /api/channels': (query: URLSearchParams, _params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{channels: Channel[], nextCursor?: string}> => {
    const { items, nextCursor } = paginate(store.channels, query.get('cursor') || undefined);
    return createApiResponse({ channels: items, nextCursor });
  },

  'POST /api/channels': (_query: URLSearchParams, _params: Record<string, string>, body?: any, _headers?: Record<string, string>): ApiResponse<Channel> => {
    const newChannel: Channel = {
      id: generateId(),
      name: body?.name || '',
      description: body?.description || '',
      private: body?.private || false,
      createdAt: new Date().toISOString(),
      members: body?.members || []
    };
    
    store.channels.push(newChannel);
    return createApiResponse(newChannel);
  },

  // Messages endpoints
  'GET /api/messages': (query: URLSearchParams, _params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{messages: Message[], nextCursor?: string}> => {
    const channelId = query.get('channelId');
    const threadId = query.get('threadId');
    
    let messages = store.messages;
    
    if (channelId) {
      messages = messages.filter(msg => msg.channelId === channelId);
    }
    
    if (threadId) {
      messages = messages.filter(msg => msg.threadId === threadId);
    }
    
    // Sort by createdAt descending
    messages = messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const { items, nextCursor } = paginate(messages, query.get('cursor') || undefined);
    
    return createApiResponse({ messages: items, nextCursor });
  },

  'POST /api/messages': (_query: URLSearchParams, _params: Record<string, string>, body?: any, _headers?: Record<string, string>): ApiResponse<Message> => {
    const newMessage: Message = {
      id: generateId(),
      content: body?.content || '',
      channelId: body?.channelId || '',
      senderId: body?.senderId || body?.authorId || '',
      threadId: body?.threadId,
      attachments: body?.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: {},
      edited: false,
      deleted: false
    };
    
    store.messages.push(newMessage);
    
    // Emit real-time event via mock socket
    mockSocket.emit('message', newMessage);
    
    return createApiResponse(newMessage);
  },

  'PUT /api/messages/:id': (_query: URLSearchParams, params: Record<string, string>, body?: any, _headers?: Record<string, string>): ApiResponse<Message | null> => {
    const message = findById(store.messages, params.id);
    if (!message) {
      return createApiResponse(null, false, 'Message not found');
    }
    
    const updatedMessage: Message = {
      ...message,
      content: body?.content || message.content,
      updatedAt: new Date().toISOString(),
      edited: true
    };
    
    const index = store.messages.findIndex(msg => msg.id === params.id);
    store.messages[index] = updatedMessage;
    
    mockSocket.emit('message_updated', updatedMessage);
    
    return createApiResponse(updatedMessage);
  },

  'DELETE /api/messages/:id': (_query: URLSearchParams, params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{success: boolean}> => {
    const index = store.messages.findIndex(msg => msg.id === params.id);
    if (index === -1) {
      return createApiResponse({success: false}, false, 'Message not found');
    }
    
    store.messages.splice(index, 1);
    mockSocket.emit('message_deleted', { id: params.id });
    
    return createApiResponse({ success: true });
  },

  // Files endpoints
  'GET /api/files': (query: URLSearchParams, _params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{files: FileMeta[], nextCursor?: string}> => {
    const { items, nextCursor } = paginate(store.files, query.get('cursor') || undefined);
    return createApiResponse({ files: items, nextCursor });
  },

  'POST /api/files': (_query: URLSearchParams, _params: Record<string, string>, body?: any, _headers?: Record<string, string>): ApiResponse<FileMeta> => {
    const newFile: FileMeta = {
      id: generateId(),
      name: body?.name || '',
      size: body?.size || 0,
      type: body?.type || '',
      mimeType: body?.mimeType || body?.type || '',
      url: body?.url || `https://mock-cdn.example.com/files/${generateId()}`,
      uploadedBy: body?.uploadedBy || '',
      uploadedAt: new Date().toISOString(),
      channelId: body?.channelId
    };
    
    store.files.push(newFile);
    
    return createApiResponse(newFile);
  },

  // Presence endpoints
  'GET /api/presence': (query: URLSearchParams, _params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{presence: MockPresenceState[]}> => {
    const channelId = query.get('channelId');
    let presence = store.presence;
    
    if (channelId) {
      presence = presence.filter(p => p.channelId === channelId);
    }
    
    return createApiResponse({ presence });
  },

  'POST /api/presence': (_query: URLSearchParams, _params: Record<string, string>, body?: any, _headers?: Record<string, string>): ApiResponse<MockPresenceState> => {
    const existingIndex = store.presence.findIndex(p => 
      p.userId === body.userId && p.channelId === body.channelId
    );
    
    const presenceData: MockPresenceState = {
      userId: body?.userId || '',
      channelId: body?.channelId || '',
      online: body?.online !== false, // Default to true
      status: body?.status || 'available',
      lastSeen: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      store.presence[existingIndex] = presenceData;
    } else {
      store.presence.push(presenceData);
    }
    
    mockSocket.emit('presence_updated', presenceData);
    
    return createApiResponse(presenceData);
  },

  // Reactions endpoints
  'GET /api/reactions': (query: URLSearchParams, _params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{reactions: MockReaction[]}> => {
    const messageId = query.get('messageId');
    let reactions = store.reactions;
    
    if (messageId) {
      reactions = reactions.filter(r => r.messageId === messageId);
    }
    
    return createApiResponse({ reactions });
  },

  'POST /api/reactions': (_query: URLSearchParams, _params: Record<string, string>, body?: any, _headers?: Record<string, string>): ApiResponse<MockReaction> => {
    const newReaction: MockReaction = {
      id: generateId(),
      messageId: body?.messageId || '',
      userId: body?.userId || '',
      emoji: body?.emoji || '',
      createdAt: new Date().toISOString()
    };
    
    store.reactions.push(newReaction);
    mockSocket.emit('reaction_added', newReaction);
    
    return createApiResponse(newReaction);
  },

  'DELETE /api/reactions/:id': (_query: URLSearchParams, params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{success: boolean}> => {
    const index = store.reactions.findIndex(r => r.id === params.id);
    if (index === -1) {
      return createApiResponse({success: false}, false, 'Reaction not found');
    }
    
    const reaction = store.reactions[index];
    store.reactions.splice(index, 1);
    mockSocket.emit('reaction_removed', { id: params.id, messageId: reaction.messageId });
    
    return createApiResponse({ success: true });
  },

  // Threads endpoints
  'GET /api/threads': (query: URLSearchParams, _params: Record<string, string>, _body?: any, _headers?: Record<string, string>): ApiResponse<{threads: MockThread[], nextCursor?: string}> => {
    const channelId = query.get('channelId');
    let threads = store.threads;
    
    if (channelId) {
      threads = threads.filter(t => t.channelId === channelId);
    }
    
    const { items, nextCursor } = paginate(threads, query.get('cursor') || undefined);
    
    return createApiResponse({ threads: items, nextCursor });
  },

  'POST /api/threads': (_query: URLSearchParams, _params: Record<string, string>, body?: any, _headers?: Record<string, string>): ApiResponse<MockThread> => {
    const newThread: MockThread = {
      id: generateId(),
      channelId: body?.channelId || '',
      parentMessageId: body?.parentMessageId || '',
      messageIds: [],
      title: body?.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0
    };
    
    store.threads.push(newThread);
    
    return createApiResponse(newThread);
  }
};

// Parse route parameters from path
const parseParams = (template: string, actualPath: string): Record<string, string> => {
  const templateParts = template.split('/');
  const actualParts = actualPath.split('/');
  const params: Record<string, string> = {};
  
  templateParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = actualParts[index];
    }
  });
  
  return params;
};

// Find matching handler for request
const findHandler = (method: string, path: string): { handler: Function; params: Record<string, string> } | null => {
  const key = `${method} ${path}`;
  
  // Direct match
  if (handlers[key as keyof typeof handlers]) {
    return { handler: handlers[key as keyof typeof handlers], params: {} };
  }
  
  // Check for exact path matches first (like /api/users/me)
  for (const pattern in handlers) {
    const [patternMethod, patternPath] = pattern.split(' ');
    if (patternMethod === method && patternPath === path) {
      return { handler: handlers[pattern as keyof typeof handlers], params: {} };
    }
  }
  
  // Pattern match
  for (const pattern in handlers) {
    if (pattern.includes(':')) {
      const [patternMethod, patternPath] = pattern.split(' ');
      if (patternMethod === method) {
        const templateParts = patternPath.split('/');
        const actualParts = path.split('/');
        
        if (templateParts.length === actualParts.length) {
          let matches = true;
          for (let i = 0; i < templateParts.length; i++) {
            if (!templateParts[i].startsWith(':') && templateParts[i] !== actualParts[i]) {
              matches = false;
              break;
            }
          }
          
          if (matches) {
            const params = parseParams(patternPath, path);
            return { handler: handlers[pattern as keyof typeof handlers], params };
          }
        }
      }
    }
  }
  
  return null;
};

// Main request handler
const handleRequest = (
  url: string, 
  method: string = 'GET', 
  body?: any, 
  headers?: Record<string, string>
): ApiResponse<any> => {
  try {
    const urlObj = new URL(url, 'http://localhost');
    const path = urlObj.pathname;
    const query = urlObj.searchParams;
    
    const match = findHandler(method.toUpperCase(), path);
    
    if (!match) {
      return createApiResponse(null, false, `Handler not found for ${method} ${path}`);
    }
    
    return match.handler(query, match.params, body, headers);
  } catch (error) {
    return createApiResponse(null, false, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Reset store to initial state
const resetStore = (): void => {
  const fresh = getMockData();
  store = {
    users: [...fresh.users],
    channels: [...fresh.channels],
    messages: [...fresh.messages],
    files: [...fresh.files],
    presence: [...fresh.presence],
    reactions: [...fresh.reactions],
    threads: [...fresh.threads]
  };
};

// Setup function for initializing mocks
export const setupMocks = () => {
  const disabledHandler = () => ({ data: null, success: false, error: { message: 'Mocks disabled', code: 'MOCKS_DISABLED' } });
  
  if (!devConfig.enable_mock_data) {
    return {
      handle: disabledHandler,
      handleRequest: disabledHandler,
      start: () => {},
      stop: () => {},
      resetStore
    };
  }
  
  // Initialize mock socket
  mockSocket.connect();
  
  return {
    handle: handleRequest,
    start: () => {
      console.log('[MockServer] Mock server started');
    },
    stop: () => {
      mockSocket.disconnect();
      console.log('[MockServer] Mock server stopped');
    },
    resetStore
  };
};

export const mockServer = setupMocks();

// Export the main handler for use by apiClient
export { handleRequest };

// Export store access for testing/debugging (commented out to avoid unused warning)
// export const getMockStore = () => ({ ...store });
