import type { LucideProps } from 'lucide-react';
import type React from 'react';

export type SensoryType = 'touch' | 'vestibular' | 'proprioception' | 'vision' | 'hearing' | 'smell' | 'taste';

export type SensoryInfo = {
  name: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> | React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  className: string;
};

export type Item = {
  id: string;
  // For mapbox, x is longitude, y is latitude
  x: number;
  y: number;
  type: SensoryType;
  description: string;
}

export type Marker = Item;

export type Zone = Item & {
  width: number;
  height: number;
};

export type ActiveTool = {
  tool: 'select' | 'marker' | 'zone';
  type?: SensoryType;
};
