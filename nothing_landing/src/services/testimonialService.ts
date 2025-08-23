import { apiClient } from '../utils/apiClient';
import type { Testimonial } from '../types';

const testimonialService = {
  async getAll(): Promise<Testimonial[]> {
    try {
      const response = await apiClient.get('/api/testimonials/nothing');
      return response.data.testimonials || [];
    } catch (error) {
      throw new Error(`Failed to fetch testimonials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

export default testimonialService;
