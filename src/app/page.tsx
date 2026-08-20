'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

// Мінімальстичний 3D елемент
function MinimalShape({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08
      
      const scale = Math.max(0.2, 1 - scrollProgress * 0.8)
      meshRef.current.scale.setScalar(scale)
      
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.opacity = Math.max(0, 1 - scrollProgress * 2)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      >
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color={hovered ? '#e4d4a8' : '#c9a962'}
          wireframe
          transparent
          opacity={0.6}
          emissive="#c9a962"
          emissiveIntensity={hovered ? 0.2 : 0.05}
        />
      </mesh>
    </Float>
  )
}

function Particles({ scrollProgress }: { scrollProgress: number }) {
  const particles = useRef<THREE.Points>(null)
  const count = 15
  
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15
  }

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y = state.clock.elapsedTime * 0.01
      const material = particles.current.material as THREE.PointsMaterial
      material.opacity = Math.max(0, 0.4 - scrollProgress)
    }
  })

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#c9a962" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#c9a962" />
      <pointLight position={[-5, -5, -5]} intensity={0.2} color="#e4d4a8" />
      <MinimalShape scrollProgress={scrollProgress} />
      <Particles scrollProgress={scrollProgress} />
      <Environment preset="city" />
    </>
  )
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLightMode, setIsLightMode] = useState(false)
  
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  
  useEffect(() => {
    return smoothProgress.on('change', (latest) => {
      setScrollProgress(latest)
      setIsLightMode(latest > 0.1)
    })
  }, [smoothProgress])

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98])

  // Contact info
  const contacts = [
    { label: 'Telegram', value: '@Antolosi', href: 'https://t.me/Antolosi' },
    { label: 'Instagram', value: '@antolosi_partners', href: 'https://instagram.com/antolosi_partners' },
    { label: 'Телефон', value: '+380 66 169 40 60', href: 'tel:+380661694060' },
    { label: 'Email', value: 'bogdan10antoniuk@gmail.com', href: 'mailto:bogdan10antoniuk@gmail.com' },
  ]

  return (
    <div className={isLightMode ? 'light-mode' : ''}>
      {/* Hero Section */}
      <motion.section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'var(--color-bg-primary)',
        }}
      >
        {/* Video Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.4,
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.9) 100%)',
          }} />
        </div>

        {/* 3D Element */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: 'transparent' }}>
            <Suspense fallback={null}>
              <Scene scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>

        {/* Hero Content */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: '0 clamp(1.5rem, 5vw, 4rem)',
            opacity: heroOpacity,
            scale: heroScale,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.875rem',
              border: '1px solid rgba(201, 169, 98, 0.25)',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ width: '4px', height: '4px', background: 'var(--color-gold)', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
              Операційний консалтинг
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 9vw, 7rem)',
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: '0.02em',
              marginBottom: '1rem',
              color: 'var(--color-text-light)',
            }}
          >
            ANTOLOSI
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.25rem, 3.5vw, 2.5rem)',
              fontWeight: 300,
              letterSpacing: '0.25em',
              color: 'var(--color-gold)',
              marginBottom: '2rem',
            }}
          >
            PARTNERS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)',
              fontWeight: 300,
              color: 'var(--color-text-muted)',
              maxWidth: '480px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Архітектура цифрових воронок для преміального бізнесу.
            <br />Повертаємо контроль над конверсією.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.a
              href="https://t.me/Antolosi"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.75rem',
                background: 'var(--color-gold)',
                color: 'var(--color-bg-primary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                letterSpacing: '0.03em',
              }}
            >
              Зв'язатися
            </motion.a>
            <motion.a
              href="/about"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.875rem 1.5rem',
                background: 'transparent',
                border: '1px solid rgba(201, 169, 98, 0.4)',
                color: 'var(--color-gold)',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              Про нас
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.375rem',
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: '0.5625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Скрол
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, var(--color-gold), transparent)' }}
          />
        </motion.div>
      </motion.section>

      {/* Problem Section */}
      <section style={{ minHeight: '100vh', background: 'var(--color-bg-white)', padding: '7rem 0', position: 'relative' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: '720px', marginBottom: '3.5rem' }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              marginBottom: '1.25rem',
            }}>
              <span style={{ width: '4px', height: '4px', background: 'var(--color-gold)', borderRadius: '50%' }} />
              Проблема
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 400,
              color: 'var(--color-text-dark)',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
            }}>
              Втрата клієнтів на цифрових точках входу
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#666', fontWeight: 300 }}>
              Потенційні клієнти з високим чеком приходять з Instagram, Google, реклами — 
              і зникають, коли не можуть швидко оформити заявку.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
            {[
              { num: '01', title: 'Розірваний маршрут', desc: 'Клієнт переходить на сторонній сервіс і втрачає зв\'язок з брендом.' },
              { num: '02', title: 'Відсутність контролю', desc: 'Аналітика розпорошена. Ви не бачите, де втрачається клієнт.' },
              { num: '03', title: 'Ручна рутина', desc: 'Адміністратор фільтрує неякісні ліди замість роботи з високочеком.' },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                style={{
                  padding: '1.75rem',
                  background: '#fff',
                  border: '1px solid rgba(201, 169, 98, 0.15)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, color: 'rgba(201, 169, 98, 0.25)', marginBottom: '0.75rem', lineHeight: 1 }}>
                  {item.num}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-text-dark)', marginBottom: '0.625rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#777' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              padding: '3rem',
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f0e6 100%)',
              border: '1px solid rgba(201, 169, 98, 0.15)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
              {[
                { value: '4-7', label: 'точок втрати на аудит' },
                { value: '24/7', label: 'автономна робота' },
                { value: '100%', label: 'контроль конверсії' },
              ].map((m, i) => (
                <div key={m.label}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 300, color: 'var(--color-gold)', lineHeight: 1 }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginTop: '0.375rem' }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '7rem 0', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '3%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(201, 169, 98, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: '720px', marginBottom: '3.5rem' }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              marginBottom: '1.25rem',
            }}>
              <span style={{ width: '4px', height: '4px', background: 'var(--color-gold)', borderRadius: '50%' }} />
              Рішення
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 400,
              color: 'var(--color-text-light)',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
            }}>
              Автономна цифрова архітектура
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--color-text-muted)', fontWeight: 300 }}>
              Проєктуємо системи, які працюють 24/7 і повертають прибуток власнику бізнесу.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '01', tag: 'Діагностика', title: 'Аудит втрат', desc: 'Картуємо customer journey. Знаходимо 4-7 критичних розривів.' },
              { num: '02', tag: 'Проєктування', title: 'Архітектура воронки', desc: 'Єдина точка входу. Всі сервіси в одному логічному маршруті.' },
              { num: '03', tag: 'Оптимізація', title: 'Автоматизація', desc: 'Забираємо операторів з воронки. Боти, форми, автовідповіді.' },
              { num: '04', tag: 'Результат', title: 'Запуск', desc: 'Система працює автономно. Не залежить від графіка адміністраторів.' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ backgroundColor: 'rgba(201, 169, 98, 0.04)', borderColor: 'rgba(201, 169, 98, 0.3)' }}
                style={{
                  padding: '2rem',
                  background: 'rgba(201, 169, 98, 0.015)',
                  border: '1px solid rgba(201, 169, 98, 0.12)',
                  transition: 'all 0.35s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 300, color: 'rgba(201, 169, 98, 0.25)' }}>
                    {s.num}
                  </span>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.5625rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    border: '1px solid rgba(201, 169, 98, 0.25)',
                  }}>
                    {s.tag}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '0.625rem' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-text-muted)' }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section style={{ background: 'var(--color-bg-secondary)', padding: '7rem 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '0.75rem' }}>
              Преміальний сегмент
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Власники бізнесів з високим чеком
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '◈', title: 'Стоматології', desc: 'Імплантація, мікроскоп, вініри. Один пацієнт — тисячі доларів.' },
              { icon: '◎', title: 'Мережі краси', desc: '3+ локації. Запис на сторонніх SaaS — втрата аналітики.' },
              { icon: '◇', title: 'HoReCa', desc: 'Fine dining, банкети. Бронювання розірване на телефони та Google Forms.' },
            ].map((ind, i) => (
              <motion.div
                key={ind.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                style={{
                  padding: '2rem',
                  background: 'rgba(10, 10, 10, 0.4)',
                  border: '1px solid rgba(201, 169, 98, 0.08)',
                  textAlign: 'center',
                  transition: 'all 0.35s ease',
                }}
              >
                <div style={{ fontSize: '2rem', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>{ind.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '0.625rem' }}>
                  {ind.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.65, color: 'var(--color-text-muted)' }}>
                  {ind.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
        padding: '6rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(201, 169, 98, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 300,
              color: 'var(--color-text-light)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}>
              Повернути контроль над конверсією?
            </h2>
            <p style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-muted)',
              marginBottom: '2.5rem',
              maxWidth: '420px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.65,
            }}>
              Безкоштовна 30-хвилинна діагностика. Знайдемо точки втрати у вашому маршруті.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.a
                href="https://t.me/Antolosi"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  background: 'var(--color-gold)',
                  color: 'var(--color-bg-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}
              >
                Записатися на діагностику
              </motion.a>
              <motion.a
                href="/cases"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.875rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(201, 169, 98, 0.25)',
                  color: 'var(--color-gold)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}
              >
                Кейси
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Bar */}
      <section style={{ background: 'var(--color-gold)', padding: '1.25rem 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2.5rem',
            flexWrap: 'wrap',
          }}>
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-bg-primary)',
                }}
              >
                {c.value}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
