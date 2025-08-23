import React from 'react';
import { motion } from 'framer-motion';
import { useFetch } from '../../shared/hooks/useFetch';
import testimonialService from '../../services/testimonialService';
import { Avatar } from '../../shared/components/Avatar';
import Spinner from '../../shared/components/Spinner';
import type { Testimonial } from '../../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      x: [0, Math.sin(index) * 10, 0],
      rotate: [0, Math.sin(index) * 2, 0],
      transition: {
        duration: 4 + (index % 3),
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.5,
      }
    }
  };

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 max-w-sm"
      variants={floatVariants}
      animate="animate"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Avatar
          src={testimonial.avatar}
          alt={testimonial.name}
          size="sm"
        />
        <div>
          <h4 className="text-white font-medium text-sm">{testimonial.name}</h4>
          <p className="text-gray-300 text-xs">{testimonial.role}</p>
        </div>
      </div>
      <blockquote className="text-gray-100 text-sm leading-relaxed italic">
        "{testimonial.quote}"
      </blockquote>
      <div className="flex mt-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <svg
            key={i}
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    </motion.div>
  );
};

export const TestimonialList: React.FC = () => {
  const { data: testimonials, loading, error } = useFetch(
    testimonialService.getAll
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load testimonials</p>
        <p className="text-gray-400 text-sm">
          Even nothing sometimes fails to load properly.
        </p>
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No testimonials found</p>
        <p className="text-gray-500 text-sm mt-2">
          The void speaks for itself.
        </p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What People Say About Nothing
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover why millions choose absolutely nothing over everything else.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Floating background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-xl"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${10 + (i * 20)}%`,
              }}
              animate={{
                x: [0, 50, -30, 0],
                y: [0, -30, 20, 0],
                scale: [1, 1.1, 0.9, 1],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
