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
function Donut({ position }: { position: [number, number, number] }) {
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
          <meshStandardMaterial color="#a855f7" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh ref={ref} position={[0, 0.05, 0]}>
          <torusGeometry args={[0.5, 0.22, 32, 64]} />
          <meshStandardMaterial color="#f472b6" roughness={0.2} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Coffee Cup ── */
function CoffeeCup({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.25;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={ref} position={position} scale={0.5}>
        {/* Cup body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 1.2, 32]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
        {/* Coffee inside */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.1, 32]} />
          <meshStandardMaterial color="#5c3317" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.6, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.25, 0.06, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
        {/* Steam wisps */}
        {[[0, 0.8, 0], [-0.15, 0.9, 0.1], [0.15, 0.85, -0.1]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} scale={[0.06, 0.2, 0.06]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ── Croissant ── */
function Croissant({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.1;
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2}>
      <group ref={ref} position={position} scale={0.45} rotation={[0.2, 0, 0.3]}>
        {/* Crescent body using torus segment */}
        <mesh>
          <torusGeometry args={[0.7, 0.3, 16, 32, Math.PI * 0.7]} />
          <meshStandardMaterial color="#d4920a" roughness={0.6} />
        </mesh>
        {/* Layers/ridges */}
        {[0, 0.4, 0.8, 1.2].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, 0]} rotation={[0, 0, angle]} scale={[0.35, 0.08, 0.25]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#b8860b" roughness={0.7} />
          </mesh>
        ))}
        {/* Glaze sheen */}
        <mesh position={[0, 0.1, 0.15]}>
          <torusGeometry args={[0.68, 0.15, 8, 32, Math.PI * 0.7]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.2} transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Sushi Roll ── */
function SushiRoll({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });
  return (
    <Float speed={2.2} rotationIntensity={0.7} floatIntensity={1.8}>
      <group ref={ref} position={position} scale={0.5} rotation={[Math.PI / 2, 0, 0]}>
        {/* Nori wrap */}
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.6, 32]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
        {/* Rice ring */}
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.02, 32]} />
          <meshStandardMaterial color="#fefce8" roughness={0.3} />
        </mesh>
        {/* Salmon center */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
          <meshStandardMaterial color="#fb923c" roughness={0.4} />
        </mesh>
        {/* Avocado */}
        <mesh position={[0.15, 0.3, 0.15]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#4ade80" roughness={0.5} />
        </mesh>
        {/* Cucumber */}
        <mesh position={[-0.15, 0.3, -0.1]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Cake Slice ── */
function CakeSlice({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.45) * 0.1;
    }
  });

  const sliceShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1, -0.5);
    s.quadraticCurveTo(1.05, 0, 1, 0.5);
    s.lineTo(0, 0);
    return s;
  }, []);

  return (
    <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1.5}>
      <group ref={ref} position={position} scale={0.5}>
        {/* Bottom layer */}
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry args={[sliceShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.4} />
        </mesh>
        {/* Cream layer */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry args={[sliceShape, { depth: 0.08, bevelEnabled: false }]} />
          <meshStandardMaterial color="#fefce8" roughness={0.2} />
        </mesh>
        {/* Top layer */}
        <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry args={[sliceShape, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }]} />
          <meshStandardMaterial color="#c084fc" roughness={0.4} />
        </mesh>
        {/* Strawberry on top */}
        <mesh position={[0.5, 0.65, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Hot Dog ── */
function HotDog({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.35;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.9} floatIntensity={2}>
      <group ref={ref} position={position} scale={0.45} rotation={[0, 0, 0.3]}>
        {/* Bottom bun */}
        <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.25, 1.2, 16, 32]} />
          <meshStandardMaterial color="#d4920a" roughness={0.6} />
        </mesh>
        {/* Sausage */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.15, 1.1, 16, 32]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>
        {/* Mustard zigzag */}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0.2, (i % 2 === 0 ? 0.05 : -0.05)]} scale={[0.08, 0.04, 0.08]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.3} />
          </mesh>
        ))}
        {/* Ketchup */}
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.18, (i % 2 === 0 ? -0.04 : 0.04)]} scale={[0.06, 0.03, 0.06]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ── Particles (food sparkle) ── */
function FoodParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3);
    for (let i = 0; i < 200 * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
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
      <pointsMaterial size={0.035} color="#a855f7" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export function HeroScene({ onReady }: { onReady?: () => void }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 9], fov: 70 }} onCreated={() => { setTimeout(() => onReady?.(), 300); }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-8, -3, -5]} intensity={0.6} color="#a855f7" />
        <pointLight position={[8, 4, 2]} intensity={0.4} color="#e879f9" />
        <pointLight position={[0, -2, 4]} intensity={0.3} color="#c084fc" />
        {/* Center */}
        <Burger position={[-1.5, 0.5, 0]} />
        <IceCream position={[0, -1.2, 1]} />
        <PizzaSlice position={[1.8, 0.8, -1]} />
        {/* Left edge */}
        <Donut position={[-6, 1.5, -1]} />
        <CoffeeCup position={[-5.5, -1.5, 0.5]} />
        <CakeSlice position={[-7, 0, -2]} />
        {/* Right edge */}
        <Croissant position={[6, -0.3, -1]} />
        <SushiRoll position={[5.5, 2, -0.5]} />
        <HotDog position={[7, -1, -2]} />
        {/* Extra far edges for ultrawide */}
        <Burger position={[-8.5, -0.5, -3]} />
        <PizzaSlice position={[8.5, 1, -3]} />
        <IceCream position={[-7.5, 2.5, -2.5]} />
        <Croissant position={[7.5, -2.5, -2.5]} />
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
