import { apiClient } from '../utils/apiClient';

interface NewsletterResponse {
  success: boolean;
  message?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const subscribe = async (email: string): Promise<boolean> => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  try {
    const response = await apiClient.post<NewsletterResponse>('/api/newsletter/nothing', {
      email: email.trim().toLowerCase()
    });

    return response.success;
  } catch (error) {
    console.error('Newsletter subscription failed:', error);
    return false;
  }
};

export default {
  subscribe
};
