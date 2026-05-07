"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// One entry per university: Waterloo (cyan), Regina (indigo), UofT (green)
const SLABS = [
  { color: 0x06b6d4, x: -4.2, phase: 0 },
  { color: 0x818cf8, x:  0,   phase: 2.1 },
  { color: 0x10b981, x:  4.2, phase: 4.2 },
] as const;

export default function ThreeBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // ── Scene & camera ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 1.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // ── Lights ──────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    SLABS.forEach(({ color, x }) => {
      const light = new THREE.PointLight(color, 4, 16);
      light.position.set(x, 2, 4);
      scene.add(light);
    });

    // ── Floating platform slabs ──────────────────────────────────────
    const meshes: THREE.Mesh[] = [];
    SLABS.forEach(({ color, x }) => {
      const geo = new THREE.BoxGeometry(3.2, 0.14, 1.8);
      const mat = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.18,
        roughness: 0.2,
        metalness: 0.9,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0, 0);
      scene.add(mesh);
      meshes.push(mesh);

      // Wireframe edge glow
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
      });
      mesh.add(new THREE.LineSegments(edges, lineMat));
    });

    // ── Particle field ───────────────────────────────────────────────
    const pCount = 280;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 28;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.05,
      transparent: true,
      opacity: 0.3,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Animation loop ───────────────────────────────────────────────
    let raf = 0;
    let t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.007;
      meshes.forEach((mesh, i) => {
        mesh.position.y = Math.sin(t + SLABS[i].phase) * 0.45;
        mesh.rotation.y = Math.sin(t * 0.4 + SLABS[i].phase) * 0.12;
      });
      particles.rotation.y = t * 0.025;
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ───────────────────────────────────────────────────────
    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ──────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
