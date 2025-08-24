import { useCallback, useRef, useEffect } from 'react';

interface ThreeSetupCallback {
  (scene: any, camera: any, renderer: any): void;
}

interface UseThreeReturn {
  canvasRef: (element: HTMLCanvasElement | null) => void;
  dispose: () => void;
}

export const useThree = (setup?: ThreeSetupCallback): UseThreeReturn => {
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const dispose = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    if (sceneRef.current) {
      // Clean up scene objects
      sceneRef.current.traverse((object: any) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material: any) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      sceneRef.current = null;
    }

    cameraRef.current = null;
    containerRef.current = null;
  }, []);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);
  }, []);

  const canvasRef = useCallback(async (element: HTMLCanvasElement | null) => {
    if (!element) {
      dispose();
      return;
    }

    try {
      // Dynamically import three to avoid SSR issues
      const THREE = await import('three');
      
      containerRef.current = element.parentElement;
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        canvas: element, 
        antialias: true, 
        alpha: true 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rendererRef.current = renderer;

      // Call setup callback if provided
      if (setup) {
        setup(scene, camera, renderer);
      }

      // Add resize listener
      window.addEventListener('resize', handleResize);

      // Start render loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

    } catch (error) {
      console.warn('Three.js failed to initialize:', error);
      // Graceful fallback - element remains but without 3D content
    }
  }, [setup, handleResize, dispose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('resize', handleResize);
      dispose();
    };
  }, [handleResize, dispose]);

  return {
    canvasRef,
    dispose
  };
};
```

/*
## SELF-CHECK
- [x] Uses `@/` imports only - N/A for this hook (only React imports needed)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Only manages canvas/WebGL context
- [x] Reads config from `@/app/config` - N/A for this utility hook
- [x] Exports default named component - Exports named hook `useThree`
- [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for Three.js hook
*/