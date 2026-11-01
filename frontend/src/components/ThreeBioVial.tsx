import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Thermometer, ShieldCheck, AlertTriangle, Eye } from 'lucide-react';

interface ThreeBioVialProps {
  temperature?: number;
  isExcursion?: boolean;
  status?: string;
  className?: string;
}

export const ThreeBioVial: React.FC<ThreeBioVialProps> = ({
  temperature = 4.2,
  isExcursion = false,
  status = 'IN_TRANSIT',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const liquidMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const glowLightRef = useRef<THREE.PointLight | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 300;
    const height = mount.clientHeight || 260;

    // Scene, Camera, WebGL (OpenGL ES) Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Group containing the vial
    const vialGroup = new THREE.Group();
    scene.add(vialGroup);

    // 1. Outer Glass Cylinder (Cryogenic Vacuum Flask)
    const glassGeometry = new THREE.CylinderGeometry(1.2, 1.2, 3.8, 32, 1, true);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    vialGroup.add(glass);

    // 2. Inner Active Liquid Core
    const liquidGeometry = new THREE.CylinderGeometry(1.05, 1.05, 3.2, 32);
    const liquidColor = isExcursion ? 0xf43f5e : 0x06b6d4;
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: liquidColor,
      emissive: liquidColor,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      metalness: 0.3,
    });
    liquidMaterialRef.current = liquidMaterial;
    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
    vialGroup.add(liquid);

    // 3. Metallic Caps (Top & Bottom Cryo-Locks)
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25,
    });
    
    // Top cap
    const topCapGeometry = new THREE.CylinderGeometry(1.25, 1.25, 0.4, 32);
    const topCap = new THREE.Mesh(topCapGeometry, capMaterial);
    topCap.position.y = 2.0;
    vialGroup.add(topCap);

    // Bottom cap
    const bottomCapGeometry = new THREE.CylinderGeometry(1.25, 1.25, 0.4, 32);
    const bottomCap = new THREE.Mesh(bottomCapGeometry, capMaterial);
    bottomCap.position.y = -2.0;
    vialGroup.add(bottomCap);

    // Inner core LED ring
    const ringGeometry = new THREE.TorusGeometry(1.26, 0.05, 16, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: isExcursion ? 0xf43f5e : 0x10b981,
    });
    const ledRingTop = new THREE.Mesh(ringGeometry, ringMaterial);
    ledRingTop.rotation.x = Math.PI / 2;
    ledRingTop.position.y = 1.8;
    vialGroup.add(ledRingTop);

    const ledRingBottom = new THREE.Mesh(ringGeometry, ringMaterial);
    ledRingBottom.rotation.x = Math.PI / 2;
    ledRingBottom.position.y = -1.8;
    vialGroup.add(ledRingBottom);

    // 4. Cryo Micro-bubbles / Nanoparticles
    const particleCount = 80;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 0.9;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      speeds[i] = 0.01 + Math.random() * 0.02;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.07,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    vialGroup.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x06b6d4, 2, 10);
    rimLight.position.set(-3, -2, 2);
    scene.add(rimLight);

    const glowLight = new THREE.PointLight(isExcursion ? 0xf43f5e : 0x06b6d4, 2.5, 6);
    glowLight.position.set(0, 0, 1.5);
    glowLightRef.current = glowLight;
    scene.add(glowLight);

    // Interactive mouse rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      vialGroup.rotation.y += deltaX * 0.01;
      vialGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow rotation if not dragged
      if (!isDragging) {
        vialGroup.rotation.y += 0.012;
      }

      // Floating particles
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += speeds[i];
        if (arr[i * 3 + 1] > 1.5) {
          arr[i * 3 + 1] = -1.5;
        }
      }
      posAttr.needsUpdate = true;

      // Pulsing glow
      if (glowLightRef.current) {
        const pulse = Math.sin(elapsedTime * 3) * 0.3 + 2.2;
        glowLightRef.current.intensity = pulse;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update color dynamically when temperature or excursion state changes
  useEffect(() => {
    const color = isExcursion ? 0xf43f5e : 0x06b6d4;
    if (liquidMaterialRef.current) {
      liquidMaterialRef.current.color.setHex(color);
      liquidMaterialRef.current.emissive.setHex(color);
      liquidMaterialRef.current.emissiveIntensity = isExcursion ? 0.75 : 0.45;
    }
    if (glowLightRef.current) {
      glowLightRef.current.color.setHex(color);
    }
  }, [temperature, isExcursion]);

  return (
    <div className={`relative bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header Overlay */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isExcursion ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <h4 className="text-xs font-mono uppercase font-bold text-slate-200">
            WebGL 3D Bio-Vial Hologram
          </h4>
        </div>
        <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          <Eye className="w-3 h-3 text-cyan-400" />
          <span>Interactive 3D</span>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-52 sm:h-56 cursor-grab active:cursor-grabbing flex items-center justify-center my-1"
      />

      {/* Telemetry Status Bar */}
      <div className="z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <Thermometer className={`w-4 h-4 ${isExcursion ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
          <span className="text-slate-400">Core Temp:</span>
          <span className={`font-bold ${isExcursion ? 'text-rose-400' : 'text-emerald-400'}`}>
            {temperature.toFixed(1)}°C
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {isExcursion ? (
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>EXCURSION</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>2.0°C – 8.0°C SAFE</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

