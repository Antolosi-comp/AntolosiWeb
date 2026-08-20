'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// 3D Geometric Abstract Shape - Interactive
function GeometricShape({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
      
      // Scale based on scroll
      const scale = 1 - scrollProgress * 0.5
      meshRef.current.scale.setScalar(Math.max(0.3, scale))
      
      // Opacity based on scroll
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.opacity = Math.max(0, 1 - scrollProgress * 1.5)
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color={hovered ? '#e4d4a8' : '#c9a962'}
          wireframe
          transparent
          opacity={0.8}
          emissive="#c9a962"
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
    </Float>
  )
}

// Secondary floating elements
function FloatingParticles({ count = 20, scrollProgress }: { count?: number, scrollProgress: number }) {
  const particles = useRef<THREE.Points>(null)
  
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y = state.clock.elapsedTime * 0.02
      const material = particles.current.material as THREE.PointsMaterial
      material.opacity = Math.max(0, 1 - scrollProgress * 2)
    }
  })

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#c9a962"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// 3D Scene Component
function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#c9a962" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#e4d4a8" />
      <GeometricShape scrollProgress={scrollProgress} />
      <FloatingParticles scrollProgress={scrollProgress} />
      <Environment preset="city" />
    </>
  )
}

// Scroll Section Component
function ScrollSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.section
      className={className}
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {children}
    </motion.section>
  )
}

// Animated Text Component
function AnimatedText({ children, delay = 0 }: { children: string, delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.span>
  )
}

// Metric Card Component
function MetricCard({ value, label, description }: { value: string, label: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -5 }}
      style={{
        padding: '2rem',
        background: 'rgba(201, 169, 98, 0.05)',
        border: '1px solid rgba(201, 169, 98, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '3rem',
        fontWeight: 300,
        color: 'var(--color-gold)',
        marginBottom: '0.5rem',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--color-gold)',
        marginBottom: '1rem',
      }}>
        {label}
      </div>
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)',
        lineHeight: 1.6,
      }}>
        {description}
      </p>
    </motion.div>
  )
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLightMode, setIsLightMode] = useState(false)
  
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  
  useEffect(() => {
    return smoothProgress.on('change', (latest) => {
      setScrollProgress(latest)
      setIsLightMode(latest > 0.15)
    })
  }, [smoothProgress])

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div ref={containerRef} className={isLightMode ? 'light-mode' : ''}>
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
        {/* 3D Canvas */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <Scene scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--color-bg-primary) 70%)',
          zIndex: 1,
        }} />

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
          {/* Top Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(201, 169, 98, 0.3)',
              marginBottom: '2rem',
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              background: 'var(--color-gold)',
              borderRadius: '50%',
            }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
            }}>
              Операційний консалтинг
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(3rem, 10vw, 8rem)',
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, var(--color-text-light) 0%, var(--color-gold) 50%, var(--color-gold-light) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ANTOLOSI
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              fontWeight: 300,
              letterSpacing: '0.3em',
              color: 'var(--color-gold)',
              marginBottom: '2rem',
            }}
          >
            PARTNERS
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 300,
              color: 'var(--color-text-muted)',
              maxWidth: '600px',
              margin: '0 auto 3rem',
              lineHeight: 1.8,
            }}
          >
            Архітектура цифрових воронок для преміального бізнесу.
            <br />
            Повертаємо контроль над конверсією.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.a
              href="https://t.me/Antolosi"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'var(--color-gold)',
                color: 'var(--color-bg-primary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.169.333.015.099.034.323.019.498z"/>
              </svg>
              Зв'язатися з нами
            </motion.a>
            <motion.a
              href="/about"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                background: 'transparent',
                border: '1px solid rgba(201, 169, 98, 0.5)',
                color: 'var(--color-gold)',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
              }}
            >
              Дізнатися більше
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            position: 'absolute',
            bottom: '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 2,
          }}
        >
          <span style={{
            fontSize: '0.625rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}>
            Скрол вниз
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, var(--color-gold), transparent)',
            }}
          />
        </motion.div>
      </motion.section>

      {/* Transition Section - Unfolds to White */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'var(--color-bg-white)',
          zIndex: 50,
          pointerEvents: 'none',
          transformOrigin: 'top',
          scaleY: scrollProgress > 0.05 ? 0 : 1,
        }}
      />

      {/* White Content Section */}
      <section style={{
        minHeight: '100vh',
        background: 'var(--color-bg-white)',
        padding: '8rem 0',
        position: 'relative',
      }}>
        <div className="container">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ maxWidth: '800px', marginBottom: '4rem' }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(201, 169, 98, 0.3)',
              marginBottom: '1.5rem',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                background: 'var(--color-gold)',
                borderRadius: '50%',
              }} />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}>
                Проблема
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 400,
              color: 'var(--color-text-dark)',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}>
              Ваш бізнес втрачає клієнтів через зламані цифрові точки входу
            </h2>
            <p style={{
              fontSize: '1.125rem',
              lineHeight: 1.8,
              color: '#666',
              fontWeight: 300,
            }}>
              Кожного дня потенційні клієнти з високим чеком приходять з Instagram, Google чи реклами — 
              і зникають у момент, коли не можуть швидко оформити заявку або забронювати послугу.
            </p>
          </motion.div>

          {/* Problem Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '5rem',
          }}>
            {[
              {
                icon: '01',
                title: 'Розірваний маршрут',
                description: 'Клієнт переходить з вашого Instagram на сторонній сервіс (Linktree, Altegio) і втрачає зв\'язок з брендом.',
              },
              {
                icon: '02',
                title: 'Немає контролю',
                description: 'Аналітика розпорошена між десятком сервісів. Ви не бачите, де саме втрачається клієнт.',
              },
              {
                icon: '03',
                title: 'Ручна рутина',
                description: 'Адміністратор витрачає години на фільтрацію неякісних лідам замість роботи з високочеком.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.icon}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                style={{
                  padding: '2rem',
                  background: '#fff',
                  border: '1px solid rgba(201, 169, 98, 0.2)',
                  borderRadius: '2px',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '3rem',
                  fontWeight: 300,
                  color: 'rgba(201, 169, 98, 0.3)',
                  marginBottom: '1rem',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: 'var(--color-text-dark)',
                  marginBottom: '1rem',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: '#666',
                }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              padding: '4rem',
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f0e8 100%)',
              border: '1px solid rgba(201, 169, 98, 0.2)',
              marginBottom: '5rem',
            }}
          >
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 400,
              color: 'var(--color-text-dark)',
              textAlign: 'center',
              marginBottom: '3rem',
            }}>
              Наш підхід — це не косметика, а хірургія
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '3.5rem',
                  fontWeight: 300,
                  color: 'var(--color-gold)',
                  lineHeight: 1,
                }}>4-7</div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginTop: '0.5rem',
                }}>Точок втрати на аудит</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '3.5rem',
                  fontWeight: 300,
                  color: 'var(--color-gold)',
                  lineHeight: 1,
                }}>24/7</div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginTop: '0.5rem',
                }}>Автономна робота системи</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '3.5rem',
                  fontWeight: 300,
                  color: 'var(--color-gold)',
                  lineHeight: 1,
                }}>100%</div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginTop: '0.5rem',
                }}>Контроль конверсії</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section - Returns to Dark */}
      <section style={{
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
        padding: '8rem 0',
        position: 'relative',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(201, 169, 98, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div className="container">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ maxWidth: '800px', marginBottom: '4rem' }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(201, 169, 98, 0.3)',
              marginBottom: '1.5rem',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                background: 'var(--color-gold)',
                borderRadius: '50%',
              }} />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}>
                Рішення
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 400,
              color: 'var(--color-text-light)',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}>
              Автономна цифрова архітектура під контролем бренду
            </h2>
            <p style={{
              fontSize: '1.125rem',
              lineHeight: 1.8,
              color: 'var(--color-text-muted)',
              fontWeight: 300,
            }}>
              Ми не малюємо красиві сайти. Ми проєктуємо системи, які працюють 24/7 
              і повертають прибуток власнику бізнесу.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                number: '01',
                title: 'Аудит втрат',
                description: 'Картуємо customer journey від першого контакту до оплати. Знаходимо 4-7 критичних розривів, де трафік відсікається.',
                tag: 'Діагностика',
              },
              {
                number: '02',
                title: 'Архітектура воронки',
                description: 'Проєктуємо єдину точку входу. Всі сервіси (меню, запис, доставка, івенти) збираються в один логічний маршрут.',
                tag: 'Проєктування',
              },
              {
                number: '03',
                title: 'Автоматизація',
                description: 'Забираємо операторів з воронки там, де рішення можна прийняти автоматично. Боти, швидкі форми, автовідповіді.',
                tag: 'Оптимізація',
              },
              {
                number: '04',
                title: 'Запуск та масштабування',
                description: 'Передаємо клієнту систему, яка працює автономно і не залежить від графіка адміністраторів.',
                tag: 'Результат',
              },
            ].map((service, i) => (
              <motion.div
                key={service.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ 
                  backgroundColor: 'rgba(201, 169, 98, 0.05)',
                  borderColor: 'rgba(201, 169, 98, 0.4)',
                }}
                style={{
                  padding: '2.5rem',
                  background: 'rgba(201, 169, 98, 0.02)',
                  border: '1px solid rgba(201, 169, 98, 0.15)',
                  transition: 'all 0.4s ease',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2.5rem',
                    fontWeight: 300,
                    color: 'rgba(201, 169, 98, 0.3)',
                  }}>
                    {service.number}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.625rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    border: '1px solid rgba(201, 169, 98, 0.3)',
                  }}>
                    {service.tag}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: 'var(--color-text-light)',
                  marginBottom: '1rem',
                }}>
                  {service.title}
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-muted)',
                }}>
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        padding: '8rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}
          >
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: 'var(--color-text-light)',
              marginBottom: '1rem',
            }}>
              Преміальний сегмент
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.7,
            }}>
              Власники бізнесів з високим чеком, які приймають рішення особисто
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { 
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                ),
                title: 'Стоматології',
                description: 'Імплантація, мікроскоп, вініри. Один пацієнт — тисячі доларів. Відсутність цифрової точки довіри до дзвінка коштує вам клієнтів.',
              },
              { 
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                ),
                title: 'Мережі краси',
                description: '3+ локації, які тримають запис на сторонніх SaaS і втрачають аналітику. Втрачаєте клієнтів на кожному етапі воронки.',
              },
              { 
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                    <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
                  </svg>
                ),
                title: 'HoReCa',
                description: 'Fine dining, ресторанні комплекси, івент-простори. Банкети та бронювання столиків розірвані на телефони та Google Forms.',
              },
            ].map((industry, i) => (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                style={{
                  padding: '2.5rem',
                  background: 'rgba(10, 10, 10, 0.5)',
                  border: '1px solid rgba(201, 169, 98, 0.1)',
                  textAlign: 'center',
                  transition: 'all 0.4s ease',
                }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  {industry.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  color: 'var(--color-text-light)',
                  marginBottom: '1rem',
                }}>
                  {industry.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-muted)',
                }}>
                  {industry.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
        padding: '8rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(201, 169, 98, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 300,
              color: 'var(--color-text-light)',
              marginBottom: '1.5rem',
              lineHeight: 1.2,
            }}>
              Готові повернути контроль
              <br />
              <span style={{ color: 'var(--color-gold)' }}>над конверсією?</span>
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              marginBottom: '3rem',
              maxWidth: '500px',
              margin: '0 auto 3rem',
              lineHeight: 1.7,
            }}>
              Запишіться на безкоштовну 30-хвилинну діагностику. 
              Ми знайдемо точки втрати у вашому цифровому маршруті.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.a
                href="https://t.me/Antolosi"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 2.5rem',
                  background: 'var(--color-gold)',
                  color: 'var(--color-bg-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                }}
              >
                Записатися на діагностику
              </motion.a>
              <motion.a
                href="/cases"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  background: 'transparent',
                  border: '1px solid rgba(201, 169, 98, 0.3)',
                  color: 'var(--color-gold)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                }}
              >
                Дивитися кейси
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Bar */}
      <section style={{
        background: 'var(--color-gold)',
        padding: '1.5rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
          }}>
            <a
              href="https://instagram.com/antolosi_partners"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-bg-primary)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              @antolosi_partners
            </a>
            <a
              href="tel:+380661694060"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-bg-primary)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              +380 66 169 40 60
            </a>
            <a
              href="mailto:bogdan10antoniuk@gmail.com"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-bg-primary)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              bogdan10antoniuk@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
