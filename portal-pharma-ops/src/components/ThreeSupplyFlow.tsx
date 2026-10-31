import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FacilityNode {
  id: string;
  name: string;
  type: 'DEPOT' | 'HOSPITAL' | 'CLINIC';
  pos: [number, number, number];
  color: number;
}

const FACILITIES: FacilityNode[] = [
  { id: 'FAC-MAYAGANJ-01', name: 'Mayaganj Central Depot', type: 'DEPOT', pos: [0, 0.5, 0], color: 0x10b981 }, // Emerald
  { id: 'FAC-JLNMCH-01', name: 'JLNMCH Hospital', type: 'HOSPITAL', pos: [-3.2, -0.8, 1.2], color: 0x06b6d4 }, // Cyan
  { id: 'FAC-SADAR-01', name: 'Sadar Hospital', type: 'HOSPITAL', pos: [3.4, -0.6, -1.0], color: 0x6366f1 }, // Indigo
  { id: 'FAC-CLINIC-01', name: 'IIIT Health Clinic', type: 'CLINIC', pos: [0.8, 2.2, -2.2], color: 0xf59e0b }, // Amber
];

interface ThreeSupplyFlowProps {
  lastEvent?: any;
  activeShipmentCount?: number;
}

export const ThreeSupplyFlow: React.FC<ThreeSupplyFlowProps> = ({ lastEvent, activeShipmentCount = 3 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 8.5);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 3, 15);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);

    // 3. Holographic Ground Grid
    const gridHelper = new THREE.GridHelper(16, 32, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -1.5;
    scene.add(gridHelper);

    // 4. Facility Nodes
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeSpheres: { [id: string]: THREE.Mesh } = {};
    const rings: THREE.Mesh[] = [];

    FACILITIES.forEach((fac) => {
      // Main glowing sphere
      const sphereGeo = new THREE.SphereGeometry(fac.type === 'DEPOT' ? 0.45 : 0.32, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: fac.color,
        emissive: fac.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(...fac.pos);
      nodeGroup.add(sphere);
      nodeSpheres[fac.id] = sphere;

      // Outer holographic orbit ring
      const ringGeo = new THREE.RingGeometry(0.55, 0.62, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: fac.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(...fac.pos);
      ring.rotation.x = Math.PI / 2;
      nodeGroup.add(ring);
      rings.push(ring);

      // Vertical pedestal beam to grid
      const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, fac.pos[1] - (-1.5), 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: fac.color,
        transparent: true,
        opacity: 0.3,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(fac.pos[0], (fac.pos[1] + (-1.5)) / 2, fac.pos[2]);
      nodeGroup.add(beam);
    });

    // 5. Curved Conduit Curves & Traveling Supply Packets
    const depot = FACILITIES[0]; // Mayaganj Central Depot
    const targets = FACILITIES.slice(1);
    const conduits: THREE.QuadraticBezierCurve3[] = [];
    const packetMeshes: { mesh: THREE.Mesh; conduitIdx: number; t: number; speed: number }[] = [];

    targets.forEach((target, idx) => {
      // Quadratic Bezier arc
      const p0 = new THREE.Vector3(...depot.pos);
      const p2 = new THREE.Vector3(...target.pos);
      const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
      mid.y += 1.2 + idx * 0.3; // Lift conduit in 3D arc

      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
      conduits.push(curve);

      // Tube visualizer
      const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.03, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.7,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);

      // 2 traveling packets per conduit
      for (let p = 0; p < 2; p++) {
        const pGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const pMat = new THREE.MeshBasicMaterial({
          color: target.color,
        });
        const packet = new THREE.Mesh(pGeo, pMat);
        scene.add(packet);
        packetMeshes.push({
          mesh: packet,
          conduitIdx: idx,
          t: p * 0.5,
          speed: 0.006 + Math.random() * 0.004,
        });
      }
    });

    // 6. Interactive Mouse Drag to Rotate View
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      targetRotationY += deltaX * 0.006;
      targetRotationX += deltaY * 0.004;
      targetRotationX = Math.max(-0.4, Math.min(0.8, targetRotationX));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow smooth auto-orbit + mouse dampening
      if (!isDragging) {
        targetRotationY += 0.002;
      }
      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

      // Pulse rings
      rings.forEach((ring, idx) => {
        ring.rotation.z += 0.015 * (idx % 2 === 0 ? 1 : -1);
        const s = 1 + Math.sin(elapsed * 3 + idx) * 0.08;
        ring.scale.set(s, s, s);
      });

      // Update traveling packets along Bezier conduits
      packetMeshes.forEach((item) => {
        item.t += item.speed;
        if (item.t > 1) item.t = 0;
        const curve = conduits[item.conduitIdx];
        const point = curve.getPoint(item.t);
        item.mesh.position.copy(point);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
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
    <div className="relative w-full h-[360px] bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Holographic Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-cyan-500/30 backdrop-blur-md">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Bhagalpur Geo-Conduit Mesh</h3>
          <p className="text-[10px] text-slate-400">Mayaganj Depot ➔ Hospitals & Clinics</p>
        </div>
      </div>

      {/* Floating Node Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2 text-[11px]">
        {FACILITIES.map((f) => (
          <div
            key={f.id}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900/90 rounded-lg border border-slate-700/60 text-slate-300"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  f.color === 0x10b981
                    ? '#10b981'
                    : f.color === 0x06b6d4
                    ? '#06b6d4'
                    : f.color === 0x6366f1
                    ? '#6366f1'
                    : '#f59e0b',
              }}
            />
            <span className="font-semibold">{f.name}</span>
            <span className="text-[9px] uppercase px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
              {f.type}
            </span>
          </div>
        ))}
      </div>

      {/* Controls Hint */}
      <div className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-slate-900/70 border border-slate-800 text-[10px] text-slate-400 rounded-md pointer-events-none">
        Drag to Orbit 3D Conduits
      </div>
    </div>
  );
};

