import * as THREE from 'three'

export type CarParts = {
  root: THREE.Group
  body: THREE.Group
  wheels: THREE.Mesh[]
  steerWheels: THREE.Mesh[]
  brakeLights: THREE.MeshBasicMaterial
  headlights: THREE.Mesh[]
}

const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.34, 16)
wheelGeo.rotateZ(Math.PI / 2)
const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 10)
rimGeo.rotateZ(Math.PI / 2)
const tireMat = new THREE.MeshStandardMaterial({ color: 0x0d0d10, roughness: 0.95 })
const rimMat = new THREE.MeshStandardMaterial({ color: 0xc9c9d2, metalness: 0.9, roughness: 0.25 })
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x0a1420,
  metalness: 0.2,
  roughness: 0.08,
  transmission: 0.55,
  transparent: true,
  opacity: 0.75,
})
const chromeMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.8, roughness: 0.35 })

export type CarStyle = 'sport' | 'sedan' | 'suv' | 'truck'

export const CAR_SPECS: Record<CarStyle, { len: number; wid: number; hgt: number; accel: number; top: number; grip: number }> = {
  sport: { len: 4.3, wid: 1.95, hgt: 0.62, accel: 26, top: 62, grip: 1.15 },
  sedan: { len: 4.5, wid: 1.9, hgt: 0.78, accel: 19, top: 48, grip: 1.0 },
  suv: { len: 4.7, wid: 2.05, hgt: 1.0, accel: 17, top: 44, grip: 0.92 },
  truck: { len: 6.2, wid: 2.3, hgt: 1.25, accel: 12, top: 36, grip: 0.8 },
}

export function buildCar(color: number, style: CarStyle = 'sedan'): CarParts {
  const s = CAR_SPECS[style]
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)

  const paint = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.65,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  })

  const L = s.len, W = s.wid, H = s.hgt

  // chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(W, H, L), paint)
  chassis.position.y = 0.62
  chassis.castShadow = true
  body.add(chassis)

  // hood taper / nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(W * 0.94, H * 0.62, L * 0.22), paint)
  nose.position.set(0, 0.52, L * 0.5)
  nose.castShadow = true
  body.add(nose)

  // cabin
  const cabinLen = style === 'truck' ? L * 0.3 : L * 0.5
  const cabinZ = style === 'truck' ? L * 0.22 : -L * 0.05
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, H * (style === 'sport' ? 0.75 : 0.95), cabinLen), paint)
  cabin.position.set(0, 0.62 + H * 0.72, cabinZ)
  cabin.castShadow = true
  body.add(cabin)

  // greenhouse glass
  const glass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, H * 0.6, cabinLen * 0.94), glassMat)
  glass.position.set(0, 0.62 + H * 0.78, cabinZ)
  body.add(glass)

  if (style === 'truck') {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(W, H * 1.1, L * 0.5), chromeMat)
    bed.position.set(0, 0.85, -L * 0.24)
    body.add(bed)
  }

  // bumpers
  for (const z of [L * 0.6, -L * 0.6]) {
    const bump = new THREE.Mesh(new THREE.BoxGeometry(W * 0.98, 0.26, 0.28), chromeMat)
    bump.position.set(0, 0.44, z * 0.98)
    body.add(bump)
  }

  // headlights
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfff3d0 })
  const headlights: THREE.Mesh[] = []
  for (const x of [-W * 0.32, W * 0.32]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.1), headMat)
    hl.position.set(x, 0.6, L * 0.61)
    body.add(hl)
    headlights.push(hl)
  }

  // tail lights
  const brakeLights = new THREE.MeshBasicMaterial({ color: 0x551111 })
  for (const x of [-W * 0.32, W * 0.32]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.1), brakeLights)
    tl.position.set(x, 0.62, -L * 0.61)
    body.add(tl)
  }

  // spoiler for sport
  if (style === 'sport') {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(W * 0.85, 0.08, 0.42), chromeMat)
    wing.position.set(0, 1.18, -L * 0.52)
    body.add(wing)
    for (const x of [-W * 0.3, W * 0.3]) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.2), chromeMat)
      stand.position.set(x, 1.04, -L * 0.52)
      body.add(stand)
    }
  }

  // wheels
  const wheels: THREE.Mesh[] = []
  const steerWheels: THREE.Mesh[] = []
  const wz = L * 0.33
  const wx = W * 0.5
  const positions: [number, number, boolean][] = [
    [wx, wz, true],
    [-wx, wz, true],
    [wx, -wz, false],
    [-wx, -wz, false],
  ]
  for (const [x, z, front] of positions) {
    const holder = new THREE.Group()
    holder.position.set(x, 0.45, z)
    const tire = new THREE.Mesh(wheelGeo, tireMat)
    tire.castShadow = true
    const rim = new THREE.Mesh(rimGeo, rimMat)
    holder.add(tire, rim)
    body.add(holder)
    wheels.push(tire as THREE.Mesh)
    ;(holder as any).__tire = tire
    if (front) steerWheels.push(holder as unknown as THREE.Mesh)
  }

  return { root, body, wheels, steerWheels, brakeLights, headlights }
}

export type PedParts = {
  root: THREE.Group
  legL: THREE.Object3D
  legR: THREE.Object3D
  armL: THREE.Object3D
  armR: THREE.Object3D
  head: THREE.Object3D
}

const SKIN = [0xe0b090, 0xc98c62, 0x8d5a3b, 0xf2d0b6, 0x5f3a24]

export function buildPed(shirt = 0x3366cc, pants = 0x22242c): PedParts {
  const root = new THREE.Group()
  const skin = new THREE.MeshStandardMaterial({ color: SKIN[(Math.random() * SKIN.length) | 0], roughness: 0.85 })
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.8 })
  const pantsMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.85 })
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x121216, roughness: 0.9 })

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.3), shirtMat)
  torso.position.y = 1.16
  torso.castShadow = true
  root.add(torso)

  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.3), pantsMat)
  hips.position.y = 0.8
  root.add(hips)

  const head = new THREE.Group()
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), skin)
  skull.castShadow = true
  head.add(skull)
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 1 }))
  hair.position.y = 0.17
  head.add(hair)
  head.position.y = 1.63
  root.add(head)

  const mkLimb = (mat: THREE.Material, len: number, w: number, x: number, y: number, shoe: boolean) => {
    const pivot = new THREE.Group()
    pivot.position.set(x, y, 0)
    const seg = new THREE.Mesh(new THREE.BoxGeometry(w, len, w), mat)
    seg.position.y = -len / 2
    seg.castShadow = true
    pivot.add(seg)
    if (shoe) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.1, w + 0.14), shoeMat)
      s.position.set(0, -len - 0.02, 0.04)
      pivot.add(s)
    }
    root.add(pivot)
    return pivot
  }

  const legL = mkLimb(pantsMat, 0.7, 0.19, -0.13, 0.74, true)
  const legR = mkLimb(pantsMat, 0.7, 0.19, 0.13, 0.74, true)
  const armL = mkLimb(shirtMat, 0.62, 0.15, -0.33, 1.42, false)
  const armR = mkLimb(shirtMat, 0.62, 0.15, 0.33, 1.42, false)

  return { root, legL, legR, armL, armR, head }
}

export function animatePed(p: PedParts, phase: number, speed: number) {
  const a = Math.sin(phase) * Math.min(0.9, speed * 0.16)
  p.legL.rotation.x = a
  p.legR.rotation.x = -a
  p.armL.rotation.x = -a * 0.85
  p.armR.rotation.x = a * 0.85
  p.root.position.y = Math.abs(Math.sin(phase)) * Math.min(0.09, speed * 0.02)
}
