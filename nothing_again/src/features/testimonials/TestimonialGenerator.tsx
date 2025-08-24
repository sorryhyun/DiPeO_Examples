import React, { useState } from 'react';
import { Testimonial } from '@/types';

interface TestimonialGeneratorProps {
  className?: string;
}

export const TestimonialGenerator: React.FC<TestimonialGeneratorProps> = ({ className }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  const generateTestimonial = async () => {
    setLoading(true);
    
    // Generate a mock testimonial with proper interface compliance
    const newTestimonial: Testimonial = {
      id: `generated-${Date.now()}`,
      author: 'AI Generated User',
      name: 'AI Generated User',
      role: 'Nothing Enthusiast',
      company: 'Virtual Corp',
      content: 'This testimonial was generated to demonstrate the power of nothing.',
      quote: 'This testimonial was generated to demonstrate the power of nothing.',
      rating: 5,
      avatar: '/api/placeholder/50/50',
      createdAt: new Date().toISOString(),
      verified: false
    };

    setTimeout(() => {
      setTestimonials(prev => [newTestimonial, ...prev]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={`p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Testimonial Generator</h2>
      
      <button
        onClick={generateTestimonial}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Testimonial'}
      </button>

      <div className="mt-6 space-y-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center mb-2">
              <strong>{testimonial.author}</strong>
              <span className="ml-2 text-gray-600">- {testimonial.role}</span>
              {testimonial.verified && <span className="ml-2 text-green-600">✓ Verified</span>}
            </div>
            <p className="text-gray-700 dark:text-gray-300">{testimonial.content}</p>
            <div className="mt-2 text-sm text-gray-500">
              Rating: {testimonial.rating}/5 | Created: {new Date(testimonial.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};