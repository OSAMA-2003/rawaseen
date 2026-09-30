"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Group,
} from "three";

type Props = {
  progress: React.MutableRefObject<number>;
  isTwilight?: boolean;
};

// Precise architectural proportions matching reference photo
const UPPER_FLOORS_COUNT = 5;
const FLOOR_HEIGHT = 0.68;
const BUILDING_WIDTH = 3.2;
const BUILDING_DEPTH = 2.8;
const CORE_WALL_THICKNESS = 0.38;
const GROUND_FLOOR_HEIGHT = 1.02;

function CommercialBuildingModel({ progress, isTwilight }: Props) {
  const rootGroup = useRef<Group>(null);
  const upperFloorsRef = useRef<(Group | null)[]>([]);
  const roofRef = useRef<Group>(null);
  const sideWallRef = useRef<Group>(null);

  // Responsive offset state (centers model nicely alongside UI text on desktop)
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Reusable geometries with clean scale
  const geos = useMemo(() => {
    return {
      // Diorama plinth with curb
      plinth: new BoxGeometry(5.4, 0.16, 5.0),
      curb: new BoxGeometry(5.6, 0.08, 5.2),
      planterFront: new BoxGeometry(3.2, 0.14, 0.42),
      planterSide: new BoxGeometry(0.42, 0.14, 2.9),

      // Landscaping foliage
      bushLarge: new DodecahedronGeometry(0.18, 1),
      bushSmall: new DodecahedronGeometry(0.12, 1),

      // Ground showroom
      groundGlassFront: new BoxGeometry(BUILDING_WIDTH, GROUND_FLOOR_HEIGHT, 0.035),
      groundGlassSide: new BoxGeometry(0.035, GROUND_FLOOR_HEIGHT, BUILDING_DEPTH),
      groundSlab: new BoxGeometry(BUILDING_WIDTH + 0.12, 0.14, BUILDING_DEPTH + 0.12),
      receptionDesk: new BoxGeometry(0.75, 0.3, 0.35),
      table: new BoxGeometry(0.55, 0.24, 0.55),
      stairStep: new BoxGeometry(0.48, 0.045, 0.16),

      // Upper typical floors
      floorGlassFront: new BoxGeometry(BUILDING_WIDTH - 0.02, FLOOR_HEIGHT - 0.16, 0.035),
      floorGlassSide: new BoxGeometry(0.035, FLOOR_HEIGHT - 0.16, BUILDING_DEPTH - 0.02),
      spandrelFront: new BoxGeometry(BUILDING_WIDTH + 0.06, 0.16, 0.06),
      spandrelSide: new BoxGeometry(0.06, 0.16, BUILDING_DEPTH + 0.06),
      slabPlate: new BoxGeometry(BUILDING_WIDTH, 0.05, BUILDING_DEPTH),
      mullionVertical: new BoxGeometry(0.03, FLOOR_HEIGHT - 0.16, 0.05),
      windowBlind: new BoxGeometry(0.36, FLOOR_HEIGHT - 0.18, 0.018),

      // Side concrete shear wall & rear wall
      sideCoreWall: new BoxGeometry(CORE_WALL_THICKNESS, 4.8, BUILDING_DEPTH + 0.2),
      rearWall: new BoxGeometry(BUILDING_WIDTH + CORE_WALL_THICKNESS, 4.8, 0.24),
      sconceLight: new BoxGeometry(0.05, 0.1, 0.05),

      // Beveled roof parapet & cove
      roofBevel: new BoxGeometry(BUILDING_WIDTH + 0.42, 0.32, BUILDING_DEPTH + 0.42),
      roofDeck: new BoxGeometry(BUILDING_WIDTH + 0.12, 0.03, BUILDING_DEPTH + 0.12),
      roofCoveGlow: new BoxGeometry(BUILDING_WIDTH + 0.28, 0.03, BUILDING_DEPTH + 0.28),
    };
  }, []);

  // Curated color palette
  const palette = useMemo(() => {
    return {
      concrete: isTwilight ? "#d2ccbf" : "#e0ddd6",
      concreteEdge: isTwilight ? "#8a8376" : "#b2aba1",
      darkFrame: "#1a1d22",
      darkFrameEdge: "#2f333a",
      sidewalk: isTwilight ? "#9fa4ae" : "#d7dbe0",
      curb: isTwilight ? "#616773" : "#8d939e",
      bushGreen1: "#3c6e48",
      bushGreen2: "#4a8258",
      bushGreen3: "#2d5636",
      interiorWarm: "#ffc266",
      interiorGlowIntensity: isTwilight ? 2.5 : 1.75,
      windowGlass: isTwilight ? "#201a14" : "#362c20",
      groundShowroomGlow: "#ffd580",
      coveLight: "#ffa834",
      sconce: "#ffcc66",
    };
  }, [isTwilight]);

  useFrame(({ camera }) => {
    const p = Math.min(Math.max(progress.current, 0), 1);
    // Controlled exploded separation
    const explode = Math.sin(p * Math.PI);

    // Responsive horizontal model position:
    // On desktop, offset slightly to the right so left text never collides.
    // On mobile, center perfectly.
    const targetModelX = isDesktop ? 0.65 : 0;
    const targetModelY = isDesktop ? -0.15 : -0.25;

    if (rootGroup.current) {
      rootGroup.current.position.x = targetModelX;
      rootGroup.current.position.y = targetModelY;
      // Gentle subtle rotation driven by scroll progress
      rootGroup.current.rotation.y = p * 0.28;
    }

    // Camera isometric angle and framing
    const baseAngle = 0.72; // ~42 deg axonometric
    const angle = baseAngle + p * 0.85;
    const radius = isDesktop ? 9.8 - explode * 0.9 : 11.2 - explode * 0.8;
    const eyeY = 4.8 + p * 1.0 + explode * 0.6;
    camera.position.set(
      targetModelX + Math.sin(angle) * radius,
      eyeY,
      Math.cos(angle) * radius,
    );
    camera.lookAt(targetModelX, 0.5, 0);

    // Explode each of the 5 upper floors with disciplined displacement
    upperFloorsRef.current.forEach((group, idx) => {
      if (!group) return;
      const baseY = -0.38 + idx * FLOOR_HEIGHT;
      // Progressive lift that stays fully within screen bounds
      const lift = (idx + 1) * 0.16 * explode;
      group.position.y = baseY + lift;

      // Micro drift forward to expose slab edges
      group.position.x = -explode * 0.08 * (idx * 0.15);
      group.position.z = -explode * 0.08 * (idx * 0.15);
    });

    // Roof parapet lifts above top floor
    if (roofRef.current) {
      const roofBaseY = -0.38 + UPPER_FLOORS_COUNT * FLOOR_HEIGHT + 0.1;
      roofRef.current.position.y = roofBaseY + explode * 1.15;
    }

    // Side shear wall drifts outward
    if (sideWallRef.current) {
      sideWallRef.current.position.x =
        BUILDING_WIDTH / 2 + CORE_WALL_THICKNESS / 2 + explode * 0.35;
    }
  });

  return (
    <group ref={rootGroup}>
      {/* 1. DIORAMA PAVED PLINTH & PLANTERS */}
      <group position={[0, -1.92, 0]}>
        {/* Curbs */}
        <mesh position={[0, -0.04, 0]} receiveShadow geometry={geos.curb}>
          <meshStandardMaterial color={palette.curb} roughness={0.8} />
        </mesh>

        {/* Sidewalk pavement */}
        <mesh position={[0, 0.04, 0]} receiveShadow geometry={geos.plinth}>
          <meshStandardMaterial color={palette.sidewalk} roughness={0.65} />
        </mesh>

        {/* Planter Box Front */}
        <mesh
          position={[-0.3, 0.15, BUILDING_DEPTH / 2 + 0.4]}
          receiveShadow
          geometry={geos.planterFront}
        >
          <meshStandardMaterial color={palette.darkFrame} roughness={0.7} />
        </mesh>

        {/* Planter Box Left Side */}
        <mesh
          position={[-BUILDING_WIDTH / 2 - 0.4, 0.15, 0]}
          receiveShadow
          geometry={geos.planterSide}
        >
          <meshStandardMaterial color={palette.darkFrame} roughness={0.7} />
        </mesh>

        {/* Miniature Trees & Bushes in Front Planter */}
        {[-1.4, -0.9, -0.4, 0.1, 0.6, 1.1].map((x, i) => (
          <group key={`fbush-${i}`} position={[x, 0.3, BUILDING_DEPTH / 2 + 0.4]}>
            <mesh castShadow geometry={geos.bushLarge} scale={i % 2 === 0 ? 0.95 : 0.8}>
              <meshStandardMaterial
                color={
                  i % 3 === 0
                    ? palette.bushGreen1
                    : i % 3 === 1
                    ? palette.bushGreen2
                    : palette.bushGreen3
                }
                roughness={0.9}
              />
            </mesh>
            <mesh position={[0.1, -0.05, 0.06]} geometry={geos.bushSmall} scale={0.85}>
              <meshStandardMaterial color={palette.bushGreen2} roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Miniature Trees along Left Side Planter */}
        {[-1.1, -0.55, 0, 0.55, 1.1].map((z, i) => (
          <group key={`sbush-${i}`} position={[-BUILDING_WIDTH / 2 - 0.4, 0.3, z]}>
            <mesh castShadow geometry={geos.bushLarge} scale={i % 2 === 1 ? 0.95 : 0.8}>
              <meshStandardMaterial
                color={i % 2 === 0 ? palette.bushGreen1 : palette.bushGreen2}
                roughness={0.9}
              />
            </mesh>
            <mesh position={[0.07, -0.05, -0.08]} geometry={geos.bushSmall} scale={0.8}>
              <meshStandardMaterial color={palette.bushGreen3} roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. GROUND FLOOR SHOWROOM */}
      <group position={[0, -1.22, 0]}>
        {/* Mezzanine Slab Header */}
        <mesh position={[0, GROUND_FLOOR_HEIGHT / 2 + 0.07, 0]} castShadow receiveShadow geometry={geos.groundSlab}>
          <meshStandardMaterial color={palette.concrete} roughness={0.7} />
        </mesh>
        <lineSegments position={[0, GROUND_FLOOR_HEIGHT / 2 + 0.07, 0]}>
          <edgesGeometry args={[geos.groundSlab]} />
          <lineBasicMaterial color={palette.concreteEdge} />
        </lineSegments>

        {/* Front Glass Facade */}
        <mesh position={[0, 0, BUILDING_DEPTH / 2]} geometry={geos.groundGlassFront}>
          <meshStandardMaterial
            color={palette.windowGlass}
            emissive={palette.groundShowroomGlow}
            emissiveIntensity={palette.interiorGlowIntensity * 0.9}
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.84}
          />
        </mesh>

        {/* Left Side Glass Facade */}
        <mesh position={[-BUILDING_WIDTH / 2, 0, 0]} geometry={geos.groundGlassSide}>
          <meshStandardMaterial
            color={palette.windowGlass}
            emissive={palette.groundShowroomGlow}
            emissiveIntensity={palette.interiorGlowIntensity * 0.9}
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.84}
          />
        </mesh>

        {/* Front Mullions (5 vertical bays) */}
        {[-1.6, -0.96, -0.32, 0.32, 0.96, 1.6].map((x, i) => (
          <mesh key={`gm-f-${i}`} position={[x, 0, BUILDING_DEPTH / 2 + 0.02]} castShadow>
            <boxGeometry args={[0.04, GROUND_FLOOR_HEIGHT, 0.05]} />
            <meshStandardMaterial color={palette.darkFrame} roughness={0.5} />
          </mesh>
        ))}

        {/* Left Side Mullions (4 vertical bays) */}
        {[-1.4, -0.7, 0, 0.7, 1.4].map((z, i) => (
          <mesh key={`gm-s-${i}`} position={[-BUILDING_WIDTH / 2 - 0.02, 0, z]} castShadow>
            <boxGeometry args={[0.05, GROUND_FLOOR_HEIGHT, 0.04]} />
            <meshStandardMaterial color={palette.darkFrame} roughness={0.5} />
          </mesh>
        ))}

        {/* Interior Furniture */}
        <mesh position={[-0.7, -0.32, 0.35]} castShadow geometry={geos.receptionDesk}>
          <meshStandardMaterial color="#4a423b" roughness={0.6} />
        </mesh>
        <mesh position={[0.65, -0.35, 0.2]} castShadow geometry={geos.table}>
          <meshStandardMaterial color="#6a5f54" roughness={0.5} />
        </mesh>

        {/* Interior Staircase */}
        {[0, 1, 2, 3, 4, 5].map((st) => (
          <mesh
            key={`stair-${st}`}
            position={[-1.1 + st * 0.1, -0.42 + st * 0.16, -0.7 + st * 0.14]}
            castShadow
            geometry={geos.stairStep}
          >
            <meshStandardMaterial color="#d4ceb8" roughness={0.4} />
          </mesh>
        ))}

        {/* Warm Showroom Point Light */}
        <pointLight position={[0, 0.15, 0.2]} intensity={2.6} distance={5.5} color="#ffe1a0" />
      </group>

      {/* 3. UPPER 5 TYPICAL FLOORS */}
      {Array.from({ length: UPPER_FLOORS_COUNT }).map((_, floorIdx) => {
        return (
          <group
            key={`floor-${floorIdx}`}
            ref={(el) => {
              upperFloorsRef.current[floorIdx] = el;
            }}
            position={[0, -0.38 + floorIdx * FLOOR_HEIGHT, 0]}
          >
            {/* Floor Slab Plate */}
            <mesh position={[0, -FLOOR_HEIGHT / 2 + 0.025, 0]} geometry={geos.slabPlate}>
              <meshStandardMaterial color="#ded7cb" roughness={0.8} />
            </mesh>

            {/* Top Spandrel (Front) */}
            <mesh
              position={[0, FLOOR_HEIGHT / 2 - 0.08, BUILDING_DEPTH / 2 + 0.035]}
              castShadow
              geometry={geos.spandrelFront}
            >
              <meshStandardMaterial color={palette.darkFrame} roughness={0.65} metalness={0.25} />
            </mesh>

            {/* Top Spandrel (Side) */}
            <mesh
              position={[-BUILDING_WIDTH / 2 - 0.035, FLOOR_HEIGHT / 2 - 0.08, 0]}
              castShadow
              geometry={geos.spandrelSide}
            >
              <meshStandardMaterial color={palette.darkFrame} roughness={0.65} metalness={0.25} />
            </mesh>

            {/* Bottom Spandrel (Front) */}
            <mesh
              position={[0, -FLOOR_HEIGHT / 2 + 0.08, BUILDING_DEPTH / 2 + 0.035]}
              castShadow
              geometry={geos.spandrelFront}
            >
              <meshStandardMaterial color={palette.darkFrame} roughness={0.65} metalness={0.25} />
            </mesh>

            {/* Bottom Spandrel (Side) */}
            <mesh
              position={[-BUILDING_WIDTH / 2 - 0.035, -FLOOR_HEIGHT / 2 + 0.08, 0]}
              castShadow
              geometry={geos.spandrelSide}
            >
              <meshStandardMaterial color={palette.darkFrame} roughness={0.65} metalness={0.25} />
            </mesh>

            {/* Glowing Front Windows */}
            <mesh position={[0, 0, BUILDING_DEPTH / 2]} geometry={geos.floorGlassFront}>
              <meshStandardMaterial
                color={palette.windowGlass}
                emissive={palette.interiorWarm}
                emissiveIntensity={palette.interiorGlowIntensity}
                roughness={0.15}
                metalness={0.1}
                transparent
                opacity={0.92}
              />
            </mesh>

            {/* Glowing Left Side Windows */}
            <mesh position={[-BUILDING_WIDTH / 2, 0, 0]} geometry={geos.floorGlassSide}>
              <meshStandardMaterial
                color={palette.windowGlass}
                emissive={palette.interiorWarm}
                emissiveIntensity={palette.interiorGlowIntensity}
                roughness={0.15}
                metalness={0.1}
                transparent
                opacity={0.92}
              />
            </mesh>

            {/* Vertical Mullion Bars - Front Window Grid */}
            {[-1.6, -0.96, -0.32, 0.32, 0.96, 1.6].map((mx, mIdx) => (
              <mesh
                key={`fm-m-${mIdx}`}
                position={[mx, 0, BUILDING_DEPTH / 2 + 0.025]}
                castShadow
                geometry={geos.mullionVertical}
              >
                <meshStandardMaterial color={palette.darkFrame} roughness={0.5} />
              </mesh>
            ))}

            {/* Vertical Mullion Bars - Side Window Grid */}
            {[-1.4, -0.7, 0, 0.7, 1.4].map((mz, mIdx) => (
              <mesh
                key={`sm-m-${mIdx}`}
                position={[-BUILDING_WIDTH / 2 - 0.025, 0, mz]}
                castShadow
                geometry={geos.mullionVertical}
              >
                <meshStandardMaterial color={palette.darkFrame} roughness={0.5} />
              </mesh>
            ))}

            {/* Window Louver Panels */}
            {[-1.28, -0.64, 0, 0.64, 1.28].map((bx, bIdx) => (
              <mesh
                key={`b-f-${bIdx}`}
                position={[bx, 0, BUILDING_DEPTH / 2 - 0.02]}
                geometry={geos.windowBlind}
              >
                <meshStandardMaterial
                  color="#faeed6"
                  emissive="#ffaa33"
                  emissiveIntensity={0.55 + ((bIdx + floorIdx) % 3) * 0.25}
                  roughness={0.9}
                  transparent
                  opacity={0.72}
                />
              </mesh>
            ))}

            {/* Interior Glow per Floor */}
            <pointLight
              position={[0, 0, 0]}
              intensity={isTwilight ? 1.5 : 1.0}
              distance={4.2}
              color="#ffb84d"
            />
          </group>
        );
      })}

      {/* 4. SOLID CONCRETE RIGHT & REAR FRAME */}
      <group
        ref={sideWallRef}
        position={[BUILDING_WIDTH / 2 + CORE_WALL_THICKNESS / 2, 1.05, 0]}
      >
        {/* Right Wall */}
        <mesh castShadow receiveShadow geometry={geos.sideCoreWall}>
          <meshStandardMaterial color={palette.concrete} roughness={0.75} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[geos.sideCoreWall]} />
          <lineBasicMaterial color={palette.concreteEdge} />
        </lineSegments>

        {/* Rear Wall */}
        <mesh
          position={[-(BUILDING_WIDTH / 2), 0, -BUILDING_DEPTH / 2 - 0.08]}
          castShadow
          receiveShadow
          geometry={geos.rearWall}
        >
          <meshStandardMaterial color={palette.concrete} roughness={0.8} />
        </mesh>

        {/* Wall Sconces */}
        {[-1.5, -0.75, 0, 0.75, 1.5, 2.2].map((sy, sIdx) => (
          <mesh
            key={`sconce-${sIdx}`}
            position={[CORE_WALL_THICKNESS / 2 + 0.025, sy, 0]}
            geometry={geos.sconceLight}
          >
            <meshStandardMaterial
              color={palette.sconce}
              emissive={palette.sconce}
              emissiveIntensity={isTwilight ? 3.0 : 1.8}
            />
          </mesh>
        ))}
      </group>

      {/* 5. ROOFTOP CANOPY & BEVELED CORNICE */}
      <group
        ref={roofRef}
        position={[0, -0.38 + UPPER_FLOORS_COUNT * FLOOR_HEIGHT + 0.1, 0]}
      >
        {/* Beveled Parapet */}
        <mesh castShadow receiveShadow geometry={geos.roofBevel}>
          <meshStandardMaterial color={palette.concrete} roughness={0.7} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[geos.roofBevel]} />
          <lineBasicMaterial color={palette.concreteEdge} />
        </lineSegments>

        {/* Roof Deck */}
        <mesh position={[0, 0.17, 0]} receiveShadow geometry={geos.roofDeck}>
          <meshStandardMaterial color="#646b73" roughness={0.9} />
        </mesh>

        {/* Under-Parapet Cove Light */}
        <mesh position={[0, -0.17, 0]} geometry={geos.roofCoveGlow}>
          <meshStandardMaterial
            color={palette.coveLight}
            emissive={palette.coveLight}
            emissiveIntensity={isTwilight ? 2.8 : 1.9}
            roughness={0.2}
          />
        </mesh>
        <pointLight position={[0, -0.2, 0]} intensity={2.0} distance={3.8} color="#ffa500" />
      </group>
    </group>
  );
}

export default function ThreeScene({ progress, isTwilight = false }: Props) {
  const bg = isTwilight ? "#0d1017" : "#efece6";

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [7.8, 5.0, 7.8], fov: 29 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 14, 30]} />

      {/* Studio Lighting */}
      <ambientLight intensity={isTwilight ? 0.45 : 0.85} />

      <directionalLight
        position={[7.5, 13, 5.5]}
        intensity={isTwilight ? 1.0 : 1.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      <directionalLight
        position={[-6, 7, -5]}
        intensity={isTwilight ? 0.4 : 0.65}
        color={isTwilight ? "#7189a8" : "#fff8ee"}
      />

      <CommercialBuildingModel progress={progress} isTwilight={isTwilight} />
    </Canvas>
  );
}
