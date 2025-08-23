// Core User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  avatar?: string;
}

export type Role = 'admin' | 'member' | 'guest';

// Channel types
export interface Channel {
  id: string;
  name: string;
  private: boolean;
  members: string[]; // User IDs
  createdAt: string;
  description?: string;
}

// File types
export interface FileMeta {
  id: string;
  name: string;
  size: number;
  url: string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string; // User ID
}

// Reaction types
export interface Reaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

// Thread types
export interface Thread {
  id: string;
  parentMessageId: string;
  messageIds: string[];
  createdAt: string;
}

// Message types
export interface Message {
  id: string;
  channelId: string;
  threadId?: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: FileMeta[];
  reactions?: Record<string, Reaction[]>; // emoji -> reactions
  edited?: boolean;
  deleted?: boolean;
}

// Presence types
export interface PresenceState {
  userId: string;
  online: boolean;
  lastSeen: string;
  status?: 'available' | 'away' | 'busy' | 'invisible';
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// WebSocket event types
export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: unknown;
  timestamp: string;
}

export type WebSocketEventType = 
  | 'message:new'
  | 'message:updated'
  | 'message:deleted'
  | 'reaction:added'
  | 'reaction:removed'
  | 'presence:updated'
  | 'channel:updated'
  | 'typing:start'
  | 'typing:stop';

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  avatar?: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Toast notification types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Search types
export interface SearchResult {
  type: 'message' | 'channel' | 'user';
  id: string;
  title: string;
  content?: string;
  channelId?: string;
  userId?: string;
  highlight?: string;
}

// Call types
export interface CallState {
  id: string;
  channelId: string;
  participants: string[]; // User IDs
  status: 'starting' | 'active' | 'ended';
  startedAt: string;
  endedAt?: string;
}

// Typing indicator types
export interface TypingUser {
  userId: string;
  channelId: string;
  timestamp: string;
}
