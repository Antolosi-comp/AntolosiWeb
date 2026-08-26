import * as THREE from 'three'
import { makeAsphalt, makeFacade, makeSidewalk, makeSign } from './textures'

export const CELL = 92
export const ROAD = 20
export const GRID = 7
export const WORLD = CELL * GRID
export const OFFSET = -WORLD / 2

export type Box = { minX: number; maxX: number; minZ: number; maxZ: number; h: number }

export type City = {
  group: THREE.Group
  colliders: Box[]
  /** road-network node positions for AI navigation */
  nodes: THREE.Vector2[]
  lamps: THREE.Vector3[]
  spawnPoints: THREE.Vector3[]
  update: (t: number) => void
}

/** world coordinate of road centerline index i */
export const roadAt = (i: number) => OFFSET + i * CELL

/** true if the point is on a road (drivable) */
export function onRoad(x: number, z: number) {
  const half = ROAD / 2 + 1
  const fx = Math.abs(((x - OFFSET) % CELL) )
  const fz = Math.abs(((z - OFFSET) % CELL) )
  const nx = Math.min(fx, CELL - fx)
  const nz = Math.min(fz, CELL - fz)
  return nx < half || nz < half
}

export function buildCity(): City {
  const group = new THREE.Group()
  const colliders: Box[] = []
  const nodes: THREE.Vector2[] = []
  const lamps: THREE.Vector3[] = []
  const spawnPoints: THREE.Vector3[] = []
  const animated: ((t: number) => void)[] = []

  /* ---------------- ground / roads ---------------- */
  const asphalt = makeAsphalt()
  asphalt.repeat.set(WORLD / 14, WORLD / 14)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD + CELL * 2, WORLD + CELL * 2),
    new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.82, metalness: 0.05, color: 0x8a8a92 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  group.add(ground)

  const sidewalkTex = makeSidewalk()
  sidewalkTex.repeat.set(8, 8)
  const sidewalkMat = new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.9, color: 0x9aa0aa })

  const markMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x555544,
    roughness: 0.6,
    transparent: true,
    opacity: 0.75,
  })

  // lane markings along every road
  const dashGeo = new THREE.PlaneGeometry(1.1, 5)
  const dashCount = Math.floor(WORLD / 12)
  const dashes = new THREE.InstancedMesh(dashGeo, markMat, (GRID + 1) * dashCount * 2)
  const dummy = new THREE.Object3D()
  let di = 0
  for (let i = 0; i <= GRID; i++) {
    const c = roadAt(i)
    for (let k = 0; k < dashCount; k++) {
      const p = OFFSET + k * 12 + 6
      // vertical road (along Z)
      dummy.position.set(c, 0.03, p)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.updateMatrix()
      dashes.setMatrixAt(di++, dummy.matrix)
      // horizontal road (along X)
      dummy.position.set(p, 0.03, c)
      dummy.rotation.set(-Math.PI / 2, 0, Math.PI / 2)
      dummy.updateMatrix()
      dashes.setMatrixAt(di++, dummy.matrix)
    }
  }
  dashes.count = di
  dashes.instanceMatrix.needsUpdate = true
  group.add(dashes)

  /* ---------------- blocks ---------------- */
  const facades = Array.from({ length: 10 }, (_, i) => {
    const { map, emissive } = makeFacade(200 + i * 14, 0.35 + (i % 3) * 0.12)
    return new THREE.MeshStandardMaterial({
      map,
      emissiveMap: emissive,
      emissive: 0xffffff,
      emissiveIntensity: 1.15,
      roughness: 0.55,
      metalness: 0.25,
    })
  })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x24242c, roughness: 0.95 })
  const boxGeo = new THREE.BoxGeometry(1, 1, 1)
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x1e3b22, roughness: 1 })
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 1 })
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6b34, roughness: 1 })
  const palmMat = new THREE.MeshStandardMaterial({ color: 0x2e7d4f, roughness: 1 })

  const addCollider = (cx: number, cz: number, sx: number, sz: number, h: number) => {
    colliders.push({ minX: cx - sx / 2, maxX: cx + sx / 2, minZ: cz - sz / 2, maxZ: cz + sz / 2, h })
  }

  const signTexts = ['VICE', 'NEON', 'LEONIDA', 'PALM', 'CLUB 6', 'ANTOLOSI', 'MOTEL', 'CASINO', 'DINER']

  for (let gx = 0; gx < GRID; gx++) {
    for (let gz = 0; gz < GRID; gz++) {
      const cx = roadAt(gx) + CELL / 2
      const cz = roadAt(gz) + CELL / 2
      const inner = CELL - ROAD // block footprint incl. sidewalk

      // sidewalk pad
      const pad = new THREE.Mesh(new THREE.BoxGeometry(inner, 0.35, inner), sidewalkMat)
      pad.position.set(cx, 0.17, cz)
      pad.receiveShadow = true
      group.add(pad)

      const isPark = (gx * 3 + gz * 5) % 11 === 0
      const build = inner - 10

      if (isPark) {
        const g = new THREE.Mesh(new THREE.BoxGeometry(build, 0.2, build), grassMat)
        g.position.set(cx, 0.4, cz)
        g.receiveShadow = true
        group.add(g)
        for (let t = 0; t < 10; t++) {
          const tx = cx + (Math.random() - 0.5) * build * 0.85
          const tz = cz + (Math.random() - 0.5) * build * 0.85
          const hgt = 4 + Math.random() * 4
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, hgt, 6), trunkMat)
          trunk.position.set(tx, hgt / 2 + 0.4, tz)
          trunk.castShadow = true
          group.add(trunk)
          const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2 + Math.random(), 0), Math.random() < 0.5 ? leafMat : palmMat)
          crown.position.set(tx, hgt + 1.2, tz)
          crown.castShadow = true
          group.add(crown)
        }
        spawnPoints.push(new THREE.Vector3(cx, 1, cz))
        continue
      }

      // 1-4 buildings per block
      const split = Math.random() < 0.55 ? 2 : 1
      for (let sx = 0; sx < split; sx++) {
        for (let sz = 0; sz < split; sz++) {
          const w = (build / split) * (0.72 + Math.random() * 0.2)
          const d = (build / split) * (0.72 + Math.random() * 0.2)
          const bx = cx + (split === 1 ? 0 : (sx - 0.5) * (build / split))
          const bz = cz + (split === 1 ? 0 : (sz - 0.5) * (build / split))
          const distC = Math.hypot(bx, bz) / (WORLD / 2)
          const h = THREE.MathUtils.clamp((1.15 - distC) * (26 + Math.random() * 74), 12, 96)

          const mat = facades[(Math.random() * facades.length) | 0]
          const b = new THREE.Mesh(boxGeo, mat)
          b.position.set(bx, h / 2, bz)
          b.scale.set(w, h, d)
          b.castShadow = true
          b.receiveShadow = true
          const uv = mat.map!.clone()
          group.add(b)
          void uv

          const roof = new THREE.Mesh(boxGeo, roofMat)
          roof.position.set(bx, h + 0.6, bz)
          roof.scale.set(w + 1.2, 1.2, d + 1.2)
          group.add(roof)

          addCollider(bx, bz, w, d, h)

          // rooftop antenna
          if (h > 55 && Math.random() < 0.6) {
            const ah = 6 + Math.random() * 10
            const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, ah, 5), roofMat)
            ant.position.set(bx, h + ah / 2, bz)
            group.add(ant)
            const bulb = new THREE.Mesh(
              new THREE.SphereGeometry(0.5, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0xff3355 })
            )
            bulb.position.set(bx, h + ah, bz)
            group.add(bulb)
            animated.push((t) => {
              const on = Math.sin(t * 3) > 0
              ;(bulb.material as THREE.MeshBasicMaterial).color.setHex(on ? 0xff3355 : 0x330a12)
            })
          }

          // neon billboard on facade
          if (Math.random() < 0.4 && h > 20) {
            const txt = signTexts[(Math.random() * signTexts.length) | 0]
            const hue = [320, 190, 275, 40][(Math.random() * 4) | 0]
            const tex = makeSign(txt, hue)
            const sw = Math.min(w, d) * 0.9
            const sign = new THREE.Mesh(
              new THREE.PlaneGeometry(sw, sw / 2),
              new THREE.MeshBasicMaterial({ map: tex, transparent: true })
            )
            const side = (Math.random() * 4) | 0
            const y = 8 + Math.random() * (h - 14)
            if (side === 0) sign.position.set(bx, y, bz + d / 2 + 0.25)
            else if (side === 1) { sign.position.set(bx + w / 2 + 0.25, y, bz); sign.rotation.y = Math.PI / 2 }
            else if (side === 2) { sign.position.set(bx, y, bz - d / 2 - 0.25); sign.rotation.y = Math.PI }
            else { sign.position.set(bx - w / 2 - 0.25, y, bz); sign.rotation.y = -Math.PI / 2 }
            group.add(sign)
          }
        }
      }
    }
  }

  /* ---------------- street lamps ---------------- */
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.7, metalness: 0.5 })
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
  const poleGeo = new THREE.CylinderGeometry(0.22, 0.3, 8, 6)
  const headGeo = new THREE.SphereGeometry(0.55, 8, 8)
  const poleInst = new THREE.InstancedMesh(poleGeo, poleMat, (GRID + 1) * (GRID + 1) * 4)
  const headInst = new THREE.InstancedMesh(headGeo, glowMat, (GRID + 1) * (GRID + 1) * 4)
  let li = 0
  for (let i = 0; i <= GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const c = roadAt(i)
      const p = roadAt(j) + CELL / 2
      const spots: [number, number][] = [
        [c + ROAD / 2 + 1.5, p],
        [c - ROAD / 2 - 1.5, p],
        [p, c + ROAD / 2 + 1.5],
        [p, c - ROAD / 2 - 1.5],
      ]
      for (const [x, z] of spots) {
        dummy.position.set(x, 4, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        poleInst.setMatrixAt(li, dummy.matrix)
        dummy.position.set(x, 8.2, z)
        dummy.updateMatrix()
        headInst.setMatrixAt(li, dummy.matrix)
        lamps.push(new THREE.Vector3(x, 8.2, z))
        li++
      }
    }
  }
  poleInst.count = li
  headInst.count = li
  poleInst.instanceMatrix.needsUpdate = true
  headInst.instanceMatrix.needsUpdate = true
  group.add(poleInst, headInst)

  /* ---------------- nav nodes (intersections) ---------------- */
  for (let i = 0; i <= GRID; i++)
    for (let j = 0; j <= GRID; j++) nodes.push(new THREE.Vector2(roadAt(i), roadAt(j)))

  for (let i = 0; i < GRID; i++)
    for (let j = 0; j <= GRID; j++)
      spawnPoints.push(new THREE.Vector3(roadAt(i) + CELL / 2, 1, roadAt(j) + 4))

  /* ---------------- boundary walls ---------------- */
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0b0b12, roughness: 1 })
  const B = WORLD / 2 + CELL * 0.55
  const wallDefs: [number, number, number, number][] = [
    [0, B, WORLD + CELL * 2, 4],
    [0, -B, WORLD + CELL * 2, 4],
    [B, 0, 4, WORLD + CELL * 2],
    [-B, 0, 4, WORLD + CELL * 2],
  ]
  for (const [x, z, sx, sz] of wallDefs) {
    const w = new THREE.Mesh(boxGeo, wallMat)
    w.position.set(x, 6, z)
    w.scale.set(sx, 12, sz)
    group.add(w)
    addCollider(x, z, sx, sz, 12)
  }

  return {
    group,
    colliders,
    nodes,
    lamps,
    spawnPoints,
    update: (t) => animated.forEach((f) => f(t)),
  }
}
