import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBioVialProps {
  status: 'REQUESTED' | 'AUTHORIZED' | 'TAMPER_REJECTED' | 'UNDER_REVIEW' | 'IDLE';
  resourceCode?: string;
}

export const ThreeBioVial: React.FC<ThreeBioVialProps> = ({ status, resourceCode = 'O_POS_RBC' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Colors mapping based on live state
    const getColor = (s: string) => {
      if (s === 'AUTHORIZED') return { main: 0x10b981, emissive: 0x059669, glow: '#10b981' };
      if (s === 'TAMPER_REJECTED' || s === 'UNDER_REVIEW') return { main: 0xef4444, emissive: 0xb91c1c, glow: '#ef4444' };
      return { main: 0x06b6d4, emissive: 0x0891b2, glow: '#06b6d4' };
    };

    const palette = getColor(status);

    // Container Group
    const vialGroup = new THREE.Group();
    scene.add(vialGroup);

    // 1. Outer Glass Cylinder (Transparent)
    const glassGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2.6, 32, 1, true);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      side: THREE.DoubleSide,
    });
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    vialGroup.add(glassMesh);

    // 2. Liquid Serum (Inner Core with dynamic glow)
    const liquidGeometry = new THREE.CylinderGeometry(0.72, 0.72, 2.1, 32);
    const liquidMaterial = new THREE.MeshStandardMaterial({
      color: palette.main,
      emissive: palette.emissive,
      emissiveIntensity: 0.85,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.y = -0.2;
    vialGroup.add(liquidMesh);

    // 3. Metallic Cryo-Seal Caps (Top & Bottom)
    const capGeometry = new THREE.CylinderGeometry(0.84, 0.84, 0.3, 32);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
    });
    const topCap = new THREE.Mesh(capGeometry, capMaterial);
    topCap.position.y = 1.35;
    vialGroup.add(topCap);

    const bottomCap = new THREE.Mesh(capGeometry, capMaterial);
    bottomCap.position.y = -1.35;
    vialGroup.add(bottomCap);

    // 4. Floating Internal Bubbles / Nanoparticles
    const bubbleCount = 20;
    const bubbleGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const bubbles: THREE.Mesh[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      bubble.position.set(
        (Math.random() - 0.5) * 1.0,
        -1.0 + Math.random() * 1.8,
        (Math.random() - 0.5) * 1.0
      );
      bubbles.push(bubble);
      vialGroup.add(bubble);
    }

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(palette.main, 2.5, 10);
    pointLight.position.set(2, 3, 3);
    scene.add(pointLight);

    const backGlow = new THREE.PointLight(palette.emissive, 2.0, 8);
    backGlow.position.set(-2, -1, -2);
    scene.add(backGlow);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation & floating bobbing
      vialGroup.rotation.y = elapsedTime * 0.7;
      vialGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.12;
      vialGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      // Pulse liquid glow
      liquidMaterial.emissiveIntensity = 0.7 + Math.sin(elapsedTime * 2.5) * 0.25;

      // Animate bubbles rising
      bubbles.forEach((b) => {
        b.position.y += 0.008;
        if (b.position.y > 0.8) {
          b.position.y = -1.1;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [status]);

  const getStatusBadge = () => {
    if (status === 'AUTHORIZED') {
      return { text: 'CRYPTOGRAPHICALLY SEALED (EMERALD)', bg: 'bg-emerald-950/80 border-emerald-500 text-emerald-400' };
    }
    if (status === 'TAMPER_REJECTED' || status === 'UNDER_REVIEW') {
      return { text: 'SECURITY VIOLATION DETECTED (RED)', bg: 'bg-rose-950/80 border-rose-500 text-rose-400' };
    }
    return { text: 'PENDING HUB AUTHORIZATION (CYAN)', bg: 'bg-cyan-950/80 border-cyan-500 text-cyan-400' };
  };

  const badge = getStatusBadge();

  return (
    <div className="relative w-full h-80 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 flex flex-col items-center justify-center p-3 overflow-hidden shadow-2xl">
      <div className="absolute top-3 left-4 z-10 flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">3D Bio-Vial Digital Twin</span>
      </div>

      <div className="absolute top-3 right-4 z-10">
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${badge.bg}`}>
          {badge.text}
        </span>
      </div>

      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <p className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
          {resourceCode} <span className="text-slate-500 font-normal">| Cryo-Containment Temp: 4.2°C</span>
        </p>
      </div>
    </div>
  );
};

