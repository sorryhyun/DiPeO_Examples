import { 
  User, 
  Message, 
  Channel, 
  ChannelType,
  Thread, 
  Reaction, 
  FileMeta, 
  PresenceStatus,
  MessageType,
  ApiResult,
  ApiError,
  AuthToken,
  MessageCreateDTO,
  ChannelCreateDTO,
  UserProfileUpdateDTO
} from '@/core/contracts';
import { appConfig, shouldUseMockData, isDevelopment } from '@/app/config';
import { mockDatabase } from '@/mock/mockData';

// Mock authentication tokens
const activeTokens = new Map<string, { userId: string; expiresAt: string }>();

// Utility to create API responses
function createApiResponse<T>(data: T, status = 200): Response {
  const result: ApiResult<T> = { ok: true, data };
  return new Response(JSON.stringify(result), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function createApiError(code: string, message: string, status = 400): Response {
  const error: ApiError = { code, message };
  const result: ApiResult<never> = { ok: false, error };
  return new Response(JSON.stringify(result), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Authentication helpers
function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function validateToken(token: string): User | null {
  const tokenData = activeTokens.get(token);
  if (!tokenData || new Date() > new Date(tokenData.expiresAt)) {
    activeTokens.delete(token);
    return null;
  }
  return mockDatabase.users.findById(tokenData.userId);
}

function generateToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

// Request handlers
const handlers = {
  // Authentication
  '/api/auth/login': async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
    }

    try {
      const { email, password } = await request.json();
      
      if (!email || !password) {
        return createApiError('VALIDATION_ERROR', 'Email and password are required');
      }

      const user = mockDatabase.users.findByEmail(email);
      
      // Check if user exists and validate password (in real app, hash comparison)
      const validCredentials = appConfig.developmentMode.mockAuthUsers.find(
        u => u.email === email && u.password === password
      );

      if (!user || !validCredentials) {
        return createApiError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
      }

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      activeTokens.set(token, { userId: user.id, expiresAt });

      const authToken: AuthToken = { token, expiresAt };

      return createApiResponse({ user, token: authToken });
    } catch (error) {
      return createApiError('BAD_REQUEST', 'Invalid request body');
    }
  },

  '/api/auth/logout': async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
    }
    
    const token = extractToken(request);
    if (token) {
      activeTokens.delete(token);
    }
    
    return createApiResponse({ success: true });
  },

  '/api/auth/me': async (request: Request): Promise<Response> => {
    if (request.method !== 'GET') {
      return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
    }

    const token = extractToken(request);
    if (!token) {
      return createApiError('UNAUTHORIZED', 'No token provided', 401);
    }

    const user = validateToken(token);
    if (!user) {
      return createApiError('UNAUTHORIZED', 'Invalid or expired token', 401);
    }

    return createApiResponse(user);
  },

  // Users
  '/api/users': async (request: Request): Promise<Response> => {
    const token = extractToken(request);
    const currentUser = token ? validateToken(token) : null;
    
    if (!currentUser) {
      return createApiError('UNAUTHORIZED', 'Invalid or missing token', 401);
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const search = url.searchParams.get('search');
      
      let users = mockDatabase.users.findAll();
      
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(user => 
          user.displayName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      return createApiResponse(users);
    }

    if (request.method === 'PUT') {
      try {
        const updates: UserProfileUpdateDTO = await request.json();
        const updatedUser = mockDatabase.users.update(currentUser.id, updates);
        
        if (!updatedUser) {
          return createApiError('NOT_FOUND', 'User not found', 404);
        }

        return createApiResponse(updatedUser);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid request body');
      }
    }

    return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  },

  // Channels
  '/api/channels': async (request: Request): Promise<Response> => {
    const token = extractToken(request);
    const currentUser = token ? validateToken(token) : null;
    
    if (!currentUser) {
      return createApiError('UNAUTHORIZED', 'Invalid or missing token', 401);
    }

    if (request.method === 'GET') {
      const channels = mockDatabase.channels.findByUserId(currentUser.id);
      return createApiResponse(channels);
    }

    if (request.method === 'POST') {
      try {
        const dto: ChannelCreateDTO = await request.json();
        
        if (!dto.name) {
          return createApiError('VALIDATION_ERROR', 'Channel name is required');
        }

        const newChannel = mockDatabase.channels.create({
          name: dto.name,
          type: dto.type || ChannelType.PUBLIC,
          description: dto.metadata?.description || null,
          memberIds: [...(dto.memberIds || []), currentUser.id],
          createdBy: currentUser.id,
          metadata: dto.metadata || {}
        });

        return createApiResponse(newChannel, 201);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid request body');
      }
    }

    return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  },

  // Messages
  '/api/messages': async (request: Request): Promise<Response> => {
    const token = extractToken(request);
    const currentUser = token ? validateToken(token) : null;
    
    if (!currentUser) {
      return createApiError('UNAUTHORIZED', 'Invalid or missing token', 401);
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const channelId = url.searchParams.get('channelId');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const cursor = url.searchParams.get('cursor') || undefined;
      
      if (!channelId) {
        return createApiError('VALIDATION_ERROR', 'channelId is required');
      }

      // Check if user has access to channel
      const channel = mockDatabase.channels.findById(channelId);
      if (!channel || !channel.memberIds.includes(currentUser.id)) {
        return createApiError('FORBIDDEN', 'Access denied to channel', 403);
      }

      const messages = mockDatabase.messages.findByChannelId(channelId, limit, cursor);
      const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

      return createApiResponse({
        items: messages,
        nextCursor,
        total: mockDatabase.messages.findByChannelId(channelId, 1000).length
      });
    }

    if (request.method === 'POST') {
      try {
        const dto: MessageCreateDTO = await request.json();
        
        if (!dto.channelId) {
          return createApiError('VALIDATION_ERROR', 'channelId is required');
        }

        if (!dto.text && (!dto.files || dto.files.length === 0)) {
          return createApiError('VALIDATION_ERROR', 'Message must have text or files');
        }

        // Check if user has access to channel
        const channel = mockDatabase.channels.findById(dto.channelId);
        if (!channel || !channel.memberIds.includes(currentUser.id)) {
          return createApiError('FORBIDDEN', 'Access denied to channel', 403);
        }

        // Process file uploads if any
        const fileIds: string[] = [];
        if (dto.files) {
          for (const file of dto.files) {
            if (file.fileName && file.mimeType && file.size) {
              const uploadedFile = mockDatabase.files.create({
                fileName: file.fileName,
                originalName: file.fileName,
                mimeType: file.mimeType,
                size: file.size,
                url: file.url || `/mock-files/${file.fileName}`,
                thumbnailUrl: file.thumbnailUrl,
                uploadedBy: currentUser.id,
                channelId: dto.channelId,
                messageId: null, // Will be set after message creation
                metadata: {}
              });
              fileIds.push(uploadedFile.id);
            }
          }
        }

        const newMessage = mockDatabase.messages.create({
          channelId: dto.channelId,
          threadId: dto.replyToId ? undefined : null,
          userId: currentUser.id,
          type: MessageType.TEXT,
          text: dto.text || '',
          fileIds,
          reactions: [],
          replyToId: dto.replyToId || null,
          editedAt: null,
          metadata: dto.metadata || {}
        });

        // Update file records with message ID
        fileIds.forEach(fileId => {
          const file = mockDatabase.files.findById(fileId);
          if (file) {
            mockDatabase.files.create({
              ...file,
              messageId: newMessage.id
            });
          }
        });

        return createApiResponse(newMessage, 201);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid request body');
      }
    }

    return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  },

  // Files
  '/api/files': async (request: Request): Promise<Response> => {
    const token = extractToken(request);
    const currentUser = token ? validateToken(token) : null;
    
    if (!currentUser) {
      return createApiError('UNAUTHORIZED', 'Invalid or missing token', 401);
    }

    if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const channelId = formData.get('channelId') as string;
        
        if (!file) {
          return createApiError('VALIDATION_ERROR', 'No file provided');
        }

        if (!channelId) {
          return createApiError('VALIDATION_ERROR', 'channelId is required');
        }

        // Check channel access
        const channel = mockDatabase.channels.findById(channelId);
        if (!channel || !channel.memberIds.includes(currentUser.id)) {
          return createApiError('FORBIDDEN', 'Access denied to channel', 403);
        }

        const uploadedFile = mockDatabase.files.create({
          fileName: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: `/mock-uploads/${Date.now()}-${file.name}`,
          thumbnailUrl: file.type.startsWith('image/') ? `/mock-thumbs/${Date.now()}-${file.name}` : undefined,
          uploadedBy: currentUser.id,
          channelId,
          messageId: null,
          metadata: {
            originalSize: file.size,
            uploadedAt: new Date().toISOString()
          }
        });

        return createApiResponse(uploadedFile, 201);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid file upload');
      }
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const channelId = url.searchParams.get('channelId');
      
      if (channelId) {
        // Check channel access
        const channel = mockDatabase.channels.findById(channelId);
        if (!channel || !channel.memberIds.includes(currentUser.id)) {
          return createApiError('FORBIDDEN', 'Access denied to channel', 403);
        }
        
        const files = mockDatabase.files.findByChannelId(channelId);
        return createApiResponse(files);
      }

      const files = mockDatabase.files.findAll();
      return createApiResponse(files);
    }

    return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  },

  // Presence
  '/api/presence': async (request: Request): Promise<Response> => {
    const token = extractToken(request);
    const currentUser = token ? validateToken(token) : null;
    
    if (!currentUser) {
      return createApiError('UNAUTHORIZED', 'Invalid or missing token', 401);
    }

    if (request.method === 'GET') {
      const presence = mockDatabase.presence.findAll();
      return createApiResponse(presence);
    }

    if (request.method === 'PUT') {
      try {
        const { status, customStatus } = await request.json();
        
        if (!Object.values(PresenceStatus).includes(status)) {
          return createApiError('VALIDATION_ERROR', 'Invalid presence status');
        }

        const updatedPresence = mockDatabase.presence.update(currentUser.id, {
          status,
          customStatus: customStatus || null,
          lastSeen: new Date().toISOString()
        });

        return createApiResponse(updatedPresence);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid request body');
      }
    }

    return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  },

  // Reactions
  '/api/reactions': async (request: Request): Promise<Response> => {
    const token = extractToken(request);
    const currentUser = token ? validateToken(token) : null;
    
    if (!currentUser) {
      return createApiError('UNAUTHORIZED', 'Invalid or missing token', 401);
    }

    if (request.method === 'POST') {
      try {
        const { messageId, emoji } = await request.json();
        
        if (!messageId || !emoji) {
          return createApiError('VALIDATION_ERROR', 'messageId and emoji are required');
        }

        // Check if message exists and user has access
        const message = mockDatabase.messages.findById(messageId);
        if (!message) {
          return createApiError('NOT_FOUND', 'Message not found', 404);
        }

        const channel = mockDatabase.channels.findById(message.channelId);
        if (!channel || !channel.memberIds.includes(currentUser.id)) {
          return createApiError('FORBIDDEN', 'Access denied', 403);
        }

        // Check if reaction already exists
        const existingReactions = message.reactions.find(r => r.emoji === emoji);
        if (existingReactions && existingReactions.userIds.includes(currentUser.id)) {
          return createApiError('CONFLICT', 'Reaction already exists', 409);
        }

        // Update message reactions
        const updatedReactions = [...message.reactions];
        const reactionIndex = updatedReactions.findIndex(r => r.emoji === emoji);
        
        if (reactionIndex >= 0) {
          // Add user to existing reaction
          updatedReactions[reactionIndex] = {
            ...updatedReactions[reactionIndex],
            userIds: [...updatedReactions[reactionIndex].userIds, currentUser.id],
            count: updatedReactions[reactionIndex].count + 1
          };
        } else {
          // Create new reaction
          updatedReactions.push({
            emoji,
            userIds: [currentUser.id],
            count: 1
          });
        }

        const updatedMessage = mockDatabase.messages.update(messageId, {
          reactions: updatedReactions
        });

        return createApiResponse(updatedMessage?.reactions, 201);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid request body');
      }
    }

    if (request.method === 'DELETE') {
      try {
        const { messageId, emoji } = await request.json();
        
        if (!messageId || !emoji) {
          return createApiError('VALIDATION_ERROR', 'messageId and emoji are required');
        }

        const message = mockDatabase.messages.findById(messageId);
        if (!message) {
          return createApiError('NOT_FOUND', 'Message not found', 404);
        }

        const updatedReactions = message.reactions
          .map(reaction => {
            if (reaction.emoji === emoji && reaction.userIds.includes(currentUser.id)) {
              const newUserIds = reaction.userIds.filter(id => id !== currentUser.id);
              return {
                ...reaction,
                userIds: newUserIds,
                count: newUserIds.length
              };
            }
            return reaction;
          })
          .filter(reaction => reaction.count > 0);

        const updatedMessage = mockDatabase.messages.update(messageId, {
          reactions: updatedReactions
        });

        return createApiResponse(updatedMessage?.reactions);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid request body');
      }
    }

    return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  },

  // Threads
  '/api/threads': async (request: Request): Promise<Response> => {
    const token = extractToken(request);
    const currentUser = token ? validateToken(token) : null;
    
    if (!currentUser) {
      return createApiError('UNAUTHORIZED', 'Invalid or missing token', 401);
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const parentMessageId = url.searchParams.get('parentMessageId');
      
      if (!parentMessageId) {
        return createApiError('VALIDATION_ERROR', 'parentMessageId is required');
      }

      // Check if parent message exists and user has access
      const parentMessage = mockDatabase.messages.findById(parentMessageId);
      if (!parentMessage) {
        return createApiError('NOT_FOUND', 'Parent message not found', 404);
      }

      const channel = mockDatabase.channels.findById(parentMessage.channelId);
      if (!channel || !channel.memberIds.includes(currentUser.id)) {
        return createApiError('FORBIDDEN', 'Access denied', 403);
      }

      const thread = mockDatabase.threads.findByParentMessageId(parentMessageId);
      const threadMessages = thread 
        ? mockDatabase.messages.findByChannelId(parentMessage.channelId)
            .filter(msg => msg.replyToId === parentMessageId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : [];

      return createApiResponse({
        thread,
        messages: threadMessages,
        parentMessage
      });
    }

    if (request.method === 'POST') {
      try {
        const { parentMessageId } = await request.json();
        
        if (!parentMessageId) {
          return createApiError('VALIDATION_ERROR', 'parentMessageId is required');
        }

        const parentMessage = mockDatabase.messages.findById(parentMessageId);
        if (!parentMessage) {
          return createApiError('NOT_FOUND', 'Parent message not found', 404);
        }

        // Check if thread already exists
        const existingThread = mockDatabase.threads.findByParentMessageId(parentMessageId);
        if (existingThread) {
          return createApiResponse(existingThread);
        }

        const newThread = mockDatabase.threads.create({
          parentMessageId,
          channelId: parentMessage.channelId,
          participants: [currentUser.id, parentMessage.userId],
          messageCount: 0,
          lastMessageAt: new Date().toISOString(),
          metadata: {}
        });

        return createApiResponse(newThread, 201);
      } catch (error) {
        return createApiError('BAD_REQUEST', 'Invalid request body');
      }
    }

    return createApiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }
};

// Global fetch interceptor
let originalFetch: typeof fetch;
let isServerRunning = false;

export function startMockServer(): void {
  if (!shouldUseMockData || isServerRunning || typeof window === 'undefined') {
    return;
  }

  originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    
    // Only intercept our API endpoints
    if (!url.pathname.startsWith('/api/')) {
      return originalFetch(input, init);
    }

    // Find matching handler
    const handler = handlers[url.pathname as keyof typeof handlers];
    
    if (!handler) {
      return createApiError('NOT_FOUND', 'Endpoint not found', 404);
    }

    try {
      // Add small delay to simulate network latency
      if (isDevelopment) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
      }
      
      return await handler(request);
    } catch (error) {
      console.error('Mock server error:', error);
      return createApiError('INTERNAL_ERROR', 'Internal server error', 500);
    }
  };

  isServerRunning = true;
  console.log('🚀 Mock API server started - intercepting /api/* requests');
}

export function stopMockServer(): void {
  if (!isServerRunning || !originalFetch || typeof window === 'undefined') {
    return;
  }

  window.fetch = originalFetch;
  isServerRunning = false;
  activeTokens.clear();
  console.log('🛑 Mock API server stopped');
}

// Auto-start server in development when mock data is enabled
if (typeof window !== 'undefined' && shouldUseMockData && isDevelopment) {
  // Use setTimeout to ensure DOM is ready
  setTimeout(startMockServer, 0);
}
