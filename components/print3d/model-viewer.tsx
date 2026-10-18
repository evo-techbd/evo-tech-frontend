"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const TRANSPARENT_COLOR_NAMES = ["clear", "transparent", "natural"];

// Material colors are free text set by admins; map them to something visible
const resolveFilamentColor = (name: string) => {
  const key = name.toLowerCase().replace(/\s+/g, "");
  if (TRANSPARENT_COLOR_NAMES.includes(key)) {
    return { hex: 0xdbeafe, opacity: 0.55 };
  }
  const named = (THREE.Color.NAMES as Record<string, number>)[key];
  return { hex: named ?? 0x0ea5e9, opacity: 1 };
};

interface ModelViewerProps {
  geometry: THREE.BufferGeometry;
  color: string;
  className?: string;
}

export function ModelViewer({ geometry, color, className }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Printers are Z-up
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100000);
    camera.up.set(0, 0, 1);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(1, -1.5, 2);
    scene.add(keyLight);

    const material = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      metalness: 0.05,
    });
    materialRef.current = material;
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    const gridSize = Math.ceil((maxDim * 2) / 10) * 10;
    const grid = new THREE.GridHelper(gridSize, 20, 0xa8a29e, 0xd6d3d1);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    const target = new THREE.Vector3(0, 0, size.z / 2);
    camera.position.set(maxDim * 1.4, -maxDim * 1.8, size.z / 2 + maxDim * 1.1);
    camera.near = maxDim / 100;
    camera.far = maxDim * 100;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enableDamping = true;
    controls.update();

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      material.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      materialRef.current = null;
      // geometry is owned by the caller and outlives the viewer
    };
  }, [geometry]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const { hex, opacity } = resolveFilamentColor(color);
    material.color.setHex(hex);
    material.opacity = opacity;
    material.transparent = opacity < 1;
    material.needsUpdate = true;
  }, [color, geometry]);

  return <div ref={containerRef} className={className} />;
}
