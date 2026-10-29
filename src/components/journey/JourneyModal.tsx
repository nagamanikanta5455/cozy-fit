import React from 'react';
import { Modal } from '../ui/Modal';
import { AllTimeHeatmap } from './AllTimeHeatmap';
import { Workout, ISODate } from '../../domain/types';

interface JourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  workouts: Workout[];
  today: ISODate;
  longestStreak: number;
  onOpenLogger: () => void;
}

export const JourneyModal: React.FC<JourneyModalProps> = ({
  isOpen,
  onClose,
  workouts,
  today,
  longestStreak,
  onOpenLogger,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="The Journey"
      description="All-time consistency heatmap and lifetime movement records."
      maxWidth="lg"
    >
      <div className="max-h-[75dvh] overflow-y-auto pb-safe pr-1 -mr-1">
        <AllTimeHeatmap
          workouts={workouts}
          today={today}
          longestStreak={longestStreak}
          onOpenLogger={() => {
            onClose();
            onOpenLogger();
          }}
        />
      </div>
    </Modal>
  );
};
