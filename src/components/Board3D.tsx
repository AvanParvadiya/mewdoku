import React, { useEffect, useRef } from 'react';
import * as pc from 'playcanvas';

interface Board3DProps {
  size: number;
  regions: number[][];
  grid: (null | 'X' | 'CAT')[][];
  onCellClick: (row: number, col: number) => void;
  errorCell: { row: number; col: number } | null;
}

export const Board3D: React.FC<Board3DProps> = ({
  size,
  regions,
  grid,
  onCellClick,
  errorCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Keep mutable references to PlayCanvas objects for interaction
  const appRef = useRef<pc.Application | null>(null);
  const cameraEntityRef = useRef<pc.Entity | null>(null);
  const tileEntitiesRef = useRef<pc.Entity[][]>([]);
  const stateEntitiesRef = useRef<(pc.Entity | null)[][]>([]);
  
  // Animation state tracking
  const animStatesRef = useRef<{
    scale: number;
    targetScale: number;
    wiggleTime: number;
    spinSpeed: number;
    bobOffset: number;
  }[][]>([]);

  // Config constants
  const spacing = 1.15;
  const tileHeight = 0.25;

  // Region colors matching index.css cozy theme
  const regionColors = [
    new pc.Color(1.0, 0.81, 0.81), // 0: Soft Pink (#ffcfcf)
    new pc.Color(0.76, 0.89, 0.76), // 1: Soft Mint (#c3e2c2)
    new pc.Color(0.86, 0.87, 0.92), // 2: Soft Lavender-Blue (#dbdfea)
    new pc.Color(1.0, 0.91, 0.58), // 3: Soft Gold-Yellow (#ffe893)
    new pc.Color(0.92, 0.83, 0.75), // 4: Soft Peach-Tan (#ebd3be)
    new pc.Color(0.73, 0.93, 0.87), // 5: Pale Teal (#b9eddd)
    new pc.Color(0.92, 0.78, 0.78), // 6: Dusty Rose (#eac7c7)
    new pc.Color(0.82, 0.91, 0.91), // 7: Pastel Blue-Green (#d2e9e9)
    new pc.Color(0.97, 0.90, 0.77), // 8: Soft Straw-Yellow (#f7e6c4)
  ];
  
  const borderMaterialColor = new pc.Color(0.36, 0.25, 0.22); // Chocolate-brown (#5d4037)
  const catColor = new pc.Color(0.98, 0.95, 0.92); // White-Cream
  const catEarColor = new pc.Color(1.0, 0.7, 0.75); // Pink
  const catEyeColor = new pc.Color(0.2, 0.15, 0.1); // Dark Brown
  const xMarkColor = new pc.Color(0.74, 0.67, 0.64); // Muted brown (#bcaaa4)
  
  // Helpers for WebGL model assembly (combining primitives)
  const createMaterial = (app: pc.Application, color: pc.Color, gloss = 0.4) => {
    const mat = new pc.StandardMaterial();
    mat.diffuse = color;
    mat.gloss = gloss;
    mat.useLighting = true;
    mat.update();
    return mat;
  };

  const create3DCat = (app: pc.Application) => {
    const parent = new pc.Entity('cat-parent');
    
    // Head Sphere
    const head = new pc.Entity('cat-head');
    head.addComponent('render', { type: 'sphere' });
    head.render!.material = createMaterial(app, catColor);
    head.setLocalPosition(0, 0.25, 0);
    head.setLocalScale(0.45, 0.45, 0.45);
    parent.addChild(head);

    // Left Ear Cone
    const leftEar = new pc.Entity('cat-left-ear');
    leftEar.addComponent('render', { type: 'cone' });
    leftEar.render!.material = createMaterial(app, catEarColor);
    leftEar.setLocalPosition(-0.16, 0.45, -0.05);
    leftEar.setLocalScale(0.18, 0.25, 0.18);
    leftEar.setLocalEulerAngles(0, 0, 20);
    parent.addChild(leftEar);

    // Right Ear Cone
    const rightEar = new pc.Entity('cat-right-ear');
    rightEar.addComponent('render', { type: 'cone' });
    rightEar.render!.material = createMaterial(app, catEarColor);
    rightEar.setLocalPosition(0.16, 0.45, -0.05);
    rightEar.setLocalScale(0.18, 0.25, 0.18);
    rightEar.setLocalEulerAngles(0, 0, -20);
    parent.addChild(rightEar);

    // Left Eye Sphere
    const leftEye = new pc.Entity('cat-left-eye');
    leftEye.addComponent('render', { type: 'sphere' });
    leftEye.render!.material = createMaterial(app, catEyeColor);
    leftEye.setLocalPosition(-0.1, 0.28, 0.18);
    leftEye.setLocalScale(0.06, 0.06, 0.06);
    parent.addChild(leftEye);

    // Right Eye Sphere
    const rightEye = new pc.Entity('cat-right-eye');
    rightEye.addComponent('render', { type: 'sphere' });
    rightEye.render!.material = createMaterial(app, catEyeColor);
    rightEye.setLocalPosition(0.1, 0.28, 0.18);
    rightEye.setLocalScale(0.06, 0.06, 0.06);
    parent.addChild(rightEye);

    // Nose Sphere (pink)
    const nose = new pc.Entity('cat-nose');
    nose.addComponent('render', { type: 'sphere' });
    nose.render!.material = createMaterial(app, new pc.Color(1, 0.6, 0.6));
    nose.setLocalPosition(0, 0.22, 0.21);
    nose.setLocalScale(0.05, 0.04, 0.04);
    parent.addChild(nose);

    // Collar Collar Box
    const collar = new pc.Entity('cat-collar');
    collar.addComponent('render', { type: 'cylinder' });
    collar.render!.material = createMaterial(app, new pc.Color(1, 0.5, 0.5));
    collar.setLocalPosition(0, 0.08, 0);
    collar.setLocalScale(0.35, 0.05, 0.35);
    parent.addChild(collar);

    return parent;
  };

  const create3DXMark = (app: pc.Application) => {
    const parent = new pc.Entity('x-parent');
    
    // Bar 1 (Box)
    const bar1 = new pc.Entity('bar-1');
    bar1.addComponent('render', { type: 'box' });
    bar1.render!.material = createMaterial(app, xMarkColor);
    bar1.setLocalPosition(0, 0.2, 0);
    bar1.setLocalScale(0.12, 0.12, 0.45);
    bar1.setLocalEulerAngles(0, 45, 0);
    parent.addChild(bar1);

    // Bar 2 (Box)
    const bar2 = new pc.Entity('bar-2');
    bar2.addComponent('render', { type: 'box' });
    bar2.render!.material = createMaterial(app, xMarkColor);
    bar2.setLocalPosition(0, 0.2, 0);
    bar2.setLocalScale(0.12, 0.12, 0.45);
    bar2.setLocalEulerAngles(0, -45, 0);
    parent.addChild(bar2);

    return parent;
  };

  // Setup the PlayCanvas Application
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Reset size state arrays
    tileEntitiesRef.current = Array.from({ length: size }, () => []);
    stateEntitiesRef.current = Array.from({ length: size }, () => []);
    animStatesRef.current = Array.from({ length: size }, () => []);

    // Create App
    const app = new pc.Application(canvasRef.current, {
      mouse: new pc.Mouse(canvasRef.current),
      touch: new pc.TouchDevice(canvasRef.current),
      graphicsDeviceOptions: { alpha: true, antialias: true },
    });
    
    // Enable full canvas sizing
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.setCanvasFillMode(pc.FILLMODE_NONE);
    appRef.current = app;

    // Adjust size on screen change
    const resize = () => {
      if (containerRef.current && canvasRef.current) {
        const w = containerRef.current.clientWidth;
        canvasRef.current.width = w;
        canvasRef.current.height = w; // keep 1:1 aspect ratio
        app.resizeCanvas(w, w);
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Start rendering loop
    app.start();

    // Create Camera
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0, 0, 0, 0), // Transparent background, falls back to CSS bg
      projection: pc.PROJECTION_PERSPECTIVE,
      fov: 40,
    });
    
    // Position camera dynamically based on grid size
    const cameraDist = size * 1.3 + 1.5;
    camera.setPosition(0, cameraDist * 1.25, cameraDist * 0.9);
    camera.lookAt(new pc.Vec3(0, -0.2, 0));
    app.root.addChild(camera);
    cameraEntityRef.current = camera;

    // Light Source
    const light = new pc.Entity('light');
    light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1.0, 0.98, 0.95),
      intensity: 1.2,
      castShadows: false,
    });
    light.setEulerAngles(45, 45, 0);
    app.root.addChild(light);

    // Ambient Light
    const ambient = new pc.Entity('ambient-light');
    ambient.addComponent('light', {
      type: 'ambient',
      color: new pc.Color(0.65, 0.65, 0.68),
      intensity: 0.8,
    });
    app.root.addChild(ambient);

    // Generate grid tiles
    const offset = (size - 1) / 2;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const regionId = regions[r][c];
        const tileColor = regionColors[regionId % regionColors.length];

        const tile = new pc.Entity(`tile-${r}-${c}`);
        tile.addComponent('render', { type: 'box' });
        tile.render!.material = createMaterial(app, tileColor, 0.3);
        
        // Position cell
        const px = (c - offset) * spacing;
        const pz = (r - offset) * spacing;
        tile.setPosition(px, 0, pz);
        tile.setLocalScale(1.0, tileHeight, 1.0);
        
        app.root.addChild(tile);
        tileEntitiesRef.current[r][c] = tile;
        stateEntitiesRef.current[r][c] = null;
        
        animStatesRef.current[r][c] = {
          scale: 0,
          targetScale: 0,
          wiggleTime: 0,
          spinSpeed: 0,
          bobOffset: Math.random() * 100,
        };
      }
    }

    // Add a dark solid base board underneath the tiles for visual separation
    const baseBoard = new pc.Entity('base-board');
    baseBoard.addComponent('render', { type: 'box' });
    baseBoard.render!.material = createMaterial(app, borderMaterialColor, 0.2);
    const boardWidth = size * spacing + 0.15;
    baseBoard.setPosition(0, -tileHeight, 0);
    baseBoard.setLocalScale(boardWidth, tileHeight, boardWidth);
    app.root.addChild(baseBoard);

    // Tap/Click raycasting handler
    const onPointerDown = (screenX: number, screenY: number) => {
      if (!cameraEntityRef.current || !canvasRef.current) return;
      
      // Calculate ray from screen pointer coords
      const rect = canvasRef.current.getBoundingClientRect();
      const relativeX = screenX - rect.left;
      const relativeY = screenY - rect.top;

      // Project screen point to 3D world near and far clip planes
      const start = new pc.Vec3();
      const end = new pc.Vec3();
      cameraEntityRef.current.camera!.screenToWorld(relativeX, relativeY, cameraEntityRef.current.camera!.nearClip, start);
      cameraEntityRef.current.camera!.screenToWorld(relativeX, relativeY, cameraEntityRef.current.camera!.farClip, end);

      // Perform ray-plane intersection on plane y = tileHeight / 2 (top surface of tiles)
      const planeY = tileHeight / 2;
      const dirY = end.y - start.y;
      
      if (Math.abs(dirY) > 0.0001) {
        const t = (planeY - start.y) / dirY;
        if (t >= 0 && t <= 1) {
          const hitX = start.x + t * (end.x - start.x);
          const hitZ = start.z + t * (end.z - start.z);

          // Find closest tile coordinate
          const hitC = Math.round(hitX / spacing + offset);
          const hitR = Math.round(hitZ / spacing + offset);

          if (hitR >= 0 && hitR < size && hitC >= 0 && hitC < size) {
            onCellClick(hitR, hitC);
          }
        }
      }
    };

    // Attach Mouse listeners
    const handleMouseDown = (e: MouseEvent) => {
      onPointerDown(e.clientX, e.clientY);
    };
    if (app.mouse) {
      app.mouse.on(pc.EVENT_MOUSEDOWN, handleMouseDown);
    }

    // Attach Touch listeners
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    if (app.touch) {
      canvasRef.current.addEventListener('touchstart', handleTouchStart, { passive: true });
    }

    // Animation update loop using pc.EVENT_UPDATE
    let timeAccumulator = 0;
    const onUpdate = (dt: number) => {
      timeAccumulator += dt;
      const offsetVal = (size - 1) / 2;
      
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const tile = tileEntitiesRef.current[r][c];
          const stateEntity = stateEntitiesRef.current[r][c];
          const anim = animStatesRef.current[r][c];
          if (!tile || !anim) continue;

          // Wiggle tile if this is the error cell shaking
          const isErrorWiggling = errorCell?.row === r && errorCell?.col === c;
          if (isErrorWiggling) {
            anim.wiggleTime += dt * 35; // speed of shake
            const shakeOffset = Math.sin(anim.wiggleTime) * 0.12;
            tile.setPosition(
              (c - offsetVal) * spacing + shakeOffset,
              0,
              (r - offsetVal) * spacing
            );
          } else {
            // Normal tile rest position
            anim.wiggleTime = 0;
            tile.setPosition((c - offsetVal) * spacing, 0, (r - offsetVal) * spacing);
          }

          // Smoothly animate scale of child entities (cats or X markers)
          if (stateEntity) {
            if (anim.scale < anim.targetScale) {
              anim.scale = Math.min(anim.targetScale, anim.scale + dt * 5.0); // quick scale up
            } else if (anim.scale > anim.targetScale) {
              anim.scale = Math.max(anim.targetScale, anim.scale - dt * 6.0); // quick scale down
            }

            stateEntity.setLocalScale(anim.scale, anim.scale, anim.scale);

            // If it is a Cat entity, add a subtle idle breathing/bobbing and rotation animation
            if (stateEntity.name === 'cat-parent') {
              const bob = Math.sin(timeAccumulator * 3.5 + anim.bobOffset) * 0.04;
              const catHead = stateEntity.findByName('cat-head');
              if (catHead) {
                catHead.setLocalPosition(0, 0.25 + bob, 0);
              }
              // Gentle rotation
              stateEntity.setLocalEulerAngles(0, Math.sin(timeAccumulator * 1.5 + anim.bobOffset) * 8, 0);
            }
          }
        }
      }
    };
    app.on('update', onUpdate);

    // Clean up
    return () => {
      window.removeEventListener('resize', resize);
      if (appRef.current) {
        appRef.current.off('update', onUpdate);
        if (appRef.current.mouse) {
          appRef.current.mouse.off(pc.EVENT_MOUSEDOWN, handleMouseDown);
        }
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('touchstart', handleTouchStart);
        }
        appRef.current.destroy();
      }
    };
  }, [size, regions]); // Rebuild board if size or region partitions change

  // Synchronize React grid changes to the PlayCanvas scene
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const val = grid[r][c];
        const currentEntity = stateEntitiesRef.current[r][c];
        const tile = tileEntitiesRef.current[r][c];
        const anim = animStatesRef.current[r][c];

        if (!tile || !anim) continue;

        // Determine if entity type matches current value
        let needsRebuild = false;
        if (val === 'CAT' && (!currentEntity || currentEntity.name !== 'cat-parent')) needsRebuild = true;
        else if (val === 'X' && (!currentEntity || currentEntity.name !== 'x-parent')) needsRebuild = true;
        else if (val === null && currentEntity !== null) needsRebuild = true;

        if (needsRebuild) {
          // Remove old child entity
          if (currentEntity) {
            tile.removeChild(currentEntity);
            currentEntity.destroy();
            stateEntitiesRef.current[r][c] = null;
          }

          // Build new child entity
          if (val === 'CAT') {
            const cat = create3DCat(app);
            cat.setLocalScale(0, 0, 0); // start collapsed
            tile.addChild(cat);
            stateEntitiesRef.current[r][c] = cat;
            anim.scale = 0;
            anim.targetScale = 1.0;
          } else if (val === 'X') {
            const xMark = create3DXMark(app);
            xMark.setLocalScale(0, 0, 0); // start collapsed
            tile.addChild(xMark);
            stateEntitiesRef.current[r][c] = xMark;
            anim.scale = 0;
            anim.targetScale = 1.0;
          }
        }
      }
    }
  }, [grid, size]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        aspectRatio: '1', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'transparent',
        overflow: 'hidden'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          outline: 'none',
          cursor: 'pointer'
        }} 
      />
    </div>
  );
};
