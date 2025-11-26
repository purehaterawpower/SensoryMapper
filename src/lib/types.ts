import type { LucideProps } from 'lucide-react';
import type React from 'react';

export type SensoryType = 'touch' | 'proprioception' | 'vestibular' | 'vision' | 'hearing' | 'smell';
export type AmenityType = 'quietArea' | 'seating' | 'toilets' | 'exit' | 'help' | 'firstAid' | 'food';

export type ItemType = SensoryType | AmenityType;

export type BaseInfo = {
  name: string;
  description: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> | React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export type SensoryInfo = BaseInfo;
export type AmenityInfo = BaseInfo;

export type Point = { x: number; y: number };

export type BaseItem = {
  id: string;
  type: ItemType;
  description: string;
  color?: string;
};

export type Marker = BaseItem & {
  shape: 'marker';
  x: number;
  y: number;
};

export type RectangleShape = BaseItem & {
  shape: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleShape = BaseItem & {
  shape: 'circle';
  cx: number;
  cy: number;
  radius: number;
};

export type PolygonShape = BaseItem & {
  shape: 'polygon';
  points: Point[];
};

export type Shape = RectangleShape | CircleShape | PolygonShape;

export type Item = Marker | Shape;

export type DrawingShape = 'rectangle' | 'circle' | 'polygon';
export type ActiveTool = {
  tool: 'select' | 'shape' | 'marker';
  type?: ItemType;
  shape?: DrawingShape;
};
