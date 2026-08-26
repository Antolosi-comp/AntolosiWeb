'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import '../styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isGame = pathname?.startsWith('/gta6') ?? false
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = window.scrollY / totalHeight
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      lenis.destroy()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navLinks = [
    { href: '/about', label: 'Про нас' },
    { href: '/services', label: 'Послуги' },
    { href: '/cases', label: 'Кейси' },
    { href: '/contact', label: 'Контакти' },
  ]

  return (
    <html lang="uk">
      <head>
        <title>Antolosi Partners — Операційний консалтинг</title>
        <meta name="description" content="Архітектура цифрових воронок для преміального бізнесу. CRO, автоматизація, маршрутизація клієнтів." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        {isGame ? children : (
        <>
        {/* Progress bar */}
        <motion.div
          className="progress-bar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '2px',
            background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-light))',
            zIndex: 9999,
            scaleX: scrollProgress,
            transformOrigin: '0%',
          }}
        />

        {/* Navigation */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: '1.5rem clamp(1.5rem, 5vw, 4rem)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(10, 10, 10, 0.7)',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="var(--color-gold)" strokeWidth="1.5" fill="none"/>
              <path d="M16 10L22 13V19L16 22L10 19V13L16 10Z" fill="var(--color-gold)"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: 'var(--color-gold)',
            }}>
              ANTOLOSI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-light)',
                  opacity: 0.8,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.color = 'var(--color-gold)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                  e.currentTarget.style.color = 'var(--color-text-light)'
                }}
              >
                {link.label}
              </Link>
            ))}
            <motion.a
              href="https://t.me/Antolosi"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-gold)',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-gold)'
                e.currentTarget.style.color = 'var(--color-bg-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-gold)'
              }}
            >
              Зв'язатися
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '6px',
              padding: '0.5rem',
            }}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '24px',
                height: '1px',
                background: 'var(--color-gold)',
              }}
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '24px',
                height: '1px',
                background: 'var(--color-gold)',
              }}
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '24px',
                height: '1px',
                background: 'var(--color-gold)',
              }}
            />
          </button>
        </motion.nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '400px',
                background: 'var(--color-bg-secondary)',
                zIndex: 999,
                padding: '6rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
              }}
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '2rem',
                      fontWeight: 400,
                      color: 'var(--color-text-light)',
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.a
                href="https://t.me/Antolosi"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  marginTop: '2rem',
                  padding: '1rem 2rem',
                  background: 'var(--color-gold)',
                  color: 'var(--color-bg-primary)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                Зв'язатися в Telegram
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>

        <main>{children}</main>

        {/* Footer */}
        <footer style={{
          background: 'var(--color-bg-secondary)',
          borderTop: '1px solid rgba(201, 169, 98, 0.2)',
          padding: '4rem 0 2rem',
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '3rem',
              marginBottom: '4rem',
            }}>
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="var(--color-gold)" strokeWidth="1.5" fill="none"/>
                    <path d="M16 10L22 13V19L16 22L10 19V13L16 10Z" fill="var(--color-gold)"/>
                  </svg>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: 'var(--color-gold)',
                  }}>
                    ANTOLOSI PARTNERS
                  </span>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-muted)',
                  maxWidth: '300px',
                }}>
                  Операційний консалтинг для преміального бізнесу. Архітектура цифрових воронок, CRO, автоматизація.
                </p>
              </div>

              {/* Navigation */}
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  marginBottom: '1.5rem',
                }}>
                  Навігація
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        transition: 'color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  marginBottom: '1.5rem',
                }}>
                  Контакти
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a
                    href="https://t.me/Antolosi"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      transition: 'color 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.169.333.015.099.034.323.019.498z"/>
                    </svg>
                    @Antolosi
                  </a>
                  <a
                    href="https://instagram.com/antolosi_partners"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      transition: 'color 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    @antolosi_partners
                  </a>
                  <a
                    href="tel:+380661694060"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    +380 66 169 40 60
                  </a>
                  <a
                    href="mailto:bogdan10antoniuk@gmail.com"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    bogdan10antoniuk@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid rgba(201, 169, 98, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}>
                © 2024 Antolosi Partners. Всі права захищені.
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}>
                Операційний консалтинг · Цифрова архітектура · CRO
              </p>
            </div>
          </div>
        </footer>
        </>
        )}

        <style jsx global>{`
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
            .mobile-menu-btn {
              display: flex !important;
            }
          }
        `}</style>
      </body>
    </html>
  )
}
