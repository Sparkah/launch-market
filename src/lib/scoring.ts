import type { Candidate } from '../types';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function scorePrompt(prompt: string): Pick<Candidate, 'fairnessScore' | 'launchScore' | 'businessScore'> {
  const lower = prompt.toLowerCase();
  const hasEvidence = ['proof', 'test', 'validate', 'spec', 'fair'].some((word) => lower.includes(word));
  const hasMarket = ['market', 'launch', 'fund', 'promote', 'revenue'].some((word) => lower.includes(word));
  const hasPlayable = ['game', 'play', 'merge', 'idle', 'physics', 'defense'].some((word) => lower.includes(word));
  const lengthSignal = Math.min(prompt.trim().length / 160, 1);

  return {
    fairnessScore: clamp(64 + (hasEvidence ? 22 : 0) + lengthSignal * 8),
    launchScore: clamp(52 + (hasPlayable ? 20 : 0) + (hasMarket ? 12 : 0) + lengthSignal * 10),
    businessScore: clamp(46 + (hasMarket ? 22 : 0) + (hasEvidence ? 8 : 0) + lengthSignal * 12)
  };
}

export function deriveTitle(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('brainrot')) return 'Meme Rescue Launch';
  if (lower.includes('merge')) return 'Merge Run Launch';
  if (lower.includes('idle')) return 'Idle Forge Launch';
  if (lower.includes('physics')) return 'Physics Table Launch';
  return 'Factory Candidate Launch';
}

