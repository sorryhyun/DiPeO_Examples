// Domain user types
export type Role = 'admin' | 'member' | 'guest' | 'patient' | 'doctor' | 'nurse';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: Role;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Patient extends User {
  role: 'patient';
  dob?: string;
  medicalRecordId?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialty?: string;
  licenseNumber?: string;
}

export interface Nurse extends User {
  role: 'nurse';
  department?: string;
}

// Messaging domain
export type MessageType = 'text' | 'system' | 'file' | 'reaction' | 'call' | 'thread';

export interface FileMeta {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url?: string;
  uploadedAt: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

export type PresenceStatus = 'online' | 'idle' | 'offline' | 'do-not-disturb';

export interface Message {
  id: string;
  channelId: string;
  threadId?: string | null;
  authorId: string;
  type: MessageType;
  text?: string;
  files?: FileMeta[];
  reactions?: Reaction[];
  createdAt: string;
  editedAt?: string | null;
  metadata?: Record<string, any>;
}

export type ChannelType = 'public' | 'private' | 'dm';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Thread {
  id: string;
  parentMessageId: string;
  channelId: string;
  participants: string[];
  createdAt: string;
}

// Healthcare domain models
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  entries: {
    id: string;
    type: 'note' | 'diagnosis' | 'observation' | 'procedure';
    text: string;
    createdBy?: string;
    createdAt: string;
  }[];
}

export interface Prescription {
  id: string;
  patientId: string;
  prescriberId: string;
  medication: string;
  dosage: string;
  instructions?: string;
  issuedAt: string;
  expiresAt?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  type: string;
  result: string;
  units?: string;
  referenceRange?: string;
  collectedAt: string;
  reportedAt: string;
}

// API DTOs and envelopes
export interface AuthToken {
  token: string;
  expiresAt?: string;
}

export interface MessageCreateDTO {
  channelId: string;
  text?: string;
  files?: Partial<FileMeta>[];
  replyToId?: string;
  metadata?: Record<string, any>;
}

export interface ChannelCreateDTO {
  name: string;
  type?: ChannelType;
  memberIds?: string[];
  metadata?: Record<string, any>;
}

export interface UserProfileUpdateDTO {
  displayName?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string | null;
  total?: number;
}

// WebSocket / real-time events
export type AppEventName =
  | 'message:created'
  | 'message:updated'
  | 'message:deleted'
  | 'presence:updated'
  | 'reaction:added'
  | 'reaction:removed'
  | 'thread:created'
  | 'channel:updated'
  | 'user:updated'
  | 'call:started'
  | 'call:ended'
  | 'health:appointment:created';

export interface AppEventMap {
  'message:created': { message: Message };
  'message:updated': { message: Message };
  'message:deleted': { messageId: string; channelId: string };
  'presence:updated': { userId: string; status: PresenceStatus };
  'reaction:added': { messageId: string; reaction: Reaction };
  'reaction:removed': { messageId: string; reaction: Reaction };
  'thread:created': { thread: Thread };
  'channel:updated': { channel: Channel };
  'user:updated': { user: User };
  'call:started': { callId: string; participants: string[] };
  'call:ended': { callId: string };
  'health:appointment:created': { appointment: Appointment };
}

export type WebSocketPayload<K extends AppEventName = AppEventName> = {
  event: K;
  data: AppEventMap[K];
  timestamp: string;
};

// UI & utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = any> {
  values: T;
  errors?: Partial<Record<keyof T, string>>;
  touched?: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
}

// Type guards & helpers
export function isApiError(obj: any): obj is ApiError {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string'
  );
}

export function isPaginated<T>(obj: any): obj is PaginatedResponse<T> {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.items) &&
    (obj.nextCursor === undefined || obj.nextCursor === null || typeof obj.nextCursor === 'string') &&
    (obj.total === undefined || typeof obj.total === 'number')
  );
}

export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.displayName === 'string' &&
    typeof obj.role === 'string' &&
    typeof obj.createdAt === 'string' &&
    (obj.avatarUrl === undefined || typeof obj.avatarUrl === 'string') &&
    (obj.metadata === undefined || (typeof obj.metadata === 'object' && obj.metadata !== null))
  );
}

export function isMessage(obj: any): obj is Message {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.channelId === 'string' &&
    typeof obj.authorId === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.createdAt === 'string' &&
    (obj.threadId === undefined || obj.threadId === null || typeof obj.threadId === 'string') &&
    (obj.text === undefined || typeof obj.text === 'string') &&
    (obj.files === undefined || Array.isArray(obj.files)) &&
    (obj.reactions === undefined || Array.isArray(obj.reactions)) &&
    (obj.editedAt === undefined || obj.editedAt === null || typeof obj.editedAt === 'string') &&
    (obj.metadata === undefined || (typeof obj.metadata === 'object' && obj.metadata !== null))
  );
}
