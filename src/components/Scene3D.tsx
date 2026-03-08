// @ts-nocheck
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ── Burger: stacked cylinders ── */
function Burger({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group ref={ref} position={position} scale={0.7}>
        {/* Bottom bun */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.9, 1, 0.3, 32]} />
          <meshStandardMaterial color="#d4920a" roughness={0.6} />
        </mesh>
        {/* Lettuce */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[1.05, 0.95, 0.1, 32]} />
          <meshStandardMaterial color="#4ade80" roughness={0.8} />
        </mesh>
        {/* Patty */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.25, 32]} />
          <meshStandardMaterial color="#5c3317" roughness={0.7} />
        </mesh>
        {/* Cheese */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.95, 0.9, 0.06, 32]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Tomato */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
        {/* Top bun */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d4920a" roughness={0.6} />
        </mesh>
        {/* Sesame seeds */}
        {[[-0.3, 0.85, 0.3], [0.2, 0.9, -0.2], [0, 0.92, 0.4], [-0.2, 0.88, -0.4], [0.35, 0.85, 0.1]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} scale={[0.06, 0.03, 0.06]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ── Pizza Slice: triangle-ish shape ── */
function PizzaSlice({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.5);
    s.lineTo(-1, -0.8);
    s.quadraticCurveTo(0, -1.2, 1, -0.8);
    s.lineTo(0, 1.5);
    return s;
  }, []);

  return (
    <Float speed={1.8} rotationIntensity={1.2} floatIntensity={2.5}>
      <group ref={ref} position={position} scale={0.55} rotation={[0.3, 0, 0]}>
        {/* Base */}
        <mesh>
          <extrudeGeometry args={[shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 }]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.6} />
        </mesh>
        {/* Cheese top */}
        <mesh position={[0, 0, 0.16]}>
          <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: false }]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} />
        </mesh>
        {/* Pepperoni */}
        {[[0, 0.3, 0.22], [-0.4, -0.3, 0.22], [0.35, -0.2, 0.22], [0, -0.5, 0.22]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.7} />
          </mesh>
        ))}
        {/* Crust edge */}
        <mesh position={[0, -1, 0.08]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1, 0.12, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#b8860b" roughness={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Ice Cream Cone ── */
function IceCream({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
    }
  });
  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.5}>
      <group ref={ref} position={position} scale={0.6}>
        {/* Cone */}
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.5, 1.4, 32]} />
          <meshStandardMaterial color="#d4920a" roughness={0.8} />
        </mesh>
        {/* Cone pattern lines */}
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.52, 1.42, 8]} />
          <meshStandardMaterial color="#b8860b" roughness={0.9} wireframe />
        </mesh>
        {/* Scoop 1 - Strawberry */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Scoop 2 - Vanilla */}
        <mesh position={[-0.3, 0.6, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Scoop 3 - Chocolate */}
        <mesh position={[0.3, 0.65, 0]}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Cherry on top */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Cherry stem */}
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#166534" roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Donut ── */
function Donut({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      ref.current.rotation.y += 0.01;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <group position={position}>
        <mesh ref={ref}>
          <torusGeometry args={[0.5, 0.25, 32, 64]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Frosting */}
        <mesh ref={ref} position={[0, 0.05, 0]}>
          <torusGeometry args={[0.5, 0.22, 32, 64]} />
          <meshStandardMaterial color="#f472b6" roughness={0.2} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Particles (food sparkle) ── */
function FoodParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(150 * 3);
    for (let i = 0; i < 150 * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 15;
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#f97316" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 55 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -3, -5]} intensity={0.5} color="#f97316" />
        <pointLight position={[3, 4, 2]} intensity={0.3} color="#f472b6" />
        <Burger position={[-2.8, 0.5, 0]} />
        <PizzaSlice position={[2.8, 0.8, -1]} />
        <IceCream position={[0, -1, 1]} />
        <Donut position={[-1, 2, -2]} color="#d4920a" />
        <FoodParticles />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export function SmallScene3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <Burger position={[0, 0, 0]} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
