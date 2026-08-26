import * as THREE from 'three'

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, ctx: c.getContext('2d')! }
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/** Facade with lit windows. Returns [map, emissiveMap] */
export function makeFacade(hue: number, litChance = 0.45) {
  const { c, ctx } = canvas(256, 512)
  const base = `hsl(${hue}, 18%, ${rnd(12, 26)}%)`
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 256, 512)

  // concrete noise
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`
    ctx.fillRect(Math.random() * 256, Math.random() * 512, 2, 2)
  }

  const em = canvas(256, 512)
  em.ctx.fillStyle = '#000'
  em.ctx.fillRect(0, 0, 256, 512)

  const cols = 6
  const rows = 16
  const pad = 8
  const cw = (256 - pad * (cols + 1)) / cols
  const ch = (512 - pad * (rows + 1)) / rows
  const neon = [
    [255, 90, 180],
    [90, 200, 255],
    [255, 190, 90],
    [180, 120, 255],
  ]
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = pad + x * (cw + pad)
      const py = pad + y * (ch + pad)
      const lit = Math.random() < litChance
      if (lit) {
        const n = neon[(Math.random() * neon.length) | 0]
        const a = rnd(0.55, 1)
        ctx.fillStyle = `rgba(${n[0]},${n[1]},${n[2]},${a})`
        ctx.fillRect(px, py, cw, ch)
        em.ctx.fillStyle = `rgb(${(n[0] * a) | 0},${(n[1] * a) | 0},${(n[2] * a) | 0})`
        em.ctx.fillRect(px, py, cw, ch)
      } else {
        ctx.fillStyle = `rgba(10,14,22,${rnd(0.6, 0.95)})`
        ctx.fillRect(px, py, cw, ch)
      }
    }
  }

  const map = new THREE.CanvasTexture(c)
  const emissive = new THREE.CanvasTexture(em.c)
  for (const t of [map, emissive]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
  }
  map.colorSpace = THREE.SRGBColorSpace
  emissive.colorSpace = THREE.SRGBColorSpace
  return { map, emissive }
}

export function makeAsphalt() {
  const { c, ctx } = canvas(512, 512)
  ctx.fillStyle = '#1a1a1f'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 14000; i++) {
    const g = Math.random() * 40
    ctx.fillStyle = `rgba(${g + 20},${g + 20},${g + 26},${Math.random() * 0.5})`
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
  }
  // cracks
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    let x = Math.random() * 512
    let y = Math.random() * 512
    ctx.moveTo(x, y)
    for (let k = 0; k < 6; k++) {
      x += rnd(-40, 40)
      y += rnd(-40, 40)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export function makeSidewalk() {
  const { c, ctx } = canvas(256, 256)
  ctx.fillStyle = '#3a3a42'
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 3
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke()
  }
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Big glowing billboard sign */
export function makeSign(text: string, hue: number) {
  const { c, ctx } = canvas(512, 256)
  ctx.fillStyle = '#07070c'
  ctx.fillRect(0, 0, 512, 256)
  ctx.strokeStyle = `hsl(${hue},100%,60%)`
  ctx.lineWidth = 8
  ctx.strokeRect(14, 14, 484, 228)
  ctx.font = 'bold 76px Inter, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = `hsl(${hue},100%,60%)`
  ctx.shadowBlur = 34
  ctx.fillStyle = '#fff'
  ctx.fillText(text, 256, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
