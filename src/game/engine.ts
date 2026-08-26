import * as THREE from 'three'
import { buildCity, City, onRoad, roadAt, CELL, GRID, WORLD, OFFSET } from './city'
import { buildCar, buildPed, animatePed, CarParts, PedParts, CarStyle, CAR_SPECS } from './models'

export type HudState = {
  speed: number
  gear: string
  wanted: number
  health: number
  armor: number
  money: number
  ammo: number
  inCar: boolean
  carName: string
  time: string
  mission: string
  objective: string
  prompt: string
  toast: string
  minimap: {
    px: number; pz: number; heading: number
    blips: { x: number; z: number; kind: string }[]
  }
}

const CAR_COLORS = [0xff2f6d, 0x00d1ff, 0xffd166, 0x8b5cf6, 0x22c55e, 0xf97316, 0xe5e7eb, 0x111318, 0xef4444, 0x14b8a6]
const CAR_NAMES: Record<CarStyle, string[]> = {
  sport: ['Cheetah XR', 'Banshee 6', 'Infernus V'],
  sedan: ['Sentinel LS', 'Primo Deluxe', 'Fugitive'],
  suv: ['Baller GT', 'Landstalker', 'Cavalcade'],
  truck: ['Phantom Haul', 'Packer', 'Mule'],
}
const STYLES: CarStyle[] = ['sport', 'sedan', 'suv', 'truck']

type Vehicle = {
  parts: CarParts
  style: CarStyle
  name: string
  pos: THREE.Vector3
  heading: number
  speed: number
  steer: number
  wheelSpin: number
  isPlayer: boolean
  isPolice: boolean
  ai: null | { target: THREE.Vector2; dirIdx: number }
  health: number
  color: number
}

type Ped = {
  parts: PedParts
  pos: THREE.Vector3
  heading: number
  speed: number
  phase: number
  panic: number
  target: THREE.Vector3
  alive: boolean
  deadT: number
}

type Cop = {
  parts: PedParts
  pos: THREE.Vector3
  heading: number
  phase: number
  fireCd: number
  health: number
}

type Bullet = { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; fromPlayer: boolean }

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const lerp = THREE.MathUtils.lerp
const angDiff = (a: number, b: number) => {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

export class Game {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera: THREE.PerspectiveCamera
  city!: City
  clock = new THREE.Clock()
  raf = 0
  disposed = false

  keys = new Set<string>()
  mouse = { dx: 0, dy: 0, down: false, locked: false }

  camYaw = 0
  camPitch = -0.18
  camPos = new THREE.Vector3()

  player = {
    parts: null as unknown as PedParts,
    pos: new THREE.Vector3(roadAt(3) + 6, 0, roadAt(3) + 6),
    vel: new THREE.Vector3(),
    heading: 0,
    phase: 0,
    onFoot: true,
    health: 100,
    armor: 0,
    money: 2500,
    ammo: 120,
    fireCd: 0,
    grounded: true,
    vy: 0,
  }

  vehicles: Vehicle[] = []
  peds: Ped[] = []
  cops: Cop[] = []
  bullets: Bullet[] = []
  playerCar: Vehicle | null = null
  nearCar: Vehicle | null = null

  wanted = 0
  wantedDecay = 0
  timeOfDay = 21.0 // hours
  hud: HudState
  onHud: (h: HudState) => void
  toast = ''
  toastT = 0

  mission = { active: false, name: '', objective: '', stage: 0, target: new THREE.Vector3(), reward: 0 }
  missionMarker!: THREE.Mesh
  pickupMarkers: { mesh: THREE.Mesh; pos: THREE.Vector3; kind: 'money' | 'health' | 'ammo' | 'armor'; taken: boolean }[] = []

  sun!: THREE.DirectionalLight
  hemi!: THREE.HemisphereLight
  headLightL!: THREE.SpotLight
  headLightR!: THREE.SpotLight
  audio: AudioCtl

  constructor(canvas: HTMLCanvasElement, onHud: (h: HudState) => void) {
    this.onHud = onHud
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8))
    this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.3, 1400)
    this.camera.position.set(0, 8, 14)

    this.audio = new AudioCtl()
    this.hud = this.blankHud()

    this.setupWorld()
    this.setupInput()
    this.loop()
  }

  blankHud(): HudState {
    return {
      speed: 0, gear: 'N', wanted: 0, health: 100, armor: 0, money: 2500, ammo: 120,
      inCar: false, carName: '', time: '21:00', mission: '', objective: '', prompt: '', toast: '',
      minimap: { px: 0, pz: 0, heading: 0, blips: [] },
    }
  }

  /* ---------------------------------------------------------------- world */
  setupWorld() {
    const scene = this.scene
    scene.fog = new THREE.FogExp2(0x120a1e, 0.0055)
    scene.background = new THREE.Color(0x120a1e)

    this.city = buildCity()
    scene.add(this.city.group)

    this.hemi = new THREE.HemisphereLight(0x5a3f8a, 0x120c18, 0.7)
    scene.add(this.hemi)

    this.sun = new THREE.DirectionalLight(0xffb37a, 0.9)
    this.sun.position.set(120, 180, 60)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(2048, 2048)
    const cam = this.sun.shadow.camera as THREE.OrthographicCamera
    cam.left = -110; cam.right = 110; cam.top = 110; cam.bottom = -110
    cam.near = 1; cam.far = 500
    this.sun.shadow.bias = -0.0009
    scene.add(this.sun, this.sun.target)

    // sky dome gradient
    const skyGeo = new THREE.SphereGeometry(900, 32, 20)
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top: { value: new THREE.Color(0x1b1035) },
        bot: { value: new THREE.Color(0xff5f8d) },
        mid: { value: new THREE.Color(0x6b2b8a) },
      },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP;
        void main(){
          float h = normalize(vP).y;
          vec3 c = h > 0.08 ? mix(mid, top, smoothstep(0.08,0.75,h)) : mix(bot, mid, smoothstep(-0.25,0.08,h));
          gl_FragColor = vec4(c,1.0);
        }`,
    })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)
    ;(this as any).skyMat = skyMat

    // stars
    const starGeo = new THREE.BufferGeometry()
    const sp = new Float32Array(1800 * 3)
    for (let i = 0; i < 1800; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(700)
      v.y = Math.abs(v.y)
      sp.set([v.x, v.y, v.z], i * 3)
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85 }))
    scene.add(stars)
    ;(this as any).stars = stars

    // player
    const p = buildPed(0x18d3ff, 0x1b1d26)
    this.player.parts = p
    scene.add(p.root)

    // headlight spots (attached to whatever car player drives)
    const mkSpot = () => {
      const s = new THREE.SpotLight(0xfff0cc, 0, 70, 0.55, 0.45, 1.2)
      s.castShadow = false
      scene.add(s, s.target)
      return s
    }
    this.headLightL = mkSpot()
    this.headLightR = mkSpot()

    // mission marker
    this.missionMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 24, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })
    )
    this.missionMarker.visible = false
    scene.add(this.missionMarker)

    this.spawnTraffic(30)
    this.spawnPeds(46)
    this.spawnPickups(34)
  }

  randRoadPoint(): { pos: THREE.Vector3; heading: number } {
    const along = Math.random() < 0.5
    const i = (Math.random() * (GRID + 1)) | 0
    const c = roadAt(i)
    const p = OFFSET + Math.random() * WORLD
    const lane = 4.5
    if (along) return { pos: new THREE.Vector3(c + lane, 0, p), heading: 0 }
    return { pos: new THREE.Vector3(p, 0, c - lane), heading: Math.PI / 2 }
  }

  spawnVehicle(style: CarStyle, color: number, pos: THREE.Vector3, heading: number, police = false): Vehicle {
    const parts = buildCar(police ? 0x101018 : color, style)
    this.scene.add(parts.root)
    if (police) {
      // light bar
      const bar = new THREE.Group()
      const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.28), new THREE.MeshBasicMaterial({ color: 0xff0033 }))
      const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.28), new THREE.MeshBasicMaterial({ color: 0x0044ff }))
      red.position.set(-0.32, 1.62, 0)
      blue.position.set(0.32, 1.62, 0)
      bar.add(red, blue)
      parts.body.add(bar)
      const pl = new THREE.PointLight(0xff0033, 6, 26)
      const pb = new THREE.PointLight(0x0044ff, 6, 26)
      pl.position.set(-0.4, 1.8, 0)
      pb.position.set(0.4, 1.8, 0)
      parts.body.add(pl, pb)
      ;(parts as any).__bar = { red, blue, pl, pb }
      // white door panels
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 1.6), new THREE.MeshStandardMaterial({ color: 0xf2f2f5 }))
      const d2 = door.clone()
      door.position.set(-1.0, 0.66, 0)
      d2.position.set(1.0, 0.66, 0)
      parts.body.add(door, d2)
    }
    const v: Vehicle = {
      parts, style, name: police ? 'Police Cruiser' : CAR_NAMES[style][(Math.random() * 3) | 0],
      pos: pos.clone(), heading, speed: 0, steer: 0, wheelSpin: 0,
      isPlayer: false, isPolice: police, ai: police ? null : { target: new THREE.Vector2(), dirIdx: 0 },
      health: 100, color,
    }
    if (v.ai) this.pickAiTarget(v)
    this.vehicles.push(v)
    return v
  }

  spawnTraffic(n: number) {
    for (let i = 0; i < n; i++) {
      const { pos, heading } = this.randRoadPoint()
      const style = STYLES[(Math.random() * (STYLES.length - (Math.random() < 0.8 ? 1 : 0))) | 0]
      this.spawnVehicle(style, CAR_COLORS[(Math.random() * CAR_COLORS.length) | 0], pos, heading)
    }
    // a hero car right next to the player
    const hero = this.spawnVehicle('sport', 0xff2f6d, new THREE.Vector3(this.player.pos.x + 5, 0, this.player.pos.z + 2), Math.PI / 2)
    hero.ai = null
    hero.name = 'Cheetah XR'
  }

  spawnPeds(n: number) {
    const shirts = [0xef4444, 0x3b82f6, 0x22c55e, 0xf59e0b, 0xa855f7, 0xffffff, 0x111827, 0xec4899]
    for (let i = 0; i < n; i++) {
      const sp = this.city.spawnPoints[(Math.random() * this.city.spawnPoints.length) | 0]
      const parts = buildPed(shirts[(Math.random() * shirts.length) | 0], [0x1f2937, 0x374151, 0x4b5563][(Math.random() * 3) | 0])
      const pos = sp.clone().add(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20))
      pos.y = 0
      parts.root.position.copy(pos)
      this.scene.add(parts.root)
      this.peds.push({
        parts, pos, heading: Math.random() * 6.28, speed: 1.2 + Math.random() * 0.9,
        phase: Math.random() * 6.28, panic: 0,
        target: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 60, 0, (Math.random() - 0.5) * 60)),
        alive: true, deadT: 0,
      })
    }
  }

  spawnPickups(n: number) {
    const kinds: ('money' | 'health' | 'ammo' | 'armor')[] = ['money', 'money', 'health', 'ammo', 'armor']
    const colors = { money: 0x22c55e, health: 0xff4d6d, ammo: 0xffd166, armor: 0x38bdf8 }
    for (let i = 0; i < n; i++) {
      const kind = kinds[(Math.random() * kinds.length) | 0]
      const sp = this.city.spawnPoints[(Math.random() * this.city.spawnPoints.length) | 0]
      const pos = sp.clone()
      pos.y = 1.2
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.6, 0),
        new THREE.MeshBasicMaterial({ color: colors[kind] })
      )
      mesh.position.copy(pos)
      this.scene.add(mesh)
      const halo = new THREE.PointLight(colors[kind], 3, 10)
      mesh.add(halo)
      this.pickupMarkers.push({ mesh, pos, kind, taken: false })
    }
  }

  /* ---------------------------------------------------------------- input */
  setupInput() {
    const kd = (e: KeyboardEvent) => {
      const k = e.code
      this.keys.add(k)
      if (['Space', 'KeyF', 'Tab'].includes(k)) e.preventDefault()
      if (k === 'KeyF') this.tryEnterExit()
      if (k === 'KeyM') this.startMission()
      if (k === 'KeyR') this.resetVehicle()
      if (k === 'KeyH' && this.playerCar) this.audio.horn()
      if (k === 'KeyN') this.timeOfDay = (this.timeOfDay + 6) % 24
    }
    const ku = (e: KeyboardEvent) => this.keys.delete(e.code)
    const mm = (e: MouseEvent) => {
      if (!this.mouse.locked) return
      this.camYaw -= e.movementX * 0.0026
      this.camPitch = clamp(this.camPitch - e.movementY * 0.002, -0.9, 0.55)
    }
    const md = (e: MouseEvent) => { if (e.button === 0) this.mouse.down = true }
    const mu = (e: MouseEvent) => { if (e.button === 0) this.mouse.down = false }
    const plc = () => { this.mouse.locked = document.pointerLockElement === this.renderer.domElement }
    const rs = () => {
      this.camera.aspect = innerWidth / innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(innerWidth, innerHeight)
    }
    const wheel = (e: WheelEvent) => { if (this.mouse.locked) e.preventDefault() }

    addEventListener('keydown', kd)
    addEventListener('keyup', ku)
    addEventListener('mousemove', mm)
    addEventListener('mousedown', md)
    addEventListener('mouseup', mu)
    document.addEventListener('pointerlockchange', plc)
    addEventListener('resize', rs)
    addEventListener('wheel', wheel, { passive: false })
    this.renderer.domElement.addEventListener('click', () => {
      if (!this.mouse.locked) this.renderer.domElement.requestPointerLock()
      this.audio.resume()
    })
    ;(this as any).__cleanup = () => {
      removeEventListener('keydown', kd); removeEventListener('keyup', ku)
      removeEventListener('mousemove', mm); removeEventListener('mousedown', md)
      removeEventListener('mouseup', mu); removeEventListener('resize', rs)
      removeEventListener('wheel', wheel)
      document.removeEventListener('pointerlockchange', plc)
    }
  }

  key(k: string) { return this.keys.has(k) }

  /* ------------------------------------------------------------ collision */
  collide(pos: THREE.Vector3, radius: number): boolean {
    for (const c of this.city.colliders) {
      if (pos.x > c.minX - radius && pos.x < c.maxX + radius && pos.z > c.minZ - radius && pos.z < c.maxZ + radius) return true
    }
    return false
  }

  resolve(pos: THREE.Vector3, prev: THREE.Vector3, radius: number) {
    if (!this.collide(pos, radius)) return false
    const tryX = new THREE.Vector3(pos.x, pos.y, prev.z)
    if (!this.collide(tryX, radius)) { pos.z = prev.z; return true }
    const tryZ = new THREE.Vector3(prev.x, pos.y, pos.z)
    if (!this.collide(tryZ, radius)) { pos.x = prev.x; return true }
    pos.copy(prev)
    return true
  }

  /* ------------------------------------------------------------- vehicles */
  tryEnterExit() {
    if (this.playerCar) {
      const c = this.playerCar
      if (Math.abs(c.speed) > 12) { this.setToast('Занадто швидко для виходу!'); return }
      const side = new THREE.Vector3(Math.cos(c.heading), 0, -Math.sin(c.heading)).multiplyScalar(2.4)
      const out = c.pos.clone().add(side)
      out.y = 0
      if (this.collide(out, 0.5)) out.copy(c.pos.clone().sub(side))
      this.player.pos.copy(out)
      this.player.onFoot = true
      c.isPlayer = false
      if (!c.isPolice) c.ai = { target: new THREE.Vector2(), dirIdx: 0 }
      if (c.ai) this.pickAiTarget(c)
      this.playerCar = null
      this.player.parts.root.visible = true
      this.audio.setEngine(0)
      this.setToast('Ви вийшли з авто')
      return
    }
    let best: Vehicle | null = null
    let bd = 4.2
    for (const v of this.vehicles) {
      const d = v.pos.distanceTo(this.player.pos)
      if (d < bd) { bd = d; best = v }
    }
    if (best) {
      this.playerCar = best
      best.isPlayer = true
      best.ai = null
      this.player.onFoot = false
      this.player.parts.root.visible = false
      this.camYaw = best.heading
      if (best.isPolice) { this.raiseWanted(1); this.setToast('Викрадено поліцейське авто! +1 розшук') }
      else this.setToast(`${best.name} — вкрадено`)
      this.audio.door()
    } else {
      this.setToast('Немає авто поруч')
    }
  }

  resetVehicle() {
    if (!this.playerCar) return
    this.playerCar.pos.y = 0
    this.playerCar.speed = 0
    this.playerCar.parts.root.rotation.set(0, this.playerCar.heading, 0)
    this.setToast('Авто вирівняно')
  }

  pickAiTarget(v: Vehicle) {
    if (!v.ai) return
    const nodes = this.city.nodes
    const n = nodes[(Math.random() * nodes.length) | 0]
    v.ai.target.copy(n)
  }

  updatePlayerCar(dt: number) {
    const c = this.playerCar!
    const spec = CAR_SPECS[c.style]
    const throttle = (this.key('KeyW') || this.key('ArrowUp') ? 1 : 0) - (this.key('KeyS') || this.key('ArrowDown') ? 1 : 0)
    const steerIn = (this.key('KeyA') || this.key('ArrowLeft') ? 1 : 0) - (this.key('KeyD') || this.key('ArrowRight') ? 1 : 0)
    const brake = this.key('Space')

    const target = steerIn * (0.55 - Math.min(0.34, Math.abs(c.speed) / spec.top * 0.34))
    c.steer = lerp(c.steer, target, 1 - Math.pow(0.001, dt))

    if (throttle > 0) c.speed += spec.accel * dt * (1 - Math.abs(c.speed) / (spec.top * 1.15))
    else if (throttle < 0) c.speed -= spec.accel * 0.7 * dt
    else c.speed *= 1 - 0.7 * dt

    if (brake) c.speed *= 1 - 2.6 * dt
    c.speed = clamp(c.speed, -spec.top * 0.35, spec.top)

    // handbrake drift
    const gripLoss = brake && Math.abs(c.speed) > 8 ? 0.45 : 1
    c.heading += c.steer * (c.speed / spec.top) * 2.4 * dt * spec.grip * (brake ? 1.5 : 1)

    const fwd = new THREE.Vector3(Math.sin(c.heading), 0, Math.cos(c.heading))
    const prev = c.pos.clone()
    c.pos.addScaledVector(fwd, c.speed * dt * gripLoss)
    if (this.resolve(c.pos, prev, spec.wid * 0.6)) {
      if (Math.abs(c.speed) > 14) { this.damagePlayer(Math.abs(c.speed) * 0.35); this.audio.crash() }
      c.speed *= -0.22
    }

    // vehicle-vehicle collisions
    for (const o of this.vehicles) {
      if (o === c) continue
      const d = o.pos.distanceTo(c.pos)
      const min = 3.4
      if (d < min) {
        const push = c.pos.clone().sub(o.pos).setY(0).normalize().multiplyScalar((min - d) * 0.6)
        c.pos.add(push)
        o.pos.sub(push)
        if (Math.abs(c.speed) > 16) { this.audio.crash(); o.speed += c.speed * 0.4; c.speed *= 0.55 }
      }
    }

    // run over peds
    for (const p of this.peds) {
      if (!p.alive) continue
      if (p.pos.distanceTo(c.pos) < 2.1 && Math.abs(c.speed) > 6) {
        this.killPed(p)
        this.raiseWanted(1)
        c.speed *= 0.9
      }
    }

    c.wheelSpin += c.speed * dt * 2.4
    this.applyCarTransform(c)
    c.parts.brakeLights.color.setHex(brake || throttle < 0 ? 0xff2222 : 0x551111)

    // headlights follow
    const night = this.isNight()
    const hi = night ? 40 : 0
    const lp = c.pos.clone().add(fwd.clone().multiplyScalar(2)).setY(0.7)
    const right = new THREE.Vector3(Math.cos(c.heading), 0, -Math.sin(c.heading)).multiplyScalar(0.7)
    this.headLightL.position.copy(lp).sub(right)
    this.headLightR.position.copy(lp).add(right)
    this.headLightL.target.position.copy(lp).add(fwd.clone().multiplyScalar(30)).setY(0)
    this.headLightR.target.position.copy(this.headLightL.target.position)
    this.headLightL.intensity = hi
    this.headLightR.intensity = hi
    for (const h of c.parts.headlights) (h.material as THREE.MeshBasicMaterial).color.setHex(night ? 0xfff3d0 : 0x554b33)

    this.audio.setEngine(Math.abs(c.speed) / spec.top)

    // drive-by shooting
    this.player.fireCd -= dt
    if (this.mouse.down && this.player.fireCd <= 0 && this.player.ammo > 0) {
      this.player.fireCd = 0.16
      this.player.ammo--
      const dir = new THREE.Vector3(
        Math.sin(this.camYaw) * Math.cos(this.camPitch),
        Math.sin(this.camPitch) + 0.02,
        Math.cos(this.camYaw) * Math.cos(this.camPitch)
      ).normalize()
      const from = c.pos.clone().setY(1.2).addScaledVector(dir, 3.2)
      this.fireBullet(from, dir, true)
    }
  }

  applyCarTransform(c: Vehicle) {
    c.parts.root.position.set(c.pos.x, c.pos.y, c.pos.z)
    c.parts.root.rotation.y = c.heading
    // body roll & pitch
    c.parts.body.rotation.z = lerp(c.parts.body.rotation.z, -c.steer * clamp(c.speed / 40, 0, 1) * 0.22, 0.15)
    for (const w of c.parts.wheels) w.rotation.x = c.wheelSpin
    for (const sw of c.parts.steerWheels) (sw as any).rotation.y = c.steer * 0.55
  }

  updateAiCar(v: Vehicle, dt: number) {
    if (!v.ai) return
    const spec = CAR_SPECS[v.style]
    const to = new THREE.Vector2(v.ai.target.x - v.pos.x, v.ai.target.y - v.pos.z)
    if (to.length() < 8) { this.pickAiTarget(v); return }
    const want = Math.atan2(to.x, to.y)
    const diff = angDiff(want, v.heading)
    v.steer = clamp(diff, -0.6, 0.6)
    v.heading += v.steer * dt * 1.5

    // avoid car ahead
    let blocked = false
    const fwd = new THREE.Vector3(Math.sin(v.heading), 0, Math.cos(v.heading))
    const ahead = v.pos.clone().addScaledVector(fwd, 7)
    for (const o of this.vehicles) {
      if (o === v) continue
      if (o.pos.distanceTo(ahead) < 4.2) { blocked = true; break }
    }
    if (this.playerCar === null && this.player.pos.distanceTo(ahead) < 3) blocked = true

    const cruise = spec.top * 0.42
    v.speed = lerp(v.speed, blocked ? 0 : cruise, dt * 1.4)

    const prev = v.pos.clone()
    v.pos.addScaledVector(fwd, v.speed * dt)
    if (this.resolve(v.pos, prev, spec.wid * 0.6)) { v.speed *= 0.3; this.pickAiTarget(v) }
    v.wheelSpin += v.speed * dt * 2.4
    this.applyCarTransform(v)
  }

  /* ---------------------------------------------------------------- peds */
  killPed(p: Ped) {
    p.alive = false
    p.deadT = 0
    p.parts.root.rotation.x = -Math.PI / 2
    p.parts.root.position.y = 0.25
    this.audio.hit()
    this.setToast('💀 Пішохода збито')
    for (const o of this.peds) {
      if (o.alive && o.pos.distanceTo(p.pos) < 30) o.panic = 6
    }
  }

  updatePeds(dt: number) {
    const playerPos = this.playerCar ? this.playerCar.pos : this.player.pos
    for (const p of this.peds) {
      if (!p.alive) {
        p.deadT += dt
        if (p.deadT > 22) {
          // respawn far away
          const sp = this.city.spawnPoints[(Math.random() * this.city.spawnPoints.length) | 0]
          p.pos.copy(sp); p.pos.y = 0
          p.alive = true
          p.parts.root.rotation.x = 0
          p.parts.root.position.y = 0
          p.panic = 0
        }
        continue
      }
      if (p.panic > 0) p.panic -= dt

      const dToPlayer = p.pos.distanceTo(playerPos)
      if (this.playerCar && Math.abs(this.playerCar.speed) > 20 && dToPlayer < 16) p.panic = Math.max(p.panic, 2)

      let dir: THREE.Vector3
      let spd = p.speed
      if (p.panic > 0) {
        dir = p.pos.clone().sub(playerPos).setY(0)
        if (dir.lengthSq() < 0.01) dir.set(1, 0, 0)
        dir.normalize()
        spd = p.speed * 3.2
      } else {
        dir = p.target.clone().sub(p.pos).setY(0)
        if (dir.length() < 2.5) {
          const sp = this.city.spawnPoints[(Math.random() * this.city.spawnPoints.length) | 0]
          p.target.copy(sp).add(new THREE.Vector3((Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30))
          p.target.y = 0
        }
        dir.normalize()
      }
      const prev = p.pos.clone()
      p.pos.addScaledVector(dir, spd * dt)
      if (this.resolve(p.pos, prev, 0.45)) {
        const sp = this.city.spawnPoints[(Math.random() * this.city.spawnPoints.length) | 0]
        p.target.copy(sp)
      }
      p.heading = lerp(p.heading, Math.atan2(dir.x, dir.z), 0.2)
      p.phase += dt * spd * 3.4
      p.parts.root.position.set(p.pos.x, 0, p.pos.z)
      p.parts.root.rotation.y = p.heading
      animatePed(p.parts, p.phase, spd)
    }
  }

  /* --------------------------------------------------------------- wanted */
  raiseWanted(n: number) {
    const before = this.wanted
    this.wanted = clamp(this.wanted + n, 0, 5)
    this.wantedDecay = 0
    if (this.wanted > before) {
      this.setToast(`🚨 Рівень розшуку: ${this.wanted}`)
      this.audio.siren(true)
      this.spawnPolice(this.wanted)
    }
  }

  spawnPolice(level: number) {
    const wantCars = Math.min(level, 4)
    const have = this.vehicles.filter((v) => v.isPolice).length
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    for (let i = have; i < wantCars; i++) {
      const ang = Math.random() * 6.28
      const pos = ppos.clone().add(new THREE.Vector3(Math.cos(ang) * 90, 0, Math.sin(ang) * 90))
      pos.x = clamp(pos.x, OFFSET + 5, OFFSET + WORLD - 5)
      pos.z = clamp(pos.z, OFFSET + 5, OFFSET + WORLD - 5)
      pos.y = 0
      this.spawnVehicle('sedan', 0x101018, pos, Math.random() * 6.28, true)
    }
    if (level >= 2) {
      const wantCops = Math.min((level - 1) * 2, 6)
      for (let i = this.cops.length; i < wantCops; i++) {
        const ang = Math.random() * 6.28
        const parts = buildPed(0x1e293b, 0x0f172a)
        const pos = ppos.clone().add(new THREE.Vector3(Math.cos(ang) * 40, 0, Math.sin(ang) * 40))
        pos.y = 0
        parts.root.position.copy(pos)
        this.scene.add(parts.root)
        this.cops.push({ parts, pos, heading: 0, phase: 0, fireCd: 1, health: 60 })
      }
    }
  }

  updatePolice(dt: number) {
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    const t = performance.now() / 1000

    for (const v of this.vehicles) {
      if (!v.isPolice) continue
      const bar = (v.parts as any).__bar
      if (bar) {
        const on = Math.sin(t * 12) > 0
        bar.pl.intensity = on ? 10 : 0
        bar.pb.intensity = on ? 0 : 10
      }
      if (v.isPlayer) continue

      if (this.wanted === 0) {
        // wander off
        if (!v.ai) v.ai = { target: new THREE.Vector2(), dirIdx: 0 }
        this.updateAiCar(v, dt)
        continue
      }
      v.ai = null
      const spec = CAR_SPECS.sedan
      const to = ppos.clone().sub(v.pos).setY(0)
      const dist = to.length()
      const want = Math.atan2(to.x, to.z)
      const diff = angDiff(want, v.heading)
      v.heading += clamp(diff, -1.2, 1.2) * dt * 2.0
      const chase = spec.top * (0.6 + this.wanted * 0.12)
      v.speed = lerp(v.speed, dist > 8 ? chase : 0, dt * 1.6)
      const fwd = new THREE.Vector3(Math.sin(v.heading), 0, Math.cos(v.heading))
      const prev = v.pos.clone()
      v.pos.addScaledVector(fwd, v.speed * dt)
      if (this.resolve(v.pos, prev, 1.2)) v.speed *= 0.4
      v.wheelSpin += v.speed * dt * 2.4
      this.applyCarTransform(v)

      // ram damage
      if (dist < 3.6 && this.playerCar) {
        this.damagePlayer(5 * dt * (1 + this.wanted * 0.35))
      }
      if (dist < 3.0 && !this.playerCar) this.damagePlayer(9 * dt)
    }

    for (const c of this.cops) {
      const to = ppos.clone().sub(c.pos).setY(0)
      const dist = to.length()
      to.normalize()
      c.heading = lerp(c.heading, Math.atan2(to.x, to.z), 0.16)
      if (this.wanted > 0 && dist > 9) {
        const prev = c.pos.clone()
        c.pos.addScaledVector(to, 4.6 * dt)
        this.resolve(c.pos, prev, 0.45)
        c.phase += dt * 14
      } else if (this.wanted === 0) {
        c.phase += dt * 4
        c.pos.addScaledVector(to, -1.4 * dt)
      }
      c.fireCd -= dt
      if (this.wanted >= 2 && dist < 42 && c.fireCd <= 0) {
        c.fireCd = 1.5 - Math.min(0.7, this.wanted * 0.12)
        const from = c.pos.clone().setY(1.4)
        const dirv = ppos.clone().setY(1.2).sub(from).normalize()
        dirv.x += (Math.random() - 0.5) * 0.22
        dirv.z += (Math.random() - 0.5) * 0.22
        this.fireBullet(from, dirv.normalize(), false)
      }
      c.parts.root.position.set(c.pos.x, 0, c.pos.z)
      c.parts.root.rotation.y = c.heading
      animatePed(c.parts, c.phase, this.wanted > 0 ? 4.6 : 1)
    }

    // decay
    const fleeing = this.playerCar && Math.abs(this.playerCar.speed) > 25
    const nearestCop = Math.min(
      ...this.vehicles.filter((v) => v.isPolice && !v.isPlayer).map((v) => v.pos.distanceTo(ppos)),
      ...this.cops.map((c) => c.pos.distanceTo(ppos)),
      9999
    )
    if (this.wanted > 0) {
      if (nearestCop > 110 || (fleeing && nearestCop > 70)) {
        this.wantedDecay += dt
        if (this.wantedDecay > 7) {
          this.wanted--
          this.wantedDecay = 0
          this.setToast(this.wanted === 0 ? '✅ Ви відірвалися від поліції' : `Розшук знижено до ${this.wanted}`)
          if (this.wanted === 0) {
            this.audio.siren(false)
            for (const c of this.cops) this.scene.remove(c.parts.root)
            this.cops = []
          }
        }
      } else this.wantedDecay = Math.max(0, this.wantedDecay - dt * 0.5)
    }
  }

  /* -------------------------------------------------------------- combat */
  fireBullet(from: THREE.Vector3, dir: THREE.Vector3, fromPlayer: boolean) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 6, 6),
      new THREE.MeshBasicMaterial({ color: fromPlayer ? 0xffe08a : 0xff5a5a })
    )
    mesh.position.copy(from)
    const light = new THREE.PointLight(fromPlayer ? 0xffcc66 : 0xff5555, 4, 8)
    mesh.add(light)
    this.scene.add(mesh)
    this.bullets.push({ mesh, vel: dir.multiplyScalar(120), life: 1.6, fromPlayer })
    this.audio.shot()
  }

  updateBullets(dt: number) {
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]
      const prev = b.mesh.position.clone()
      b.mesh.position.addScaledVector(b.vel, dt)
      b.life -= dt
      let hit = false

      if (this.collide(b.mesh.position, 0.1) || b.mesh.position.y < 0) hit = true

      if (!hit && b.fromPlayer) {
        for (const c of this.cops) {
          if (c.pos.clone().setY(1).distanceTo(b.mesh.position) < 1.1) {
            c.health -= 34
            hit = true
            this.audio.hit()
            if (c.health <= 0) {
              this.scene.remove(c.parts.root)
              this.cops.splice(this.cops.indexOf(c), 1)
              this.player.money += 250
              this.setToast('Копа нейтралізовано +$250')
              this.raiseWanted(1)
            }
            break
          }
        }
        if (!hit) {
          for (const p of this.peds) {
            if (p.alive && p.pos.clone().setY(1).distanceTo(b.mesh.position) < 1.0) {
              this.killPed(p)
              this.raiseWanted(2)
              hit = true
              break
            }
          }
        }
        if (!hit) {
          for (const v of this.vehicles) {
            if (v.isPlayer) continue
            if (v.pos.clone().setY(0.8).distanceTo(b.mesh.position) < 2.2) {
              v.health -= 20
              hit = true
              if (v.health <= 0 && v.isPolice) {
                this.explode(v.pos)
                this.scene.remove(v.parts.root)
                this.vehicles.splice(this.vehicles.indexOf(v), 1)
                this.raiseWanted(1)
              }
              break
            }
          }
        }
      } else if (!hit) {
        if (b.mesh.position.distanceTo(ppos.clone().setY(this.playerCar ? 0.9 : 1.1)) < (this.playerCar ? 2.2 : 1.0)) {
          this.damagePlayer(this.playerCar ? 2.5 : 5.5)
          hit = true
        }
      }

      if (hit || b.life <= 0) {
        if (hit) this.sparks(prev)
        this.scene.remove(b.mesh)
        this.bullets.splice(i, 1)
      }
    }
  }

  sparks(pos: THREE.Vector3) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.9 }))
    g.position.copy(pos)
    this.scene.add(g)
    let t = 0
    const tick = (d: number) => {
      t += d
      g.scale.setScalar(1 + t * 6)
      ;(g.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - t * 5)
      if (t > 0.2) { this.scene.remove(g); return false }
      return true
    }
    this.effects.push(tick)
  }

  explode(pos: THREE.Vector3) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 1 }))
    m.position.copy(pos).setY(1)
    this.scene.add(m)
    const light = new THREE.PointLight(0xff8822, 60, 60)
    light.position.copy(m.position)
    this.scene.add(light)
    this.audio.explosion()
    let t = 0
    this.effects.push((d) => {
      t += d
      m.scale.setScalar(1 + t * 22)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - t * 1.6)
      light.intensity = Math.max(0, 60 - t * 110)
      if (t > 0.9) { this.scene.remove(m, light); return false }
      return true
    })
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    if (ppos.distanceTo(pos) < 12) this.damagePlayer(45)
  }

  effects: ((dt: number) => boolean)[] = []
  regenAcc = 0

  regen(dt: number) {
    if (this.wanted > 0) { this.regenAcc = 0; return }
    this.regenAcc += dt
    if (this.regenAcc > 4 && this.player.health < 100) this.player.health = Math.min(100, this.player.health + 4 * dt)
  }

  damagePlayer(n: number) {
    if (this.player.armor > 0) {
      const abs = Math.min(this.player.armor, n * 0.8)
      this.player.armor -= abs
      n -= abs
    }
    this.player.health -= n
    if (this.player.health <= 0) this.busted()
  }

  busted() {
    this.player.health = 100
    this.player.armor = 0
    this.player.money = Math.max(0, this.player.money - 500)
    this.wanted = 0
    this.audio.siren(false)
    for (const c of this.cops) this.scene.remove(c.parts.root)
    this.cops = []
    if (this.playerCar) { this.playerCar.isPlayer = false; this.playerCar.ai = { target: new THREE.Vector2(), dirIdx: 0 } }
    this.playerCar = null
    this.player.onFoot = true
    this.player.parts.root.visible = true
    const sp = this.city.spawnPoints[(Math.random() * this.city.spawnPoints.length) | 0]
    this.player.pos.copy(sp).setY(0)
    this.mission.active = false
    this.missionMarker.visible = false
    this.setToast('☠️ WASTED — лікарня, −$500')
  }

  /* ------------------------------------------------------------- on foot */
  updateOnFoot(dt: number) {
    const p = this.player
    const sprint = this.key('ShiftLeft') || this.key('ShiftRight')
    const spd = sprint ? 8.4 : 4.2
    const f = (this.key('KeyW') || this.key('ArrowUp') ? 1 : 0) - (this.key('KeyS') || this.key('ArrowDown') ? 1 : 0)
    const s = (this.key('KeyD') || this.key('ArrowRight') ? 1 : 0) - (this.key('KeyA') || this.key('ArrowLeft') ? 1 : 0)

    const fwd = new THREE.Vector3(Math.sin(this.camYaw), 0, Math.cos(this.camYaw))
    const right = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw))
    const move = new THREE.Vector3().addScaledVector(fwd, f).addScaledVector(right, s)
    const moving = move.lengthSq() > 0.001
    if (moving) move.normalize()

    // jump
    if (this.key('Space') && p.grounded) { p.vy = 6.2; p.grounded = false }
    p.vy -= 20 * dt
    p.pos.y += p.vy * dt
    if (p.pos.y <= 0) { p.pos.y = 0; p.vy = 0; p.grounded = true }

    const prev = p.pos.clone()
    p.pos.addScaledVector(move, spd * dt)
    this.resolve(p.pos, prev, 0.45)
    p.pos.x = clamp(p.pos.x, OFFSET - CELL * 0.4, OFFSET + WORLD + CELL * 0.4)
    p.pos.z = clamp(p.pos.z, OFFSET - CELL * 0.4, OFFSET + WORLD + CELL * 0.4)

    if (moving) p.heading = lerp(p.heading, Math.atan2(move.x, move.z), 0.25)
    p.phase += dt * (moving ? spd * 3.2 : 0)
    if (!moving) p.phase = lerp(p.phase % 6.28, 0, 0.2)

    p.parts.root.position.copy(p.pos)
    p.parts.root.rotation.y = p.heading
    animatePed(p.parts, p.phase, moving ? spd : 0)

    // shooting
    p.fireCd -= dt
    if (this.mouse.down && p.fireCd <= 0 && p.ammo > 0) {
      p.fireCd = 0.13
      p.ammo--
      const from = p.pos.clone().setY(1.35)
      const dir = new THREE.Vector3(
        Math.sin(this.camYaw) * Math.cos(this.camPitch),
        Math.sin(this.camPitch) + 0.03,
        Math.cos(this.camYaw) * Math.cos(this.camPitch)
      ).normalize()
      from.addScaledVector(dir, 1.0)
      this.fireBullet(from, dir, true)
      p.heading = this.camYaw
    }
  }

  /* ------------------------------------------------------------ missions */
  missionsPool = [
    { name: 'Кур\'єр Vice', obj: 'Доставити пакунок до маркера', reward: 1500 },
    { name: 'Викрадення', obj: 'Пригнати авто до точки', reward: 2200 },
    { name: 'Втеча з району', obj: 'Дістатися схованки, не втративши авто', reward: 3000 },
    { name: 'Нічний забіг', obj: 'Пройти контрольну точку на швидкості', reward: 1800 },
  ]

  startMission() {
    if (this.mission.active) { this.setToast('Місія вже активна'); return }
    const m = this.missionsPool[(Math.random() * this.missionsPool.length) | 0]
    const nodes = this.city.nodes
    let t = nodes[(Math.random() * nodes.length) | 0]
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    for (let i = 0; i < 12; i++) {
      const c = nodes[(Math.random() * nodes.length) | 0]
      if (new THREE.Vector2(c.x - ppos.x, c.y - ppos.z).length() > 150) { t = c; break }
    }
    this.mission = { active: true, name: m.name, objective: m.obj, stage: 0, target: new THREE.Vector3(t.x, 0, t.y), reward: m.reward }
    this.missionMarker.position.copy(this.mission.target).setY(12)
    this.missionMarker.visible = true
    this.setToast(`📍 Місія: ${m.name} — $${m.reward}`)
  }

  updateMission(dt: number) {
    if (!this.mission.active) return
    this.missionMarker.rotation.y += dt * 0.7
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    if (ppos.distanceTo(this.mission.target) < 6) {
      this.player.money += this.mission.reward
      this.setToast(`✅ Місію виконано! +$${this.mission.reward}`)
      this.mission.active = false
      this.missionMarker.visible = false
      this.audio.cash()
    }
  }

  updatePickups() {
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    const t = performance.now() / 1000
    for (const pk of this.pickupMarkers) {
      if (pk.taken) continue
      pk.mesh.rotation.y = t * 1.6
      pk.mesh.position.y = pk.pos.y + Math.sin(t * 2 + pk.pos.x) * 0.25
      if (ppos.distanceTo(pk.pos) < 3.2) {
        pk.taken = true
        pk.mesh.visible = false
        if (pk.kind === 'money') { this.player.money += 300; this.setToast('💵 +$300'); this.audio.cash() }
        if (pk.kind === 'health') { this.player.health = Math.min(100, this.player.health + 45); this.setToast('❤️ Здоров\'я відновлено') }
        if (pk.kind === 'ammo') { this.player.ammo += 60; this.setToast('🔫 +60 патронів') }
        if (pk.kind === 'armor') { this.player.armor = Math.min(100, this.player.armor + 50); this.setToast('🛡️ Броня +50') }
        setTimeout(() => { pk.taken = false; pk.mesh.visible = true }, 30000)
      }
    }
  }

  /* --------------------------------------------------------------- camera */
  updateCamera(dt: number) {
    const target = new THREE.Vector3()
    let dist = 7.5
    let height = 2.6

    if (this.playerCar) {
      const c = this.playerCar
      target.copy(c.pos).setY(1.4)
      dist = 9 + Math.abs(c.speed) * 0.09
      height = 3.4
      // auto-align behind car unless mouse-looking
      if (!this.key('KeyC')) {
        this.camYaw += angDiff(c.heading, this.camYaw) * (1 - Math.pow(0.02, dt))
      }
      this.camera.fov = lerp(this.camera.fov, 70 + Math.abs(c.speed) * 0.32, dt * 3)
      this.camera.updateProjectionMatrix()
    } else {
      target.copy(this.player.pos).setY(1.5)
      dist = 5.6
      this.camera.fov = lerp(this.camera.fov, 72, dt * 3)
      this.camera.updateProjectionMatrix()
    }

    const off = new THREE.Vector3(
      -Math.sin(this.camYaw) * Math.cos(this.camPitch),
      -Math.sin(this.camPitch) + 0.42,
      -Math.cos(this.camYaw) * Math.cos(this.camPitch)
    ).multiplyScalar(dist)
    const want = target.clone().add(off).setY(Math.max(1.4, target.y + height + this.camPitch * -6))

    // simple wall avoidance
    const ray = new THREE.Vector3().subVectors(want, target)
    const steps = 6
    let ok = want
    for (let i = steps; i >= 1; i--) {
      const test = target.clone().addScaledVector(ray, i / steps)
      if (!this.collide(test, 0.6)) { ok = test; break }
    }

    this.camPos.lerp(ok, 1 - Math.pow(0.0009, dt))
    this.camera.position.copy(this.camPos)
    this.camera.lookAt(target)
  }

  /* ----------------------------------------------------------- day cycle */
  isNight() { return this.timeOfDay < 6.5 || this.timeOfDay > 18.5 }

  updateSky(dt: number) {
    this.timeOfDay = (this.timeOfDay + dt / 90) % 24
    const h = this.timeOfDay
    // 0 = deep night, 1 = noon
    const day = clamp(Math.sin(((h - 6) / 12) * Math.PI), -0.3, 1)
    const dayN = clamp(day, 0, 1)

    this.sun.intensity = 0.15 + dayN * 2.0
    this.sun.color.setHSL(lerp(0.04, 0.12, dayN), lerp(0.85, 0.35, dayN), lerp(0.55, 0.95, dayN))
    const ang = ((h - 6) / 24) * Math.PI * 2
    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    this.sun.position.set(ppos.x + Math.cos(ang) * 160, 40 + Math.sin(ang) * 200, ppos.z + 90)
    this.sun.target.position.copy(ppos)

    this.hemi.intensity = 0.35 + dayN * 0.7
    this.hemi.color.setHSL(lerp(0.72, 0.58, dayN), 0.6, lerp(0.28, 0.6, dayN))

    const skyMat = (this as any).skyMat as THREE.ShaderMaterial
    skyMat.uniforms.top.value.setHSL(0.65, lerp(0.7, 0.6, dayN), lerp(0.08, 0.42, dayN))
    skyMat.uniforms.mid.value.setHSL(lerp(0.78, 0.58, dayN), 0.65, lerp(0.18, 0.6, dayN))
    skyMat.uniforms.bot.value.setHSL(lerp(0.95, 0.09, dayN), 0.8, lerp(0.32, 0.72, dayN))

    const fog = this.scene.fog as THREE.FogExp2
    fog.color.setHSL(lerp(0.76, 0.58, dayN), 0.5, lerp(0.06, 0.45, dayN))
    ;(this.scene.background as THREE.Color).copy(fog.color)
    fog.density = lerp(0.0055, 0.0022, dayN)
    ;((this as any).stars as THREE.Points).material as THREE.PointsMaterial
    ;(((this as any).stars as THREE.Points).material as THREE.PointsMaterial).opacity = clamp(1 - dayN * 2.2, 0, 0.9)
    ;((this as any).stars as THREE.Points).position.copy(this.camera.position)
  }

  /* ------------------------------------------------------------------ HUD */
  setToast(s: string) { this.toast = s; this.toastT = 3 }

  pushHud(dt: number) {
    this.toastT -= dt
    if (this.toastT <= 0) this.toast = ''

    const ppos = this.playerCar ? this.playerCar.pos : this.player.pos
    const speedKmh = this.playerCar ? Math.abs(this.playerCar.speed) * 3.6 * 1.4 : 0
    const gear = this.playerCar
      ? this.playerCar.speed < -0.5 ? 'R' : this.playerCar.speed < 1 ? 'N' : String(Math.min(6, 1 + Math.floor(Math.abs(this.playerCar.speed) / 9)))
      : '—'

    let prompt = ''
    if (!this.playerCar) {
      this.nearCar = null
      let bd = 4.2
      for (const v of this.vehicles) {
        const d = v.pos.distanceTo(this.player.pos)
        if (d < bd) { bd = d; this.nearCar = v }
      }
      if (this.nearCar) prompt = `[F] Сісти — ${this.nearCar.name}`
    } else prompt = '[F] Вийти   [H] Сигнал   [R] Вирівняти'

    const hh = Math.floor(this.timeOfDay)
    const mm = Math.floor((this.timeOfDay % 1) * 60)

    const blips: { x: number; z: number; kind: string }[] = []
    for (const v of this.vehicles) {
      if (v.isPlayer) continue
      const d = v.pos.distanceTo(ppos)
      if (d < 150) blips.push({ x: v.pos.x, z: v.pos.z, kind: v.isPolice ? 'police' : 'car' })
    }
    for (const c of this.cops) if (c.pos.distanceTo(ppos) < 150) blips.push({ x: c.pos.x, z: c.pos.z, kind: 'police' })
    for (const p of this.pickupMarkers) if (!p.taken && p.pos.distanceTo(ppos) < 150) blips.push({ x: p.pos.x, z: p.pos.z, kind: p.kind })
    if (this.mission.active) blips.push({ x: this.mission.target.x, z: this.mission.target.z, kind: 'mission' })

    this.hud = {
      speed: Math.round(speedKmh),
      gear,
      wanted: this.wanted,
      health: Math.max(0, Math.round(this.player.health)),
      armor: Math.round(this.player.armor),
      money: this.player.money,
      ammo: this.player.ammo,
      inCar: !!this.playerCar,
      carName: this.playerCar?.name ?? '',
      time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
      mission: this.mission.active ? this.mission.name : '',
      objective: this.mission.active ? this.mission.objective : 'Натисніть [M] щоб узяти місію',
      prompt,
      toast: this.toast,
      minimap: { px: ppos.x, pz: ppos.z, heading: this.playerCar ? this.playerCar.heading : this.player.heading, blips },
    }
    this.onHud(this.hud)
  }

  /* ----------------------------------------------------------------- loop */
  hudAcc = 0
  loop = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(0.05, this.clock.getDelta())
    const t = this.clock.elapsedTime

    if (this.playerCar) this.updatePlayerCar(dt)
    else this.updateOnFoot(dt)

    for (const v of this.vehicles) {
      if (v.isPlayer || v.isPolice) continue
      const d = v.pos.distanceTo(this.playerCar ? this.playerCar.pos : this.player.pos)
      if (d > 320) {
        const r = this.randRoadPoint()
        v.pos.copy(r.pos); v.heading = r.heading; v.speed = 0
        this.pickAiTarget(v)
      }
      this.updateAiCar(v, dt)
    }

    this.updatePolice(dt)
    this.updatePeds(dt)
    this.updateBullets(dt)
    this.updateMission(dt)
    this.regen(dt)
    this.updatePickups()
    this.city.update(t)
    this.updateSky(dt)
    this.updateCamera(dt)

    for (let i = this.effects.length - 1; i >= 0; i--) if (!this.effects[i](dt)) this.effects.splice(i, 1)

    this.hudAcc += dt
    if (this.hudAcc > 0.08) { this.pushHud(this.hudAcc); this.hudAcc = 0 }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    ;(this as any).__cleanup?.()
    this.audio.dispose()
    this.renderer.dispose()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      const mat = m.material as THREE.Material | THREE.Material[]
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat?.dispose?.()
    })
  }
}

/* -------------------------------------------------------------- audio ctl */
class AudioCtl {
  ctx: AudioContext | null = null
  engineOsc: OscillatorNode | null = null
  engineGain: GainNode | null = null
  sirenOsc: OscillatorNode | null = null
  sirenGain: GainNode | null = null
  sirenLfo: OscillatorNode | null = null
  master: GainNode | null = null

  ensure() {
    if (this.ctx) return this.ctx
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.28
      this.master.connect(this.ctx.destination)

      this.engineGain = this.ctx.createGain()
      this.engineGain.gain.value = 0
      const filt = this.ctx.createBiquadFilter()
      filt.type = 'lowpass'
      filt.frequency.value = 900
      this.engineOsc = this.ctx.createOscillator()
      this.engineOsc.type = 'sawtooth'
      this.engineOsc.frequency.value = 60
      this.engineOsc.connect(this.engineGain)
      this.engineGain.connect(filt)
      filt.connect(this.master)
      this.engineOsc.start()
    } catch { /* no audio */ }
    return this.ctx
  }
  resume() { this.ensure()?.resume() }

  setEngine(load: number) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return
    const f = 55 + load * 190
    this.engineOsc.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.08)
    this.engineGain.gain.setTargetAtTime(load > 0.01 ? 0.1 + load * 0.14 : 0, this.ctx.currentTime, 0.12)
  }

  blip(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.3) {
    const c = this.ensure()
    if (!c || !this.master) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(vol, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    o.connect(g); g.connect(this.master)
    o.start(); o.stop(c.currentTime + dur)
  }

  shot() { this.blip(280, 0.09, 'square', 0.32); this.blip(110, 0.16, 'sawtooth', 0.22) }
  hit() { this.blip(160, 0.12, 'triangle', 0.3) }
  crash() { this.blip(90, 0.3, 'sawtooth', 0.4); this.blip(220, 0.14, 'square', 0.2) }
  explosion() { this.blip(60, 0.7, 'sawtooth', 0.5); this.blip(140, 0.5, 'square', 0.3) }
  horn() { this.blip(420, 0.35, 'square', 0.25); this.blip(315, 0.35, 'square', 0.2) }
  door() { this.blip(200, 0.08, 'triangle', 0.2) }
  cash() { this.blip(880, 0.08, 'square', 0.2); setTimeout(() => this.blip(1320, 0.12, 'square', 0.2), 80) }

  siren(on: boolean) {
    const c = this.ensure()
    if (!c || !this.master) return
    if (on && !this.sirenOsc) {
      this.sirenOsc = c.createOscillator()
      this.sirenGain = c.createGain()
      this.sirenLfo = c.createOscillator()
      const lfoGain = c.createGain()
      this.sirenOsc.type = 'sine'
      this.sirenOsc.frequency.value = 720
      this.sirenLfo.frequency.value = 1.6
      lfoGain.gain.value = 220
      this.sirenLfo.connect(lfoGain)
      lfoGain.connect(this.sirenOsc.frequency)
      this.sirenGain.gain.value = 0.07
      this.sirenOsc.connect(this.sirenGain)
      this.sirenGain.connect(this.master)
      this.sirenOsc.start(); this.sirenLfo.start()
    } else if (!on && this.sirenOsc) {
      try { this.sirenOsc.stop(); this.sirenLfo?.stop() } catch {}
      this.sirenOsc = null; this.sirenLfo = null
    }
  }

  dispose() {
    try { this.engineOsc?.stop(); this.sirenOsc?.stop(); this.sirenLfo?.stop() } catch {}
    this.ctx?.close()
  }
}
