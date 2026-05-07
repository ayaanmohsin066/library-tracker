"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type BuildingType =
  | "dana-porter"
  | "davis"
  | "musagetes"
  | "robarts"
  | "gerstein"
  | "generic";

interface Props {
  buildingType: BuildingType;
  occupancyPercent: number;
  isOpen: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────

function getWinProps(pct: number, open: boolean) {
  if (!open) return { hex: 0x1a1a2e, intensity: 0.08 };
  if (pct >= 80) return { hex: 0xef4444, intensity: 0.65 };
  if (pct >= 50) return { hex: 0xf59e0b, intensity: 0.65 };
  return { hex: 0x10b981, intensity: 0.65 };
}

function evenSpace(lo: number, hi: number, n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [(lo + hi) / 2];
  return Array.from({ length: n }, (_, i) => lo + (hi - lo) * (i / (n - 1)));
}

function makeWallMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x2a2a35,
    roughness: 0.82,
    metalness: 0.08,
  });
}

function makeWinMat(hex: number, intensity: number) {
  return new THREE.MeshStandardMaterial({
    color: 0x080814,
    emissive: new THREE.Color(hex),
    emissiveIntensity: intensity,
    roughness: 0.25,
  });
}

// Place a grid of window planes on all 4 vertical faces of a box.
// Box center is at (cx, cy, cz) with dimensions W × H × D.
function addBoxWindows(
  parent: THREE.Group,
  mat: THREE.Material,
  W: number, H: number, D: number,
  cx: number, cy: number, cz: number,
  cols: number, rows: number
) {
  const EPS = 0.016;
  const wW  = (W / (cols + 1)) * 0.50;
  const wWd = (D / (cols + 1)) * 0.50;
  const wH  = (H / (rows + 1)) * 0.52;

  const gFB = new THREE.PlaneGeometry(wW,  wH);
  const gLR = new THREE.PlaneGeometry(wWd, wH);

  const xs = evenSpace(-W / 2 + W / (cols + 1), W / 2 - W / (cols + 1), cols);
  const zs = evenSpace(-D / 2 + D / (cols + 1), D / 2 - D / (cols + 1), cols);
  const ys = evenSpace(-H / 2 + H / (rows + 1), H / 2 - H / (rows + 1), rows);

  for (const yOff of ys) {
    const wy = cy + yOff;
    for (let c = 0; c < cols; c++) {
      // Front (+z)
      const mf = new THREE.Mesh(gFB, mat);
      mf.position.set(cx + xs[c], wy, cz + D / 2 + EPS);
      parent.add(mf);

      // Back (-z)
      const mb = new THREE.Mesh(gFB, mat);
      mb.rotation.y = Math.PI;
      mb.position.set(cx - xs[c], wy, cz - D / 2 - EPS);
      parent.add(mb);

      // Right (+x)
      const mr = new THREE.Mesh(gLR, mat);
      mr.rotation.y = Math.PI / 2;
      mr.position.set(cx + W / 2 + EPS, wy, cz - zs[c]);
      parent.add(mr);

      // Left (-x)
      const ml = new THREE.Mesh(gLR, mat);
      ml.rotation.y = -Math.PI / 2;
      ml.position.set(cx - W / 2 - EPS, wy, cz + zs[c]);
      parent.add(ml);
    }
  }
}

function buildBuilding(type: BuildingType, wm: THREE.MeshStandardMaterial): THREE.Group {
  const g    = new THREE.Group();
  const wall = makeWallMat();

  switch (type) {
    case "dana-porter": {
      const tW = 3, tH = 8, tD = 3;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(tW, tH, tD), wall);
      tower.position.y = tH / 2;
      g.add(tower);
      const pW = 4.4, pH = 0.9, pD = 4.4;
      const pod = new THREE.Mesh(new THREE.BoxGeometry(pW, pH, pD), wall.clone());
      pod.position.y = -pH / 2;
      g.add(pod);
      addBoxWindows(g, wm, tW, tH, tD, 0, tH / 2, 0, 6, 9);
      break;
    }
    case "davis": {
      const W = 5, H = 4, D = 3;
      const main = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wall);
      main.position.y = H / 2;
      g.add(main);
      addBoxWindows(g, wm, W, H, D, 0, H / 2, 0, 7, 5);
      break;
    }
    case "musagetes": {
      const W = 3, H = 2, D = 3;
      const main = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wall);
      main.position.y = H / 2;
      g.add(main);
      addBoxWindows(g, wm, W, H, D, 0, H / 2, 0, 4, 3);
      break;
    }
    case "robarts": {
      const H = 10;
      // Distinctive triangular brutalist tower — 3-sided cylinder
      const body = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.3, H, 3), wall);
      body.position.y = H / 2;
      body.rotation.y = Math.PI / 6; // orient flat face toward viewer
      g.add(body);
      // Windows approximated on a box proxy (slightly inside the prism — acceptable for stylized view)
      addBoxWindows(g, wm, 2.8, H, 2.8, 0, H / 2, 0, 4, 10);
      break;
    }
    case "gerstein":
    case "generic":
    default: {
      const W = 4, H = 5, D = 4;
      const main = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wall);
      main.position.y = H / 2;
      g.add(main);
      addBoxWindows(g, wm, W, H, D, 0, H / 2, 0, 6, 7);
      break;
    }
  }

  return g;
}

const CAM: Record<BuildingType, [number, number, number]> = {
  "dana-porter": [7.0, 7.0, 11.0],
  "davis":       [7.5, 5.0, 10.5],
  "musagetes":   [5.0, 3.5,  8.0],
  "robarts":     [8.0, 8.0, 12.0],
  "gerstein":    [7.0, 5.5, 10.0],
  "generic":     [7.0, 5.5, 10.0],
};

const CAM_TARGET_Y: Record<BuildingType, number> = {
  "dana-porter": 4,
  "davis":       2,
  "musagetes":   1,
  "robarts":     5,
  "gerstein":    2.5,
  "generic":     2.5,
};

// ── Component ────────────────────────────────────────────────────────

export default function BuildingModel({ buildingType, occupancyPercent, isOpen }: Props) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const winMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Always-current refs so the scene init closure can read latest values
  const pctRef  = useRef(occupancyPercent);
  const openRef = useRef(isOpen);
  pctRef.current  = occupancyPercent;
  openRef.current = isOpen;

  // ── Scene init — rebuilds only when building type changes ──────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth  || 300;
    const h = mount.clientHeight || 280;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const [cpx, cpy, cpz] = CAM[buildingType];
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(cpx, cpy, cpz);
    camera.lookAt(0, CAM_TARGET_Y[buildingType], 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(-5, 8, 3);
    scene.add(dirLight);
    const accentLight = new THREE.PointLight(0x06b6d4, 1.8, 14);
    accentLight.position.set(0, -0.4, 0);
    scene.add(accentLight);

    // Ground grid
    const grid = new THREE.GridHelper(22, 22, 0x06b6d4, 0x1a1a2a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.55;
    grid.position.y = -0.02;
    scene.add(grid);

    // Building
    const wp = getWinProps(pctRef.current, openRef.current);
    const wm = makeWinMat(wp.hex, wp.intensity);
    winMatRef.current = wm;
    const building = buildBuilding(buildingType, wm);
    scene.add(building);

    // ── Manual orbit ────────────────────────────────────────────────
    let isDragging = false;
    let autoRotate = true;
    let prevX = 0;
    let prevY = 0;
    let resumeTimer = 0;

    const pauseAndResume = () => {
      autoRotate = false;
      clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => { autoRotate = true; }, 1400);
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      clearTimeout(resumeTimer);
      prevX = e.clientX;
      prevY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      building.rotation.y += dx * 0.008;
      building.rotation.x = Math.max(-0.42, Math.min(0.52, building.rotation.x + dy * 0.006));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
      pauseAndResume();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const target = new THREE.Vector3(0, CAM_TARGET_Y[buildingType], 0);
      const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
      camera.position.addScaledVector(dir, e.deltaY * 0.015);
      const dist = camera.position.distanceTo(target);
      if (dist < 3.5) camera.position.addScaledVector(dir, -(3.5 - dist));
      if (dist > 30)  camera.position.addScaledVector(dir,  dist - 30);
    };

    // Touch
    let prevTX = 0, prevTY = 0;
    const onTouchStart = (e: TouchEvent) => {
      prevTX = e.touches[0].clientX;
      prevTY = e.touches[0].clientY;
      autoRotate = false;
      clearTimeout(resumeTimer);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dx = e.touches[0].clientX - prevTX;
      const dy = e.touches[0].clientY - prevTY;
      building.rotation.y += dx * 0.009;
      building.rotation.x = Math.max(-0.42, Math.min(0.52, building.rotation.x + dy * 0.007));
      prevTX = e.touches[0].clientX;
      prevTY = e.touches[0].clientY;
    };
    const onTouchEnd = () => pauseAndResume();

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseup",    onMouseUp);
    canvas.addEventListener("wheel",      onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd);

    // Resize
    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    // Animation loop
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (autoRotate) building.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    tick();

    // Cleanup
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

  // ── Live window color updates (no scene rebuild) ───────────────────
  useEffect(() => {
    const mat = winMatRef.current;
    if (!mat) return;
    const wp = getWinProps(occupancyPercent, isOpen);
    mat.emissive.setHex(wp.hex);
    mat.emissiveIntensity = wp.intensity;
    mat.needsUpdate = true;
  }, [occupancyPercent, isOpen]);

  return (
    <div>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "280px", cursor: "grab" }}
      />
      <p
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "6px",
          letterSpacing: "0.05em",
          userSelect: "none",
        }}
      >
        Drag to rotate · Scroll to zoom
      </p>
    </div>
  );
}
