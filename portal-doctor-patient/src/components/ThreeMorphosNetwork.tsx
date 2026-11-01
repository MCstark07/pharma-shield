import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeMorphosNetworkProps {
  urgency?: 'LOW' | 'STANDARD' | 'URGENT' | 'CRITICAL';
  status?: string;
}

export const ThreeMorphosNetwork: React.FC<ThreeMorphosNetworkProps> = ({
  urgency = 'CRITICAL',
  status = 'REQUESTED',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Color Palette inspired by Morphos Reference
    // Near-black: #010001, Cyan: #00D9FF, Medical Blue: #247BFF, Violet: #965BFF, Signal Red: #FF4B5C
    const isCritical = urgency === 'CRITICAL' || status === 'TAMPER_REJECTED';
    const isAuthorized = status === 'AUTHORIZED';

    const primaryColor = isAuthorized
      ? new THREE.Color(0x10b981) // Emerald on fulfillment
      : isCritical
      ? new THREE.Color(0x00d9ff) // Cyan medical glow
      : new THREE.Color(0x247bff); // Medical blue

    const accentColor = isAuthorized
      ? new THREE.Color(0x34d399)
      : isCritical
      ? new THREE.Color(0x965bff) // Violet synaptic accent
      : new THREE.Color(0x00d9ff);

    // 3. Central Holographic Biological Torus / Anatomical Core
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.TorusKnotGeometry(1.4, 0.35, 128, 24, 2, 3);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: accentColor,
      emissiveIntensity: 0.6,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner glowing biological nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleusMesh);

    // 4. Medical Synaptic Particles & Dynamic Connections
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const radius = 2.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[idx] = radius * Math.cos(theta) * Math.cos(phi);
      positions[idx + 1] = radius * Math.sin(phi);
      positions[idx + 2] = radius * Math.sin(theta) * Math.cos(phi);

      velocities[idx] = (Math.random() - 0.5) * 0.008;
      velocities[idx + 1] = (Math.random() - 0.5) * 0.008;
      velocities[idx + 2] = (Math.random() - 0.5) * 0.008;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);

    // Dynamic Synaptic Connecting Lines (Neural / Vascular Network)
    const lineMat = new THREE.LineBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const lineGeo = new THREE.BufferGeometry();
    const maxLineSegments = 120;
    const linePositions = new Float32Array(maxLineSegments * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    coreGroup.add(lines);

    // 5. Orbital Sentinel Rings (Cold-Chain & Vital Telemetry Conduits)
    const ringGeo1 = new THREE.TorusGeometry(3.2, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.3 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.6, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x965bff, transparent: true, opacity: 0.2 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // 6. Interactive Mouse Movement Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop with Heartbeat Pulse
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Biological Heartbeat expansion & contraction
      const heartbeat = 1.0 + Math.sin(elapsed * 3.5) * 0.04 + Math.sin(elapsed * 7.0) * 0.02;
      coreGroup.scale.set(heartbeat, heartbeat, heartbeat);

      // Rotations
      coreMesh.rotation.x = elapsed * 0.25;
      coreMesh.rotation.y = elapsed * 0.35;
      nucleusMesh.rotation.y = -elapsed * 0.4;

      ring1.rotation.z = elapsed * 0.15;
      ring2.rotation.z = -elapsed * 0.12;

      coreGroup.rotation.y = targetX * 0.6;
      coreGroup.rotation.x = -targetY * 0.4;

      // Update particle positions
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        posArr[idx] += velocities[idx];
        posArr[idx + 1] += velocities[idx + 1];
        posArr[idx + 2] += velocities[idx + 2];

        // Boundary bounce
        if (Math.abs(posArr[idx]) > 3.8) velocities[idx] *= -1;
        if (Math.abs(posArr[idx + 1]) > 3.8) velocities[idx + 1] *= -1;
        if (Math.abs(posArr[idx + 2]) > 3.8) velocities[idx + 2] *= -1;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Update connecting lines between close particles
      let lineIdx = 0;
      const lineArr = lineGeo.attributes.position.array as Float32Array;

      for (let i = 0; i < 40; i++) {
        for (let j = i + 1; j < 40; j++) {
          const dx = posArr[i * 3] - posArr[j * 3];
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 1.4 && lineIdx < maxLineSegments * 6) {
            lineArr[lineIdx++] = posArr[i * 3];
            lineArr[lineIdx++] = posArr[i * 3 + 1];
            lineArr[lineIdx++] = posArr[i * 3 + 2];

            lineArr[lineIdx++] = posArr[j * 3];
            lineArr[lineIdx++] = posArr[j * 3 + 1];
            lineArr[lineIdx++] = posArr[j * 3 + 2];
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx / 3);
      lineGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // 8. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);

      coreGeo.dispose();
      coreMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [urgency, status]);

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#010001] via-slate-950 to-[#010001] border border-cyan-500/20 shadow-2xl">
      <div ref={mountRef} className="w-full h-full" />
      {/* Overlay Status Pill */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-cyan-300/80 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 pointer-events-none">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>MORPHOS 3D BIOLOGICAL NETWORK</span>
        </span>
        <span className="text-slate-400">180 VITAL NODES • 60 FPS</span>
      </div>
    </div>
  );
};
