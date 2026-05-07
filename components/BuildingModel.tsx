"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type BuildingType = "dana-porter" | "davis" | "musagetes" | "generic";

interface Props {
  buildingType: BuildingType;
  occupancyPercent: number;
  isOpen: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function winProps(pct: number, open: boolean) {
  if (!open) return { hex: 0x0a0a1e, intensity: 0.04 };
  if (pct >= 80) return { hex: 0xef4444, intensity: 1.4 };
  if (pct >= 50) return { hex: 0xf59e0b, intensity: 1.2 };
  return { hex: 0x10b981, intensity: 1.0 };
}

function wallMat(color = 0x1c1c2a) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.12 });
}

function makeWinMat(hex: number, intensity: number) {
  return new THREE.MeshStandardMaterial({
    color: 0x050510,
    emissive: new THREE.Color(hex),
    emissiveIntensity: intensity,
    roughness: 0.05,
    metalness: 0.95,
    transparent: true,
    opacity: 0.92,
  });
}

function addBox(
  g: THREE.Group,
  mat: THREE.Material,
  W: number, H: number, D: number,
  x: number, y: number, z: number
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}

// Place a window-plane grid on all 4 vertical faces of a box volume.
// All planes share the same material instance so live updates apply everywhere.
function addWindows(
  g: THREE.Group,
  mat: THREE.Material,
  W: number, H: number, D: number,
  cx: number, cy: number, cz: number,
  cols: number, rows: number
) {
  const EPS = 0.018;
  const wW = (W / (cols + 1)) * 0.52;
  const wH = (H / (rows + 1)) * 0.56;
  const wD = (D / (cols + 1)) * 0.52;

  const gFB = new THREE.PlaneGeometry(wW, wH);
  const gLR = new THREE.PlaneGeometry(wD, wH);

  const xs = Array.from({ length: cols }, (_, i) => -W / 2 + (W / (cols + 1)) * (i + 1));
  const zs = Array.from({ length: cols }, (_, i) => -D / 2 + (D / (cols + 1)) * (i + 1));
  const ys = Array.from({ length: rows }, (_, i) => -H / 2 + (H / (rows + 1)) * (i + 1));

  for (const yOff of ys) {
    const wy = cy + yOff;
    for (let c = 0; c < cols; c++) {
      const mf = new THREE.Mesh(gFB, mat);
      mf.position.set(cx + xs[c], wy, cz + D / 2 + EPS);
      g.add(mf);

      const mb = new THREE.Mesh(gFB, mat);
      mb.rotation.y = Math.PI;
      mb.position.set(cx - xs[c], wy, cz - D / 2 - EPS);
      g.add(mb);

      const mr = new THREE.Mesh(gLR, mat);
      mr.rotation.y = Math.PI / 2;
      mr.position.set(cx + W / 2 + EPS, wy, cz - zs[c]);
      g.add(mr);

      const ml = new THREE.Mesh(gLR, mat);
      ml.rotation.y = -Math.PI / 2;
      ml.position.set(cx - W / 2 - EPS, wy, cz + zs[c]);
      g.add(ml);
    }
  }
}

// ── Building geometries ───────────────────────────────────────────────────────

function buildDanaPorter(wm: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  // Wide low podium
  addBox(g, wallMat(0x1a1a28), 5.5, 1.5, 5.5, 0, 0.75, 0);
  addWindows(g, wm, 5.5, 1.5, 5.5, 0, 0.75, 0, 4, 1);

  // Tall central tower
  const tW = 3.4, tH = 11, tD = 3.4;
  const tY = 1.5 + tH / 2;
  addBox(g, wallMat(0x1e1e2e), tW, tH, tD, 0, tY, 0);

  // Horizontal floor-plate banding
  for (let i = 0; i <= 9; i++) {
    addBox(g, wallMat(0x26263a), tW + 0.18, 0.08, tD + 0.18, 0, 1.5 + 1.1 * i, 0);
  }

  addWindows(g, wm, tW, tH, tD, 0, tY, 0, 4, 10);

  // Rooftop mechanical penthouse
  addBox(g, wallMat(0x181826), 1.8, 0.9, 1.8, 0, 1.5 + tH + 0.45, 0);

  return g;
}

function buildDavis(wm: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  // Main block
  const W = 7.5, H = 4.5, D = 4.2;
  addBox(g, wallMat(0x1c1c2c), W, H, D, 0, H / 2, 0);
  addWindows(g, wm, W, H, D, 0, H / 2, 0, 7, 4);

  // Lower side wing
  addBox(g, wallMat(0x1a1a2a), 2.5, 3.2, 2.2, -5, 1.6, 0);
  addWindows(g, wm, 2.5, 3.2, 2.2, -5, 1.6, 0, 3, 3);

  // Roof parapet / cornice
  addBox(g, wallMat(0x222234), W + 0.3, 0.14, D + 0.3, 0, H + 0.07, 0);

  return g;
}

function buildMusagetes(wm: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  const W = 3.8, H = 2.6, D = 3.8;
  addBox(g, wallMat(0x1d1d2d), W, H, D, 0, H / 2, 0);
  addWindows(g, wm, W, H, D, 0, H / 2, 0, 4, 2);

  // Wide flat roof overhang
  addBox(g, wallMat(0x202030), W + 0.8, 0.1, D + 0.8, 0, H + 0.05, 0);

  // Thin glass curtain-wall entrance strip
  addBox(g, wallMat(0x141420), 1.4, H, 0.08, 0, H / 2, D / 2 + 0.04);

  return g;
}

function buildGeneric(wm: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  const W = 5.2, H = 6.5, D = 4.2;
  addBox(g, wallMat(0x1c1c2c), W, H, D, 0, H / 2, 0);

  // Side annex
  addBox(g, wallMat(0x1a1a2a), 2.2, 3.8, 3.2, 3.6, 1.9, 0);
  addWindows(g, wm, 2.2, 3.8, 3.2, 3.6, 1.9, 0, 2, 3);

  // Horizontal ledge details
  for (let i = 1; i <= 5; i++) {
    addBox(g, wallMat(0x232336), W + 0.12, 0.07, D + 0.12, 0, i * 1.1, 0);
  }

  addWindows(g, wm, W, H, D, 0, H / 2, 0, 5, 6);

  return g;
}

function buildStructure(type: BuildingType, wm: THREE.Material): THREE.Group {
  switch (type) {
    case "dana-porter": return buildDanaPorter(wm);
    case "davis":       return buildDavis(wm);
    case "musagetes":   return buildMusagetes(wm);
    default:            return buildGeneric(wm);
  }
}

// ── Camera presets ────────────────────────────────────────────────────────────

const CAM_POS: Record<BuildingType, [number, number, number]> = {
  "dana-porter": [12, 10, 12],
  "davis":       [13,  7, 13],
  "musagetes":   [ 9,  6,  9],
  "generic":     [12,  8, 12],
};

const CAM_TARGET_Y: Record<BuildingType, number> = {
  "dana-porter": 5.0,
  "davis":       2.5,
  "musagetes":   1.5,
  "generic":     3.0,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function BuildingModel({ buildingType, occupancyPercent, isOpen }: Props) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const winMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Always-current refs so scene-init closure reads latest values
  const pctRef  = useRef(occupancyPercent);
  const openRef = useRef(isOpen);
  pctRef.current  = occupancyPercent;
  openRef.current = isOpen;

  // ── Scene init ─ rebuilds only when buildingType changes ──────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth  || 400;
    const h = mount.clientHeight || 320;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Scene + fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020208, 0.035);

    // Camera
    const [cpx, cpy, cpz] = CAM_POS[buildingType];
    const targetY = CAM_TARGET_Y[buildingType];
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(cpx, cpy, cpz);
    camera.lookAt(0, targetY, 0);

    // ── Lighting ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0a0a1a, 0.3));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width  = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near   =  0.5;
    dirLight.shadow.camera.far    = 100;
    dirLight.shadow.camera.left   = -20;
    dirLight.shadow.camera.right  =  20;
    dirLight.shadow.camera.top    =  20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    // Cyan accent — front-left low
    const cyanLight = new THREE.PointLight(0x06b6d4, 2.0, 30);
    cyanLight.position.set(-8, 3, 8);
    scene.add(cyanLight);

    // Warm amber — back-right
    const warmLight = new THREE.PointLight(0xf59e0b, 0.8, 25);
    warmLight.position.set(8, 1, -8);
    scene.add(warmLight);

    scene.add(new THREE.HemisphereLight(0x1a1a3e, 0x0a0a0a, 0.5));

    // ── Ground plane ────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.8, metalness: 0.2 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(30, 30, 0x06b6d4, 0x0a0a1a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.4;
    grid.position.y = 0.01;
    scene.add(grid);

    // ── Building ────────────────────────────────────────────────────────────
    const wp = winProps(pctRef.current, openRef.current);
    const wm = makeWinMat(wp.hex, wp.intensity);
    winMatRef.current = wm;
    const building = buildStructure(buildingType, wm);
    scene.add(building);

    // ── Manual orbit controls ───────────────────────────────────────────────
    let isDragging = false;
    let autoRotate = true;
    let prevX = 0, prevY = 0;
    let resumeTimer = 0;

    const pauseAuto = () => {
      autoRotate = false;
      clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => { autoRotate = true; }, 1500);
    };

    const canvas = renderer.domElement;
    canvas.style.cursor = "grab";

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      clearTimeout(resumeTimer);
      prevX = e.clientX; prevY = e.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      building.rotation.y += dx * 0.007;
      building.rotation.x = Math.max(-0.4, Math.min(0.5, building.rotation.x + dy * 0.005));
      prevX = e.clientX; prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
      pauseAuto();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const target = new THREE.Vector3(0, targetY, 0);
      const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
      camera.position.addScaledVector(dir, e.deltaY * 0.02);
      const dist = camera.position.distanceTo(target);
      if (dist < 8)  camera.position.addScaledVector(dir, -(8  - dist));
      if (dist > 25) camera.position.addScaledVector(dir,  dist - 25);
    };

    let prevTX = 0, prevTY = 0;
    const onTouchStart = (e: TouchEvent) => {
      prevTX = e.touches[0].clientX; prevTY = e.touches[0].clientY;
      autoRotate = false; clearTimeout(resumeTimer);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dx = e.touches[0].clientX - prevTX;
      const dy = e.touches[0].clientY - prevTY;
      building.rotation.y += dx * 0.008;
      building.rotation.x = Math.max(-0.4, Math.min(0.5, building.rotation.x + dy * 0.006));
      prevTX = e.touches[0].clientX; prevTY = e.touches[0].clientY;
    };
    const onTouchEnd = () => pauseAuto();

    canvas.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseup",    onMouseUp);
    canvas.addEventListener("wheel",      onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd);

    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ──────────────────────────────────────────────────────
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (autoRotate) building.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
      canvas.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseup",    onMouseUp);
      canvas.removeEventListener("wheel",      onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("resize",     onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else (obj.material as THREE.Material).dispose();
      });
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingType]);

  // ── Live window color updates (no scene rebuild) ──────────────────────────
  useEffect(() => {
    const mat = winMatRef.current;
    if (!mat) return;
    const wp = winProps(occupancyPercent, isOpen);
    mat.emissive.setHex(wp.hex);
    mat.emissiveIntensity = wp.intensity;
    mat.needsUpdate = true;
  }, [occupancyPercent, isOpen]);

  return (
    <div>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "320px", cursor: "grab" }}
      />
      <p
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "8px",
          letterSpacing: "0.05em",
          userSelect: "none",
        }}
      >
        ⟳ Drag to explore · Scroll to zoom
      </p>
    </div>
  );
}
