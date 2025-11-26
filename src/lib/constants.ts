import type { SensoryType, SensoryInfo } from './types';
import { Hand, Scale, User, Eye, Ear } from 'lucide-react';
import { NoseIcon } from '@/components/icons/NoseIcon';
import { TasteIcon } from '@/components/icons/TasteIcon';

export const SENSORY_TYPES: SensoryType[] = ['vision', 'hearing', 'smell', 'vestibular', 'taste', 'touch', 'proprioception'];

export const SENSORY_DATA: Record<SensoryType, SensoryInfo> = {
  vision: { 
    name: 'Vision', 
    description: 'The capacity to perceive and interpret light and color.',
    icon: Eye, 
    color: 'hsl(271 76% 53%)', 
    className: 'border-purple-500 bg-purple-500/20 text-purple-600' 
  },
  hearing: { 
    name: 'Hearing', 
    description: 'The capacity to perceive and interpret sound.',
    icon: Ear, 
    color: 'hsl(0 84% 60%)', 
    className: 'border-red-500 bg-red-500/20 text-red-600' 
  },
  smell: { 
    name: 'Smell', 
    description: 'The capacity to perceive and interpret smells.',
    icon: NoseIcon, 
    color: 'hsl(50 95% 55%)', 
    className: 'border-yellow-500 bg-yellow-500/20 text-yellow-600' 
  },
  vestibular: { 
    name: 'The vestibular system', 
    description: 'The capacity to perceive and interpret the position and movement of the head, through which one can orient oneself in space and time.',
    icon: Scale, 
    color: 'hsl(145 63% 49%)', 
    className: 'border-green-500 bg-green-500/20 text-green-600' 
  },
  taste: { 
    name: 'Taste', 
    description: 'The capacity to perceive and interpret qualities of food and other materials in the mouth.',
    icon: TasteIcon, 
    color: 'hsl(340 82% 52%)', 
    className: 'border-pink-500 bg-pink-500/20 text-pink-600' 
  },
  touch: { 
    name: 'Touch', 
    description: 'The tactile system through which one can perceive and interpret with the skin, among other things, pressure, temperature and pain.',
    icon: Hand, 
    color: 'hsl(210 80% 60%)', 
    className: 'border-blue-500 bg-blue-500/20 text-blue-600' 
  },
  proprioception: { 
    name: 'The proprioceptive system', 
    description: 'which mainly perceives and interprets the condition of the muscles in ones own body.',
    icon: User, 
    color: 'hsl(30 90% 55%)', 
    className: 'border-orange-500 bg-orange-500/20 text-orange-600' 
  },
};
