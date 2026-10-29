import React from 'react';
import { LucideIconKey } from '../../domain/constants';
import {
  Footprints,
  Activity,
  Bike,
  PersonStanding,
  Dumbbell,
  Zap,
  Waves,
  Trophy,
  MoreHorizontal,
} from 'lucide-react';

interface WorkoutIconProps {
  iconKey: LucideIconKey;
  className?: string;
  size?: number;
}

export const WorkoutIcon: React.FC<WorkoutIconProps> = ({
  iconKey,
  className = 'w-5 h-5',
  size = 20,
}) => {
  const props = {
    className,
    size,
    strokeWidth: 1.75,
  };

  switch (iconKey) {
    case 'Activity':
      return <Activity {...props} />;
    case 'Footprints':
      return <Footprints {...props} />;
    case 'Bike':
      return <Bike {...props} />;
    case 'PersonStanding':
      return <PersonStanding {...props} />;
    case 'Dumbbell':
      return <Dumbbell {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Waves':
      return <Waves {...props} />;
    case 'Trophy':
      return <Trophy {...props} />;
    case 'MoreHorizontal':
    default:
      return <MoreHorizontal {...props} />;
  }
};
