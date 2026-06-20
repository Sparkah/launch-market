export type BountyKey = 'solvimon' | 'codeplain' | 'sui' | 'bga' | 'bilt';

export type CandidateStatus = 'ready' | 'running' | 'blocked' | 'mocked';

export interface EvidenceItem {
  label: string;
  value: string;
  status: CandidateStatus;
}

export interface BountyTrack {
  key: BountyKey;
  name: string;
  requirement: string;
  proof: string;
  status: CandidateStatus;
}

export interface Candidate {
  id: string;
  title: string;
  prompt: string;
  mechanic: string;
  creator: string;
  fairnessScore: number;
  launchScore: number;
  businessScore: number;
  allocation: number;
  market: {
    pair: string;
    liquidity: string;
    depthSignal: string;
  };
  evidence: EvidenceItem[];
  plainFiles: string[];
  verdict: string;
}

