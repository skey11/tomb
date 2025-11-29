import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Sparkles, Edges } from "@react-three/drei";
import { DoubleSide, Group, MeshStandardMaterial } from "three";
import { Tombstone } from "../types";

type SceneProps = {
  tombs: Tombstone[];
  selectedId?: string;
  onSelect: (id: string) => void;
  burstAt?: Tombstone | null;
};

const TombstoneMesh = ({
  tomb,
  isActive,
  onClick
}: {
  tomb: Tombstone;
  isActive: boolean;
  onClick: () => void;
}) => {
  const group = useRef<Group>(null);
  const height = tomb.height ?? 2.3;
  const width = 1.4;
  const depth = 0.5;
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: isActive ? "#6fffe9" : "#c0d0e6",
        metalness: 0.7,
        roughness: 0.25,
        emissive: isActive ? "#6fffe9" : "#0a1120",
        emissiveIntensity: isActive ? 1.2 : 0.35
      }),
    [isActive]
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime() * 0.6 + tomb.position[0] * 0.3;
    const float = Math.sin(t) * 0.15;
    group.current.position.y = tomb.position[1] + float;
    group.current.rotation.y += 0.0025;
  });

  return (
    <group ref={group} position={tomb.position} rotation={[0, 0, tomb.tilt ?? 0]}>
      <mesh castShadow receiveShadow onClick={onClick}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
        <Edges scale={1.01} color={isActive ? "#b4fff4" : "#7fa6c9"} threshold={30} />
      </mesh>

      <mesh position={[0, -height / 2 - 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1, 0.3, 24, 1, false]} />
        <meshStandardMaterial
          color={isActive ? "#3ae5cc" : "#9eb8d6"}
          metalness={0.4}
          roughness={0.5}
          emissive={isActive ? "#1f9d8a" : "#0c1524"}
          emissiveIntensity={isActive ? 0.7 : 0.2}
        />
      </mesh>
      <mesh position={[0, -height / 2 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.35, 48]} />
        <meshBasicMaterial
          color={isActive ? "#6fffe9" : "#3bb0a1"}
          transparent
          opacity={isActive ? 0.5 : 0.25}
          side={DoubleSide}
        />
      </mesh>
      <Text
        position={[0, height / 2 + 0.24, 0]}
        fontSize={0.35}
        color={isActive ? "#fbd68a" : "#7ce5ff"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.018}
        outlineColor={isActive ? "#0d1c31" : "#07101f"}
      >
        {tomb.name}
      </Text>
    </group>
  );
};

const Burst = ({ tomb }: { tomb: Tombstone }) => {
  return (
    <group position={tomb.position}>
      <Sparkles count={80} speed={1.2} size={6} scale={3} color="#f8d57e" />
    </group>
  );
};

const SceneContent = ({ tombs, selectedId, onSelect, burstAt }: SceneProps) => {
  const glow = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#6fffe9",
        emissive: "#6fffe9",
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.05
      }),
    []
  );

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 6, 3]} intensity={1.6} color="#6fffe9" />
      <pointLight position={[-4, 5, -2]} intensity={1} color="#f8d57e" />

      <Stars radius={80} depth={50} count={4000} factor={3} saturation={0.2} fade speed={1} />

      {tombs.map((t) => (
        <TombstoneMesh key={t.id} tomb={t} isActive={t.id === selectedId} onClick={() => onSelect(t.id)} />
      ))}

      {/* gentle fog layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <primitive object={glow} attach="material" />
      </mesh>

      <OrbitControls
        makeDefault
        target={[0, 1.2, 0]}
        enablePan={false}
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.65}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={22}
        zoomSpeed={0.8}
        rotateSpeed={0.75}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
      />

      {burstAt && <Burst tomb={burstAt} />}
    </>
  );
};

const SpaceScene = ({ tombs, selectedId, onSelect, burstAt }: SceneProps) => {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [6, 4, 8], fov: 55, near: 0.1, far: 200 }}
      className="h-full w-full"
    >
      <SceneContent tombs={tombs} selectedId={selectedId} onSelect={onSelect} burstAt={burstAt} />
    </Canvas>
  );
};

export default SpaceScene;
