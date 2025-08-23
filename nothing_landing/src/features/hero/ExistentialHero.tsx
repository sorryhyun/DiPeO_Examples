import React from 'react';
import { useModal } from '../shared/providers/ModalProvider';
import { useParallax } from '../shared/hooks/useParallax';

export const ExistentialHero: React.FC = () => {
  const { openModal } = useModal();
  const { offsetY } = useParallax();

  const handlePrimaryClick = () => {
    openModal('newsletter');
  };

  const handleSecondaryClick = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const heroTransform = {
    transform: `translateY(${offsetY * 0.5}px)`,
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      <div 
        className="container mx-auto px-4 text-center z-10 relative"
        style={heroTransform}
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-tight">
          Absolutely{' '}
          <span className="relative inline-block group cursor-default">
            <span className="relative z-10 transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:via-pink-500 group-hover:to-red-500 group-hover:bg-clip-text">
              Nothing
            </span>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 blur-sm">
              Nothing
            </span>
          </span>
          ™
        </h1>
        
        <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Experience the profound emptiness of premium nothingness. 
          Crafted with meticulous attention to absence, delivered with unparalleled void.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={handlePrimaryClick}
            className="px-8 py-4 bg-white text-black font-semibold text-lg rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
          >
            Subscribe to Nothing
          </button>
          
          <button
            onClick={handleSecondaryClick}
            className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-lg hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 transform"
          >
            View Pricing
          </button>
        </div>
        
        <div className="mt-12 text-sm text-gray-400">
          <p>Join thousands who have discovered the art of nothing</p>
        </div>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />
    </section>
  );
};
