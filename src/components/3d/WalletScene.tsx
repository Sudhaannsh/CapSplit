import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useWallet } from '@/contexts/WalletContext';

const ACTIVITY_COLORS = [
  '#3dd9d0',
  '#4ade80',
  '#a78bfa',
  '#fb923c',
  '#f472b6',
  '#facc15',
];

function WalletOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { balance } = useWallet();
  
  // Scale based on balance (subtle effect)
  const scale = 1 + Math.min(balance / 100000, 0.5);
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 32, 32]} scale={scale}>
        <MeshDistortMaterial
          color="#3dd9d0"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
          emissive="#1a7a74"
          emissiveIntensity={0.4}
        />
      </Sphere>
    </Float>
  );
}

function ActivityOrbs() {
  const { activities, getTotalAllocated } = useWallet();
  const totalAllocated = getTotalAllocated();
  
  return (
    <group>
      {activities.map((activity, index) => {
        const angle = (index / Math.max(activities.length, 1)) * Math.PI * 2;
        const radius = 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Size based on allocation
        const allocatedAmount = Number(activity.allocated_amount);
        const size = 0.3 + (allocatedAmount / Math.max(totalAllocated, 1)) * 0.4;
        const color = ACTIVITY_COLORS[index % ACTIVITY_COLORS.length];
        
        return (
          <Float key={activity.id} speed={3} rotationIntensity={0.3} floatIntensity={0.3}>
            <Sphere args={[size, 16, 16]} position={[x, 0, z]}>
              <meshStandardMaterial
                color={color}
                roughness={0.3}
                metalness={0.6}
                emissive={color}
                emissiveIntensity={0.2}
              />
            </Sphere>
          </Float>
        );
      })}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3dd9d0" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ade80" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#ffffff"
      />
    </>
  );
}

export function WalletScene() {
  return (
    <div className="w-full h-[300px] relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Lights />
          <WalletOrb />
          <ActivityOrbs />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
