import type { SensoryType, SensoryInfo } from './types';
import { Hand, Scale, User, Eye, Ear } from 'lucide-react';
import { NoseIcon } from '@/components/icons/NoseIcon';
import { TasteIcon } from '@/components/icons/TasteIcon';

export const SENSORY_TYPES: SensoryType[] = ['touch', 'vestibular', 'proprioception', 'vision', 'hearing', 'smell', 'taste'];

export const SENSORY_DATA: Record<SensoryType, SensoryInfo> = {
  touch: { name: 'Touch', icon: Hand, color: 'hsl(210 80% 60%)', className: 'border-blue-500 bg-blue-500/20 text-blue-600' },
  vestibular: { name: 'Vestibular', icon: Scale, color: 'hsl(145 63% 49%)', className: 'border-green-500 bg-green-500/20 text-green-600' },
  proprioception: { name: 'Proprioception', icon: User, color: 'hsl(30 90% 55%)', className: 'border-orange-500 bg-orange-500/20 text-orange-600' },
  vision: { name: 'Vision', icon: Eye, color: 'hsl(271 76% 53%)', className: 'border-purple-500 bg-purple-500/20 text-purple-600' },
  hearing: { name: 'Hearing', icon: Ear, color: 'hsl(0 84% 60%)', className: 'border-red-500 bg-red-500/20 text-red-600' },
  smell: { name: 'Smell', icon: NoseIcon, color: 'hsl(50 95% 55%)', className: 'border-yellow-500 bg-yellow-500/20 text-yellow-600' },
  taste: { name: 'Taste', icon: TasteIcon, color: 'hsl(340 82% 52%)', className: 'border-pink-500 bg-pink-500/20 text-pink-600' }
};
