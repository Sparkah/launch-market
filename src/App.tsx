import { FormEvent, useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Blocks,
  ChevronRight,
  Database,
  FileCode2,
  Gamepad2,
  GitBranch,
  HandCoins,
  Landmark,
  ListChecks,
  Play,
  Rocket,
  Smartphone,
  Store,
  WalletCards
} from 'lucide-react';
import { bountyTracks, initialCandidate } from './data/demo';
import { deriveTitle, scorePrompt } from './lib/scoring';
import type { BountyTrack, Candidate, CandidateStatus } from './types';

const statusLabels: Record<CandidateStatus, string> = {
  ready: 'ready',
  running: 'running',
  blocked: 'blocked',
  mocked: 'mock'
};

const trackIcons: Record<BountyTrack['key'], typeof Store> = {
  solvimon: Store,
  codeplain: FileCode2,
  sui: Landmark,
  bga: HandCoins,
  bilt: Smartphone
};

function StatusPill({ status }: { status: CandidateStatus }) {
  return <span className={`status status--${status}`}>{statusLabels[status]}</span>;
}

function ScoreMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-meter" style={{ '--score': value } as React.CSSProperties}>
      <div className="score-meter__top">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="score-meter__track" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function BountyTile({ track }: { track: BountyTrack }) {
  const Icon = trackIcons[track.key];
  return (
    <article className="bounty-tile">
      <div className="bounty-tile__top">
        <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
        <StatusPill status={track.status} />
      </div>
      <h3>{track.name}</h3>
      <p>{track.requirement}</p>
      <small>{track.proof}</small>
    </article>
  );
}

function CandidatePreview({ candidate }: { candidate: Candidate }) {
  return (
    <section className="workbench-frame" aria-labelledby="preview-title">
      <div className="workbench-frame__bar">
        <span>{candidate.id}</span>
        <span>{candidate.creator}</span>
      </div>
      <div className="preview-grid">
        <div className="game-surface" aria-label="Playable candidate preview">
          <div className="game-surface__board">
            <span className="orb orb--one" />
            <span className="orb orb--two" />
            <span className="orb orb--three" />
            <span className="orb orb--four" />
            <span className="rail rail--left" />
            <span className="rail rail--right" />
          </div>
          <button className="surface-action" type="button">
            <Play size={16} aria-hidden="true" />
            Play sandbox
          </button>
        </div>
        <div className="candidate-copy">
          <p className="eyebrow">candidate</p>
          <h2 id="preview-title">{candidate.title}</h2>
          <p>{candidate.prompt}</p>
          <div className="mini-spec">
            <span>Mechanic</span>
            <strong>{candidate.mechanic}</strong>
          </div>
          <div className="mini-spec">
            <span>Launch pool</span>
            <strong>{candidate.allocation} credits</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceLedger({ candidate }: { candidate: Candidate }) {
  return (
    <section className="panel" aria-labelledby="ledger-title">
      <div className="section-title">
        <ListChecks size={18} aria-hidden="true" />
        <h2 id="ledger-title">Evidence ledger</h2>
      </div>
      <ol className="ledger">
        {candidate.evidence.map((item) => (
          <li key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <StatusPill status={item.status} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function SpecFiles({ candidate }: { candidate: Candidate }) {
  return (
    <section className="panel" aria-labelledby="spec-title">
      <div className="section-title">
        <FileCode2 size={18} aria-hidden="true" />
        <h2 id="spec-title">Plain files</h2>
      </div>
      <div className="spec-list">
        {candidate.plainFiles.map((file) => (
          <code key={file}>{file}</code>
        ))}
      </div>
    </section>
  );
}

function MarketPanel({ candidate }: { candidate: Candidate }) {
  return (
    <section className="panel market-panel" aria-labelledby="market-title">
      <div className="section-title">
        <WalletCards size={18} aria-hidden="true" />
        <h2 id="market-title">Launch market</h2>
      </div>
      <dl>
        <div>
          <dt>Pair</dt>
          <dd>{candidate.market.pair}</dd>
        </div>
        <div>
          <dt>Liquidity</dt>
          <dd>{candidate.market.liquidity}</dd>
        </div>
        <div>
          <dt>Signal</dt>
          <dd>{candidate.market.depthSignal}</dd>
        </div>
      </dl>
    </section>
  );
}

function CandidateForm({ onCreate }: { onCreate: (candidate: Candidate) => void }) {
  const [prompt, setPrompt] = useState(initialCandidate.prompt);
  const [thesis, setThesis] = useState('Back games only after spec, validation, and demand evidence are visible.');
  const [isSubmitting, setSubmitting] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      const scores = scorePrompt(`${prompt} ${thesis}`);
      onCreate({
        ...initialCandidate,
        id: `gf-lm-${Math.floor(100 + prompt.length * 7)}`,
        title: deriveTitle(prompt),
        prompt,
        verdict:
          scores.fairnessScore >= 80
            ? 'Eligible for a small public launch pool after Walrus proof is uploaded.'
            : 'Hold for stronger evidence before allocating promotion capital.',
        ...scores
      });
      setSubmitting(false);
    }, 420);
  }

  return (
    <form className="candidate-form" onSubmit={submit} action="/launch-candidate" method="post">
      <fieldset>
        <legend>New candidate</legend>
        <label htmlFor="candidate-prompt">Game request</label>
        <textarea
          id="candidate-prompt"
          name="candidate_prompt"
          minLength={18}
          maxLength={360}
          required
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <label htmlFor="market-thesis">Allocation rule</label>
        <textarea
          id="market-thesis"
          name="market_thesis"
          minLength={18}
          maxLength={260}
          required
          value={thesis}
          onChange={(event) => setThesis(event.target.value)}
        />
        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Activity size={16} aria-hidden="true" />
              Scoring
            </>
          ) : (
            <>
              <Rocket size={16} aria-hidden="true" />
              Score candidate
            </>
          )}
        </button>
      </fieldset>
    </form>
  );
}

export default function App() {
  const [candidate, setCandidate] = useState<Candidate>(initialCandidate);
  const scoreAverage = useMemo(
    () => Math.round((candidate.fairnessScore + candidate.launchScore + candidate.businessScore) / 3),
    [candidate]
  );

  return (
    <>
      <nav className="nav-pill" aria-label="Primary">
        <a className="wordmark" href="#top" aria-label="Game Factory Launch Market home">
          <Blocks size={18} aria-hidden="true" />
          Launch Market
        </a>
        <div className="nav-pill__links">
          <a href="#evidence">Evidence</a>
          <a href="#tracks">Tracks</a>
          <a href="#mobile">Mobile</a>
        </div>
        <a className="button button--nav" href="#candidate">
          <Gamepad2 size={15} aria-hidden="true" />
          Candidate
        </a>
      </nav>

      <main id="top" className="app-shell">
        <header className="topline">
          <div>
            <p className="eyebrow">game factory launch market</p>
            <h1>Spec first. Evidence visible. Promotion capital waits.</h1>
          </div>
          <div className="topline__proof" aria-label="Bounty coverage">
            <BadgeCheck size={18} aria-hidden="true" />
            <span>5 target bounties mapped</span>
          </div>
        </header>

        <section className="control-grid" id="candidate">
          <CandidateForm onCreate={setCandidate} />
          <CandidatePreview candidate={candidate} />
        </section>

        <section className="score-strip" aria-label="Candidate scores">
          <ScoreMeter label="Fairness" value={candidate.fairnessScore} />
          <ScoreMeter label="Launch" value={candidate.launchScore} />
          <ScoreMeter label="Business" value={candidate.businessScore} />
          <div className="score-summary">
            <span>average</span>
            <strong>{scoreAverage}</strong>
          </div>
        </section>

        <section className="workspace" id="evidence">
          <EvidenceLedger candidate={candidate} />
          <SpecFiles candidate={candidate} />
          <MarketPanel candidate={candidate} />
        </section>

        <section className="verdict-panel" aria-labelledby="verdict-title">
          <div>
            <p className="eyebrow">verdict</p>
            <h2 id="verdict-title">{candidate.verdict}</h2>
          </div>
          <div className="verdict-actions">
            <button className="button button--secondary" type="button">
              <Database size={16} aria-hidden="true" />
              Publish proof
            </button>
            <button className="button button--secondary" type="button">
              <GitBranch size={16} aria-hidden="true" />
              Promote manually
            </button>
          </div>
        </section>

        <section className="bounty-grid" id="tracks" aria-label="Bounty coverage">
          {bountyTracks.map((track) => (
            <BountyTile key={track.key} track={track} />
          ))}
        </section>

        <section className="mobile-brief" id="mobile" aria-labelledby="mobile-title">
          <div>
            <p className="eyebrow">bilt mobile companion</p>
            <h2 id="mobile-title">Creator intake, candidate browsing, and launch-credit allocation.</h2>
          </div>
          <a className="button button--primary" href="./mobile/BILT_BRIEF.md">
            <Smartphone size={16} aria-hidden="true" />
            Open brief
            <ChevronRight size={16} aria-hidden="true" />
          </a>
        </section>
      </main>

      <footer className="foot-line">
        <p>Game Factory Launch Market - hackathon sandbox - no production Factory writes</p>
      </footer>
    </>
  );
}
