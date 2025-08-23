import React, { useEffect, useRef, useState, Suspense } from 'react';
import Spinner from '../../shared/components/Spinner';

// Three.js component is defined below

interface Showcase3DProps {
  className?: string;
}

const FallbackSVG: React.FC = () => (
  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
    <div className="relative">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="animate-spin"
        style={{ animationDuration: '8s' }}
      >
        {/* Outer ring */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="2"
          strokeDasharray="20 10"
          className="opacity-60"
        />
        {/* Inner ring */}
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke="url(#gradient2)"
          strokeWidth="1"
          strokeDasharray="15 5"
          className="opacity-40"
          style={{ animationDirection: 'reverse' }}
        />
        {/* Center void */}
        <circle
          cx="100"
          cy="100"
          r="20"
          fill="url(#radialGradient)"
          className="opacity-80"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="radialGradient">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="70%" stopColor="#1f2937" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#374151" stopOpacity="0.3" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse`}
            style={{
              left: `${20 + i * 25}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>
    </div>
    
    <div className="absolute bottom-4 text-center text-gray-400 text-sm">
      <p>Absolutely Nothing™</p>
      <p className="text-xs opacity-60">WebGL Unavailable - Void Simulation Active</p>
    </div>
  </div>
);

const Showcase3D: React.FC<Showcase3DProps> = ({ className = '' }) => {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Check WebGL support
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!context;
      } catch (error) {
        return false;
      }
    };

    setWebGLSupported(checkWebGLSupport());
  }, []);

  const handleError = () => {
    setLoadError(true);
  };

  // Show fallback if WebGL is not supported or there's a load error
  if (webGLSupported === false || loadError) {
    return (
      <div className={`w-full ${className}`}>
        <FallbackSVG />
      </div>
    );
  }

  // Show loading spinner while checking WebGL support
  if (webGLSupported === null) {
    return (
      <div className={`w-full h-96 flex items-center justify-center ${className}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Suspense
        fallback={
          <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-400 text-sm">Loading Absolutely Nothing™ in 3D...</p>
            </div>
          </div>
        }
      >
        <ThreeJSShowcase onError={handleError} />
      </Suspense>
    </div>
  );
};

// Separate component for the actual Three.js implementation
const ThreeJSShowcase: React.FC<{ onError: () => void }> = ({ onError }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    let mounted = true;

    const initThreeJS = async () => {
      try {
        // Dynamic import of Three.js to enable code splitting
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

        if (!mountRef.current || !mounted) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          mountRef.current.clientWidth / mountRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 5;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        if (!mountRef.current) return;
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x6366f1, 1, 100);
        pointLight1.position.set(-10, 0, 0);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 100);
        pointLight2.position.set(10, 0, 0);
        scene.add(pointLight2);

        // Create a default "nothing" object if model fails to load
        let mesh: THREE.Object3D;
        
        // Try to load the GLB model
        const loader = new GLTFLoader();
        try {
          const gltf = await new Promise<any>((resolve, reject) => {
            loader.load(
              '/assets/models/nothing.glb',
              resolve,
              undefined,
              reject
            );
          });
          mesh = gltf.scene;
          mesh.scale.set(2, 2, 2);
        } catch (modelError) {
          // Fallback: create a geometric "nothing" representation
          const geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
          const material = new THREE.MeshPhongMaterial({ 
            color: 0x6366f1,
            transparent: true,
            opacity: 0.7,
            wireframe: false
          });
          mesh = new THREE.Mesh(geometry, material);
          
          // Add inner void
          const voidGeometry = new THREE.SphereGeometry(1, 32, 32);
          const voidMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 0.9
          });
          const voidMesh = new THREE.Mesh(voidGeometry, voidMaterial);
          mesh.add(voidMesh);
        }

        scene.add(mesh);

        // Store references
        sceneRef.current = { scene, camera, renderer, mesh };
        rendererRef.current = renderer;

        // Animation loop
        const animate = () => {
          if (!mounted) return;

          animationIdRef.current = requestAnimationFrame(animate);

          // Rotate the mesh
          if (mesh) {
            mesh.rotation.x += 0.005;
            mesh.rotation.y += 0.01;
            mesh.rotation.z += 0.003;
          }

          // Animate point lights
          const time = Date.now() * 0.001;
          pointLight1.position.x = Math.cos(time) * 8;
          pointLight1.position.z = Math.sin(time) * 8;
          pointLight2.position.x = Math.cos(time + Math.PI) * 8;
          pointLight2.position.z = Math.sin(time + Math.PI) * 8;

          renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
          if (!mountRef.current || !camera || !renderer) return;
          
          camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };

      } catch (error) {
        console.error('Three.js initialization failed:', error);
        if (mounted) {
          onError();
        }
      }
    };

    initThreeJS();

    return () => {
      mounted = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [onError]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 text-white text-sm opacity-60">
        <p>Absolutely Nothing™ 3D Experience</p>
        <p className="text-xs">Powered by WebGL</p>
      </div>
    </div>
  );
};

export default Showcase3D;
