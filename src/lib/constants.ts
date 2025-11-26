import type { SensoryType, SensoryInfo } from './types';
import { Hand, Scale, User, Eye, Ear } from 'lucide-react';
import { NoseIcon } from '@/components/icons/NoseIcon';

export const SENSORY_TYPES: SensoryType[] = ['vision', 'hearing', 'smell', 'vestibular', 'touch', 'proprioception'];

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
    color: '#FDDDB1', // Changed from #FFF5EB to a darker shade for visibility
    className: 'bg-[#FDDDB1]' 
  },
  vestibular: { 
    name: 'The vestibular system', 
    description: 'The capacity to perceive and interpret the position and movement of the head, through which one can orient oneself in space and time.',
    icon: Scale, 
    color: '#007C78', 
    className: 'bg-[#007C78]' 
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
