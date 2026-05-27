import { useState } from 'react'
import RobotArm from './RobotArm'
import './App.css'

const MODES = {
  analysis: { label: 'ANALYSIS MODE', hex: '#00D4AA', threeHex: 0x00d4aa },
  deploy:   { label: 'DEPLOY MODE',   hex: '#F59E0B', threeHex: 0xf59e0b },
}

const METRICS = [
  { value: '99.7%', label: 'Validation Pass Rate',  desc: 'Across 1.2M episodes logged in the current sprint cycle.' },
  { value: '12ms',  label: 'Inference Latency P99', desc: 'End-to-end policy execution on edge TPU, real-time class.' },
  { value: '340K',  label: 'Anomalies Surfaced',    desc: 'Edge cases identified before physical deployment.' },
]

export default function App() {
  const [mode, setMode] = useState('analysis')
  const accent = MODES[mode]

  return (
    <div className="page" style={{ '--accent': accent.hex }}>

      {/* ── Nav ── */}
      <nav className="nav">
        <span className="nav-logo">VLA<span className="accent-text">.</span>Robotics</span>
        <button
          className="status-pill"
          onClick={() => setMode(m => m === 'analysis' ? 'deploy' : 'analysis')}
          aria-label="Toggle mode"
        >
          <span className="pulse-dot" />
          {accent.label}
        </button>
        <ul className="nav-links">
          <li><a href="#capabilities">Capabilities</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" id="hero">
        <RobotArm accentHex={accent.threeHex} />
        <div className="hero-headline">
          <span className="hero-italic">validate</span>
          <span className="hero-bold">EVERYTHING</span>
        </div>
        <div className="hero-sub">Physical AI Validation Infrastructure</div>
      </section>

      {/* ── Feature cards ── */}
      <section className="cards-section" id="capabilities">
        <div className="section-label">Metrics</div>
        <div className="cards-grid">
          {METRICS.map((m) => (
            <div className="card" key={m.label}>
              <div className="card-metric">{m.value}</div>
              <div className="card-title">{m.label}</div>
              <p className="card-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="editorial" id="about">
        <div className="section-label">About</div>
        <h2 className="ed-h2">
          <em>Physical AI</em> is only as good<br />
          as the tests it fails.
        </h2>
        <p>
          VLA Robotics builds the validation infrastructure that makes embodied AI deployable.
          We instrument, stress-test, and certify robot policies before they touch the real world —
          so your team ships faster and fails safely.
        </p>
        <p>
          Our platform sits between model training and physical deployment, running millions of
          simulation and hardware episodes to surface the edge cases that matter.
        </p>
      </section>

      {/* ── Process ── */}
      <section className="process-section" id="process">
        <div className="section-label">Process</div>
        <h2 className="ed-h2">
          From checkpoint<br />
          <em>to certified.</em>
        </h2>
        <div className="steps">
          {[
            ['01', 'Ingest',   'Push your checkpoint via API or connect your training pipeline directly. We accept all major policy formats — diffusion, ACT, VLA, and custom architectures.'],
            ['02', 'Simulate', 'We run your policy across simulation environments at scale — standard benchmarks plus your own task distributions — in parallel.'],
            ['03', 'Validate', 'Physical validation on standardised hardware rigs or remotely on your own systems. Full sensor-level telemetry logging.'],
            ['04', 'Certify',  'Structured pass/fail report with per-capability breakdown, regression deltas, and a machine-readable certificate attached to the model hash.'],
          ].map(([n, title, body]) => (
            <div className="step" key={n}>
              <span className="step-num">{n}</span>
              <div>
                <h3 className="step-title">{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" id="contact">
        <div className="section-label">Contact</div>
        <h2 className="ed-h2">
          <em>Ready to ship</em><br />
          with confidence?
        </h2>
        <a href="mailto:hello@vlarobotics.com" className="cta-btn">
          Get in touch
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <ul className="footer-links">
          <li><a href="#">Twitter</a></li>
          <li><a href="#">LinkedIn</a></li>
          <li><a href="#">GitHub</a></li>
          <li><a href="#">Research</a></li>
        </ul>
      </footer>
    </div>
  )
}
