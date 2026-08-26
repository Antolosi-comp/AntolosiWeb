'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Game, HudState } from '@/game/engine'
import { WORLD, OFFSET } from '@/game/city'

const blank: HudState = {
  speed: 0, gear: '—', wanted: 0, health: 100, armor: 0, money: 2500, ammo: 120,
  inCar: false, carName: '', time: '21:00', mission: '', objective: '', prompt: '', toast: '',
  minimap: { px: 0, pz: 0, heading: 0, blips: [] },
}

export default function Gta6Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const mapRef = useRef<HTMLCanvasElement>(null)
  const hudRef = useRef<HudState>(blank)
  const [hud, setHud] = useState<HudState>(blank)
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paused, setPaused] = useState(false)

  const onHud = useCallback((h: HudState) => {
    hudRef.current = h
    setHud(h)
  }, [])

  const start = async () => {
    if (gameRef.current || !canvasRef.current) return
    setLoading(true)
    const { Game } = await import('@/game/engine')
    // let the loader paint
    await new Promise((r) => setTimeout(r, 60))
    gameRef.current = new Game(canvasRef.current, onHud)
    setLoading(false)
    setStarted(true)
    canvasRef.current.requestPointerLock()
  }

  useEffect(() => {
    const onLock = () => setPaused(!document.pointerLockElement && !!gameRef.current)
    document.addEventListener('pointerlockchange', onLock)
    return () => {
      document.removeEventListener('pointerlockchange', onLock)
      gameRef.current?.dispose()
      gameRef.current = null
    }
  }, [])

  /* minimap render */
  useEffect(() => {
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const cv = mapRef.current
      if (!cv || !started) return
      const ctx = cv.getContext('2d')!
      const S = cv.width
      const R = 150
      const h = hudRef.current.minimap
      ctx.clearRect(0, 0, S, S)
      ctx.save()
      ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 2, 0, 7); ctx.clip()
      ctx.fillStyle = '#0a0a14'
      ctx.fillRect(0, 0, S, S)

      const k = (S / 2) / R
      ctx.translate(S / 2, S / 2)
      ctx.rotate(-h.heading)
      ctx.translate(-h.px * k, h.pz * k)

      // road grid
      const CELL = 92, GRID = 7
      ctx.strokeStyle = '#2c2c3e'
      ctx.lineWidth = 18 * k
      for (let i = 0; i <= GRID; i++) {
        const c = OFFSET + i * CELL
        ctx.beginPath(); ctx.moveTo(c * k, -(OFFSET) * k); ctx.lineTo(c * k, -(OFFSET + WORLD) * k); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(OFFSET * k, -c * k); ctx.lineTo((OFFSET + WORLD) * k, -c * k); ctx.stroke()
      }
      const colors: Record<string, string> = {
        car: '#6b7280', police: '#3b82f6', money: '#22c55e', health: '#ff4d6d', ammo: '#ffd166', armor: '#38bdf8', mission: '#facc15',
      }
      for (const b of h.blips) {
        ctx.fillStyle = colors[b.kind] ?? '#fff'
        const r = b.kind === 'mission' ? 6 : b.kind === 'police' ? 4.5 : 3
        ctx.beginPath(); ctx.arc(b.x * k, -b.z * k, r, 0, 7); ctx.fill()
      }
      ctx.restore()

      // player arrow
      ctx.save()
      ctx.translate(S / 2, S / 2)
      ctx.fillStyle = '#00e5ff'
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6, 7); ctx.lineTo(0, 4); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill()
      ctx.restore()

      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 2, 0, 7); ctx.stroke()
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [started])

  const bar = (v: number, max: number, color: string) => (
    <div style={{ width: 132, height: 9, background: 'rgba(0,0,0,.55)', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(255,255,255,.16)' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, (v / max) * 100))}%`, height: '100%', background: color, transition: 'width .18s' }} />
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#05050c', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* ------------------------------------------------------------- HUD */}
      {started && (
        <>
          {/* minimap */}
          <div style={{ position: 'absolute', left: 22, bottom: 22, width: 190, height: 190 }}>
            <canvas ref={mapRef} width={190} height={190} style={{ width: 190, height: 190, borderRadius: '50%', boxShadow: '0 0 24px rgba(0,0,0,.7)' }} />
            <div style={{ position: 'absolute', top: -26, left: 4, font: '600 13px Inter, sans-serif', color: '#e9d8ff', letterSpacing: '.12em', textShadow: '0 2px 8px #000' }}>
              LEONIDA · {hud.time}
            </div>
          </div>

          {/* stats */}
          <div style={{ position: 'absolute', left: 228, bottom: 30, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {bar(hud.health, 100, 'linear-gradient(90deg,#ff2d55,#ff7b9c)')}
            {bar(hud.armor, 100, 'linear-gradient(90deg,#38bdf8,#a5f3fc)')}
          </div>

          {/* money / ammo */}
          <div style={{ position: 'absolute', right: 26, top: 22, textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ font: '700 30px/1 Inter, sans-serif', color: '#4ade80', textShadow: '0 3px 12px rgba(0,0,0,.9)' }}>
              ${hud.money.toLocaleString('en-US')}
            </div>
            <div style={{ marginTop: 8, font: '600 17px Inter, sans-serif', color: '#fde68a', textShadow: '0 3px 12px #000' }}>
              🔫 {hud.ammo}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{
                  fontSize: 22, lineHeight: 1,
                  color: i <= hud.wanted ? '#ffd166' : 'rgba(255,255,255,.16)',
                  textShadow: i <= hud.wanted ? '0 0 12px #ffb703' : 'none',
                  animation: i <= hud.wanted ? 'wpulse .8s infinite alternate' : 'none',
                }}>★</span>
              ))}
            </div>
          </div>

          {/* speedo */}
          {hud.inCar && (
            <div style={{ position: 'absolute', right: 34, bottom: 26, textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ font: '300 12px Inter', letterSpacing: '.24em', color: '#c4b5fd' }}>{hud.carName.toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end' }}>
                <span style={{ font: '700 56px/1 Inter, sans-serif', color: '#fff', textShadow: '0 0 26px rgba(255,45,120,.75)' }}>{hud.speed}</span>
                <span style={{ font: '500 15px Inter', color: '#9ca3af' }}>KM/H</span>
              </div>
              <div style={{ font: '600 15px Inter', color: '#ff2f6d', letterSpacing: '.2em' }}>GEAR {hud.gear}</div>
            </div>
          )}

          {/* mission */}
          <div style={{ position: 'absolute', left: 26, top: 22, maxWidth: 340, fontFamily: 'Inter, sans-serif' }}>
            {hud.mission && (
              <div style={{ font: '700 17px Inter', color: '#facc15', textShadow: '0 2px 10px #000' }}>{hud.mission}</div>
            )}
            <div style={{ font: '400 13px Inter', color: '#d1d5db', marginTop: 3, textShadow: '0 2px 8px #000' }}>{hud.objective}</div>
          </div>

          {/* prompt */}
          {hud.prompt && (
            <div style={{
              position: 'absolute', bottom: 118, left: '50%', transform: 'translateX(-50%)',
              padding: '9px 20px', background: 'rgba(6,6,14,.72)', border: '1px solid rgba(255,255,255,.16)',
              borderRadius: 8, font: '500 14px Inter, sans-serif', color: '#e5e7eb', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
            }}>{hud.prompt}</div>
          )}

          {/* toast */}
          {hud.toast && (
            <div style={{
              position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%)',
              padding: '12px 28px', background: 'rgba(10,6,20,.82)', border: '1px solid rgba(255,45,120,.5)',
              borderRadius: 10, font: '600 16px Inter, sans-serif', color: '#fff',
              boxShadow: '0 0 40px rgba(255,45,120,.3)', backdropFilter: 'blur(10px)', whiteSpace: 'nowrap',
            }}>{hud.toast}</div>
          )}

          {/* crosshair on foot */}
          {!hud.inCar && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
              <div style={{ width: 3, height: 3, background: '#fff', borderRadius: '50%', boxShadow: '0 0 6px #000' }} />
              <div style={{ position: 'absolute', left: -13, top: 1, width: 9, height: 1, background: 'rgba(255,255,255,.75)' }} />
              <div style={{ position: 'absolute', left: 7, top: 1, width: 9, height: 1, background: 'rgba(255,255,255,.75)' }} />
              <div style={{ position: 'absolute', left: 1, top: -13, width: 1, height: 9, background: 'rgba(255,255,255,.75)' }} />
              <div style={{ position: 'absolute', left: 1, top: 7, width: 1, height: 9, background: 'rgba(255,255,255,.75)' }} />
            </div>
          )}

          {/* wanted vignette */}
          {hud.wanted > 0 && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              boxShadow: `inset 0 0 ${90 + hud.wanted * 45}px rgba(255,20,60,${0.1 + hud.wanted * 0.07})`,
              animation: 'wsiren 1.1s infinite alternate',
            }} />
          )}
          {hud.health < 35 && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 160px rgba(255,0,0,.45)' }} />
          )}
        </>
      )}

      {/* ------------------------------------------------------- pause menu */}
      {started && paused && (
        <div onClick={() => canvasRef.current?.requestPointerLock()} style={{
          position: 'absolute', inset: 0, background: 'rgba(4,3,12,.78)', backdropFilter: 'blur(10px)',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>
          <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ font: '800 46px Inter', letterSpacing: '.06em', background: 'linear-gradient(90deg,#ff2f6d,#ffd166,#00d1ff)', WebkitBackgroundClip: 'text', color: 'transparent' }}>ПАУЗА</div>
            <div style={{ marginTop: 10, color: '#cbd5e1', fontSize: 15 }}>Клікніть, щоб продовжити</div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- intro */}
      {!started && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          background: 'radial-gradient(ellipse at 50% 120%, #ff2f6d33 0%, transparent 55%), radial-gradient(ellipse at 20% 0%, #00d1ff22 0%, transparent 50%), #05050c',
          fontFamily: 'Inter, sans-serif', padding: 24, overflowY: 'auto',
        }}>
          <div style={{ maxWidth: 760, width: '100%', textAlign: 'center' }}>
            <div style={{ font: '300 15px Inter', letterSpacing: '.6em', color: '#9ca3af', marginBottom: 6 }}>ANTOLOSI PRESENTS</div>
            <h1 style={{
              font: '900 clamp(64px,14vw,148px)/0.9 Inter, sans-serif', letterSpacing: '-.03em', margin: 0,
              background: 'linear-gradient(180deg,#ffd166 0%,#ff2f6d 55%,#8b5cf6 100%)',
              WebkitBackgroundClip: 'text', color: 'transparent',
              filter: 'drop-shadow(0 0 44px rgba(255,47,109,.55))',
            }}>GTA VI</h1>
            <div style={{ font: '500 clamp(15px,3vw,22px) Inter', letterSpacing: '.34em', color: '#00d1ff', marginTop: 4 }}>VICE CITY · LEONIDA</div>

            <div style={{
              margin: '30px auto 0', maxWidth: 620, display: 'grid', gap: 8,
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              font: '400 13.5px Inter', color: '#cbd5e1', textAlign: 'left',
            }}>
              {[
                ['WASD / ←↑↓→', 'Рух та кермування'],
                ['Миша', 'Огляд камери'],
                ['ЛКМ', 'Стрільба (пішки й з авто)'],
                ['F', 'Сісти / вийти з авто'],
                ['Space', 'Ручник / стрибок'],
                ['Shift', 'Біг'],
                ['H', 'Сигнал'],
                ['M', 'Взяти місію'],
                ['R', 'Вирівняти авто'],
                ['N', 'Змінити час доби'],
                ['C', 'Вільна камера в авто'],
                ['Esc', 'Пауза'],
              ].map(([k, d]) => (
                <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, padding: '7px 11px' }}>
                  <kbd style={{ font: '600 11.5px Inter', color: '#ffd166', background: 'rgba(255,209,102,.1)', border: '1px solid rgba(255,209,102,.28)', borderRadius: 4, padding: '3px 7px', whiteSpace: 'nowrap' }}>{k}</kbd>
                  <span>{d}</span>
                </div>
              ))}
            </div>

            <button onClick={start} disabled={loading} style={{
              marginTop: 34, padding: '17px 62px',
              font: '700 20px Inter, sans-serif', letterSpacing: '.16em', color: '#0b0616',
              background: loading ? '#4b5563' : 'linear-gradient(90deg,#ffd166,#ff2f6d)',
              border: 'none', borderRadius: 999, cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 12px 46px rgba(255,47,109,.45)',
            }}>{loading ? 'ЗАВАНТАЖЕННЯ МІСТА…' : '▶  ГРАТИ'}</button>

            <div style={{ marginTop: 20, font: '400 11.5px Inter', color: '#6b7280', lineHeight: 1.6 }}>
              Фанатська 3D-пісочниця, створена з нуля на Three.js для особистого використання.<br />
              Не пов’язана з Rockstar Games та Take-Two Interactive. Усі активи згенеровані процедурно.
            </div>
            <a href="/" style={{ display: 'inline-block', marginTop: 14, font: '500 13px Inter', color: '#9ca3af', textDecoration: 'underline' }}>← На головну Antolosi</a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wpulse { from { opacity:.75 } to { opacity:1 } }
        @keyframes wsiren { from { opacity:.55 } to { opacity:1 } }
        body { overflow: hidden; }
      `}</style>
    </div>
  )
}
