import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useThree } from '@/shared/hooks/useThree';

interface Showcase3DProps {
  className?: string;
}

export const Showcase3D: React.FC<Showcase3DProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Three.js scene setup
  const { scene, camera, cleanup } = useThree({
    canvas: canvasRef.current,
    onInit: (scene, camera, _renderer) => {
      // Create a simple geometric shape representing "nothing"
      const geometry = new (window as any).THREE.TorusKnotGeometry(1, 0.3, 100, 16);
      const material = new (window as any).THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.8,
        wireframe: false
      });
      
      const mesh = new (window as any).THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Add lighting
      const ambientLight = new (window as any).THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new (window as any).THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Position camera
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      return { mesh };
    },
    onError: () => {
      setIsWebGLSupported(false);
    }
  });

  // GSAP animation for auto-rotation
  React.useEffect(() => {
    if (!scene || !isAutoRotating || !(window as any).gsap) return;

    const mesh = scene.children.find((child: any) => child.type === 'Mesh');
    if (!mesh) return;

    const timeline = (window as any).gsap.timeline({ repeat: -1, ease: 'none' });
    timeline.to(mesh.rotation, {
      duration: 10,
      y: Math.PI * 2,
    });

    return () => {
      timeline.kill();
    };
  }, [scene, isAutoRotating]);

  // Manual rotation based on mouse drag
  const updateMeshRotation = useCallback(() => {
    if (!scene || isAutoRotating) return;

    const mesh = scene.children.find((child: any) => child.type === 'Mesh');
    if (mesh) {
      mesh.rotation.x = rotation.x;
      mesh.rotation.y = rotation.y;
    }
  }, [scene, rotation, isAutoRotating]);

  React.useEffect(() => {
    updateMeshRotation();
  }, [updateMeshRotation]);

  // Update camera zoom
  React.useEffect(() => {
    if (camera) {
      camera.position.setLength(5 / zoom);
    }
  }, [camera, zoom]);

  // Mouse/touch event handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isAutoRotating) return;
    
    setIsDragging(true);
    setLastMousePosition({
      x: e.clientX,
      y: e.clientY
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isAutoRotating]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || isAutoRotating) return;

    const deltaX = e.clientX - lastMousePosition.x;
    const deltaY = e.clientY - lastMousePosition.y;

    setRotation(prev => ({
      x: prev.x - deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));

    setLastMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  }, [isDragging, lastMousePosition, isAutoRotating]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // Control handlers
  const toggleAutoRotation = useCallback(() => {
    setIsAutoRotating(prev => !prev);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setRotation({ x: 0, y: 0 });
    setIsAutoRotating(true);
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        toggleAutoRotation();
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        resetView();
        break;
    }
  }, [toggleAutoRotation, handleZoomIn, handleZoomOut, resetView]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanup?.();
    };
  }, [cleanup]);

  const fallbackSVG = useMemo(() => (
    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
      <svg
        className="w-32 h-32 text-purple-400"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="animate-spin"
          style={{ animationDuration: '8s' }}
        />
        <circle
          cx="50"
          cy="50"
          r="25"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3,3"
          className="animate-spin"
          style={{ animationDuration: '12s', animationDirection: 'reverse' }}
        />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          className="fill-current text-xs font-mono"
        >
          Nothing
        </text>
      </svg>
    </div>
  ), []);

  if (!isWebGLSupported) {
    return (
      <div className={`w-full ${className}`} role="img" aria-label="3D Nothing Showcase - WebGL not supported">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">3D Nothing Showcase</h3>
          <p className="text-sm text-gray-400">WebGL not supported - showing fallback visualization</p>
        </div>
        {fallbackSVG}
      </div>
    );
  }

  return (
    <div 
      className={`w-full ${className}`}
      role="application"
      aria-label="3D Nothing Showcase"
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">3D Nothing Showcase</h3>
        <p className="text-sm text-gray-400">
          {isAutoRotating ? 'Auto-rotating' : 'Manual control'} • Drag to rotate • Scroll to zoom
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg overflow-hidden border border-purple-500/30"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ cursor: isDragging ? 'grabbing' : (isAutoRotating ? 'default' : 'grab') }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          aria-label="3D rotating nothing visualization"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-4 justify-center" role="toolbar" aria-label="3D showcase controls">
        <button
          onClick={toggleAutoRotation}
          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded text-sm text-purple-300 transition-colors"
          aria-label={isAutoRotating ? 'Stop auto-rotation' : 'Start auto-rotation'}
        >
          {isAutoRotating ? 'Stop Auto' : 'Auto Rotate'}
        </button>
        
        <button
          onClick={handleZoomIn}
          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded text-sm text-blue-300 transition-colors"
          aria-label="Zoom in"
        >
          Zoom In
        </button>
        
        <button
          onClick={handleZoomOut}
          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded text-sm text-blue-300 transition-colors"
          aria-label="Zoom out"
        >
          Zoom Out
        </button>
        
        <button
          onClick={resetView}
          className="px-3 py-1.5 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/50 rounded text-sm text-gray-300 transition-colors"
          aria-label="Reset view to default"
        >
          Reset
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        Controls: Space = toggle rotation, +/- = zoom, R = reset, drag = manual rotate
      </div>
    </div>
  );
};

export default Showcase3D;
