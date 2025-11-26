'use client';

import { Item, Marker, Shape } from '@/lib/types';
import { ALL_SENSORY_DATA } from '@/lib/constants';
import Image from 'next/image';
import { Progress } from '../ui/progress';

type PrintableReportProps = {
  mapImage: string | null;
  imageDimensions: { width: number; height: number } | null;
  items: Item[];
};

type NumberedItem = Item & { number: number };

const MapRenderer = ({
  mapImage,
  imageDimensions,
  items,
}: {
  mapImage: string | null;
  imageDimensions: { width: number; height: number } | null;
  items: NumberedItem[];
}) => {
  if (!imageDimensions || !mapImage) {
    return null;
  }
  
  const aspectRatio = imageDimensions.height / imageDimensions.width;

  const renderMarker = (marker: Marker & { number: number }) => {
    const { icon: Icon } = ALL_SENSORY_DATA[marker.type];
    const itemStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${(marker.x / imageDimensions.width) * 100}%`,
      top: `${(marker.y / imageDimensions.height) * 100}%`,
      transform: 'translate(-50%, -50%)',
    };
    return (
      <div key={marker.id} style={itemStyle}>
        <div
          className="p-1.5 rounded-full shadow-lg relative"
          style={{
            backgroundColor: marker.color || ALL_SENSORY_DATA[marker.type].color,
          }}
        >
          <Icon className="w-5 h-5 text-white" />
           <div className="absolute -top-1 -right-1 bg-background text-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold border">
            {marker.number}
          </div>
        </div>
      </div>
    );
  };

  const renderShape = (shape: Shape & { number: number }) => {
    const { icon: Icon } = ALL_SENSORY_DATA[shape.type];
    const color = shape.color || ALL_SENSORY_DATA[shape.type].color;
    const fill = color;

    let center: { x: number, y: number } = { x: 0, y: 0 };
    if (shape.shape === 'rectangle') {
      center = { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
    } else if (shape.shape === 'circle') {
      center = { x: shape.cx, y: shape.cy };
    } else if (shape.shape === 'polygon') {
      let xSum = 0, ySum = 0;
      shape.points.forEach(p => { xSum += p.x; ySum += p.y; });
      center = { x: xSum / shape.points.length, y: ySum / shape.points.length };
    }

    const iconSize = 20;
    const textNumberSize = 18;
    const spacing = 4;
    const totalWidth = iconSize + spacing + textNumberSize;
    const iconX = center.x - totalWidth / 2;
    const numberX = iconX + iconSize + spacing;


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
        <foreignObject x={iconX} y={center.y - iconSize / 2} width={iconSize} height={iconSize}>
            <Icon className="w-full h-full" fill="white" stroke="black" strokeWidth="0.5" />
        </foreignObject>
        <text
            x={numberX}
            y={center.y}
            textAnchor="start"
            dominantBaseline="central"
            fill="white"
            stroke="black"
            strokeWidth="1px"
            paintOrder="stroke"
            fontSize={textNumberSize}
            fontWeight="bold"
          >
            {shape.number}
        </text>
      </g>
    );
  };
  
  const mapContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: `${aspectRatio * 100}%`,
  };

  const svgStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'visible'
  };


  return (
    <div style={mapContainerStyle}>
        <img
          src={mapImage}
          alt="Floor Plan"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        <div style={svgStyle}>
            <svg width="100%" height="100%" viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`} style={{overflow: 'visible'}}>
            {items
                .filter((item) => item.shape !== 'marker')
                .map((item) => renderShape(item as Shape & { number: number }))}
            </svg>
        </div>
        <div style={svgStyle}>
            {items
            .filter((item) => item.shape === 'marker')
            .map((item) => renderMarker(item as Marker & { number: number }))}
        </div>
    </div>
  );
};

export function PrintableReport({
  mapImage,
  imageDimensions,
  items,
}: PrintableReportProps) {
  // All visible items get a number for the map and are included in the list
  const listItems: NumberedItem[] = items.map((item, index) => ({ ...item, number: index + 1 }));

  return (
    <div className="p-8 bg-white text-black">
      <style>
        {`@page { size: A4; margin: 20mm; }`}
      </style>
      <div className="space-y-8" style={{ breakAfter: 'page' }}>
        <h1 className="text-3xl font-bold">Sensory Map Report</h1>
        <div style={{width: '100%', maxWidth: '100%'}}>
          <MapRenderer mapImage={mapImage} imageDimensions={imageDimensions} items={listItems} />
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Annotations</h2>
        <div className="space-y-6">
          {listItems.length > 0 ? (
            listItems.map((item) => {
              const { name: categoryName, icon: Icon, color } = ALL_SENSORY_DATA[item.type];
              const isSensoryArea = item.shape !== 'marker' && item.type !== 'quietRoom';
              return (
                <div key={item.id} className="p-4 border rounded-lg" style={{ breakInside: 'avoid' }}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="font-bold text-lg w-6 text-center pt-1">{item.number}.</div>
                    <div className="p-1.5 rounded-md mt-1" style={{ backgroundColor: item.color || color }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className='flex-1'>
                      <h3 className="text-lg font-semibold">{categoryName}</h3>
                      {isSensoryArea && item.intensity !== undefined && (
                        <div className='flex items-center gap-2 mt-1'>
                            <span className="text-xs text-slate-600">Level:</span>
                            <Progress value={item.intensity} className="h-2 w-24" style={{ '--primary': item.color } as React.CSSProperties} />
                             <span className="text-xs text-slate-600 w-16">
                                {item.intensity < 33 ? 'Low' : item.intensity < 66 ? 'Medium' : 'High'}
                            </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 ml-9" style={{ gridTemplateColumns: item.imageUrl ? '1fr 150px' : '1fr' }}>
                    {item.description ? (
                        <p className="text-sm">{item.description}</p>
                    ) : (
                        (!item.imageUrl) && <p className='text-sm text-slate-500'>No details provided for this item.</p>
                    )}
                    {item.imageUrl && (
                       <Image
                          src={item.imageUrl}
                          alt={`Annotation image for ${categoryName}`}
                          width={150}
                          height={100}
                          className="rounded-md object-cover"
                        />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No annotations have been added to the map.</p>
          )}
        </div>
      </div>
    </div>
  );
}
