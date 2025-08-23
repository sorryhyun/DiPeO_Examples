import { apiClient } from '../apiClient';
import { devConfig } from '../../config/devConfig';
import type { User } from '../../types';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string;
  status?: string;
}

/**
 * Sign in user with email and password
 */
export const signIn = async (credentials: SignInCredentials): Promise<SignInResponse> => {
  if (devConfig.useMockData) {
    // Mock authentication for development
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        status: 'online',
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        status: 'away',
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000).toISOString()
      }
    ];

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user || credentials.password !== 'password') {
      throw new Error('Invalid credentials');
    }

    return {
      token: `mock-token-${user.id}-${Date.now()}`,
      user
    };
  }

  const response = await apiClient.post<SignInResponse>('/api/users/auth', credentials);
  return response.data;
};

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/api/users/${userId}`);
  return response.data;
};

/**
 * List all users
 */
export const listUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/api/users');
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, data: UpdateProfileData): Promise<User> => {
  const response = await apiClient.put<User>(`/api/users/${userId}`, data);
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/users/me');
  return response.data;
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<void> => {
  await apiClient.post('/api/users/signout');
};
