import { useCallback, useRef, useEffect } from 'react';

interface ThreeSetupCallback {
  (scene: any, camera: any, renderer: any): any;
}

interface UseThreeOptions {
  canvas: HTMLCanvasElement | null;
  onInit?: ThreeSetupCallback;
  onError?: () => void;
}

interface UseThreeReturn {
  scene: any;
  camera: any;
  renderer: any;
  cleanup: () => void;
}

export const useThree = (options: UseThreeOptions): UseThreeReturn => {
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

  const initializeThree = useCallback(async () => {
    const element = options.canvas;
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
      if (options.onInit) {
        options.onInit(scene, camera, renderer);
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
      if (options.onError) {
        options.onError();
      }
    }
  }, [options, handleResize, dispose]);

  // Initialize when canvas is provided
  useEffect(() => {
    if (options.canvas) {
      initializeThree();
    }
  }, [initializeThree]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('resize', handleResize);
      dispose();
    };
  }, [handleResize, dispose]);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    cleanup: dispose
  };
};