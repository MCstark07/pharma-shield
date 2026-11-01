import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FacilityBase, Shipment } from '../types';
import { Globe, RotateCcw, Activity } from 'lucide-react';

interface ThreeSupplyGlobeProps {
  facilities: FacilityBase[];
  shipments: Shipment[];
  className?: string;
}

export const ThreeSupplyGlobe: React.FC<ThreeSupplyGlobeProps> = ({
  facilities,
  shipments,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Holographic Cyber Base Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -2;
    worldGroup.add(gridHelper);

    // 2. Central Holographic Rings
    const ringGeo1 = new THREE.RingGeometry(2.8, 2.85, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = -1.9;
    worldGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(3.8, 3.84, 64);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat1);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -1.9;
    worldGroup.add(ring2);

    // 3. Facility Nodes in 3D Space
    const nodeCoords = [
      { name: 'JLNMCH', x: -1.6, z: 0.8, color: 0xf43f5e, isAlert: true },
      { name: 'Sadar Hospital', x: -0.6, z: -1.4, color: 0x06b6d4, isAlert: false },
      { name: 'Mayaganj Depot', x: 1.4, z: -0.5, color: 0x10b981, isAlert: false },
      { name: 'IIIT Bhagalpur', x: 2.2, z: 1.6, color: 0x38bdf8, isAlert: false },
    ];

    const nodesMeshGroup = new THREE.Group();
    worldGroup.add(nodesMeshGroup);

    nodeCoords.forEach((node) => {
      // Pedestal pillar
      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 16);
      const pillarMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.6 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(node.x, -0.9, node.z);
      nodesMeshGroup.add(pillar);

      // Glowing Node Sphere
      const sphereGeo = new THREE.SphereGeometry(0.24, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(node.x, 0.2, node.z);
      nodesMeshGroup.add(sphere);

      // Outer radar ring
      const ringGeo = new THREE.RingGeometry(0.35, 0.42, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: node.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(node.x, 0.2, node.z);
      nodesMeshGroup.add(ring);
    });

    // 4. Arc Curve for active dispatch (Mayaganj -> JLNMCH)
    const p1 = new THREE.Vector3(1.4, 0.2, -0.5);
    const p2 = new THREE.Vector3(-0.1, 1.8, 0.1);
    const p3 = new THREE.Vector3(-1.6, 0.2, 0.8);
    const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);

    const points = curve.getPoints(50);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
    const curveMat = new THREE.LineDashedMaterial({
      color: 0x06b6d4,
      dashSize: 0.3,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.8,
    });
    const curveLine = new THREE.Line(curveGeo, curveMat);
    curveLine.computeLineDistances();
    worldGroup.add(curveLine);

    // Traveling Energy Packet on the arc
    const packetGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const packetMesh = new THREE.Mesh(packetGeo, packetMat);
    worldGroup.add(packetMesh);

    // Ambient floating particles
    const starCount = 120;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 12;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.05, transparent: true, opacity: 0.4 });
    const starField = new THREE.Points(starGeo, starMat);
    worldGroup.add(starField);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Mouse drag orbit controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      worldGroup.rotation.y += dx * 0.008;
      worldGroup.rotation.x = Math.max(-0.4, Math.min(0.6, worldGroup.rotation.x + dy * 0.005));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        worldGroup.rotation.y += 0.004;
      }

      // Move packet along curve (0.0 to 1.0 looping)
      const t = (elapsed * 0.3) % 1.0;
      const pos = curve.getPoint(t);
      packetMesh.position.copy(pos);

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between ${className}`}>
      {/* 3D Hologram Label */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
        <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
        <span className="font-bold text-white">WebGL 3D Supply Grid Hologram</span>
        <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
          OpenGL ES
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
        Drag to Orbit 3D Space
      </div>

      <div ref={mountRef} className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing" />

      {/* Footer Info */}
      <div className="z-10 px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-rose-400 font-semibold">JLNMCH (Shortage Alert)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Mayaganj Depot (Active Dispatch)</span>
          </span>
        </div>
        <div className="text-[11px] text-cyan-400 flex items-center space-x-1">
          <Activity className="w-3.5 h-3.5" />
          <span>Real-time Particle Flow</span>
        </div>
      </div>
    </div>
  );
};

