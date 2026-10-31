import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

interface MatterSupplyDropProps {
  dropTriggerCount: number;
  category?: string;
  isAuthorized?: boolean;
}

export const MatterSupplyDrop: React.FC<MatterSupplyDropProps> = ({
  dropTriggerCount,
  category = 'BLOOD_COMPONENTS',
  isAuthorized = false,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);

  useEffect(() => {
    const container = sceneRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = 280;

    // Module aliases
    const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

    // Create engine & world
    const engine = Engine.create({
      gravity: { x: 0, y: 1.1 },
    });
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent',
      },
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Static Boundaries (Dispenser Hopper)
    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
      restitution: 0.6,
    };

    // Ground and side walls
    const ground = Bodies.rectangle(width / 2, height - 5, width, 14, wallOptions);
    const leftWall = Bodies.rectangle(5, height / 2, 12, height, wallOptions);
    const rightWall = Bodies.rectangle(width - 5, height / 2, 12, height, wallOptions);

    // Funnels / deflection pegs
    const pegs: Matter.Body[] = [];
    const rows = 3;
    const cols = 5;
    const startX = width / 6;
    const spacingX = width / 5;

    for (let r = 0; r < rows; r++) {
      const offsetX = r % 2 === 1 ? spacingX / 2 : 0;
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX + offsetX;
        const y = 60 + r * 38;
        if (x > 30 && x < width - 30) {
          const peg = Bodies.circle(x, y, 6, {
            isStatic: true,
            restitution: 0.8,
            render: { fillStyle: '#06b6d4' },
          });
          pegs.push(peg);
        }
      }
    }

    // Dividers for slots at the bottom
    const divider1 = Bodies.rectangle(width / 3, height - 35, 6, 60, wallOptions);
    const divider2 = Bodies.rectangle((2 * width) / 3, height - 35, 6, 60, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall, divider1, divider2, ...pegs]);

    // Initial supply drops
    for (let i = 0; i < 4; i++) {
      const capsule = Bodies.circle(
        width / 2 + (Math.random() - 0.5) * 60,
        15 + i * 15,
        11,
        {
          restitution: 0.7,
          friction: 0.05,
          render: { fillStyle: '#0ea5e9' },
        }
      );
      Composite.add(engine.world, capsule);
    }

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      if (render.canvas && container.contains(render.canvas)) {
        container.removeChild(render.canvas);
      }
    };
  }, []);

  // Drop physical units when dropTriggerCount increments
  useEffect(() => {
    if (!engineRef.current || !sceneRef.current) return;
    const width = sceneRef.current.clientWidth || 400;
    const { Bodies, Composite } = Matter;

    const color = isAuthorized ? '#10b981' : '#06b6d4';
    const batchSize = isAuthorized ? 5 : 2;

    for (let i = 0; i < batchSize; i++) {
      const capsule = Bodies.circle(
        width / 2 + (Math.random() - 0.5) * 80,
        -10 - i * 18,
        12,
        {
          restitution: 0.75,
          friction: 0.08,
          density: 0.002,
          render: {
            fillStyle: color,
            strokeStyle: '#ffffff',
            lineWidth: 1,
          },
        }
      );
      Composite.add(engineRef.current.world, capsule);
    }
  }, [dropTriggerCount, isAuthorized]);

  return (
    <div className="relative w-full h-[280px] rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl">
      <div className="p-3 z-10 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            Matter.js 2D Dispenser Physics
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
          Gravity: 1.1G | Restitution: 0.75
        </span>
      </div>

      <div ref={sceneRef} className="w-full h-full" />

      <div className="absolute bottom-2 left-0 right-0 flex justify-around text-[10px] font-mono text-slate-500 uppercase px-4 pointer-events-none">
        <span>Bay A: Red Cells</span>
        <span>Bay B: Emergency</span>
        <span>Bay C: Certified</span>
      </div>
    </div>
  );
};

