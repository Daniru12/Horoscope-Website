"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePathname } from "next/navigation";

const GOLD = new THREE.Color("#e7c65a");
const PALE = new THREE.Color("#cfd8ff");

function usePrefersReducedMotion() {
  return useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
}

/** Soft round sprite so stars are discs, not squares. */
function useStarTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.85)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
}

function Stars({ count, reduced }: { count: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const sprite = useStarTexture();

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Points on a thick spherical shell around the camera
      const r = 12 + Math.random() * 38;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 10;
      tmp.copy(PALE).lerp(GOLD, Math.random() < 0.22 ? 0.85 : Math.random() * 0.2);
      tmp.multiplyScalar(0.55 + Math.random() * 0.45);
      col.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const scroll = typeof window === "undefined" ? 0 : window.scrollY;
    if (!reduced) g.rotation.y += dt * 0.012;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, state.pointer.y * 0.06 + scroll * 0.00006, 2.5, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, state.pointer.x * 0.35, 2.5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, scroll * 0.0016, 4, dt);
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <pointsMaterial
          map={sprite}
          size={0.2}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/** Armillary sphere — gold rings, a wireframe core, twelve zodiac stations and orbiting bodies. */
function Armillary({ reduced }: { reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Group>(null);
  const ringB = useRef<THREE.Group>(null);
  const ringC = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const bodies = useRef<THREE.Group>(null);
  const pathname = usePathname();
  const { viewport, size } = useThree();

  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.85 }),
    []
  );
  const faint = useMemo(
    () => new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.45 }),
    []
  );
  const coreMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#8fa3ff", wireframe: true, transparent: true, opacity: 0.28 }),
    []
  );
  const stationGeo = useMemo(() => new THREE.SphereGeometry(0.045, 12, 12), []);
  const stations = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return [Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0] as [number, number, number];
      }),
    []
  );

  const isHome = pathname === "/";

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = reduced ? 0 : 1;
    const scroll = window.scrollY;
    const wide = size.width >= 900;

    if (ringA.current) ringA.current.rotation.z = t * 0.12 * k;
    if (ringB.current) {
      ringB.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.3) * 0.06 * k;
      ringB.current.rotation.z = -t * 0.09 * k;
    }
    if (ringC.current) {
      ringC.current.rotation.y = Math.PI / 3 + t * 0.07 * k;
      ringC.current.rotation.x = Math.PI / 5;
    }
    if (core.current) {
      core.current.rotation.y = t * 0.2 * k;
      core.current.rotation.x = t * 0.1 * k;
    }
    if (bodies.current) bodies.current.rotation.z = t * 0.35 * k;

    const root_ = root.current;
    if (!root_) return;

    // Where the sphere sits: hero → right side (desktop) / behind headline (mobile).
    // Other pages → small, faint, tucked into the top-right corner.
    const heroFade = THREE.MathUtils.clamp(1 - scroll / 700, 0, 1);
    // On phones the sphere is small, pushed to the top corner and dim, so the headline stays clear.
    const targetScale = isHome ? (wide ? 1 : 0.4) * (0.55 + 0.45 * heroFade) : wide ? 0.32 : 0.22;
    const targetX = isHome ? (wide ? viewport.width * 0.22 : viewport.width * 0.28) : viewport.width * 0.36;
    const targetY = isHome
      ? (wide ? 0 : viewport.height * 0.34) + scroll * 0.004
      : viewport.height * 0.34 + scroll * 0.0016;
    const targetOpacity = isHome ? (wide ? 0.9 : 0.42) * (0.25 + 0.75 * heroFade) : wide ? 0.22 : 0.14;

    root_.scale.setScalar(THREE.MathUtils.damp(root_.scale.x, targetScale, 3, dt));
    root_.position.x = THREE.MathUtils.damp(root_.position.x, targetX + state.pointer.x * 0.25, 3, dt);
    root_.position.y = THREE.MathUtils.damp(root_.position.y, targetY + state.pointer.y * 0.18, 3, dt);
    root_.rotation.y = THREE.MathUtils.damp(root_.rotation.y, state.pointer.x * 0.35, 2.5, dt);
    root_.rotation.x = THREE.MathUtils.damp(root_.rotation.x, -state.pointer.y * 0.25, 2.5, dt);

    material.opacity = THREE.MathUtils.damp(material.opacity, targetOpacity, 3, dt);
    faint.opacity = material.opacity * 0.55;
    coreMat.opacity = material.opacity * 0.32;
  });

  return (
    <group ref={root}>
      <mesh ref={core} material={coreMat}>
        <icosahedronGeometry args={[1.05, 1]} />
      </mesh>

      <group ref={ringA}>
        <mesh material={material}>
          <torusGeometry args={[2.2, 0.012, 8, 160]} />
        </mesh>
        {stations.map((p, i) => (
          <mesh key={i} position={p} geometry={stationGeo} material={material} />
        ))}
      </group>

      <group ref={ringB}>
        <mesh material={faint}>
          <torusGeometry args={[1.85, 0.008, 8, 140]} />
        </mesh>
      </group>

      <group ref={ringC}>
        <mesh material={faint}>
          <torusGeometry args={[1.5, 0.008, 8, 120]} />
        </mesh>
        <group ref={bodies}>
          <mesh position={[1.5, 0, 0]} geometry={stationGeo} material={material} scale={1.8} />
          <mesh position={[-1.5, 0, 0]} geometry={stationGeo} material={material} scale={1.2} />
        </group>
      </group>
    </group>
  );
}

export default function CosmicScene() {
  const reduced = usePrefersReducedMotion();
  const count = useMemo(
    () => (typeof window !== "undefined" && window.innerWidth < 768 ? 700 : 1600),
    []
  );

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <Stars count={count} reduced={reduced} />
      <Armillary reduced={reduced} />
    </Canvas>
  );
}
