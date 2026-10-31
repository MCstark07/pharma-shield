import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCyberGridProps {
  isUnderAttack?: boolean;
  attackType?: string | null;
}

export const ThreeCyberGrid: React.FC<ThreeCyberGridProps> = ({ isUnderAttack = false, attackType }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isAttackRef = useRef(isUnderAttack);
  isAttackRef.current = isUnderAttack;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.06);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(0, 8, 4);
    scene.add(dirLight);

    // 3. Dynamic Undulating Cyber Plane Grid
    const planeWidth = 24;
    const planeHeight = 24;
    const segmentsX = 40;
    const segmentsY = 40;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.9,
    });

    const cyberMesh = new THREE.Mesh(geometry, material);
    cyberMesh.position.y = -1.2;
    scene.add(cyberMesh);

    // Initial vertex heights backup
    const posAttr = geometry.attributes.position;
    const initialY = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      initialY[i] = posAttr.getY(i);
    }

    // 4. Central Cryptographic Shield Core (Floating Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      wireframe: true,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.8, 0);
    scene.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.7,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreMesh.add(innerMesh);

    // Outer Sentinel Rings
    const ringGeo = new THREE.TorusGeometry(1.8, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.copy(coreMesh.position);
    scene.add(ring1);

    const ring2 = ring1.clone();
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);

    // 5. Interactive Mouse Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = 0;
    let rotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevMouseX) * 0.005;
      rotX += (e.clientY - prevMouseY) * 0.004;
      rotX = Math.max(-0.2, Math.min(0.6, rotX));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => (isDragging = false);

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const underAttack = isAttackRef.current;

      // Color transition: Cyan/Emerald (Normal) vs Neon Rose/Red (Attacked)
      const targetColor = underAttack ? 0xf43f5e : 0x06b6d4;
      const targetEmissive = underAttack ? 0xe11d48 : 0x0891b2;
      const targetCoreColor = underAttack ? 0xf43f5e : 0x10b981;

      material.color.setHex(targetColor);
      material.emissive.setHex(targetEmissive);
      coreMat.color.setHex(targetCoreColor);
      innerMat.color.setHex(underAttack ? 0xfb7185 : 0x34d399);
      ringMat.color.setHex(targetColor);

      // Undulate terrain vertices
      const speed = underAttack ? 5.0 : 1.8;
      const waveFreq = underAttack ? 1.2 : 0.6;
      const waveAmp = underAttack ? 0.6 : 0.25;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        const yOffset = Math.sin(dist * waveFreq - elapsed * speed) * waveAmp;
        posAttr.setY(i, initialY[i] + yOffset);
      }
      posAttr.needsUpdate = true;

      // Rotate Shield Core
      coreMesh.rotation.y += underAttack ? 0.04 : 0.01;
      coreMesh.rotation.x += underAttack ? 0.03 : 0.007;

      ring1.rotation.y += 0.015;
      ring1.rotation.z += 0.008;
      ring2.rotation.x += 0.012;

      // Camera motion dampening
      if (!isDragging) rotY += 0.001;
      scene.rotation.y += (rotY - scene.rotation.y) * 0.05;
      scene.rotation.x += (rotX - scene.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Cyber Grid HUD Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-3 bg-slate-900/85 px-4 py-2 rounded-xl border border-slate-800 backdrop-blur-md">
        <span className="flex h-3 w-3 relative">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isUnderAttack ? 'bg-rose-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isUnderAttack ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
        </span>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Zero-Trust Cyber Sentinel
            </h3>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                isUnderAttack
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isUnderAttack ? 'ANOMALY DETECTED' : 'DEFENSES ARMED'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {isUnderAttack ? `MITM VECTOR: ${attackType || 'EXPLOIT INTERCEPTED'}` : 'SHA-256 Chain + Ed25519 Active'}
          </p>
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[11px] bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800/80 backdrop-blur-md text-slate-400">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Node Mesh Integrity: <strong className="text-slate-200 font-mono">100% Tamper Evident</strong></span>
        </span>
        <span className="font-mono text-[10px] text-slate-500">DRAG TO ORBIT CYBER GRID</span>
      </div>
    </div>
  );
};

