'use client';

import { Item, Marker, Shape } from '@/lib/types';
import { ALL_SENSORY_DATA } from '@/lib/constants';

type PrintableReportProps = {
  mapImage: string | null;
  imageDimensions: { width: number; height: number } | null;
  items: Item[];
};

const MapRenderer = ({
  mapImage,
  imageDimensions,
  items,
}: PrintableReportProps) => {
  const renderMarker = (marker: Marker) => {
    const { icon: Icon } = ALL_SENSORY_DATA[marker.type];
    const itemStyle: React.CSSProperties = {
      position: 'absolute',
      left: marker.x,
      top: marker.y,
      transform: 'translate(-50%, -50%)',
    };
    return (
      <div key={marker.id} style={itemStyle}>
        <div
          className="p-1.5 rounded-full shadow-lg"
          style={{
            backgroundColor: marker.color || ALL_SENSORY_DATA[marker.type].color,
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  };

  const renderShape = (shape: Shape) => {
    const color = shape.color || ALL_SENSORY_DATA[shape.type].color;
    const fill = color;

    return (
      <g key={shape.id}>
        {shape.shape === 'rectangle' && (
          <rect
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={fill}
            opacity={0.4}
            stroke={color}
            strokeWidth={2}
          />
        )}
        {shape.shape === 'circle' && (
          <circle
            cx={shape.cx}
            cy={shape.cy}
            r={shape.radius}
            fill={fill}
            opacity={0.4}
            stroke={color}
            strokeWidth={2}
          />
        )}
        {shape.shape === 'polygon' && (
          <polygon
            points={shape.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={fill}
            opacity={0.4}
            stroke={color}
            strokeWidth={2}
          />
        )}
      </g>
    );
  };

  const mapStyle: React.CSSProperties = imageDimensions
    ? {
        width: imageDimensions.width,
        height: imageDimensions.height,
        position: 'relative',
      }
    : { display: 'none' };

  return (
    <div style={mapStyle}>
      {mapImage && (
        <img
          src={mapImage}
          alt="Floor Plan"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <svg width="100%" height="100%">
          {items
            .filter((item) => item.shape !== 'marker')
            .map((item) => renderShape(item as Shape))}
        </svg>
      </div>
      {items
        .filter((item) => item.shape === 'marker')
        .map((item) => renderMarker(item as Marker))}
    </div>
  );
};

export function PrintableReport({
  mapImage,
  imageDimensions,
  items,
}: PrintableReportProps) {
  const visibleItems = items.filter(item => item.description);

  return (
    <div className="p-8 bg-white text-black">
      <style>
        {`@page { size: A4; margin: 20mm; }`}
      </style>
      <div className="space-y-8" style={{ breakAfter: 'page' }}>
        <h1 className="text-3xl font-bold">Sensory Map Report</h1>
        <MapRenderer mapImage={mapImage} imageDimensions={imageDimensions} items={items} />
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Annotations</h2>
        <div className="space-y-6">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => {
              const { name: categoryName, icon: Icon, color } = ALL_SENSORY_DATA[item.type];
              return (
                <div key={item.id} className="p-4 border rounded-lg" style={{ breakInside: 'avoid' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 rounded-md" style={{ backgroundColor: item.color || color }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{categoryName}</h3>
                  </div>
                  <p className="text-sm">{item.description}</p>
                </div>
              );
            })
          ) : (
            <p>No annotations with descriptions have been added to the map.</p>
          )}
        </div>
      </div>
    </div>
  );
}
