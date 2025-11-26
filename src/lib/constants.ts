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
    color: '#8DAEF3', 
    className: 'bg-[#8DAEF3]' 
  },
  hearing: { 
    name: 'Hearing', 
    description: 'The capacity to perceive and interpret sound.',
    icon: Ear, 
    color: '#E6ACAC', 
    className: 'bg-[#E6ACAC]' 
  },
  smell: { 
    name: 'Smell', 
    description: 'The capacity to perceive and interpret smells.',
    icon: NoseIcon, 
    color: '#FFF5EB', 
    className: 'bg-[#FFF5EB]' 
  },
  vestibular: { 
    name: 'The vestibular system', 
    description: 'The capacity to perceive and interpret the position and movement of the head, through which one can orient oneself in space and time.',
    icon: Scale, 
    color: '#007C78', 
    className: 'bg-[#007C78]' 
  },
  taste: { 
    name: 'Taste', 
    description: 'The capacity to perceive and interpret qualities of food and other materials in the mouth.',
    icon: TasteIcon, 
    color: '#8E4180', 
    className: 'bg-[#8E4180]' 
  },
  touch: { 
    name: 'Touch', 
    description: 'The tactile system through which one can perceive and interpret with the skin, among other things, pressure, temperature and pain.',
    icon: Hand, 
    color: '#2558D7', 
    className: 'bg-[#2558D7]' 
  },
  proprioception: { 
    name: 'The proprioceptive system', 
    description: 'which mainly perceives and interprets the condition of the muscles in ones own body.',
    icon: User, 
    color: '#F37255', 
    className: 'bg-[#F37255]'
  },
};
