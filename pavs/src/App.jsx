import HeroArm from './components/HeroArm'
import './App.css'

// ── DATA ──────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'POLICIES ASSESSED',
  'FAILURE MODES CATALOGUED',
  'DEPLOYMENTS VALIDATED',
  'ANOMALIES SURFACED',
  'CERTIFICATIONS ISSUED',
  'REGRESSION CYCLES RUN',
  'JOINT FAILURES PREDICTED',
]

const STATS = [
  {
    num: '~50%',
    label: 'sim-to-real success-rate drop',
    sub: 'Policies hitting 95% in simulation average 45–65% on real hardware.',
    cite: 'NexaStack / a16z, 2025',
  },
  {
    num: '$500K',
    label: 'per hour of unplanned robot downtime',
    sub: 'Industrial lines lose up to $500K/hr when a deployed robot fails mid-run.',
    cite: 'ABB True Cost of Downtime Report, 2024',
  },
  {
    num: '0',
    label: 'critical failures in Assay-certified deployments',
    sub: 'Every deployment that completed the full Assay certification cycle.',
    cite: 'Crucible internal, 2025',
  },
]

const STEPS = [
  ['01', 'Ingest',   'Submit any policy checkpoint',
    'Push via the Assay API or connect your CI pipeline directly. Supported formats: PyTorch, JAX, ONNX, LeRobot, and OpenVLA checkpoints. Verification hash generated on receipt.'],
  ['02', 'Simulate', 'Adversarial rollouts at scale',
    'Your policy runs across the nine Assay evaluation domains in parallel. Each domain targets a known failure class. Results are versioned against your model hash.'],
  ['03', 'Validate', 'Hardware-in-the-loop testing',
    'Physical tests run on the Assay standard rig or remotely on your hardware via the telemetry bridge. Force, torque, latency, and recovery data captured at 1 kHz.'],
  ['04', 'Certify',  'Signed certificate issued',
    'A machine-readable certificate attaches to your model hash. Per-domain scores, regression deltas from prior versions, and a deployment gate threshold are included.'],
]

const DOMAINS = [
  ['01', 'Sim-to-Real Transfer Fidelity',    'Measures policy performance degradation between controlled simulation and physical hardware across three environment classes.'],
  ['02', 'Failure Mode Coverage',             'Confirms the policy handles all catalogued failure modes for its task class. New failure modes are added as they are discovered in the field.'],
  ['03', 'Distribution Shift Tolerance',      'Stress-tests policy stability under sensor noise, lighting variation, object pose perturbation, and contact geometry change.'],
  ['04', 'Recovery Behaviour',                'Evaluates graceful degradation and recovery from joint faults, object drops, workspace intrusion, and partial occlusion.'],
  ['05', 'Inference Latency Profile',         'End-to-end latency and jitter measured across three deployment hardware classes: edge TPU, onboard GPU, and cloud inference.'],
  ['06', 'Force and Payload Compliance',      'Verifies the policy respects force limits across all joint configurations. Tested at 110% rated payload.'],
  ['07', 'Sensor Degradation Tolerance',      'Policy is evaluated with progressively degraded sensor inputs: camera blur, depth noise, partial IMU dropout, and encoder jitter.'],
  ['08', 'Joint Limit and Singularity Safety', 'Confirms the policy never commands positions inside the safety exclusion zone and handles singularity proximity without oscillation.'],
  ['09', 'Safety-Critical Interrupt Handling','Validates correct response to E-stop, force-limit trigger, workspace intrusion, and communication timeout within 5 ms.'],
]

const FORMATS = ['PyTorch (.pt / .pth)', 'JAX / Flax (orbax)', 'ONNX 1.14+', 'LeRobot (HuggingFace)', 'OpenVLA', 'ACT (Chi et al.)', 'Diffusion Policy']

const TICKER_FULL = [...TICKER_ITEMS, ...TICKER_ITEMS]

export default function App() {
  return (
    <div className="page">

      {/* ── NAV ── */}
      <nav className="nav">
        <span className="nav-wordmark">Crucible</span>
        <ul className="nav-links">
          <li><a href="#how">Standard</a></li>
          <li><a href="#specs">Specs</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-svg-wrap">
          <HeroArm />
        </div>
        <div className="hero-hl" aria-label="Validate before you deploy">
          <span className="hl-row"><span className="hl-grotesk">Validate</span></span>
          <span className="hl-row">
            <span className="hl-serif">before</span>&thinsp;
            <span className="hl-grotesk">you</span>
          </span>
          <span className="hl-row"><span className="hl-grotesk">deploy.</span></span>
        </div>
        <div className="hero-eyebrow">Assay by Crucible</div>
        <div className="hero-sub">Physical AI Validation</div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker-track">
          {TICKER_FULL.map((item, i) => (
            <span key={i} className="ticker-item">
              {item}<span className="ticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="stats" id="stats">
        {STATS.map(({ num, label, sub, cite }) => (
          <div className="stat-col" key={num}>
            <span className="stat-number">{num}</span>
            <span className="stat-label">{label}</span>
            <p className="stat-sub">{sub}</p>
            <span className="stat-cite">{cite}</span>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how">
        <div className="section-kicker">How Assay works</div>
        <div className="how-grid">
          {STEPS.map(([n, step, title, body]) => (
            <div className="how-cell" key={n}>
              <span className="how-bg-num" aria-hidden="true">{n}</span>
              <div className="how-step-num">{n} / {step}</div>
              <h3 className="how-step-title">{title}</h3>
              <p className="how-step-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECHNICAL SPECS ── */}
      <section className="specs-section" id="specs">
        <div className="section-kicker">Technical specification</div>

        <div className="specs-header">
          <div className="specs-title-block">
            <h2 className="specs-h2">Assay Validation<br /><em>Framework v0.9</em></h2>
            <span className="specs-version-badge">DRAFT — RFC OPEN</span>
          </div>
          <div className="specs-meta">
            <div className="specs-meta-row"><span>Standard</span><span>Assay / CRVL-001</span></div>
            <div className="specs-meta-row"><span>Version</span><span>0.9.1-rc3</span></div>
            <div className="specs-meta-row"><span>Status</span><span>Public Draft</span></div>
            <div className="specs-meta-row"><span>Supersedes</span><span>Internal v0.7</span></div>
            <div className="specs-meta-row"><span>Next review</span><span>Q3 2025</span></div>
          </div>
        </div>

        {/* Evaluation domains */}
        <div className="specs-block">
          <div className="specs-block-label">Evaluation domains (9)</div>
          <div className="domains-list">
            {DOMAINS.map(([n, name, desc]) => (
              <div className="domain-row" key={n}>
                <div className="domain-left">
                  <span className="domain-num">{n}</span>
                  <span className="domain-name">{name}</span>
                </div>
                <p className="domain-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column details */}
        <div className="specs-two-col">
          <div className="specs-col">
            <div className="specs-block-label">Supported policy formats</div>
            <ul className="specs-list">
              {FORMATS.map(f => <li key={f}>{f}</li>)}
            </ul>

            <div className="specs-block-label" style={{marginTop: '52px'}}>Hardware test rig</div>
            <ul className="specs-list">
              <li>6-DOF manipulator, rated to 15 kg payload</li>
              <li>Realsense D435i + wrist-mounted depth</li>
              <li>ATI Gamma force/torque sensor, 1 kHz</li>
              <li>NVIDIA Orin NX (edge), RTX 4090 (local), cloud inference endpoint</li>
              <li>Deterministic replay via rosbag or MCAP</li>
            </ul>
          </div>

          <div className="specs-col">
            <div className="specs-block-label">Certification thresholds</div>
            <div className="threshold-table">
              <div className="threshold-row header">
                <span>Domain</span><span>Pass threshold</span><span>Critical?</span>
              </div>
              {[
                ['Sim-to-Real',      '≥ 80% of sim score',   'Yes'],
                ['Failure Coverage', '100% catalogue match',  'Yes'],
                ['Dist. Shift',      '≥ 75% nominal score',  'No'],
                ['Recovery',         '≥ 90% recovery rate',  'Yes'],
                ['Latency P99',      '≤ 20 ms (edge class)', 'No'],
                ['Force Compliance', 'Zero limit violations', 'Yes'],
                ['Sensor Degrad.',   '≥ 70% at −30 dB SNR',  'No'],
                ['Joint Safety',     'Zero exclusion zone',  'Yes'],
                ['E-stop Response',  '≤ 5 ms to halt',       'Yes'],
              ].map(([d, t, c]) => (
                <div className="threshold-row" key={d}>
                  <span>{d}</span>
                  <span>{t}</span>
                  <span className={c === 'Yes' ? 'critical-yes' : 'critical-no'}>{c}</span>
                </div>
              ))}
            </div>

            <div className="specs-block-label" style={{marginTop: '52px'}}>API overview</div>
            <div className="code-block">
              <span className="code-comment"># Submit checkpoint</span>{'\n'}
              POST /v1/submissions{'\n'}
              {'  '}checkpoint_url: string{'\n'}
              {'  '}format: enum[pytorch|onnx|lerobot|openvla]{'\n'}
              {'  '}task_class: string{'\n'}
              {'  '}hardware_class: enum[manipulator|mobile|humanoid]{'\n'}
              {'\n'}
              <span className="code-comment"># Poll result</span>{'\n'}
              GET /v1/submissions/{'{id}'}/result{'\n'}
              {'\n'}
              <span className="code-comment"># Certificate</span>{'\n'}
              GET /v1/certificates/{'{model_hash}'}
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="manifesto">
        <p className="manifesto-hl">
          "The physical world has no sandbox.
          Validation is not a phase.
          It is the precondition for deployment."
        </p>
      </section>

      {/* ── ABOUT ── */}
      <section className="about" id="about">
        <div className="about-head">
          The open standard for<br />
          <em>physical AI safety.</em>
        </div>
        <div className="about-body">
          <p>
            Assay is Crucible's evaluation framework: nine test domains, one signed certificate,
            no ambiguity. A policy either passes the standard or it does not.
            There is no partial certification.
          </p>
          <p>
            The gap between a capable model and a reliable one is not an engineering problem.
            It is a measurement problem. Nobody had agreed on what to measure, at what threshold,
            with what methodology. Assay is that agreement.
          </p>
          <p>
            The standard is open and free to implement. Certification runs on Crucible infrastructure
            and is independent of any hardware vendor or model developer.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" id="contact">
        <span className="footer-wordmark">Crucible</span>
        <span className="footer-year">© 2025</span>
        <ul className="footer-links">
          <li><a href="#">Assay Spec</a></li>
          <li><a href="#">GitHub</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </footer>
    </div>
  )
}
