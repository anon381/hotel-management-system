import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Box, Environment } from "@react-three/drei";
import * as THREE from "three";

function FloatingDonut({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      ref.current.rotation.y += 0.01;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Torus ref={ref} args={[1, 0.4, 32, 64]} position={position}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </Torus>
    </Float>
  );
}

function FloatingSphere({ position, color, size = 0.6 }: { position: [number, number, number]; color: string; size?: number }) {
  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={3}>
      <Sphere args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial color={color} roughness={0.1} metalness={0.9} distort={0.3} speed={2} />
      </Sphere>
    </Float>
  );
}

function FloatingCube({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
      <Box ref={ref} args={[0.8, 0.8, 0.8]} position={position}>
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.85} />
      </Box>
    </Float>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 15;
  }
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#f97316" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#f97316" />
        <FloatingDonut position={[-2.5, 1, 0]} color="#f97316" />
        <FloatingSphere position={[2.5, -0.5, -1]} color="#22c55e" size={0.7} />
        <FloatingSphere position={[-1, -1.5, 1]} color="#3b82f6" size={0.4} />
        <FloatingCube position={[3, 1.5, -2]} color="#f97316" />
        <Particles />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export function SmallScene3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <FloatingSphere position={[0, 0, 0]} color="#f97316" size={1} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
