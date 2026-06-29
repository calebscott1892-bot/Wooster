"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// ── Config ──────────────────────────────────────────────
const PRINT_DURATION = 16;
const CLIP_MIN = -0.02;
const CLIP_MAX = 1.52;

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

// ── Print scene ─────────────────────────────────────────
function PrintScene({
  onClipY,
  onComplete,
  onInteractStart,
  onInteractEnd,
  activeId,
  onDotClick,
  clipPlane,
  printKey,
}: {
  onClipY: (y: number) => void;
  onComplete: () => void;
  onInteractStart?: () => void;
  onInteractEnd?: () => void;
  activeId: string | null;
  onDotClick: (id: string) => void;
  clipPlane: THREE.Plane;
  printKey: number;
}) {
  const wireMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      clippingPlanes: [clipPlane],
    });
  }, [clipPlane]);

  const glowRef = useRef<THREE.Mesh>(null!);
  const done = useRef(false);
  const flashStart = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  // Reset on printKey change
  useEffect(() => {
    done.current = false;
    flashStart.current = null;
    startTime.current = null;
    clipPlane.constant = CLIP_MIN;
    wireMat.color.set(0xffffff);
    wireMat.opacity = 0.55;
  }, [printKey, clipPlane, wireMat]);

  useFrame(({ clock }) => {
    // Use local start time so animation begins from mount/reset
    if (startTime.current === null) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;
    const t = Math.min(elapsed / PRINT_DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 2.5);
    const y = CLIP_MIN + eased * (CLIP_MAX - CLIP_MIN);
    clipPlane.constant = y;
    onClipY(y);

    if (glowRef.current) {
      glowRef.current.position.y = y;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = t < 1 ? 0.06 + Math.sin(elapsed * 8) * 0.02 : 0;
    }

    if (t >= 1 && !done.current) {
      done.current = true;
      flashStart.current = elapsed;
      onComplete();
    }

    if (flashStart.current !== null) {
      const ft = Math.min((elapsed - flashStart.current) / 1.2, 1);
      if (ft < 1) {
        wireMat.color.setRGB(1, 0.42 + ft * 0.58, ft);
        wireMat.opacity = 0.55 + (1 - ft) * 0.3;
      } else {
        wireMat.color.set(0xffffff);
        wireMat.opacity = 0.65;
        flashStart.current = null;
      }
    }
  });

  return (
    <>
      {/* Build plate grid */}
      <gridHelper
        args={[4, 22, 0x222222, 0x181818]}
        position={[0, -0.005, 0]}
      />

      {/* Print glow plane */}
      <mesh
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, CLIP_MIN, 0]}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          color={0xff6b00}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ═══ WOOSTER CORE HANDLE ═══ */}
      <group position={[0, 0, 0]}>
        <mesh position={[-0.52, 0.44, 0]} material={wireMat}>
          <boxGeometry args={[0.18, 0.88, 0.34, 1, 10, 1]} />
        </mesh>
        <mesh position={[-0.52, 0.44, -0.12]} material={wireMat}>
          <boxGeometry args={[0.22, 0.88, 0.12, 1, 10, 1]} />
        </mesh>
        <mesh position={[-0.52, 0.04, 0]} material={wireMat}>
          <boxGeometry args={[0.3, 0.08, 0.46, 1, 1, 1]} />
        </mesh>
        <mesh position={[0.52, 0.44, 0]} material={wireMat}>
          <boxGeometry args={[0.22, 0.88, 0.38, 1, 10, 1]} />
        </mesh>
        <mesh position={[0.52, 0.04, 0]} material={wireMat}>
          <boxGeometry args={[0.28, 0.08, 0.44, 1, 1, 1]} />
        </mesh>
        <mesh position={[0.38, 0.04, 0.14]} material={wireMat}>
          <boxGeometry args={[0.06, 0.08, 0.14, 1, 1, 1]} />
        </mesh>
        <mesh position={[0, 1.0, 0]} material={wireMat}>
          <boxGeometry args={[1.26, 0.28, 0.38, 5, 3, 1]} />
        </mesh>
        <mesh position={[0.48, 1.0, 0.04]} material={wireMat}>
          <boxGeometry args={[0.32, 0.28, 0.46, 1, 3, 1]} />
        </mesh>
        <mesh position={[0.1, 1.15, 0]} material={wireMat}>
          <boxGeometry args={[0.8, 0.02, 0.3, 3, 1, 1]} />
        </mesh>
      </group>

      {/* ═══ WOO MOUNT PIECES ═══ */}
      <group position={[0.1, 0, 0.85]}>
        <mesh position={[-0.35, 0.06, 0]} material={wireMat}>
          <boxGeometry args={[0.28, 0.12, 0.28, 2, 1, 2]} />
        </mesh>
        <mesh position={[-0.35, 0.12, 0]} material={wireMat}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 8, 1]} />
        </mesh>
        <mesh position={[0.22, 0.06, 0]} material={wireMat}>
          <boxGeometry args={[0.58, 0.12, 0.26, 3, 1, 1]} />
        </mesh>
        <mesh position={[0.22, 0.14, -0.11]} material={wireMat}>
          <boxGeometry args={[0.58, 0.05, 0.04, 3, 1, 1]} />
        </mesh>
        <mesh position={[0.22, 0.14, 0.11]} material={wireMat}>
          <boxGeometry args={[0.58, 0.05, 0.04, 3, 1, 1]} />
        </mesh>
        <mesh position={[0.44, 0.14, 0]} material={wireMat}>
          <boxGeometry args={[0.1, 0.08, 0.16, 1, 1, 1]} />
        </mesh>
        <mesh position={[0.48, 0.06, -0.12]} material={wireMat}>
          <boxGeometry args={[0.06, 0.12, 0.04, 1, 1, 1]} />
        </mesh>
      </group>

      {/* ═══ RETENTION CLIPS ═══ */}
      <group position={[0, 0, -0.75]}>
        {[-0.18, 0.18].map((x, i) => (
          <group key={`clip-${i}`} position={[x, 0, 0]} scale={[i === 0 ? 1 : -1, 1, 1]}>
            <mesh position={[0, 0.03, 0]} material={wireMat}>
              <boxGeometry args={[0.3, 0.06, 0.1, 2, 1, 1]} />
            </mesh>
            <mesh position={[0.1, 0.11, 0]} material={wireMat}>
              <boxGeometry args={[0.08, 0.14, 0.1, 1, 2, 1]} />
            </mesh>
            <mesh position={[0.06, 0.17, 0]} material={wireMat}>
              <boxGeometry args={[0.1, 0.04, 0.1, 1, 1, 1]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ═══ BOLTS ═══ */}
      <group position={[-1.1, 0, -0.5]}>
        {[[0,0,0],[0.12,0,0.18],[-0.1,0,0.2]].map((pos, i) => (
          <group key={`bolt-${i}`} position={pos as [number,number,number]}>
            <mesh position={[0, 0.18, 0]} material={wireMat}>
              <cylinderGeometry args={[0.028, 0.028, 0.34, 6, 5]} />
            </mesh>
            <mesh position={[0, 0.37, 0]} material={wireMat}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 6, 1]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ═══ WASHERS ═══ */}
      <group position={[1.1, 0, -0.5]}>
        {[[0,0,0],[0.14,0,0.12],[-0.06,0,0.16]].map((pos, i) => (
          <group key={`washer-${i}`} position={pos as [number,number,number]}>
            <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]} material={wireMat}>
              <torusGeometry args={[0.055, 0.015, 4, 14]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Orange dots — each uses same clipPlane so it appears as printed */}
      {LABELS.map((l) => (
        <DotMarker
          key={`dot-${l.id}`}
          position={l.pos}
          isActive={activeId === l.id}
          onClick={() => onDotClick(l.id)}
          clipPlane={clipPlane}
        />
      ))}

      {/* Spy-line labels */}
      {LABELS.map((l) => (
        <SpyLabel key={`spy-${l.id}`} label={l} isActive={activeId === l.id} />
      ))}

      {/* Camera controls */}
      <OrbitControls
        target={[-0.5, 0.5, 0]}
        autoRotate
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

// ── Zoom controller ─────────────────────────────────────
function ZoomController({ zoomZoneRef }: { zoomZoneRef: React.RefObject<HTMLDivElement | null> }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(-0.5, 0.5, 0), []);

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
  const [clipY, setClipY] = useState(CLIP_MIN);
  const zoomZoneRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Stable clip plane shared between PrintScene and DotMarkers
  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_MIN),
    []
  );

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const handleComplete = useCallback(() => setPrintDone(true), []);
  const handleClipY = useCallback((y: number) => setClipY(y), []);

  const handleDotClick = useCallback((id: string) => {
    setActiveLabel((prev) => (prev === id ? null : id));
  }, []);

  const handleReprint = useCallback(() => {
    setPrintDone(false);
    setActiveLabel(null);
    setClipY(CLIP_MIN);
    setPrintKey((k) => k + 1);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [3.0, 2.0, 4.0], fov: 28, near: 0.1, far: 50 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
      >
        <PrintScene
          key={printKey}
          onClipY={handleClipY}
          onComplete={handleComplete}
          onInteractStart={onInteractStart}
          onInteractEnd={onInteractEnd}
          activeId={activeLabel}
          onDotClick={handleDotClick}
          clipPlane={clipPlane}
          printKey={printKey}
        />
        <ZoomController zoomZoneRef={zoomZoneRef} />
      </Canvas>

      {/* ── Reprint button — bottom left ── */}
      <button
        onClick={handleReprint}
        className="absolute bottom-6 left-6 lg:left-10 z-20 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black/50 border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-wooster-orange hover:border-wooster-orange/40 hover:bg-black/60 transition-all select-none group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-[-360deg] transition-transform duration-500">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase">Reprint</span>
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
            <span className="font-mono text-[8px] tracking-[0.1em] text-white/25 uppercase">Zoom</span>
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

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Scroll-to-continue hint */}
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
  );
}
