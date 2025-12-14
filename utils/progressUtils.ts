
import { Dispatch, SetStateAction } from 'react';

type SetProgressState = Dispatch<SetStateAction<{ stage: string; percentage: number }>>;

export const simulateTranscriptionProgress = (
  audioDuration: number,
  setProgressState: SetProgressState,
): (() => void) => {
  setProgressState({ stage: 'Sending to AI for transcription...', percentage: 30 });

  const estimatedProcessingTimeMs = (audioDuration / 4) * 1000;
  const progressSteps = 95 - 30;
  const intervalTime = Math.max(50, estimatedProcessingTimeMs / progressSteps);
  
  setProgressState(prev => ({ ...prev, stage: 'AI is transcribing...' }));
  
  const intervalId = window.setInterval(() => {
    setProgressState(prev => {
      if (prev.percentage >= 95) {
        clearInterval(intervalId);
        return prev;
      }
      return { ...prev, percentage: Math.min(prev.percentage + 1, 95) };
    });
  }, intervalTime);

  return () => clearInterval(intervalId);
};
