import type { BountyTrack, Candidate } from '../types';

export const bountyTracks: BountyTrack[] = [
  {
    key: 'solvimon',
    name: 'Solvimon',
    requirement: 'Most likely to become a business.',
    proof: 'Creator plans, launch pricing, candidate allocation, and promotion take-rate.',
    status: 'ready'
  },
  {
    key: 'codeplain',
    name: 'Codeplain',
    requirement: 'Primary spec workflow with public .plain files and configs.',
    proof: 'game_candidate.plain, gate_spec.plain, market_spec.plain, and config.yaml.',
    status: 'ready'
  },
  {
    key: 'sui',
    name: 'Sui',
    requirement: 'AI-native app using DeepBook and Walrus.',
    proof: 'GameCandidate registry, Walrus artifact refs, DeepBook-backed launch pool.',
    status: 'mocked'
  },
  {
    key: 'bga',
    name: 'BGA',
    requirement: 'Fairer and more transparent strategy tooling.',
    proof: 'Public evidence ledger before any game receives promotion capital.',
    status: 'ready'
  },
  {
    key: 'bilt',
    name: 'Bilt.me',
    requirement: 'Working mobile app with acquisition, usage, and payment story.',
    proof: 'Mobile companion brief for creator intake, portfolio voting, and paid builder tiers.',
    status: 'running'
  }
];

export const initialCandidate: Candidate = {
  id: 'gf-lm-001',
  title: 'Orbit Bakery Launch',
  prompt: 'Build a 60-second dessert physics game and decide if it deserves promotion.',
  mechanic: '3D table-slide merge',
  creator: 'Factory sandbox',
  fairnessScore: 91,
  launchScore: 74,
  businessScore: 68,
  allocation: 240,
  market: {
    pair: 'SUI/USDC launch credits',
    liquidity: 'testnet pool placeholder',
    depthSignal: 'DeepBook adapter pending'
  },
  evidence: [
    { label: 'Plain spec', value: 'specs/game_candidate.plain', status: 'ready' },
    { label: 'Sandbox build', value: 'runs/gf-lm-001/game/index.html', status: 'mocked' },
    { label: 'Validation', value: 'reports/validation.json', status: 'ready' },
    { label: 'Walrus blob', value: 'blob pending', status: 'mocked' },
    { label: 'Sui object', value: 'GameCandidate pending', status: 'mocked' }
  ],
  plainFiles: [
    'specs/game_candidate.plain',
    'specs/gate_spec.plain',
    'specs/market_spec.plain',
    'specs/bilt_mobile.plain'
  ],
  verdict: 'Promote to a small test pool after proof upload and mobile creator intake.'
};

