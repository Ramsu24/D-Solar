'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Calculator, Bot, TrendingUp, Sun } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Stars, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

interface CalculatorPromoSectionProps {
  onCalculateClick: () => void;
}

interface MousePosition {
  x: number;
  y: number;
}

interface RobotModelProps {
  mousePosition: MousePosition | null;
}

// Extend THREE.Object3D to include isMesh property and material
interface ExtendedObject3D extends THREE.Object3D {
  isMesh?: boolean;
  material?: THREE.Material | THREE.Material[] & {
    name: string;
    emissive?: THREE.Color;
    emissiveIntensity?: number;
  };
}

// Background mesh component for the robot scene
function SceneBackground() {
  return (
    <mesh position={[0, 0, -10]} scale={[30, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial>
        <GradientTexture
          stops={[0, 0.3, 0.6, 1]}
          colors={['#f8fafc', '#e0f2fe', '#bae6fd', '#0c4a6e']}
          size={1024}
        />
      </meshStandardMaterial>
    </mesh>
  );
}

// Robot model component with modifications to stand out on lighter background
function RobotModel({ mousePosition }: RobotModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/3d-robot/robot.gltf');
  const { actions } = useAnimations(animations, group);
  
  // Start the animation
  useEffect(() => {
    // Play all animations if they exist
    if (actions && Object.keys(actions).length > 0) {
      // Get the first animation
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.reset().fadeIn(0.5).play();
      }
    }
  }, [actions]);

  // Make robot follow cursor
  useFrame(() => {
    if (group.current && mousePosition) {
      // Calculate the target rotation based on mouse position
      const targetRotationY = ((mousePosition.x / window.innerWidth) * 2 - 1) * 0.9;
      const targetRotationX = ((mousePosition.y / window.innerHeight) * 2 - 1) * 0.4;
      
      // Smoothly interpolate current rotation to target rotation
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetRotationY,
        0.1
      );
      
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        targetRotationX,
        0.1
      );
    }
  });

  useEffect(() => {
    // Make sure scene is set up correctly and enhance materials
    if (scene) {
      scene.traverse((child: ExtendedObject3D) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Enhance materials to be more colorful
          if (child.material) {
            // Make sure emissive property exists and enhance it
            if ('emissive' in child.material) {
              // Add brighter cyan emissive color to enhance robot's eyes and details
              if (child.material.name.includes('eye') || child.material.name.includes('light')) {
                child.material.emissive = new THREE.Color(0x00ffff);
                child.material.emissiveIntensity = 1.5;
              }
            }
          }
        }
      });
    }
  }, [scene]);

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={5} 
        position={[0, -2, 0]} 
        rotation={[0.2, -0.3, 0]}
      />
    </group>
  );
}

// Load the model once to prevent multiple loading
useGLTF.preload('/3d-robot/robot.gltf');

export default function CalculatorPromoSection({ onCalculateClick }: CalculatorPromoSectionProps) {
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(null);

  // Track mouse position for robot animation
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Card Content - First on mobile */}
          <div className="w-full md:w-1/2 order-1 md:order-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <Calculator className="text-blue-600 mr-3 h-8 w-8" />
                <h2 className="text-2xl font-bold text-gray-800">AI-Powered Solar Savings Calculator</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Try our new and improved Solar Calculator, now featuring AI-powered personalized analysis! 
                Get detailed insights, custom recommendations, and accurate savings estimates based on your 
                specific location, energy usage, and local weather patterns.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">AI-Powered Analysis</h3>
                    <p className="text-sm text-gray-600">Get personalized recommendations and insights from our advanced AI system</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Accurate Forecasting</h3>
                    <p className="text-sm text-gray-600">Real-time weather data and solar potential analysis for precise estimates</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Sun className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Comprehensive Reports</h3>
                    <p className="text-sm text-gray-600">Detailed financial, environmental, and technical analysis of your solar potential</p>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={onCalculateClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="button"
              >
                Try Our AI Calculator Now →
              </motion.button>
            </motion.div>
          </div>
          
          {/* 3D Robot Model - Second on mobile */}
          <div className="hidden lg:block w-full md:w-1/2 order-2 md:order-2 mt-8 md:mt-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative h-[500px] w-full max-w-[500px] mx-auto"
            >
              <Canvas
                shadows
                camera={{ position: [0, 0, 6.5], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
                gl={{ antialias: true }}
              >
                {/* Lighting setup */}
                <ambientLight intensity={1.0} />
                <spotLight 
                  position={[10, 10, 10]} 
                  angle={0.3} 
                  penumbra={1} 
                  intensity={1.5} 
                  castShadow 
                  color="#ffffff"
                />
                <pointLight position={[-5, 5, 5]} intensity={0.5} color="#88ccff" />
                <pointLight position={[5, -5, 5]} intensity={0.5} color="#00ffaa" />
                
                {/* Robot model - using section's background gradient naturally */}
                <RobotModel mousePosition={mousePosition} />
                
                {/* Subtle environment for reflections that complements white/blue gradient */}
                <Environment preset="city" />
              </Canvas>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 