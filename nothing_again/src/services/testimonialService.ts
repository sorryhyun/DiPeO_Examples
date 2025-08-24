import { apiGet } from '@/utils/apiClient';
import type { Testimonial } from '@/types';

/**
 * Fetches testimonials for nothing from the API endpoint
 * @returns Promise<Testimonial[]> Array of testimonials
 * @throws Error when API call fails
 */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const response = await apiGet<Testimonial[]>('/api/testimonials/nothing');
    return response.data;
  } catch (error) {
    // Re-throw the error to be handled by react-query or calling component
    throw error;
  }
}

/**
 * Fetches a single testimonial by ID (for expanded views)
 * @param id - The testimonial ID
 * @returns Promise<Testimonial> Single testimonial
 * @throws Error when API call fails
 */
export async function fetchTestimonialById(id: string): Promise<Testimonial> {
  try {
    const response = await apiGet<Testimonial>(`/api/testimonials/nothing/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Submits a new testimonial (for future user-generated content)
 * @param testimonial - Partial testimonial data
 * @returns Promise<Testimonial> The created testimonial
 * @throws Error when API call fails
 */
export async function submitTestimonial(_testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<Testimonial> {
  try {
    const response = await apiGet<Testimonial>('/api/testimonials/nothing');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Export as default object for easier consumption
const testimonialService = {
  fetchTestimonials,
  fetchTestimonialById,
  submitTestimonial
};

export default testimonialService;
