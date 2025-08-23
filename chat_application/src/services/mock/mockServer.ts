import { ApiResponse } from '../../types';
import { mockData, getMockData } from './mockData';
import { mockSocket } from './mockSocket';
import { generateId } from '../../utils/generateId';
import { devConfig } from '../../config/devConfig';

// In-memory store for mock data
let store = {
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

// Helper function to parse query parameters
const parseQuery = (url: string): URLSearchParams => {
  const urlObj = new URL(url, 'http://localhost');
  return urlObj.searchParams;
};

// Helper function to paginate results
const paginate = <T>(items: T[], cursor?: string, limit: number = 50): { items: T[]; nextCursor?: string } => {
  const startIndex = cursor ? parseInt(cursor, 10) : 0;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const nextCursor = endIndex < items.length ? endIndex.toString() : undefined;
  
  return { items: paginatedItems, nextCursor };
};

// Mock handlers for different endpoints
const handlers = {
  // Users endpoints
  'GET /api/users': (query: URLSearchParams): ApiResponse<any> => {
    const { items, nextCursor } = paginate(store.users, query.get('cursor') || undefined);
    return {
      data: { users: items, nextCursor },
      success: true,
      error: null
    };
  },

  'GET /api/users/:id': (query: URLSearchParams, params: Record<string, string>): ApiResponse<any> => {
    const user = findById(store.users, params.id);
    if (!user) {
      return {
        data: null,
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' }
      };
    }
    return {
      data: user,
      success: true,
      error: null
    };
  },

  // Channels endpoints
  'GET /api/channels': (query: URLSearchParams): ApiResponse<any> => {
    const { items, nextCursor } = paginate(store.channels, query.get('cursor') || undefined);
    return {
      data: { channels: items, nextCursor },
      success: true,
      error: null
    };
  },

  'POST /api/channels': (query: URLSearchParams, params: Record<string, string>, body: any): ApiResponse<any> => {
    const newChannel = {
      id: generateId(),
      name: body.name,
      description: body.description || '',
      isPrivate: body.isPrivate || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberIds: body.memberIds || []
    };
    
    store.channels.push(newChannel);
    return {
      data: newChannel,
      success: true,
      error: null
    };
  },

  // Messages endpoints
  'GET /api/messages': (query: URLSearchParams): ApiResponse<any> => {
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
    
    return {
      data: { messages: items, nextCursor },
      success: true,
      error: null
    };
  },

  'POST /api/messages': (query: URLSearchParams, params: Record<string, string>, body: any): ApiResponse<any> => {
    const newMessage = {
      id: generateId(),
      content: body.content,
      channelId: body.channelId,
      authorId: body.authorId,
      threadId: body.threadId || null,
      attachments: body.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editedAt: null,
      reactions: []
    };
    
    store.messages.push(newMessage);
    
    // Emit real-time event via mock socket
    mockSocket.emit('message', newMessage);
    
    return {
      data: newMessage,
      success: true,
      error: null
    };
  },

  'PUT /api/messages/:id': (query: URLSearchParams, params: Record<string, string>, body: any): ApiResponse<any> => {
    const message = findById(store.messages, params.id);
    if (!message) {
      return {
        data: null,
        success: false,
        error: { message: 'Message not found', code: 'MESSAGE_NOT_FOUND' }
      };
    }
    
    const updatedMessage = {
      ...message,
      content: body.content || message.content,
      updatedAt: new Date().toISOString(),
      editedAt: new Date().toISOString()
    };
    
    const index = store.messages.findIndex(msg => msg.id === params.id);
    store.messages[index] = updatedMessage;
    
    mockSocket.emit('message_updated', updatedMessage);
    
    return {
      data: updatedMessage,
      success: true,
      error: null
    };
  },

  'DELETE /api/messages/:id': (query: URLSearchParams, params: Record<string, string>): ApiResponse<any> => {
    const index = store.messages.findIndex(msg => msg.id === params.id);
    if (index === -1) {
      return {
        data: null,
        success: false,
        error: { message: 'Message not found', code: 'MESSAGE_NOT_FOUND' }
      };
    }
    
    store.messages.splice(index, 1);
    mockSocket.emit('message_deleted', { id: params.id });
    
    return {
      data: { success: true },
      success: true,
      error: null
    };
  },

  // Files endpoints
  'GET /api/files': (query: URLSearchParams): ApiResponse<any> => {
    const { items, nextCursor } = paginate(store.files, query.get('cursor') || undefined);
    return {
      data: { files: items, nextCursor },
      success: true,
      error: null
    };
  },

  'POST /api/files': (query: URLSearchParams, params: Record<string, string>, body: any): ApiResponse<any> => {
    const newFile = {
      id: generateId(),
      name: body.name,
      size: body.size,
      type: body.type,
      url: body.url || `https://mock-cdn.example.com/files/${generateId()}`,
      uploadedBy: body.uploadedBy,
      createdAt: new Date().toISOString()
    };
    
    store.files.push(newFile);
    
    return {
      data: newFile,
      success: true,
      error: null
    };
  },

  // Presence endpoints
  'GET /api/presence': (query: URLSearchParams): ApiResponse<any> => {
    const channelId = query.get('channelId');
    let presence = store.presence;
    
    if (channelId) {
      presence = presence.filter(p => p.channelId === channelId);
    }
    
    return {
      data: { presence },
      success: true,
      error: null
    };
  },

  'POST /api/presence': (query: URLSearchParams, params: Record<string, string>, body: any): ApiResponse<any> => {
    const existingIndex = store.presence.findIndex(p => 
      p.userId === body.userId && p.channelId === body.channelId
    );
    
    const presenceData = {
      userId: body.userId,
      channelId: body.channelId,
      status: body.status || 'online',
      lastSeen: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      store.presence[existingIndex] = presenceData;
    } else {
      store.presence.push(presenceData);
    }
    
    mockSocket.emit('presence_updated', presenceData);
    
    return {
      data: presenceData,
      success: true,
      error: null
    };
  },

  // Reactions endpoints
  'GET /api/reactions': (query: URLSearchParams): ApiResponse<any> => {
    const messageId = query.get('messageId');
    let reactions = store.reactions;
    
    if (messageId) {
      reactions = reactions.filter(r => r.messageId === messageId);
    }
    
    return {
      data: { reactions },
      success: true,
      error: null
    };
  },

  'POST /api/reactions': (query: URLSearchParams, params: Record<string, string>, body: any): ApiResponse<any> => {
    const newReaction = {
      id: generateId(),
      messageId: body.messageId,
      userId: body.userId,
      emoji: body.emoji,
      createdAt: new Date().toISOString()
    };
    
    store.reactions.push(newReaction);
    mockSocket.emit('reaction_added', newReaction);
    
    return {
      data: newReaction,
      success: true,
      error: null
    };
  },

  'DELETE /api/reactions/:id': (query: URLSearchParams, params: Record<string, string>): ApiResponse<any> => {
    const index = store.reactions.findIndex(r => r.id === params.id);
    if (index === -1) {
      return {
        data: null,
        success: false,
        error: { message: 'Reaction not found', code: 'REACTION_NOT_FOUND' }
      };
    }
    
    const reaction = store.reactions[index];
    store.reactions.splice(index, 1);
    mockSocket.emit('reaction_removed', { id: params.id, messageId: reaction.messageId });
    
    return {
      data: { success: true },
      success: true,
      error: null
    };
  },

  // Threads endpoints
  'GET /api/threads': (query: URLSearchParams): ApiResponse<any> => {
    const channelId = query.get('channelId');
    let threads = store.threads;
    
    if (channelId) {
      threads = threads.filter(t => t.channelId === channelId);
    }
    
    const { items, nextCursor } = paginate(threads, query.get('cursor') || undefined);
    
    return {
      data: { threads: items, nextCursor },
      success: true,
      error: null
    };
  },

  'POST /api/threads': (query: URLSearchParams, params: Record<string, string>, body: any): ApiResponse<any> => {
    const newThread = {
      id: generateId(),
      channelId: body.channelId,
      parentMessageId: body.parentMessageId,
      title: body.title || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0
    };
    
    store.threads.push(newThread);
    
    return {
      data: newThread,
      success: true,
      error: null
    };
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
      return {
        data: null,
        success: false,
        error: { message: `Handler not found for ${method} ${path}`, code: 'HANDLER_NOT_FOUND' }
      };
    }
    
    return match.handler(query, match.params, body, headers);
  } catch (error) {
    return {
      data: null,
      success: false,
      error: { 
        message: error instanceof Error ? error.message : 'Unknown error', 
        code: 'INTERNAL_ERROR' 
      }
    };
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

// Export store access for testing/debugging
export const getMockStore = () => ({ ...store });
