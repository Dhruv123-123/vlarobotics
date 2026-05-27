import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const TEAL = 0x00d4aa
const AMBER = 0xf59e0b

// Segment lengths (world units — camera at z=600, near ortho feel)
const L1 = 160
const L2 = 120
const L3 = 80

const LERP = 0.08

// Two-bone analytical IK for first two joints
// Returns [theta1, theta2] in radians (shoulder, elbow)
function solveIK(tx, ty) {
  const dist = Math.sqrt(tx * tx + ty * ty)
  const maxReach = L1 + L2
  const minReach = Math.abs(L1 - L2)
  const r = Math.min(Math.max(dist, minReach + 0.1), maxReach - 0.1)

  const cosElbow = (r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2)
  const clampedCos = Math.min(Math.max(cosElbow, -1), 1)
  // elbow-up solution (negative for "elbow right" in screen space)
  const elbow = -Math.acos(clampedCos)

  const gamma = Math.atan2(ty, tx)
  const beta = Math.atan2(L2 * Math.sin(Math.abs(elbow)), L1 + L2 * Math.cos(Math.abs(elbow)))
  const shoulder = gamma - beta

  // Clamp to physical range
  const shoulderDeg = THREE.MathUtils.radToDeg(shoulder)
  const elbowDeg = THREE.MathUtils.radToDeg(elbow)
  const sc = THREE.MathUtils.clamp(shoulderDeg, -150, 150)
  const ec = THREE.MathUtils.clamp(elbowDeg, -160, 0) // negative = elbow-up

  return [THREE.MathUtils.degToRad(sc), THREE.MathUtils.degToRad(ec)]
}

export default function RobotArm({ accentHex }) {
  const mountRef = useRef(null)
  const stateRef = useRef({
    mouse: new THREE.Vector2(0, 300),
    theta1: 0,
    theta2: -1.0,
    theta3: 0,
    accentColor: TEAL,
  })
  const lightRef = useRef(null)

  // Sync accent color to Three.js light
  useEffect(() => {
    stateRef.current.accentColor = accentHex
    if (lightRef.current) lightRef.current.color.setHex(accentHex)
  }, [accentHex])

  useEffect(() => {
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(W, H)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = false
    mount.appendChild(renderer.domElement)

    // ── Scene / Camera ────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x080808)

    // Orthographic-feel perspective, large FOV so units ≈ pixels
    const camera = new THREE.PerspectiveCamera(60, W / H, 1, 3000)
    camera.position.set(0, 0, 600)

    // ── Lights ────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambient)

    const rectLight = new THREE.RectAreaLight(0xffffff, 4, 400, 200)
    rectLight.position.set(0, 300, 200)
    rectLight.lookAt(0, 0, 0)
    scene.add(rectLight)

    const pointLight = new THREE.PointLight(stateRef.current.accentColor, 3, 600)
    pointLight.position.set(100, 200, 200)
    scene.add(pointLight)
    lightRef.current = pointLight

    // ── Materials ─────────────────────────────────────────────────
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.2,
    })
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x252525,
      metalness: 0.95,
      roughness: 0.15,
    })
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.8,
      roughness: 0.3,
    })

    // ── Helpers ───────────────────────────────────────────────────
    function makeCyl(radiusTop, radiusBot, height, mat, segs = 16) {
      const g = new THREE.CylinderGeometry(radiusTop, radiusBot, height, segs)
      return new THREE.Mesh(g, mat)
    }
    function makeSphere(r, mat, segs = 16) {
      const g = new THREE.SphereGeometry(r, segs, segs)
      return new THREE.Mesh(g, mat)
    }

    // ── Base ──────────────────────────────────────────────────────
    const baseGroup = new THREE.Group()

    const basePlate = makeCyl(28, 32, 12, metalMat)
    basePlate.position.y = 6
    baseGroup.add(basePlate)

    const baseRing = makeSphere(20, jointMat)
    baseRing.position.y = 18
    baseGroup.add(baseRing)

    // ── Arm groups (pivot at local y=0 for each) ──────────────────
    // Structure: baseGroup → shoulderPivot → link1Group → elbowPivot → link2Group → wristPivot → link3Group

    const shoulderPivot = new THREE.Group()
    shoulderPivot.position.y = 18
    baseGroup.add(shoulderPivot)

    // Link 1 (upper arm) — extends upward from pivot
    const link1Group = new THREE.Group()
    const link1Body = makeCyl(7, 9, L1, metalMat)
    link1Body.position.y = L1 / 2
    link1Group.add(link1Body)
    // cap detail rings
    const cap1a = makeCyl(10, 10, 5, jointMat)
    cap1a.position.y = L1
    link1Group.add(cap1a)
    shoulderPivot.add(link1Group)

    const elbowPivot = new THREE.Group()
    elbowPivot.position.y = L1
    const elbowJoint = makeSphere(12, jointMat)
    elbowPivot.add(elbowJoint)
    link1Group.add(elbowPivot)

    // Link 2 (forearm)
    const link2Group = new THREE.Group()
    const link2Body = makeCyl(5, 7, L2, metalMat)
    link2Body.position.y = L2 / 2
    link2Group.add(link2Body)
    const cap2a = makeCyl(8, 8, 4, jointMat)
    cap2a.position.y = L2
    link2Group.add(cap2a)
    elbowPivot.add(link2Group)

    const wristPivot = new THREE.Group()
    wristPivot.position.y = L2
    const wristJoint = makeSphere(9, jointMat)
    wristPivot.add(wristJoint)
    link2Group.add(wristPivot)

    // Link 3 (wrist + gripper)
    const link3Group = new THREE.Group()
    const link3Body = makeCyl(4, 5, L3 * 0.55, metalMat)
    link3Body.position.y = (L3 * 0.55) / 2
    link3Group.add(link3Body)

    // Gripper palm
    const palmBox = new THREE.Mesh(
      new THREE.BoxGeometry(18, 10, 10),
      metalMat
    )
    palmBox.position.y = L3 * 0.55 + 5
    link3Group.add(palmBox)

    // Pincer fingers (two flat blades)
    const fingerGeo = new THREE.BoxGeometry(4, 28, 6)
    const fingerL = new THREE.Mesh(fingerGeo, gripMat)
    fingerL.position.set(-7, L3 * 0.55 + 10 + 14, 0)
    link3Group.add(fingerL)
    const fingerR = new THREE.Mesh(fingerGeo, gripMat)
    fingerR.position.set(7, L3 * 0.55 + 10 + 14, 0)
    link3Group.add(fingerR)

    // Finger tips (small spheres)
    const tipL = makeSphere(4, gripMat, 8)
    tipL.position.set(-7, L3 * 0.55 + 10 + 28, 0)
    link3Group.add(tipL)
    const tipR = makeSphere(4, gripMat, 8)
    tipR.position.set(7, L3 * 0.55 + 10 + 28, 0)
    link3Group.add(tipR)

    wristPivot.add(link3Group)

    // Position base at bottom-center of visible area
    // At z=600, fov=60: visible height = 2*600*tan(30°) ≈ 693
    const visH = 2 * 600 * Math.tan(THREE.MathUtils.degToRad(30))
    baseGroup.position.set(0, -(visH / 2) + 40, 0)
    scene.add(baseGroup)

    // ── Mouse tracking ────────────────────────────────────────────
    const visW = visH * (W / H)

    function onMouseMove(e) {
      const rect = mount.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width
      const ny = (e.clientY - rect.top) / rect.height
      // Convert to scene coords (base at bottom-center)
      const sx = (nx - 0.5) * visW
      const sy = (0.5 - ny) * visH
      // Relative to base pivot
      stateRef.current.mouse.set(sx, sy - (-(visH / 2) + 40) - 18)
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Resize ────────────────────────────────────────────────────
    function onResize() {
      const nW = mount.clientWidth
      const nH = mount.clientHeight
      camera.aspect = nW / nH
      camera.updateProjectionMatrix()
      renderer.setSize(nW, nH)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ────────────────────────────────────────────
    let rafId
    function animate() {
      rafId = requestAnimationFrame(animate)
      const s = stateRef.current
      const { x: tx, y: ty } = s.mouse

      const [t1Target, t2Target] = solveIK(tx, ty)
      s.theta1 += (t1Target - s.theta1) * LERP
      s.theta2 += (t2Target - s.theta2) * LERP

      // Shoulder rotates around Z (in XY plane, arm points +Y by default)
      shoulderPivot.rotation.z = s.theta1

      // Elbow — pivot is already at tip of link1; rotate link2Group
      elbowPivot.rotation.z = s.theta2

      // Wrist: keep gripper perpendicular to link2 direction
      // link2 direction in link1-local space is theta2, wrist counter-rotates
      wristPivot.rotation.z = -s.theta2 * 0.5

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, []) // eslint-disable-line

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
