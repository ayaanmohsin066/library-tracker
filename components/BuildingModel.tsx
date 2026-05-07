"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type BuildingType = "dana-porter" | "davis" | "musagetes" | "generic";

interface Props {
  buildingType: BuildingType;
  occupancyPercent: number;
  isOpen: boolean;
  label?: string;
}

// ── Materials ─────────────────────────────────────────────────────────────────

function makeConcrete() {
  return new THREE.MeshStandardMaterial({
    color: 0x2c2c38,
    roughness: 0.85,
    metalness: 0.05,
    envMapIntensity: 0.5,
  });
}

function makeDarkConcrete() {
  return new THREE.MeshStandardMaterial({
    color: 0x1a1a24,
    roughness: 0.85,
    metalness: 0.05,
    envMapIntensity: 0.5,
  });
}

function winColor(pct: number): number {
  if (pct >= 80) return 0xef4444;
  if (pct >= 50) return 0xf59e0b;
  return 0x10b981;
}

function makeWindowMat(pct: number, open: boolean): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0a0a14,
    emissive: new THREE.Color(winColor(pct)),
    emissiveIntensity: open ? 0.7 : 0.05,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.95,
  });
}

function makeGenericWall(color = 0x1c1c2a) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.12 });
}

// ── Mesh helpers ──────────────────────────────────────────────────────────────

function box(
  g: THREE.Group,
  mat: THREE.Material,
  W: number, H: number, D: number,
  x: number, y: number, z: number,
  shadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mat);
  m.position.set(x, y, z);
  m.castShadow = shadows;
  m.receiveShadow = shadows;
  g.add(m);
  return m;
}

// Place PlaneGeometry windows on all 4 vertical faces — for non-dana-porter buildings
function planeWindows(
  g: THREE.Group,
  mat: THREE.Material,
  W: number, H: number, D: number,
  cx: number, cy: number, cz: number,
  cols: number, rows: number
) {
  const EPS = 0.018;
  const wW = (W / (cols + 1)) * 0.52;
  const wH = (H / (rows + 1)) * 0.56;
  const wDep = (D / (cols + 1)) * 0.52;
  const gFB = new THREE.PlaneGeometry(wW, wH);
  const gLR = new THREE.PlaneGeometry(wDep, wH);
  const xs = Array.from({ length: cols }, (_, i) => -W / 2 + (W / (cols + 1)) * (i + 1));
  const zs = Array.from({ length: cols }, (_, i) => -D / 2 + (D / (cols + 1)) * (i + 1));
  const ys = Array.from({ length: rows }, (_, i) => -H / 2 + (H / (rows + 1)) * (i + 1));
  for (const yO of ys) {
    const wy = cy + yO;
    for (let c = 0; c < cols; c++) {
      const mf = new THREE.Mesh(gFB, mat); mf.position.set(cx + xs[c], wy, cz + D / 2 + EPS); g.add(mf);
      const mb = new THREE.Mesh(gFB, mat); mb.rotation.y = Math.PI; mb.position.set(cx - xs[c], wy, cz - D / 2 - EPS); g.add(mb);
      const mr = new THREE.Mesh(gLR, mat); mr.rotation.y = Math.PI / 2; mr.position.set(cx + W / 2 + EPS, wy, cz - zs[c]); g.add(mr);
      const ml = new THREE.Mesh(gLR, mat); ml.rotation.y = -Math.PI / 2; ml.position.set(cx - W / 2 - EPS, wy, cz + zs[c]); g.add(ml);
    }
  }
}

// ── Dana Porter ───────────────────────────────────────────────────────────────

function buildDanaPorter(
  pct: number,
  open: boolean,
  winMats: THREE.MeshStandardMaterial[],
  winMeshes: THREE.Mesh[]
): THREE.Group {
  const g = new THREE.Group();
  const concrete = makeConcrete();
  const dark     = makeDarkConcrete();

  // 1. BASE SLAB
  box(g, concrete, 7, 0.8, 7, 0, 0.4, 0);

  // 2. MAIN TOWER
  const tW = 4.5, tH = 11, tD = 4.5, tY = 6.4;
  box(g, concrete, tW, tH, tD, 0, tY, 0);

  const halfW = tW / 2, halfD = tD / 2;

  // 3. VERTICAL CONCRETE FINS — 8 per face, 32 total
  for (let i = 0; i < 8; i++) {
    const tx = -halfW + tW * (i + 0.5) / 8;
    const tz = -halfD + tD * (i + 0.5) / 8;

    // Front / Back: fin width along X, depth proud in Z
    const fbGeo = new THREE.BoxGeometry(0.12, 11.2, 0.15);
    const ff = new THREE.Mesh(fbGeo, dark); ff.position.set(tx, tY,  halfD + 0.075); ff.castShadow = true; g.add(ff);
    const fb = new THREE.Mesh(fbGeo.clone(), dark); fb.position.set(tx, tY, -halfD - 0.075); fb.castShadow = true; g.add(fb);

    // Right / Left: fin width along Z, depth proud in X
    const rlGeo = new THREE.BoxGeometry(0.15, 11.2, 0.12);
    const fr = new THREE.Mesh(rlGeo, dark); fr.position.set( halfW + 0.075, tY, tz);  fr.castShadow = true; g.add(fr);
    const fl = new THREE.Mesh(rlGeo.clone(), dark); fl.position.set(-halfW - 0.075, tY, -tz); fl.castShadow = true; g.add(fl);
  }

  // 4. WINDOW GRID — 4 cols × 8 rows per face, individual materials for pulse
  const COLS = 4, ROWS = 8;
  const wW = 0.45, wH = 0.65, wD = 0.05, EPS = 0.01;
  const colX = Array.from({ length: COLS }, (_, i) => -halfW + tW * (i + 1) / (COLS + 1));
  const colZ = Array.from({ length: COLS }, (_, i) => -halfD + tD * (i + 1) / (COLS + 1));
  const rowY  = Array.from({ length: ROWS }, (_, i) => tY - tH / 2 + tH * (i + 1) / (ROWS + 1));
  const winGeo = new THREE.BoxGeometry(wW, wH, wD);

  const addWin = (x: number, y: number, z: number, ry: number) => {
    const mat = makeWindowMat(pct, open);
    winMats.push(mat);
    const m = new THREE.Mesh(winGeo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = false;
    g.add(m);
    winMeshes.push(m);
  };

  for (const wy of rowY) {
    for (let c = 0; c < COLS; c++) {
      addWin( colX[c],        wy,  halfD + EPS,       0         ); // front
      addWin(-colX[c],        wy, -halfD - EPS,       Math.PI   ); // back
      addWin( halfW + EPS,    wy, -colZ[c],           Math.PI/2 ); // right
      addWin(-halfW - EPS,    wy,  colZ[c],          -Math.PI/2 ); // left
    }
  }

  // 5. ROOF CAP + ANTENNA
  const roofY = tY + tH / 2;
  box(g, dark, 4.7, 0.25, 4.7, 0, roofY + 0.125, 0);
  box(g, dark, 0.3, 1.5,  0.3, 0, roofY + 0.25 + 0.75, 0);

  // 6. BASE ENTRANCE CANOPY
  box(g, dark, 2, 1.6, 0.2, 0, 1.2, 3.6);

  return g;
}

// ── Davis Centre ──────────────────────────────────────────────────────────────

function buildDavis(pct: number, open: boolean, winMats: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const concrete = makeConcrete();
  const dark     = makeDarkConcrete();
  const wm = makeWindowMat(pct, open);
  winMats.push(wm);

  // 1. MAIN BODY
  const mW = 8, mH = 5, mD = 5, mY = mH / 2;
  box(g, concrete, mW, mH, mD, 0, mY, 0);

  // 2. GLASS ATRIUM — right side, slightly taller
  const atriumMat = new THREE.MeshStandardMaterial({
    color: 0x0a1520,
    metalness: 0.95,
    roughness: 0.05,
    transparent: true,
    opacity: 0.7,
  });
  const aW = 3, aH = 5.2, aD = 5.2;
  box(g, atriumMat, aW, aH, aD, mW / 2 + aW / 2, aH / 2, 0);

  // 3. VERTICAL FINS — 6 per face on main body
  const finH = 5.3;
  const halfW = mW / 2, halfD = mD / 2;
  for (let i = 0; i < 6; i++) {
    const tx = -halfW + mW * (i + 0.5) / 6;
    const tz = -halfD + mD * (i + 0.5) / 6;

    // Front (+z)
    const ffGeo = new THREE.BoxGeometry(0.12, finH, 0.15);
    const ff = new THREE.Mesh(ffGeo, dark);
    ff.position.set(tx, mY,  halfD + 0.075); ff.castShadow = true; g.add(ff);
    const fb = new THREE.Mesh(ffGeo.clone(), dark);
    fb.position.set(tx, mY, -halfD - 0.075); fb.castShadow = true; g.add(fb);

    // Left only — atrium occupies the right face
    const flGeo = new THREE.BoxGeometry(0.15, finH, 0.12);
    const fl = new THREE.Mesh(flGeo, dark);
    fl.position.set(-halfW - 0.075, mY, tz); fl.castShadow = true; g.add(fl);
  }

  // 4. WINDOW GRID — 5 cols × 4 rows, shared material
  const COLS = 5, ROWS = 4, EPS = 0.01;
  const wW = 0.5, wH = 0.55, wD = 0.05;
  const winGeo = new THREE.BoxGeometry(wW, wH, wD);
  const colX = Array.from({ length: COLS }, (_, i) => -halfW + mW * (i + 1) / (COLS + 1));
  const colZ = Array.from({ length: COLS }, (_, i) => -halfD + mD * (i + 1) / (COLS + 1));
  const rowY = Array.from({ length: ROWS }, (_, i) => mY - mH / 2 + mH * (i + 1) / (ROWS + 1));

  for (const wy of rowY) {
    for (let c = 0; c < COLS; c++) {
      const mf = new THREE.Mesh(winGeo, wm); mf.position.set( colX[c], wy,  halfD + EPS); mf.castShadow = false; g.add(mf);
      const mb = new THREE.Mesh(winGeo, wm); mb.rotation.y = Math.PI;
                                              mb.position.set(-colX[c], wy, -halfD - EPS); mb.castShadow = false; g.add(mb);
      const ml = new THREE.Mesh(winGeo, wm); ml.rotation.y = -Math.PI / 2;
                                              ml.position.set(-halfW - EPS, wy, colZ[c]); ml.castShadow = false; g.add(ml);
    }
  }

  // 5. ENTRANCE OVERHANG
  box(g, dark, 4, 0.2, 2, 0, 1.5, halfD + 1, false);

  return g;
}

// ── Musagetes Architecture Library ───────────────────────────────────────────

function buildMusagetes(pct: number, open: boolean, winMats: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const concrete = makeConcrete();
  const dark     = makeDarkConcrete();
  const wm = makeWindowMat(pct, open);
  winMats.push(wm);

  // 1. MAIN BODY — low and wide
  const mW = 6, mH = 2.5, mD = 5;
  box(g, concrete, mW, mH, mD, 0, mH / 2, 0);

  // 2. LARGE GLASS FRONT — full-width plane on front face
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a1520,
    metalness: 0.95,
    roughness: 0.05,
    transparent: true,
    opacity: 0.7,
  });
  const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.3), glassMat);
  glassMesh.position.set(0, mH / 2, mD / 2 + 0.02);
  glassMesh.castShadow = false;
  g.add(glassMesh);

  // 3. SLANTED ROOF — tapered box: taller at back, lower over glass front
  const roofW = 6.3, roofH = 0.9, roofD = 5.3;
  const roofGeo = new THREE.BoxGeometry(roofW, roofH, roofD);
  const rPos = roofGeo.attributes.position;
  const slope = 0.7; // total height difference back-to-front
  for (let i = 0; i < rPos.count; i++) {
    if (rPos.getY(i) > 0) {
      // Normalise z: -1 = back, +1 = front. Lower front, raise back.
      const t = rPos.getZ(i) / (roofD / 2);
      rPos.setY(i, rPos.getY(i) - t * (slope / 2));
    }
  }
  rPos.needsUpdate = true;
  roofGeo.computeVertexNormals();
  const roof = new THREE.Mesh(roofGeo, dark);
  roof.position.set(0, mH + roofH / 2, 0);
  roof.castShadow = true;
  roof.receiveShadow = true;
  g.add(roof);

  // Thin canopy line overhanging the glass front
  box(g, dark, mW + 0.1, 0.07, 0.5, 0, mH + 0.04, mD / 2 + 0.25, false);

  // 4. MINIMAL SIDE WINDOWS — 3 cols × 2 rows, sides only
  const sideWinGeo = new THREE.BoxGeometry(0.5, 0.55, 0.05);
  const sideZ = Array.from({ length: 3 }, (_, i) => -mD / 2 + mD * (i + 1) / 4);
  for (const wz of sideZ) {
    for (const wy of [0.75, 1.8]) {
      const mr = new THREE.Mesh(sideWinGeo, wm); mr.rotation.y =  Math.PI / 2;
      mr.position.set( mW / 2 + 0.01, wy,  wz); mr.castShadow = false; g.add(mr);
      const ml = new THREE.Mesh(sideWinGeo, wm); ml.rotation.y = -Math.PI / 2;
      ml.position.set(-mW / 2 - 0.01, wy, -wz); ml.castShadow = false; g.add(ml);
    }
  }

  // Back wall — small clerestory strip near roof line
  const backWinGeo = new THREE.BoxGeometry(4.5, 0.35, 0.05);
  const bw = new THREE.Mesh(backWinGeo, wm);
  bw.rotation.y = Math.PI;
  bw.position.set(0, mH - 0.3, -mD / 2 - 0.01);
  bw.castShadow = false;
  g.add(bw);

  return g;
}

// ── Generic ───────────────────────────────────────────────────────────────────

function buildGeneric(pct: number, open: boolean, winMats: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const wm = makeWindowMat(pct, open);
  winMats.push(wm);

  const W = 5.2, H = 6.5, D = 4.2;
  box(g, makeGenericWall(0x1c1c2c), W, H, D, 0, H / 2, 0);
  box(g, makeGenericWall(0x1a1a2a), 2.2, 3.8, 3.2, 3.6, 1.9, 0);
  for (let i = 1; i <= 5; i++) box(g, makeGenericWall(0x232336), W + 0.12, 0.07, D + 0.12, 0, i * 1.1, 0);
  planeWindows(g, wm, W, H, D, 0, H / 2, 0, 5, 6);
  planeWindows(g, wm, 2.2, 3.8, 3.2, 3.6, 1.9, 0, 2, 3);
  return g;
}

// ── Build dispatch ────────────────────────────────────────────────────────────

function buildStructure(
  type: BuildingType,
  pct: number,
  open: boolean,
  winMats: THREE.MeshStandardMaterial[],
  winMeshes: THREE.Mesh[]
): THREE.Group {
  switch (type) {
    case "dana-porter": return buildDanaPorter(pct, open, winMats, winMeshes);
    case "davis":       return buildDavis(pct, open, winMats);
    case "musagetes":   return buildMusagetes(pct, open, winMats);
    default:            return buildGeneric(pct, open, winMats);
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

export default function BuildingModel({ buildingType, occupancyPercent, isOpen, label }: Props) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const winMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);

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

    // Lights
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

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.0, 30);
    cyanLight.position.set(-8, 3, 8);
    scene.add(cyanLight);

    const warmLight = new THREE.PointLight(0xf59e0b, 0.8, 25);
    warmLight.position.set(8, 1, -8);
    scene.add(warmLight);

    scene.add(new THREE.HemisphereLight(0x1a1a3e, 0x0a0a0a, 0.5));

    // Ground
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

    // Building
    const winMats: THREE.MeshStandardMaterial[] = [];
    const winMeshes: THREE.Mesh[] = [];
    const building = buildStructure(buildingType, pctRef.current, openRef.current, winMats, winMeshes);
    winMatsRef.current = winMats;
    scene.add(building);

    // Floating dust particles
    const pGeo = new THREE.SphereGeometry(0.03, 4, 4);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    type PD = { mesh: THREE.Mesh; vx: number; vy: number; vz: number };
    const particles: PD[] = [];
    for (let i = 0; i < 60; i++) {
      const m = new THREE.Mesh(pGeo, pMat);
      const r     = Math.cbrt(Math.random()) * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      m.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      const spd = 0.005 + Math.random() * 0.012;
      particles.push({ mesh: m, vx: (Math.random() - 0.5) * 0.003, vy: spd, vz: (Math.random() - 0.5) * 0.003 });
      scene.add(m);
    }

    // Orbit controls
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
      isDragging = true; autoRotate = false; clearTimeout(resumeTimer);
      prevX = e.clientX; prevY = e.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      building.rotation.y += (e.clientX - prevX) * 0.007;
      building.rotation.x  = Math.max(-0.4, Math.min(0.5, building.rotation.x + (e.clientY - prevY) * 0.005));
      prevX = e.clientX; prevY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; canvas.style.cursor = "grab"; pauseAuto(); };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const target = new THREE.Vector3(0, targetY, 0);
      const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
      camera.position.addScaledVector(dir, e.deltaY * 0.02);
      const dist = camera.position.distanceTo(target);
      if (dist <  8) camera.position.addScaledVector(dir, -(8  - dist));
      if (dist > 25) camera.position.addScaledVector(dir,  dist - 25);
    };

    let prevTX = 0, prevTY = 0;
    const onTouchStart = (e: TouchEvent) => {
      prevTX = e.touches[0].clientX; prevTY = e.touches[0].clientY;
      autoRotate = false; clearTimeout(resumeTimer);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      building.rotation.y += (e.touches[0].clientX - prevTX) * 0.008;
      building.rotation.x  = Math.max(-0.4, Math.min(0.5, building.rotation.x + (e.touches[0].clientY - prevTY) * 0.006));
      prevTX = e.touches[0].clientX; prevTY = e.touches[0].clientY;
    };
    const onTouchEnd = () => pauseAuto();

    canvas.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseup",    onMouseUp);
    canvas.addEventListener("wheel",      onWheel,       { passive: false });
    canvas.addEventListener("touchstart", onTouchStart,  { passive: true  });
    canvas.addEventListener("touchmove",  onTouchMove,   { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd);

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    // Window pulse animation — Dana Porter only
    type PulseEntry = { mat: THREE.MeshStandardMaterial; startMs: number };
    let pulsing: PulseEntry[] = [];
    let lastPulseMs = 0;

    // Animation loop
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);

      if (autoRotate) building.rotation.y += 0.003;

      // Drift particles upward, reset when too high
      for (const p of particles) {
        p.mesh.position.x += p.vx;
        p.mesh.position.y += p.vy;
        p.mesh.position.z += p.vz;
        if (p.mesh.position.y > 10) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 8;
          p.mesh.position.set(Math.cos(a) * r, -8 + Math.random() * 2, Math.sin(a) * r);
        }
      }

      // Pulse: trigger every 3 s when open, dana-porter only
      if (buildingType === "dana-porter" && openRef.current && winMeshes.length > 0) {
        const now = performance.now();
        if (now - lastPulseMs > 3000) {
          lastPulseMs = now;
          const count = 2 + Math.floor(Math.random() * 3); // 2–4
          for (let i = 0; i < count; i++) {
            const mesh = winMeshes[Math.floor(Math.random() * winMeshes.length)];
            pulsing.push({ mat: mesh.material as THREE.MeshStandardMaterial, startMs: now });
          }
        }

        const base = openRef.current ? 0.7 : 0.05;
        pulsing = pulsing.filter(({ mat, startMs }) => {
          const t = (performance.now() - startMs) / 800; // 0.8 s
          if (t >= 1) { mat.emissiveIntensity = base; return false; }
          mat.emissiveIntensity = base + Math.sin(t * Math.PI) * 0.5; // 0.7 → 1.2 → 0.7
          return true;
        });
      }

      renderer.render(scene, camera);
    };
    tick();

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

  // ── Live window color / intensity update ──────────────────────────────────
  useEffect(() => {
    const hex   = winColor(occupancyPercent);
    const intensity = isOpen ? 0.7 : 0.05;
    for (const mat of winMatsRef.current) {
      mat.emissive.setHex(hex);
      mat.emissiveIntensity = intensity;
      mat.needsUpdate = true;
    }
  }, [occupancyPercent, isOpen]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "280px" }}>
      <div ref={mountRef} style={{ width: "100%", flex: 1, minHeight: 0, cursor: "grab" }} />
      <p style={{
        textAlign: "center", fontSize: "11px", color: "var(--text-muted)",
        marginTop: "6px", paddingBottom: "4px", letterSpacing: "0.05em", userSelect: "none", flexShrink: 0,
      }}>
        {label ? `${label} · ` : ""}⟳ Drag to explore · Scroll to zoom
      </p>
    </div>
  );
}
