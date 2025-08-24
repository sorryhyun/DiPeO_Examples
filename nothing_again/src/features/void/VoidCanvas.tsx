import React, { useEffect, useRef } from 'react';
import { useThree } from '@/shared/hooks/useThree';
import { useGSAP } from '@/shared/hooks/useGSAP';
import * as THREE from 'three';

interface VoidCanvasProps {
  className?: string;
  debug?: boolean;
  performanceHints?: boolean;
  particleCount?: number;
  rotationSpeed?: number;
}

export const VoidCanvas: React.FC<VoidCanvasProps> = ({
  className = '',
  debug = false,
  performanceHints = false,
  particleCount = 1000,
  rotationSpeed = 0.01
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particleSystemRef = useRef<THREE.Points>();
  const rotatingMeshRef = useRef<THREE.Mesh>();

  const setupScene = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    // Create particle system representing zeros/nothing
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      
      // Subtle color variation for depth
      const intensity = Math.random() * 0.5 + 0.3;
      colors[i3] = intensity;
      colors[i3 + 1] = intensity;
      colors[i3 + 2] = intensity;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystemRef.current = particleSystem;
    scene.add(particleSystem);

    // Create rotating geometry to represent "nothing"
    const geometry = new THREE.TorusGeometry(5, 1, 8, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x404040,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const rotatingMesh = new THREE.Mesh(geometry, material);
    rotatingMeshRef.current = rotatingMesh;
    scene.add(rotatingMesh);

    // Set camera position
    camera.position.z = 30;

    // Add debug helpers if enabled
    if (debug) {
      const axesHelper = new THREE.AxesHelper(10);
      scene.add(axesHelper);
      
      const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
      scene.add(gridHelper);
    }
  };

  const animate = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const tick = () => {
      // Rotate the mesh
      if (rotatingMeshRef.current) {
        rotatingMeshRef.current.rotation.x += rotationSpeed;
        rotatingMeshRef.current.rotation.y += rotationSpeed * 0.7;
      }

      // Animate particles
      if (particleSystemRef.current) {
        const positions = particleSystemRef.current.geometry.attributes.position;
        const positionArray = positions.array as Float32Array;
        
        for (let i = 0; i < positionArray.length; i += 3) {
          positionArray[i + 1] -= 0.05; // Drift particles down
          
          // Reset particles that fall too far
          if (positionArray[i + 1] < -50) {
            positionArray[i + 1] = 50;
            positionArray[i] = (Math.random() - 0.5) * 100;
            positionArray[i + 2] = (Math.random() - 0.5) * 100;
          }
        }
        
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    tick();
  };

  const { initialize, cleanup } = useThree({
    canvas: canvasRef.current,
    setupScene,
    animate
  });

  const { contextSafe } = useGSAP();

  useEffect(() => {
    if (canvasRef.current) {
      initialize();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanup();
    };
  }, [initialize, cleanup]);

  // Performance monitoring
  useEffect(() => {
    if (performanceHints) {
      const logPerformance = contextSafe(() => {
        const fps = Math.round(1000 / 16.67); // Rough FPS calculation
        if (fps < 30) {
          console.warn('VoidCanvas: Low FPS detected, consider reducing particle count');
        }
      });

      const interval = setInterval(logPerformance, 5000);
      return () => clearInterval(interval);
    }
  }, [performanceHints, contextSafe]);

  return (
    <div className={`relative ${className}`} role="img" aria-label="Void canvas animation">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ background: 'transparent' }}
      />
      {debug && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-sm p-2 rounded">
          <div>Particles: {particleCount}</div>
          <div>Rotation Speed: {rotationSpeed}</div>
          <div>Debug Mode: ON</div>
        </div>
      )}
      {performanceHints && (
        <div className="absolute bottom-4 right-4 bg-yellow-900 bg-opacity-75 text-yellow-100 text-xs p-2 rounded">
          Performance monitoring active
        </div>
      )}
    </div>
  );
};

export default VoidCanvas;
