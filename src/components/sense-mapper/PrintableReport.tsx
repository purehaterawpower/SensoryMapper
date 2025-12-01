'use client';

import { Item, Marker, PrintOrientation, Shape } from '@/lib/types';
import { ALL_SENSORY_DATA, PRACTICAL_AMENITY_TYPES } from '@/lib/constants';
import Image from 'next/image';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

type PrintableReportProps = {
  mapImage: string | null;
  imageDimensions: { width: number; height: number } | null;
  items: Item[];
  printOrientation: PrintOrientation;
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
    const isFacility = PRACTICAL_AMENITY_TYPES.some(t => t === marker.type);

    const scaleFactor = isFacility ? 0.8 + ((marker.size ?? 50) / 100) * 1.2 : 1;
    const iconSize = 20 * scaleFactor;
    const padding = 6 * scaleFactor;
    const numberSize = 16 * (0.9 + (scaleFactor - 1) * 0.5);

    const itemStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${(marker.x / imageDimensions.width) * 100}%`,
      top: `${(marker.y / imageDimensions.height) * 100}%`,
      transform: 'translate(-50%, -50%)',
    };
    return (
      <div key={marker.id} style={itemStyle}>
        <div
          className="rounded-full shadow-lg relative flex items-center justify-center"
          style={{
            backgroundColor: marker.color || ALL_SENSORY_DATA[marker.type].color,
            padding: `${padding}px`
          }}
        >
          <Icon className="text-white" style={{width: iconSize, height: iconSize}}/>
           <div 
            className="absolute -top-1 -right-1 bg-background text-foreground rounded-full flex items-center justify-center font-bold border"
            style={{ width: numberSize, height: numberSize, fontSize: numberSize * 0.7 }}
          >
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
  printOrientation,
}: PrintableReportProps) {
  const listItems: NumberedItem[] = items.map((item, index) => ({ ...item, number: index + 1 }));

  return (
    <div className="p-8 bg-white text-black">
      <style>
        {`@page { size: A4 ${printOrientation}; margin: 20mm; }`}
      </style>
      <div className="space-y-8" style={{ breakAfter: 'page' }}>
        <h1 className="text-3xl font-bold">Sensory Map Report</h1>
        <div style={{width: '100%', maxWidth: '100%'}}>
          <MapRenderer mapImage={mapImage} imageDimensions={imageDimensions} items={listItems} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Annotations</h2>
        {listItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[150px]">Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listItems.map((item) => {
                const { name: categoryName, icon: Icon, color } = ALL_SENSORY_DATA[item.type];
                const isSensoryArea = item.shape !== 'marker' && item.type !== 'quietRoom';
                return (
                  <TableRow key={item.id} style={{ breakInside: 'avoid' }}>
                    <TableCell className="font-medium align-top">{item.number}.</TableCell>
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md mt-1" style={{ backgroundColor: item.color || color }}>
                              <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold">{categoryName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                        {item.description ? (
                            <p className="text-sm">{item.description}</p>
                        ) : (
                            <p className="text-sm text-slate-500">No description provided.</p>
                        )}
                        {isSensoryArea && item.intensity !== undefined && (
                            <div className='flex items-center gap-2 mt-2'>
                                <span className="text-xs text-slate-600">Level:</span>
                                <Progress value={item.intensity} className="h-2 w-24" style={{ '--primary': item.color } as React.CSSProperties} />
                                <span className="text-xs text-slate-600 w-16">
                                    {item.intensity < 33 ? 'Low' : item.intensity < 66 ? 'Medium' : 'High'}
                                </span>
                            </div>
                        )}
                    </TableCell>
                    <TableCell className="align-top">
                      {item.imageUrl && (
                         <Image
                            src={item.imageUrl}
                            alt={`Annotation image for ${categoryName}`}
                            width={150}
                            height={100}
                            className="rounded-md object-cover"
                          />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm">No annotations have been added to the map.</p>
        )}
      </div>
    </div>
  );
}
