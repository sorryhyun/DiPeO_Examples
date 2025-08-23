import { useState, useEffect, useCallback } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export const useResponsive = (): ResponsiveBreakpoints => {
  const [dimensions, setDimensions] = useState<ResponsiveBreakpoints>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1200,
      };
    }

    const width = window.innerWidth;
    return {
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet,
      width,
    };
  });

  const updateDimensions = useCallback(() => {
    const width = window.innerWidth;
    const newDimensions = {
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet,
      width,
    };

    setDimensions(prevDimensions => {
      // Only update if breakpoints have actually changed to prevent unnecessary re-renders
      if (
        prevDimensions.isMobile === newDimensions.isMobile &&
        prevDimensions.isTablet === newDimensions.isTablet &&
        prevDimensions.isDesktop === newDimensions.isDesktop
      ) {
        return prevDimensions;
      }
      return newDimensions;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    
    const debouncedUpdateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 150);
    };

    window.addEventListener('resize', debouncedUpdateDimensions);
    
    // Initial call to set correct dimensions
    updateDimensions();

    return () => {
      window.removeEventListener('resize', debouncedUpdateDimensions);
      clearTimeout(timeoutId);
    };
  }, [updateDimensions]);

  return dimensions;
};
