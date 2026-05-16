/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SessionGoal {
  STRESS = 'Stress Reduction',
  SLEEP = 'Improved Sleep',
  FOCUS = 'Mental Clarity',
  GENERAL = 'General Health',
}

export interface Session {
  id: string;
  title: string;
  description: string;
  goal: SessionGoal;
  durationMinutes: number;
  pattern: {
    inhale: number;
    pauseAfterInhale: number;
    exhale: number;
    pauseAfterExhale: number;
  };
  intensity: 'Light' | 'Moderate' | 'Advanced';
}

export const SESSION_LIMITS = {
  MIN_BREATH: 1,
  MAX_BREATH: 10,
  MIN_DURATION: 1,
  MAX_DURATION: 10,
};

export const SESSIONS: Session[] = [
  {
    id: 'stress-relief-1',
    title: 'Calm the Storm',
    description: 'Gentle nasal breathing to lower cortisol and soothe the nervous system.',
    goal: SessionGoal.STRESS,
    durationMinutes: 5,
    pattern: {
      inhale: 4,
      pauseAfterInhale: 0,
      exhale: 6,
      pauseAfterExhale: 2,
    },
    intensity: 'Light',
  },
  {
    id: 'sleep-prep-1',
    title: 'Deep Slumber',
    description: 'Minimal air volume to prepare your body for deep, restorative sleep.',
    goal: SessionGoal.SLEEP,
    durationMinutes: 10,
    pattern: {
      inhale: 3,
      pauseAfterInhale: 0,
      exhale: 5,
      pauseAfterExhale: 5,
    },
    intensity: 'Light',
  },
  {
    id: 'focus-sharp-1',
    title: 'Cognitive Flow',
    description: 'Steady oxygenation to sharpen focus and eliminate brain fog.',
    goal: SessionGoal.FOCUS,
    durationMinutes: 7,
    pattern: {
      inhale: 5,
      pauseAfterInhale: 0,
      exhale: 5,
      pauseAfterExhale: 2,
    },
    intensity: 'Moderate',
  },
  {
    id: 'general-health-1',
    title: 'The Foundation',
    description: 'The standard Buteyko reduced breathing method for daily maintenance.',
    goal: SessionGoal.GENERAL,
    durationMinutes: 10,
    pattern: {
      inhale: 4,
      pauseAfterInhale: 0,
      exhale: 4,
      pauseAfterExhale: 4,
    },
    intensity: 'Moderate',
  },
];
