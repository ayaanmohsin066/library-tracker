"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WireframeCube() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth  || 300;
    const h = mount.clientHeight || 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    const geo      = new THREE.BoxGeometry(2, 2, 2);
    const wireGeo  = new THREE.WireframeGeometry(geo);
    const mat      = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.55 });
    const wire     = new THREE.LineSegments(wireGeo, mat);
    scene.add(wire);

    // Second slightly larger cube for depth
    const geo2     = new THREE.BoxGeometry(2.8, 2.8, 2.8);
    const wireGeo2 = new THREE.WireframeGeometry(geo2);
    const mat2     = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.2 });
    const wire2    = new THREE.LineSegments(wireGeo2, mat2);
    scene.add(wire2);

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      wire.rotation.x  += 0.004;
      wire.rotation.y  += 0.007;
      wire2.rotation.x -= 0.003;
      wire2.rotation.y -= 0.005;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose(); wireGeo.dispose(); mat.dispose();
      geo2.dispose(); wireGeo2.dispose(); mat2.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
