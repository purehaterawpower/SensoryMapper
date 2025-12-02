'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";

export default function FilterPlayground() {
  // --- STATE FOR ALL FILTER VARIABLES ---
  const [baseOpacity, setBaseOpacity] = useState(0.7);
  
  // Layer 1: Ambient Throw (The widest, faintest layer)
  const [l1Blur, setL1Blur] = useState(40);
  const [l1Slope, setL1Slope] = useState(0.4);

  // Layer 2: Mid Glow (The bridge)
  const [l2Blur, setL2Blur] = useState(15);
  const [l2Slope, setL2Slope] = useState(0.6);

  // Layer 3: Hot Core (The dense center)
  const [l3Blur, setL3Blur] = useState(6);

  // View Controls
  const [shapeType, setShapeType] = useState<'circle' | 'rect' | 'polygon'>('circle');
  const [shapeColor, setShapeColor] = useState('#ef4444'); // Tailwind red-500
  const [bgColor, setBgColor] = useState('#f3f4f6'); // Tailwind gray-100

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background text-foreground font-sans">
      
      {/* LEFT: CONTROLS */}
      <div className="w-full lg:w-1/3 p-6 border-r overflow-y-auto bg-card shadow-sm z-10">
        <h2 className="text-2xl font-bold mb-6">Heatmap Tuner</h2>
        
        <div className="space-y-8">
          
          {/* Base Shape */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              Base Shape
            </h3>
            
            <Control 
              label="Base Opacity" 
              value={baseOpacity} 
              setValue={setBaseOpacity} 
              min={0} max={1} step={0.05} 
              desc="Opacity of the SVG element BEFORE it hits the filter."
            />
             <div className="flex gap-2 mt-4">
                <button 
                    onClick={() => setShapeType('circle')}
                    className={cn("px-3 py-1 text-xs rounded border", shapeType === 'circle' ? "bg-primary text-primary-foreground" : "bg-muted")}
                >Circle</button>
                <button 
                    onClick={() => setShapeType('rect')}
                    className={cn("px-3 py-1 text-xs rounded border", shapeType === 'rect' ? "bg-primary text-primary-foreground" : "bg-muted")}
                >Rectangle</button>
                <button 
                    onClick={() => setShapeType('polygon')}
                    className={cn("px-3 py-1 text-xs rounded border", shapeType === 'polygon' ? "bg-primary text-primary-foreground" : "bg-muted")}
                >Polygon</button>
             </div>
             <div className="flex gap-2 items-center mt-2">
                <label className="text-xs">Color:</label>
                <input type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} />
                <label className="text-xs ml-4">Background:</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
             </div>
          </div>

          {/* Layer 1 */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400"></span>
              Layer 1: Ambient (Throw)
            </h3>
            <Control 
              label="Blur Radius (stdDeviation)" 
              value={l1Blur} setValue={setL1Blur} 
              min={0} max={100} 
              desc="How far the faint glow reaches."
            />
            <Control 
              label="Opacity Slope" 
              value={l1Slope} setValue={setL1Slope} 
              min={0} max={1} step={0.05} 
              desc="Visibility of the outer glow (lower = fainter)."
            />
          </div>

          {/* Layer 2 */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              Layer 2: Mid Glow
            </h3>
            <Control 
              label="Blur Radius" 
              value={l2Blur} setValue={setL2Blur} 
              min={0} max={50} 
            />
            <Control 
              label="Opacity Slope" 
              value={l2Slope} setValue={setL2Slope} 
              min={0} max={1} step={0.05} 
            />
          </div>

          {/* Layer 3 */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Layer 3: Hot Core
            </h3>
            <Control 
              label="Blur Radius" 
              value={l3Blur} setValue={setL3Blur} 
              min={0} max={20} 
              desc="Softens the hard edges of the shape itself."
            />
          </div>
        </div>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="flex-1 flex flex-col relative" style={{ backgroundColor: bgColor }}>
        
        {/* The Sandbox Area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
            
            {/* Grid for scale reference */}
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            <svg width="100%" height="100%" className="overflow-visible">
                <defs>
                    <filter id="playground-glow" x="-200%" y="-200%" width="500%" height="500%">
                        
                        {/* Dynamic Layer 1 */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation={l1Blur} result="ambient" />
                        <feComponentTransfer in="ambient" result="ambientLow">
                            <feFuncA type="linear" slope={l1Slope} />
                        </feComponentTransfer>

                        {/* Dynamic Layer 2 */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation={l2Blur} result="glow" />
                        <feComponentTransfer in="glow" result="glowMed">
                            <feFuncA type="linear" slope={l2Slope} />
                        </feComponentTransfer>

                        {/* Dynamic Layer 3 */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation={l3Blur} result="core" />

                        <feMerge>
                            <feMergeNode in="ambientLow" />
                            <feMergeNode in="glowMed" />
                            <feMergeNode in="core" />
                        </feMerge>
                    </filter>
                </defs>

                <g style={{ transform: 'translate(50%, 50%)' }}>
                    {shapeType === 'circle' && (
                         <circle r="60" fill={shapeColor} fillOpacity={baseOpacity} filter="url(#playground-glow)" />
                    )}
                    {shapeType === 'rect' && (
                         <rect x="-60" y="-60" width="120" height="120" fill={shapeColor} fillOpacity={baseOpacity} filter="url(#playground-glow)" />
                    )}
                    {shapeType === 'polygon' && (
                         <polygon points="0,-80 70,60 -70,60" fill={shapeColor} fillOpacity={baseOpacity} filter="url(#playground-glow)" />
                    )}
                </g>
            </svg>
        </div>

        {/* Generated Code Output */}
        <div className="h-64 bg-slate-900 text-slate-50 p-6 border-t font-mono text-sm overflow-auto">
            <h4 className="text-slate-400 mb-2 uppercase text-xs tracking-wider">Generated Configuration</h4>
            <pre className="whitespace-pre-wrap selection:bg-blue-500/30">
{`// In components/MapArea.tsx

const renderShape = (shape: Shape | NumberedItem) => {
  // ...
  const BASE_OPACITY = ${baseOpacity}; 
  // ...
  const commonProps = {
    // ...
    fillOpacity: isEditing || showNumberedIcons ? 0.4 : BASE_OPACITY,
    filter: isEditing ? 'none' : "url(#soft-glow)",
    // ...
  }
}

// In the <defs> section:
<filter id="soft-glow" x="-200%" y="-200%" width="500%" height="500%">
    {/* Layer 1: Ambient */}
    <feGaussianBlur in="SourceGraphic" stdDeviation="${l1Blur}" result="ambient" />
    <feComponentTransfer in="ambient" result="ambientLow">
        <feFuncA type="linear" slope="${l1Slope}" /> 
    </feComponentTransfer>

    {/* Layer 2: Glow */}
    <feGaussianBlur in="SourceGraphic" stdDeviation="${l2Blur}" result="glow" />
    <feComponentTransfer in="glow" result="glowMed">
        <feFuncA type="linear" slope="${l2Slope}" /> 
    </feComponentTransfer>
    
    {/* Layer 3: Core */}
    <feGaussianBlur in="SourceGraphic" stdDeviation="${l3Blur}" result="core" />
    
    <feMerge>
        <feMergeNode in="ambientLow" />
        <feMergeNode in="glowMed" />
        <feMergeNode in="core" /> 
    </feMerge>
</filter>`}
            </pre>
        </div>
      </div>
    </div>
  );
}

// Simple internal helper for sliders
function Control({ label, value, setValue, min, max, step = 1, desc }: any) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-sm text-muted-foreground font-mono">{value}</span>
            </div>
            <input 
                type="range" 
                min={min} max={max} step={step} 
                value={value} 
                onChange={(e) => setValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
        </div>
    );
}