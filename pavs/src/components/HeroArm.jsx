import { useEffect, useRef, useState } from 'react'

const BASE_X = 320
const BASE_Y = 490
const L1 = 170   // upper arm
const L2 = 138   // forearm
const L3 = 90    // wrist
const LERP = 0.09

// Analytical 2-bone IK
// Returns [theta1_svg_deg, theta2_svg_deg] where 0 = arm pointing straight up,
// positive = clockwise in SVG space
function solveIK(svgX, svgY) {
  const dx = svgX - BASE_X
  const dy = svgY - BASE_Y

  // Convert to math coords (Y-up)
  const mx = dx
  const my = -dy

  let r = Math.sqrt(mx * mx + my * my)
  const maxR = L1 + L2 - 1
  const minR = Math.abs(L1 - L2) + 1
  r = Math.min(Math.max(r, minR), maxR)

  const origDist = Math.sqrt(dx * dx + dy * dy) || 1
  const mxC = mx * (r / origDist)
  const myC = my * (r / origDist)

  const cosE = (r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2)
  const thetaE = -Math.acos(Math.max(-1, Math.min(1, cosE))) // negative = elbow-left in math

  const baseAngle = Math.atan2(myC, mxC)
  const beta = Math.atan2(L2 * Math.sin(-thetaE), L1 + L2 * Math.cos(thetaE))
  const theta1_math = baseAngle - beta

  const theta1_svg = 90 - theta1_math * (180 / Math.PI)
  const theta2_svg = -thetaE * (180 / Math.PI)

  return [theta1_svg, theta2_svg]
}

// Sub-components for reuse
function Link({ hw, length, opLink = 0.18, opBrace = 0.08 }) {
  const braceCount = Math.max(2, Math.floor(length / 38))
  return (
    <g>
      <line x1={-hw} y1="0" x2={-hw} y2={-length}
        stroke="white" strokeOpacity={opLink} strokeWidth="1.5" />
      <line x1={hw} y1="0" x2={hw} y2={-length}
        stroke="white" strokeOpacity={opLink} strokeWidth="1.5" />
      {Array.from({ length: braceCount }, (_, i) => {
        const y = -length * (i + 1) / (braceCount + 1)
        return (
          <line key={i} x1={-hw} y1={y} x2={hw} y2={y}
            stroke="white" strokeOpacity={opBrace} strokeWidth="0.75" />
        )
      })}
    </g>
  )
}

function Joint({ r1 = 22, r2 = 14, r3 = 5.5, r4 = 2.5 }) {
  return (
    <g>
      <circle r={r1 * 1.6} stroke="#00E5CC" strokeOpacity="0.06" strokeWidth="1" />
      <circle r={r1} stroke="#00E5CC" strokeOpacity="0.5" strokeWidth="1" />
      <circle r={r2} stroke="#00E5CC" strokeOpacity="0.22" strokeWidth="1" />
      {/* 4 bearing dots */}
      <circle cx="0" cy={-r1} r="2.5" fill="#00E5CC" fillOpacity="0.45" />
      <circle cx={r1} cy="0" r="2.5" fill="#00E5CC" fillOpacity="0.45" />
      <circle cx="0" cy={r1} r="2.5" fill="#00E5CC" fillOpacity="0.45" />
      <circle cx={-r1} cy="0" r="2.5" fill="#00E5CC" fillOpacity="0.45" />
      <circle r={r3} stroke="#00E5CC" strokeOpacity="0.85" strokeWidth="1.5" />
      <circle r={r4} fill="#00E5CC" />
    </g>
  )
}

function Gripper() {
  const fl = 48   // full gripper length
  const palmY = -fl * 0.38
  return (
    <g>
      {/* Wrist stub */}
      <line x1="-4" y1="0" x2="-4" y2={palmY} stroke="white" strokeOpacity="0.18" strokeWidth="1.5" />
      <line x1="4" y1="0" x2="4" y2={palmY} stroke="white" strokeOpacity="0.18" strokeWidth="1.5" />
      {/* Palm crossbar */}
      <line x1="-13" y1={palmY} x2="13" y2={palmY} stroke="white" strokeOpacity="0.22" strokeWidth="1.5" />
      {/* Left finger */}
      <line x1="-10" y1={palmY} x2="-13" y2={-fl} stroke="white" strokeOpacity="0.22" strokeWidth="1.5" />
      {/* Right finger */}
      <line x1="10" y1={palmY} x2="13" y2={-fl} stroke="white" strokeOpacity="0.22" strokeWidth="1.5" />
      {/* Fingertip nodes */}
      <circle cx="-13" cy={-fl} r="4.5" stroke="#00E5CC" strokeOpacity="0.75" strokeWidth="1" />
      <circle cx="-13" cy={-fl} r="2" fill="#00E5CC" />
      <circle cx="13" cy={-fl} r="4.5" stroke="#00E5CC" strokeOpacity="0.75" strokeWidth="1" />
      <circle cx="13" cy={-fl} r="2" fill="#00E5CC" />
      {/* Gripped object (dashed) */}
      <rect x="-14" y={-fl - 18} width="28" height="20" rx="2"
        stroke="#00E5CC" strokeOpacity="0.22" strokeWidth="1"
        strokeDasharray="3 3" fill="none" />
    </g>
  )
}

export default function HeroArm() {
  const svgRef = useRef(null)
  const mouseRef = useRef({ x: BASE_X, y: 120 })
  const anglesRef = useRef({ t1: 0, t2: -30, t3: 15 })
  const rafRef = useRef(null)
  const [angles, setAngles] = useState({ t1: 0, t2: -30, t3: 15 })

  useEffect(() => {
    function onMouseMove(e) {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const scaleX = 640 / rect.width
      const scaleY = 560 / rect.height
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }

    function loop() {
      const [t1T, t2T] = solveIK(mouseRef.current.x, mouseRef.current.y)
      const a = anglesRef.current
      a.t1 += (t1T - a.t1) * LERP
      a.t2 += (t2T - a.t2) * LERP
      a.t3 = a.t2 * -0.45
      setAngles({ t1: a.t1, t2: a.t2, t3: a.t3 })
      rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMouseMove)
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const { t1, t2, t3 } = angles

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 640 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: 'min(720px, 82vw)', height: 'auto', pointerEvents: 'none' }}
    >
      {/* ── FLOOR ── */}
      <line x1="100" y1="530" x2="520" y2="530"
        stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      {[...Array(22)].map((_, i) => (
        <line key={i}
          x1={105 + i * 20} y1="530"
          x2={95 + i * 20} y2="546"
          stroke="white" strokeOpacity="0.06" strokeWidth="1" />
      ))}

      {/* ── BASE PLATE ── */}
      <rect x="286" y="505" width="68" height="24" rx="1"
        stroke="white" strokeOpacity="0.14" strokeWidth="1" />
      <circle cx="300" cy="517" r="3" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      <circle cx="320" cy="517" r="3" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      <circle cx="340" cy="517" r="3" stroke="white" strokeOpacity="0.1" strokeWidth="1" />

      {/* ── BASE TURNTABLE (J0, static) ── */}
      <g transform={`translate(${BASE_X}, ${BASE_Y})`}>
        <circle r="34" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
        <circle r="22" stroke="white" strokeOpacity="0.08" strokeWidth="1" />
        <circle cy="-34" r="3" fill="white" fillOpacity="0.1" />
        <circle cx="34" r="3" fill="white" fillOpacity="0.1" />
        <circle cy="34" r="3" fill="white" fillOpacity="0.1" />
        <circle cx="-34" r="3" fill="white" fillOpacity="0.1" />
        <circle r="5" stroke="white" strokeOpacity="0.16" strokeWidth="1" />
        <circle r="2" fill="white" fillOpacity="0.14" />
      </g>

      {/* ── WORKSPACE ARC ── */}
      <path d={`M ${BASE_X - (L1+L2)} ${BASE_Y} A ${L1+L2} ${L1+L2} 0 0 1 ${BASE_X} ${BASE_Y - (L1+L2)}`}
        stroke="white" strokeOpacity="0.04" strokeWidth="1"
        fill="none" strokeDasharray="4 8" />

      {/* ── DYNAMIC ARM ── */}
      <g transform={`translate(${BASE_X}, ${BASE_Y})`}>
        {/* Shoulder pivot */}
        <g transform={`rotate(${t1})`}>
          <Link hw={7} length={L1} />
          {/* Shoulder joint + elbow pivot */}
          <g transform={`translate(0, ${-L1})`}>
            <Joint r1={22} r2={14} r3={5.5} r4={2.5} />
            {/* Angle callout θ1 */}
            <text
              x="-38" y="-6"
              fontFamily="monospace" fontSize="9"
              fill="white" fillOpacity="0.2"
            >θ1</text>

            <g transform={`rotate(${t2})`}>
              <Link hw={5.5} length={L2} />
              {/* Elbow joint + wrist pivot */}
              <g transform={`translate(0, ${-L2})`}>
                <Joint r1={17} r2={10} r3={4.5} r4={2} />
                {/* Angle callout θ2 */}
                <text
                  x="-36" y="-4"
                  fontFamily="monospace" fontSize="9"
                  fill="white" fillOpacity="0.2"
                >θ2</text>

                <g transform={`rotate(${t3})`}>
                  <Link hw={4} length={L3 * 0.55} />
                  {/* Wrist joint + gripper */}
                  <g transform={`translate(0, ${-L3 * 0.55})`}>
                    <Joint r1={12} r2={7} r3={3.5} r4={1.5} />
                    <Gripper />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* ── COORDINATE FRAME ── */}
      <g transform={`translate(${BASE_X}, ${BASE_Y})`}>
        <line x1="0" y1="0" x2="54" y2="0"
          stroke="white" strokeOpacity="0.08" strokeWidth="1" />
        <polygon points="54,-3 62,0 54,3" fill="white" fillOpacity="0.08" />
        <text x="66" y="4" fontFamily="monospace" fontSize="8"
          fill="white" fillOpacity="0.12">X</text>
        <line x1="0" y1="0" x2="0" y2="-54"
          stroke="white" strokeOpacity="0.08" strokeWidth="1" />
        <polygon points="-3,-54 0,-62 3,-54" fill="white" fillOpacity="0.08" />
        <text x="-6" y="-66" fontFamily="monospace" fontSize="8"
          fill="white" fillOpacity="0.12">Y</text>
      </g>

      {/* ── STATUS READOUT ── */}
      <g transform="translate(440, 80)">
        <line x1="0" y1="0" x2="160" y2="0"
          stroke="white" strokeOpacity="0.07" strokeWidth="0.75" />
        <text x="4" y="-6" fontFamily="monospace" fontSize="9"
          fill="#00E5CC" fillOpacity="0.55">STATUS: NOMINAL</text>
        <line x1="0" y1="16" x2="160" y2="16"
          stroke="white" strokeOpacity="0.05" strokeWidth="0.75" />
        <text x="4" y="12" fontFamily="monospace" fontSize="9"
          fill="white" fillOpacity="0.2">{`θ1: ${t1.toFixed(1)}°`}</text>
        <line x1="0" y1="32" x2="160" y2="32"
          stroke="white" strokeOpacity="0.05" strokeWidth="0.75" />
        <text x="4" y="28" fontFamily="monospace" fontSize="9"
          fill="white" fillOpacity="0.2">{`θ2: ${t2.toFixed(1)}°`}</text>
        <line x1="0" y1="48" x2="160" y2="48"
          stroke="white" strokeOpacity="0.05" strokeWidth="0.75" />
        <text x="4" y="44" fontFamily="monospace" fontSize="9"
          fill="white" fillOpacity="0.2">PAYLOAD: 12.4 kg</text>
      </g>
    </svg>
  )
}
