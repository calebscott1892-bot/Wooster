"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Grid } from "@react-three/drei";
import * as THREE from "three";

// ── Config ──────────────────────────────────────────────
const PRINT_DURATION = 16;
const CLIP_MIN = -0.02;
const CLIP_MAX = 1.18; // top of the tallest part — the print ends exactly when the model does
const HOT_BAND = 0.07;
const TOTAL_LAYERS = 710; // 142mm @ 0.2mm layer height
const HEIGHT_MM = 142;
const CAM_TARGET = new THREE.Vector3(-0.5, 0.5, 0);
const CAM_START: [number, number, number] = [4.4, 2.8, 5.5];
const CAM_END = new THREE.Vector3(3.0, 2.0, 4.0);

// ── Label data ──────────────────────────────────────────
interface LabelDef {
  id: string;
  name: string;
  model: string;
  fn: string;
  /** Position ON the part — orange dot rendered here */
  pos: [number, number, number];
  /** Y threshold — dot appears when clip plane passes this */
  printY: number;
}

const LABELS: LabelDef[] = [
  {
    id: "clips",
    name: "WC-310 RETENTION CLIPS",
    model: "WC-310-BLK (×2)",
    fn: "Hook-profile clips — lock mounting plates to board rail",
    pos: [0, 0.1, -0.75],
    printY: 0.18,
  },
  {
    id: "washers",
    name: "WC-420 SS WASHERS",
    model: "M5 316SS (×3)",
    fn: "Load-distribution washers — prevent composite delamination",
    pos: [1.1, 0.04, -0.5],
    printY: 0.06,
  },
  {
    id: "mount-plate",
    name: "WC-210 MOUNT BASE",
    model: "WC-210-BLK",
    fn: "Sensor base plate — locating dowel + retention clip interface",
    pos: [-0.25, 0.12, 0.85],
    printY: 0.18,
  },
  {
    id: "mount-cradle",
    name: "WC-220 MOUNT CRADLE",
    model: "WC-220-BLK",
    fn: "Elongated sensor cradle — secure snap-fit WOO sensor housing",
    pos: [0.32, 0.12, 0.85],
    printY: 0.2,
  },
  {
    id: "bolts",
    name: "WC-410 SS BOLTS",
    model: "M5×25 316SS (×3)",
    fn: "Marine-grade 316 stainless steel — torque-rated fasteners",
    pos: [-1.1, 0.2, -0.5],
    printY: 0.4,
  },
  {
    id: "handle",
    name: "WC-100 CORE HANDLE",
    model: "WC-100-BLK",
    fn: "Primary grip interface — precision-printed PETG/ASA monolithic frame",
    pos: [0, 1.0, 0.2],
    printY: 1.0,
  },
];

// ── Part geometry definitions (absolute positions) ──────
type PartDef = {
  make: () => THREE.BufferGeometry;
  pos: [number, number, number];
  rot?: [number, number, number];
};

const box =
  (...args: ConstructorParameters<typeof THREE.BoxGeometry>) =>
  () =>
    new THREE.BoxGeometry(...args);
const cyl =
  (...args: ConstructorParameters<typeof THREE.CylinderGeometry>) =>
  () =>
    new THREE.CylinderGeometry(...args);
const torus =
  (...args: ConstructorParameters<typeof THREE.TorusGeometry>) =>
  () =>
    new THREE.TorusGeometry(...args);

const PART_DEFS: PartDef[] = [
  // ═══ WC-100 core handle ═══
  { make: box(0.18, 0.88, 0.34, 1, 10, 1), pos: [-0.52, 0.44, 0] },
  { make: box(0.22, 0.88, 0.12, 1, 10, 1), pos: [-0.52, 0.44, -0.12] },
  { make: box(0.3, 0.08, 0.46), pos: [-0.52, 0.04, 0] },
  { make: box(0.22, 0.88, 0.38, 1, 10, 1), pos: [0.52, 0.44, 0] },
  { make: box(0.28, 0.08, 0.44), pos: [0.52, 0.04, 0] },
  { make: box(0.06, 0.08, 0.14), pos: [0.38, 0.04, 0.14] },
  { make: box(1.26, 0.28, 0.38, 5, 3, 1), pos: [0, 1.0, 0] },
  { make: box(0.32, 0.28, 0.46, 1, 3, 1), pos: [0.48, 1.0, 0.04] },
  { make: box(0.8, 0.02, 0.3, 3, 1, 1), pos: [0.1, 1.15, 0] },
  // ═══ WOO mount pieces ═══
  { make: box(0.28, 0.12, 0.28, 2, 1, 2), pos: [-0.25, 0.06, 0.85] },
  { make: cyl(0.035, 0.035, 0.02, 8, 1), pos: [-0.25, 0.12, 0.85] },
  { make: box(0.58, 0.12, 0.26, 3, 1, 1), pos: [0.32, 0.06, 0.85] },
  { make: box(0.58, 0.05, 0.04, 3, 1, 1), pos: [0.32, 0.14, 0.74] },
  { make: box(0.58, 0.05, 0.04, 3, 1, 1), pos: [0.32, 0.14, 0.96] },
  { make: box(0.1, 0.08, 0.16), pos: [0.54, 0.14, 0.85] },
  { make: box(0.06, 0.12, 0.04), pos: [0.58, 0.06, 0.73] },
  // ═══ Retention clips (mirrored pair) ═══
  { make: box(0.3, 0.06, 0.1, 2, 1, 1), pos: [-0.18, 0.03, -0.75] },
  { make: box(0.08, 0.14, 0.1, 1, 2, 1), pos: [-0.08, 0.11, -0.75] },
  { make: box(0.1, 0.04, 0.1), pos: [-0.12, 0.17, -0.75] },
  { make: box(0.3, 0.06, 0.1, 2, 1, 1), pos: [0.18, 0.03, -0.75] },
  { make: box(0.08, 0.14, 0.1, 1, 2, 1), pos: [0.08, 0.11, -0.75] },
  { make: box(0.1, 0.04, 0.1), pos: [0.12, 0.17, -0.75] },
  // ═══ Bolts ═══
  { make: cyl(0.028, 0.028, 0.34, 6, 5), pos: [-1.1, 0.18, -0.5] },
  { make: cyl(0.06, 0.06, 0.04, 6, 1), pos: [-1.1, 0.37, -0.5] },
  { make: cyl(0.028, 0.028, 0.34, 6, 5), pos: [-0.98, 0.18, -0.32] },
  { make: cyl(0.06, 0.06, 0.04, 6, 1), pos: [-0.98, 0.37, -0.32] },
  { make: cyl(0.028, 0.028, 0.34, 6, 5), pos: [-1.2, 0.18, -0.3] },
  { make: cyl(0.06, 0.06, 0.04, 6, 1), pos: [-1.2, 0.37, -0.3] },
  // ═══ Washers ═══
  { make: torus(0.055, 0.015, 4, 14), pos: [1.1, 0.015, -0.5], rot: [Math.PI / 2, 0, 0] },
  { make: torus(0.055, 0.015, 4, 14), pos: [1.24, 0.015, -0.38], rot: [Math.PI / 2, 0, 0] },
  { make: torus(0.055, 0.015, 4, 14), pos: [1.04, 0.015, -0.34], rot: [Math.PI / 2, 0, 0] },
];

// Part-cluster footprints — the nozzle travels between clusters whose
// Y range contains the current print height
const PART_ANCHORS = [
  { x: -0.52, z: 0, r: 0.16, y0: 0, y1: 0.9 },
  { x: 0.52, z: 0, r: 0.18, y0: 0, y1: 0.9 },
  { x: 0, z: 0, r: 0.6, y0: 0.86, y1: 1.16 },
  { x: 0.1, z: 0.85, r: 0.3, y0: 0, y1: 0.2 },
  { x: 0, z: -0.75, r: 0.2, y0: 0, y1: 0.19 },
  { x: -1.1, z: -0.5, r: 0.15, y0: 0, y1: 0.39 },
  { x: 1.1, z: -0.5, r: 0.18, y0: 0, y1: 0.04 },
];

// Radial-gradient sprite texture — fake bloom for the nozzle tip
function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,170,80,0.8)");
  g.addColorStop(1, "rgba(255,107,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ── Pulsing 3D orange dot ───────────────────────────────
function DotMarker({
  position,
  onClick,
  isActive,
  clipPlane,
}: {
  position: [number, number, number];
  onClick: () => void;
  isActive: boolean;
  clipPlane: THREE.Plane;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        transparent: true,
        opacity: 0.9,
        clippingPlanes: [clipPlane],
      }),
    [clipPlane]
  );

  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const base = isActive || hovered ? 1.5 : 1;
      const s = base + Math.sin(clock.getElapsedTime() * 3) * 0.2;
      ref.current.scale.setScalar(s);
      mat.opacity = isActive || hovered ? 1 : 0.9;
    }
  });

  return (
    <mesh
      ref={ref}
      position={position}
      material={mat}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <sphereGeometry args={[0.04, 16, 16]} />
    </mesh>
  );
}

// ── Spy-line label — bigger, thicker, to the side ───────
function SpyLabel({
  label,
  isActive,
}: {
  label: LabelDef;
  isActive: boolean;
}) {
  const [phase, setPhase] = useState<"hidden" | "line1" | "line2" | "line3" | "open">("hidden");
  const timerChain = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timerChain.current.forEach(clearTimeout);
    timerChain.current = [];
  };

  useEffect(() => {
    clearTimers();
    if (isActive) {
      setPhase("line1");
      timerChain.current.push(setTimeout(() => setPhase("line2"), 100));
      timerChain.current.push(setTimeout(() => setPhase("line3"), 200));
      timerChain.current.push(setTimeout(() => setPhase("open"), 300));
    } else {
      setPhase("hidden");
    }
    return clearTimers;
  }, [isActive]);

  if (!isActive && phase === "hidden") return null;

  const showH1 = phase !== "hidden";
  const showV = phase === "line2" || phase === "line3" || phase === "open";
  const showH2 = phase === "line3" || phase === "open";
  const showCard = phase === "open";

  return (
    <Html position={label.pos} style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
      <div style={{ position: "absolute", left: 10, top: -6 }}>
        {/* Horizontal line 1 — extends right from dot */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: 2,
            width: showH1 ? 50 : 0,
            background: "#FF6B00",
            boxShadow: "0 0 6px rgba(255,107,0,0.4)",
            transition: "width 0.1s ease-out",
          }}
        />
        {/* Vertical line — goes up */}
        <div
          style={{
            position: "absolute",
            left: 50,
            top: showV ? -36 : 0,
            width: 2,
            height: showV ? 36 : 0,
            background: "linear-gradient(to top, #FF6B00, rgba(255,107,0,0.5))",
            boxShadow: "0 0 4px rgba(255,107,0,0.3)",
            transition: "height 0.1s ease-out, top 0.1s ease-out",
          }}
        />
        {/* Horizontal line 2 — shelf extending right */}
        <div
          style={{
            position: "absolute",
            left: 50,
            top: -36,
            height: 2,
            width: showH2 ? 30 : 0,
            background: "rgba(255,107,0,0.7)",
            boxShadow: "0 0 4px rgba(255,107,0,0.2)",
            transition: "width 0.1s ease-out",
          }}
        />
        {/* Info card — much bigger text */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: -48,
            opacity: showCard ? 1 : 0,
            transform: showCard ? "translateX(0)" : "translateX(-8px)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
            pointerEvents: showCard ? "auto" : "none",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "2px solid #FF6B00",
              borderRadius: "0 4px 4px 4px",
              padding: "8px 14px",
              whiteSpace: "nowrap",
              userSelect: "none",
              minWidth: 160,
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.95)",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {label.name}
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#FF6B00",
                letterSpacing: "0.08em",
                marginTop: 4,
                opacity: 0.8,
              }}
            >
              {label.model}
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "rgba(192,192,192,0.6)",
                letterSpacing: "0.02em",
                lineHeight: 1.5,
                whiteSpace: "normal",
                maxWidth: 220,
                marginTop: 4,
              }}
            >
              {label.fn}
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}

// ── Print gantry — rails, crossbar and a travelling nozzle ──
function Gantry({
  planeBelow,
  nozzleWorld,
}: {
  planeBelow: THREE.Plane;
  nozzleWorld: THREE.Vector3;
}) {
  const rootRef = useRef<THREE.Group>(null!);
  const liftRef = useRef<THREE.Group>(null!);
  const carriageRef = useRef<THREE.Group>(null!);
  const armRef = useRef<THREE.Mesh>(null!);
  const nozzleRef = useRef<THREE.Group>(null!);
  const spriteRef = useRef<THREE.Sprite>(null!);

  const glowTex = useMemo(() => makeGlowTexture(), []);
  const mats = useMemo(() => {
    const metal = new THREE.MeshStandardMaterial({
      color: 0x17181c,
      metalness: 0.7,
      roughness: 0.35,
      transparent: true,
    });
    const accent = new THREE.MeshBasicMaterial({
      color: 0xff7b1c,
      transparent: true,
      opacity: 0.95,
    });
    const sprite = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffa050,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { metal, accent, sprite };
  }, [glowTex]);

  useEffect(() => {
    return () => {
      glowTex.dispose();
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [glowTex, mats]);

  // Nozzle travel state — smoothed XZ position chasing a wandering target
  const sim = useRef({
    nx: -0.52,
    nz: 0,
    tx: -0.52,
    tz: 0,
    nextAt: 0,
    liftY: CLIP_MIN,
    fade: 1,
  });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = clock.getElapsedTime();
    const s = sim.current;
    const y = planeBelow.constant;
    const printing = y < CLIP_MAX - 0.001;

    if (printing) {
      // Retarget toward a random spot on a cluster being printed at this height
      if (elapsed > s.nextAt) {
        const valid = PART_ANCHORS.filter((a) => y >= a.y0 && y <= a.y1);
        if (valid.length > 0) {
          const a = valid[Math.floor(Math.random() * valid.length)];
          s.tx = THREE.MathUtils.clamp(a.x + (Math.random() - 0.5) * a.r * 1.4, -1.5, 1.5);
          s.tz = THREE.MathUtils.clamp(a.z + (Math.random() - 0.5) * a.r * 1.4, -1.5, 1.5);
        }
        s.nextAt = elapsed + 0.45 + Math.random() * 0.7;
      }
      s.liftY = y;
    } else {
      // Print finished — park the gantry up top and fade it away
      s.liftY += (1.66 - s.liftY) * (1 - Math.exp(-2.2 * dt));
      s.fade = Math.max(0, s.fade - dt / 1.1);
    }

    const k = 1 - Math.exp(-7 * dt);
    s.nx += (s.tx - s.nx) * k;
    s.nz += (s.tz - s.nz) * k;

    nozzleWorld.set(s.nx, y, s.nz);

    if (liftRef.current) liftRef.current.position.y = s.liftY;
    if (carriageRef.current) carriageRef.current.position.x = s.nx;
    if (armRef.current) {
      armRef.current.scale.z = Math.max(Math.abs(s.nz) + 0.02, 0.02);
      armRef.current.position.z = s.nz / 2;
    }
    if (nozzleRef.current) nozzleRef.current.position.set(s.nx, 0.005, s.nz);
    if (spriteRef.current) {
      spriteRef.current.material.opacity =
        (printing ? 0.55 + Math.sin(elapsed * 14) * 0.25 : 0) * s.fade;
    }

    mats.metal.opacity = s.fade;
    mats.accent.opacity = 0.95 * s.fade;
    if (rootRef.current) rootRef.current.visible = s.fade > 0.001;
  });

  return (
    <group ref={rootRef}>
      {/* Vertical rails + top beam */}
      <mesh position={[-1.78, 0.86, 0]} material={mats.metal}>
        <boxGeometry args={[0.05, 1.72, 0.05]} />
      </mesh>
      <mesh position={[1.78, 0.86, 0]} material={mats.metal}>
        <boxGeometry args={[0.05, 1.72, 0.05]} />
      </mesh>
      <mesh position={[0, 1.74, 0]} material={mats.metal}>
        <boxGeometry args={[3.61, 0.05, 0.05]} />
      </mesh>

      {/* Lift group — follows the print line */}
      <group ref={liftRef} position={[0, CLIP_MIN, 0]}>
        {/* Crossbar */}
        <mesh position={[0, 0.16, 0]} material={mats.metal}>
          <boxGeometry args={[3.56, 0.035, 0.035]} />
        </mesh>
        {/* Carriage + Z arm */}
        <group ref={carriageRef} position={[-0.52, 0.16, 0]}>
          <mesh material={mats.metal}>
            <boxGeometry args={[0.12, 0.07, 0.09]} />
          </mesh>
          <mesh ref={armRef} position={[0, -0.045, 0]} material={mats.metal}>
            <boxGeometry args={[0.03, 0.03, 1]} />
          </mesh>
        </group>
        {/* Nozzle assembly — tip sits on the print line */}
        <group ref={nozzleRef} position={[-0.52, 0.005, 0]}>
          <mesh position={[0, 0.085, 0]} material={mats.metal}>
            <cylinderGeometry args={[0.035, 0.05, 0.07, 8]} />
          </mesh>
          <mesh position={[0, 0.028, 0]} material={mats.accent}>
            <cylinderGeometry args={[0.012, 0.028, 0.045, 8]} />
          </mesh>
          <sprite ref={spriteRef} scale={[0.18, 0.18, 1]} material={mats.sprite} />
        </group>
      </group>
    </group>
  );
}

// ── Spark particles — embers flying off the nozzle ──────
function Sparks({
  planeBelow,
  nozzleWorld,
}: {
  planeBelow: THREE.Plane;
  nozzleWorld: THREE.Vector3;
}) {
  const COUNT = 80;
  const pointsRef = useRef<THREE.Points>(null!);
  const sim = useMemo(
    () => ({
      vel: new Float32Array(COUNT * 3),
      life: new Float32Array(COUNT),
    }),
    []
  );
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) arr[i * 3 + 1] = -10; // park off-screen
    return arr;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const y = planeBelow.constant;
    const printing = y > 0.005 && y < CLIP_MAX - 0.01;

    for (let i = 0; i < COUNT; i++) {
      sim.life[i] -= dt;
      const i3 = i * 3;
      if (sim.life[i] <= 0) {
        if (printing) {
          positions[i3] = nozzleWorld.x + (Math.random() - 0.5) * 0.04;
          positions[i3 + 1] = nozzleWorld.y + Math.random() * 0.02;
          positions[i3 + 2] = nozzleWorld.z + (Math.random() - 0.5) * 0.04;
          sim.vel[i3] = (Math.random() - 0.5) * 0.5;
          sim.vel[i3 + 1] = 0.4 + Math.random() * 0.8;
          sim.vel[i3 + 2] = (Math.random() - 0.5) * 0.5;
          sim.life[i] = 0.18 + Math.random() * 0.4;
        } else {
          positions[i3 + 1] = -10;
        }
      } else {
        positions[i3] += sim.vel[i3] * dt;
        positions[i3 + 1] += sim.vel[i3 + 1] * dt;
        positions[i3 + 2] += sim.vel[i3 + 2] * dt;
        sim.vel[i3 + 1] -= 2.4 * dt;
      }
    }
    const attr = pointsRef.current?.geometry.getAttribute("position");
    if (attr) attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={0xffb066}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ── Print scene ─────────────────────────────────────────
function PrintScene({
  onProgress,
  onComplete,
  onInteractStart,
  onInteractEnd,
  activeId,
  onDotClick,
  autoRotate,
}: {
  onProgress: (t: number, y: number) => void;
  onComplete: () => void;
  onInteractStart?: () => void;
  onInteractEnd?: () => void;
  activeId: string | null;
  onDotClick: (id: string) => void;
  autoRotate: boolean;
}) {
  // Clipping planes — `below` keeps what's printed, `above` keeps the unprinted preview
  const planes = useMemo(
    () => ({
      below: new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_MIN),
      above: new THREE.Plane(new THREE.Vector3(0, 1, 0), -CLIP_MIN),
      hotAbove: new THREE.Plane(new THREE.Vector3(0, 1, 0), -(CLIP_MIN - HOT_BAND)),
    }),
    []
  );

  // Shared nozzle position — written by the gantry, read by the sparks
  const nozzleWorld = useMemo(() => new THREE.Vector3(-0.52, CLIP_MIN, 0), []);

  const mats = useMemo(() => {
    const solid = new THREE.MeshStandardMaterial({
      color: 0x2a2b31,
      roughness: 0.38,
      metalness: 0.45,
      emissive: new THREE.Color(0xff6b00),
      emissiveIntensity: 0,
      clippingPlanes: [planes.below],
    });
    // FDM layer striations — horizontal bands by world height, fading with distance
    solid.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vWY;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvWY = (modelMatrix * vec4(position, 1.0)).y;"
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vWY;")
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          {
            float band = 0.5 + 0.5 * sin(vWY * 140.0);
            float bandFade = clamp(1.0 - (length(vViewPosition) - 2.5) / 5.0, 0.0, 1.0);
            diffuseColor.rgb *= mix(1.0, 0.86 + 0.14 * band, bandFade);
          }`
        );
    };
    const wire = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xffffff,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      clippingPlanes: [planes.below],
    });
    const ghost = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x9fb4cc,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      clippingPlanes: [planes.above],
    });
    const hot = new THREE.MeshBasicMaterial({
      color: 0xff8a2a,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      clippingPlanes: [planes.below, planes.hotAbove],
    });
    const frame = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shock = new THREE.MeshBasicMaterial({
      color: 0xff8a2a,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { solid, wire, ghost, hot, frame, shock };
  }, [planes]);

  const geos = useMemo(() => PART_DEFS.map((d) => d.make()), []);

  useEffect(() => {
    return () => {
      geos.forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [geos, mats]);

  const glowRef = useRef<THREE.Mesh>(null!);
  const frameRef = useRef<THREE.Group>(null!);
  const shockRef = useRef<THREE.Mesh>(null!);
  const printLightRef = useRef<THREE.PointLight>(null!);
  const done = useRef(false);
  const flashStart = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useFrame(({ clock }) => {
    // Local start time so the animation begins from mount/reset
    if (startTime.current === null) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;
    const t = Math.min(elapsed / PRINT_DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 2.5);
    const y = CLIP_MIN + eased * (CLIP_MAX - CLIP_MIN);

    planes.below.constant = y;
    planes.above.constant = -y;
    planes.hotAbove.constant = -(y - HOT_BAND);
    onProgress(t, y);

    if (glowRef.current) {
      glowRef.current.position.y = y;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = t < 1 ? 0.05 + Math.sin(elapsed * 8) * 0.02 : 0;
    }

    if (frameRef.current) {
      frameRef.current.position.y = y;
      frameRef.current.visible = t < 1;
      mats.frame.opacity = 0.22 + Math.sin(elapsed * 6) * 0.08;
    }

    if (printLightRef.current) {
      // The print light shadows the nozzle, not just the centre of the bed
      printLightRef.current.position.set(nozzleWorld.x, y + 0.12, nozzleWorld.z);
      printLightRef.current.intensity = t < 1 ? 2.4 : Math.max(0.5, printLightRef.current.intensity - 0.04);
    }

    if (t >= 1 && !done.current) {
      done.current = true;
      flashStart.current = elapsed;
      onComplete();
    }

    // Completion payoff — emissive surge cools off, hot band fades, shockwave rolls out
    if (flashStart.current !== null) {
      const ft = Math.min((elapsed - flashStart.current) / 1.2, 1);
      mats.solid.emissiveIntensity = (1 - ft) * 0.7;
      mats.hot.opacity = 0.9 * (1 - ft);
      mats.wire.opacity = 0.07 + (1 - ft) * 0.12;
      if (shockRef.current) {
        const kt = Math.min(ft * 1.35, 1);
        const scale = 0.6 + kt * 2.8;
        shockRef.current.scale.setScalar(scale);
        mats.shock.opacity = 0.5 * (1 - kt);
      }
      if (ft >= 1) flashStart.current = null;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <directionalLight position={[-5, 3, -4]} intensity={0.4} color="#7d96c8" />
      <pointLight
        ref={printLightRef}
        color="#ff7b1c"
        intensity={2.4}
        distance={3.5}
        decay={2}
        position={[0, 0, 0.15]}
      />

      {/* Build plate */}
      <mesh position={[0, -0.037, 0]}>
        <boxGeometry args={[4.7, 0.05, 4.7]} />
        <meshStandardMaterial color={0x141519} metalness={0.55} roughness={0.5} />
      </mesh>

      {/* Plate grid — fading engineering lines */}
      <Grid
        position={[0, -0.008, 0]}
        args={[4.4, 4.4]}
        cellSize={0.2}
        cellThickness={0.6}
        cellColor="#1d1d1f"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#33291f"
        fadeDistance={13}
        fadeStrength={1.6}
      />

      {/* Print glow plane */}
      <mesh
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, CLIP_MIN, 0]}
      >
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial
          color={0xff6b00}
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Scan frame — thin glowing square tracking the print line */}
      <group ref={frameRef} position={[0, CLIP_MIN, 0]}>
        <mesh position={[0, 0, -1.6]} material={mats.frame}>
          <boxGeometry args={[3.2, 0.008, 0.008]} />
        </mesh>
        <mesh position={[0, 0, 1.6]} material={mats.frame}>
          <boxGeometry args={[3.2, 0.008, 0.008]} />
        </mesh>
        <mesh position={[-1.6, 0, 0]} material={mats.frame}>
          <boxGeometry args={[0.008, 0.008, 3.2]} />
        </mesh>
        <mesh position={[1.6, 0, 0]} material={mats.frame}>
          <boxGeometry args={[0.008, 0.008, 3.2]} />
        </mesh>
      </group>

      {/* Completion shockwave ring */}
      <mesh
        ref={shockRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 0]}
        material={mats.shock}
      >
        <ringGeometry args={[0.92, 1, 48]} />
      </mesh>

      {/* Print gantry + nozzle */}
      <Gantry planeBelow={planes.below} nozzleWorld={nozzleWorld} />

      {/* Parts — solid below print line, layer-line overlay, ghost preview above, molten band */}
      {([mats.solid, mats.wire, mats.ghost, mats.hot] as THREE.Material[]).map(
        (mat, mi) =>
          PART_DEFS.map((d, pi) => (
            <mesh
              key={`${mi}-${pi}`}
              geometry={geos[pi]}
              material={mat}
              position={d.pos}
              rotation={d.rot}
            />
          ))
      )}

      {/* Sparks off the nozzle */}
      <Sparks planeBelow={planes.below} nozzleWorld={nozzleWorld} />

      {/* Orange dots — clipped by the same plane so each appears as it's printed */}
      {LABELS.map((l) => (
        <DotMarker
          key={`dot-${l.id}`}
          position={l.pos}
          isActive={activeId === l.id}
          onClick={() => onDotClick(l.id)}
          clipPlane={planes.below}
        />
      ))}

      {/* Spy-line labels */}
      {LABELS.map((l) => (
        <SpyLabel key={`spy-${l.id}`} label={l} isActive={activeId === l.id} />
      ))}

      {/* Camera controls */}
      <OrbitControls
        target={CAM_TARGET}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={2.5}
        maxDistance={8}
        enableDamping
        dampingFactor={0.04}
        onStart={() => onInteractStart?.()}
        onEnd={() => onInteractEnd?.()}
      />
    </>
  );
}

// ── Camera intro dolly — eases in from afar, once ───────
function IntroDolly({ onDone, skip }: { onDone: () => void; skip: boolean }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const from = useMemo(() => new THREE.Vector3(...CAM_START), []);
  const finished = useRef(false);

  useFrame((_, delta) => {
    if (finished.current) return;
    if (skip) {
      finished.current = true;
      onDone();
      return;
    }
    progress.current = Math.min(progress.current + delta / 2.4, 1);
    const eased = 1 - Math.pow(1 - progress.current, 3);
    camera.position.lerpVectors(from, CAM_END, eased);
    if (progress.current >= 1) {
      finished.current = true;
      onDone();
    }
  });

  return null;
}

// ── Zoom controller ─────────────────────────────────────
function ZoomController({ zoomZoneRef }: { zoomZoneRef: React.RefObject<HTMLDivElement | null> }) {
  const { camera } = useThree();
  const target = useMemo(() => CAM_TARGET.clone(), []);

  useEffect(() => {
    const zone = zoomZoneRef.current;
    if (!zone) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const cam = camera as THREE.PerspectiveCamera;
      const dir = new THREE.Vector3().subVectors(cam.position, target).normalize();
      const step = e.deltaY > 0 ? 0.3 : -0.3;
      cam.position.addScaledVector(dir, step);
      const dist = cam.position.distanceTo(target);
      if (dist < 2.5) cam.position.copy(target).addScaledVector(dir, 2.5);
      if (dist > 8) cam.position.copy(target).addScaledVector(dir, 8);
    };

    zone.addEventListener("wheel", handleWheel, { passive: false });
    return () => zone.removeEventListener("wheel", handleWheel);
  }, [camera, zoomZoneRef, target]);

  return null;
}

// ── Main export ─────────────────────────────────────────
export default function PrintAnimation3D({
  onInteractStart,
  onInteractEnd,
}: {
  onInteractStart?: () => void;
  onInteractEnd?: () => void;
}) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [printKey, setPrintKey] = useState(0);
  const [printDone, setPrintDone] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const zoomZoneRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // HUD nodes — written directly from the frame loop, no React re-renders
  const hudBarRef = useRef<HTMLDivElement>(null);
  const hudLayerRef = useRef<HTMLSpanElement>(null);
  const hudZRef = useRef<HTMLSpanElement>(null);
  const hudPctRef = useRef<HTMLSpanElement>(null);
  const hudTempRef = useRef<HTMLSpanElement>(null);
  const lastLayer = useRef(-1);
  const cycleIdx = useRef(0);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const handleComplete = useCallback(() => {
    setPrintDone(true);
    if (hudBarRef.current) hudBarRef.current.style.width = "100%";
    if (hudLayerRef.current) hudLayerRef.current.textContent = String(TOTAL_LAYERS).padStart(4, "0");
    if (hudPctRef.current) hudPctRef.current.textContent = "100%";
  }, []);

  const handleProgress = useCallback((t: number, y: number) => {
    const frac = Math.min(Math.max((y - CLIP_MIN) / (CLIP_MAX - CLIP_MIN), 0), 1);
    const layer = Math.floor(frac * TOTAL_LAYERS);
    if (layer === lastLayer.current) return;
    lastLayer.current = layer;
    if (hudBarRef.current) hudBarRef.current.style.width = `${frac * 100}%`;
    if (hudLayerRef.current) hudLayerRef.current.textContent = String(layer).padStart(4, "0");
    if (hudZRef.current) hudZRef.current.textContent = `Z ${(frac * HEIGHT_MM).toFixed(1).padStart(5, "0")}MM`;
    if (hudPctRef.current) hudPctRef.current.textContent = `${Math.round(frac * 100)}%`;
    if (hudTempRef.current)
      hudTempRef.current.textContent = `NOZ ${Math.round(231 + Math.sin(layer * 0.37) * 3)}° · BED ${Math.round(83 + Math.sin(layer * 0.11) * 1.5)}°`;
  }, []);

  // After the print completes, showcase the components one by one until
  // the visitor takes over (drags the model or taps a marker).
  useEffect(() => {
    if (!printDone || userEngaged) return;
    const id = setInterval(() => {
      setActiveLabel(LABELS[cycleIdx.current % LABELS.length].id);
      cycleIdx.current += 1;
    }, 3200);
    return () => clearInterval(id);
  }, [printDone, userEngaged]);

  const handleDotClick = useCallback((id: string) => {
    setUserEngaged(true);
    setActiveLabel((prev) => (prev === id ? null : id));
  }, []);

  const handleInteractStart = useCallback(() => {
    setUserEngaged(true);
    onInteractStart?.();
  }, [onInteractStart]);

  const handleReprint = useCallback(() => {
    setPrintDone(false);
    setUserEngaged(false);
    setActiveLabel(null);
    cycleIdx.current = 0;
    lastLayer.current = -1;
    setPrintKey((k) => k + 1);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: CAM_START, fov: 28, near: 0.1, far: 50 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
      >
        <PrintScene
          key={printKey}
          onProgress={handleProgress}
          onComplete={handleComplete}
          onInteractStart={handleInteractStart}
          onInteractEnd={onInteractEnd}
          activeId={activeLabel}
          onDotClick={handleDotClick}
          autoRotate={introDone}
        />
        <IntroDolly onDone={() => setIntroDone(true)} skip={userEngaged} />
        <ZoomController zoomZoneRef={zoomZoneRef} />
      </Canvas>

      {/* ── Print status HUD — top right, under the nav ── */}
      <div className="absolute top-20 right-4 lg:top-24 lg:right-10 z-20 pointer-events-none select-none hidden sm:block">
        <div className="w-[230px] rounded-lg bg-black/50 border border-white/[0.08] backdrop-blur-md px-4 py-3 font-mono">
          <div className="flex items-center justify-between text-[9px] tracking-[0.18em]">
            <span className="text-white/35">FDM.PRINT.SEQ</span>
            <span className={printDone ? "text-wooster-orange" : "text-white/60"}>
              <span className={printDone ? "" : "animate-pulse"}>▮</span>{" "}
              {printDone ? "COMPLETE" : "PRINTING"}
            </span>
          </div>
          <div className="mt-2.5 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              ref={hudBarRef}
              className="h-full w-0 rounded-full bg-gradient-to-r from-wooster-orange-dim via-wooster-orange to-wooster-orange-glow shadow-[0_0_8px_rgba(255,107,0,0.5)]"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[9px] tracking-[0.08em] text-white/35">
            <span>
              LYR <span ref={hudLayerRef} className="text-white/75">0000</span>
              <span className="text-white/25">/{TOTAL_LAYERS}</span>
            </span>
            <span ref={hudZRef}>Z 000.0MM</span>
            <span ref={hudPctRef} className="text-wooster-orange">0%</span>
          </div>
          <div className="mt-1.5 text-[9px] tracking-[0.08em] text-white/30">
            {printDone ? (
              <span>NOZ COOLING · BED COOLING</span>
            ) : (
              <span ref={hudTempRef}>NOZ ---° · BED ---°</span>
            )}
          </div>
          {printDone && (
            <div className="mt-2 pt-2 border-t border-white/[0.06] text-[9px] tracking-[0.15em] text-white/45">
              <span className="text-wooster-orange">▸</span> TAP MARKERS TO EXPLORE
            </div>
          )}
        </div>
      </div>

      {/* ── Reprint button — bottom left (icon-only on mobile) ── */}
      <button
        onClick={handleReprint}
        className="absolute bottom-6 left-4 lg:left-10 z-20 flex items-center gap-2 px-3 py-2.5 lg:px-5 rounded-lg bg-black/50 border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-wooster-orange hover:border-wooster-orange/40 hover:bg-black/60 transition-all select-none group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-[-360deg] transition-transform duration-500">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase hidden lg:inline">Reprint</span>
      </button>

      {/* ── Zoom + scroll-to-continue — centred under model ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {!isMobile ? (
          <div
            ref={zoomZoneRef}
            className="w-[210px] h-[52px] rounded-lg bg-black/50 border border-white/[0.08] backdrop-blur-md flex items-center justify-center cursor-ns-resize select-none hover:bg-black/60 hover:border-wooster-orange/40 transition-all group"
          >
            <span className="font-mono text-[10px] tracking-[0.1em] text-white/35 uppercase group-hover:text-white/60 transition-colors text-center leading-relaxed">
              Hover here &amp; scroll to zoom
            </span>
          </div>
        ) : (
          <div ref={zoomZoneRef} className="flex gap-2 items-center">
            <button
              onClick={() => {
                zoomZoneRef.current?.dispatchEvent(
                  new WheelEvent("wheel", { deltaY: -120, bubbles: false, cancelable: true })
                );
              }}
              className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 text-white/60 text-lg font-mono flex items-center justify-center backdrop-blur-sm active:bg-white/10 transition-colors"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => {
                zoomZoneRef.current?.dispatchEvent(
                  new WheelEvent("wheel", { deltaY: 120, bubbles: false, cancelable: true })
                );
              }}
              className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 text-white/60 text-lg font-mono flex items-center justify-center backdrop-blur-sm active:bg-white/10 transition-colors"
              aria-label="Zoom out"
            >
              −
            </button>
          </div>
        )}

        {/* Divider + scroll hint — desktop only */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-px h-6 bg-white/10" />
          <a
            href="#products"
            className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors"
          >
            <span className="font-mono text-[9px] tracking-[0.1em] uppercase whitespace-nowrap">or scroll down to continue</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
