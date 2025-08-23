import type { User } from '../types';
import { AuthRole } from '../types';

interface MockUser {
  email: string;
  password: string;
  role: AuthRole;
  name: string;
}

// Mock users for development - in a real app this would come from configuration
const MOCK_USERS: MockUser[] = [
  {
    email: 'user@nothing.com',
    password: 'nothing123',
    role: AuthRole.USER,
    name: 'Nothing User'
  },
  {
    email: 'admin@nothing.com',
    password: 'admin123',
    role: AuthRole.ADMIN,
    name: 'Nothing Admin'
  },
  {
    email: 'demo@nothing.com',
    password: 'demo',
    role: AuthRole.USER,
    name: 'Demo User'
  }
];

export interface MockAuthResult {
  user: User;
  token: string;
}

export const useMockAuth = () => {
  const login = async (email: string, password: string): Promise<MockAuthResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS.find(
      user => user.email === email && user.password === password
    );

    if (!mockUser) {
      throw new Error('Invalid credentials');
    }

    const user: User = {
      id: `mock-${mockUser.email}`,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.email}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const token = btoa(`${mockUser.email}:${Date.now()}`);

    return { user, token };
  };

  const verify = async (token: string): Promise<User | null> => {
    try {
      const decoded = atob(token);
      const [email] = decoded.split(':');
      
      const mockUser = MOCK_USERS.find(user => user.email === email);
      
      if (!mockUser) {
        return null;
      }

      return {
        id: `mock-${mockUser.email}`,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.email}`,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
    } catch {
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    // Simulate logout delay
    await new Promise(resolve => setTimeout(resolve, 200));
    // In a real app, this would clear tokens/session
  };

  return {
    login,
    verify,
    logout
  };
};

export default useMockAuth;
