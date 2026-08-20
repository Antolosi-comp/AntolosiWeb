'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    phone: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to a backend
    const text = `*Нова заявка з сайту*%0A%0A` +
      `*Ім'я:* ${formData.name}%0A` +
      `*Бізнес:* ${formData.business}%0A` +
      `*Телефон:* ${formData.phone}%0A` +
      `*Повідомлення:* ${formData.message}`
    
    window.open(`https://t.me/Antolosi?text=${text}`, '_blank')
    setIsSubmitted(true)
  }

  const contactMethods = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.169.333.015.099.034.323.019.498z"/>
        </svg>
      ),
      title: 'Telegram',
      value: '@Antolosi',
      href: 'https://t.me/Antolosi',
      description: "Основний канал зв'язку. Відповідаємо протягом 2 годин.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      title: 'Instagram',
      value: '@antolosi_partners',
      href: 'https://instagram.com/antolosi_partners',
      description: 'Новини, кейси та експертний контент.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      ),
      title: 'Телефон',
      value: '+380 66 169 40 60',
      href: 'tel:+380661694060',
      description: 'Для термінових питань.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      title: 'Email',
      value: 'bogdan10antoniuk@gmail.com',
      href: 'mailto:bogdan10antoniuk@gmail.com',
      description: 'Для офіційних запитів та документів.',
    },
  ]

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* Hero */}
      <section style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-primary)',
        padding: '4rem 0',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ maxWidth: '700px' }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(201, 169, 98, 0.3)',
              marginBottom: '2rem',
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
                Контакти
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              color: 'var(--color-text-light)',
              marginBottom: '2rem',
            }}>
              Зв'яжіться з нами
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.8,
              color: 'var(--color-text-muted)',
              fontWeight: 300,
            }}>
              Запишіться на безкоштовну 30-хвилинну діагностику. 
              Ми знайдемо точки втрати у вашому цифровому маршруті.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section style={{
        background: 'var(--color-bg-white)',
        padding: '6rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '6rem',
          }}>
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.title}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                style={{
                  display: 'block',
                  padding: '2rem',
                  background: '#fff',
                  border: '1px solid rgba(201, 169, 98, 0.2)',
                  transition: 'all 0.4s ease',
                }}
              >
                <div style={{ color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
                  {method.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.125rem',
                  fontWeight: 400,
                  color: 'var(--color-text-dark)',
                  marginBottom: '0.25rem',
                }}>
                  {method.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--color-gold)',
                  marginBottom: '0.75rem',
                }}>
                  {method.value}
                </p>
                <p style={{
                  fontSize: '0.8125rem',
                  color: '#999',
                  lineHeight: 1.5,
                }}>
                  {method.description}
                </p>
              </motion.a>
            ))}
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '3rem',
              background: 'rgba(201, 169, 98, 0.03)',
              border: '1px solid rgba(201, 169, 98, 0.15)',
            }}
          >
            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 1.5rem',
                  borderRadius: '50%',
                  background: 'var(--color-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--color-bg-primary)">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: 'var(--color-text-dark)',
                  marginBottom: '1rem',
                }}>
                  Дякуємо за заявку!
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: 1.7,
                }}>
                  Ми зв'яжемося з вами протягом 2 годин у Telegram.
                </p>
              </div>
            ) : (
              <>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.75rem',
                  fontWeight: 400,
                  color: 'var(--color-text-dark)',
                  marginBottom: '0.5rem',
                  textAlign: 'center',
                }}>
                  Записатися на діагностику
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#999',
                  textAlign: 'center',
                  marginBottom: '2rem',
                }}>
                  Безкоштовна 30-хвилинна консультація
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#666',
                      marginBottom: '0.5rem',
                    }}>
                      Ваше ім'я
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Як до вас звертатися?"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#fff',
                        border: '1px solid rgba(201, 169, 98, 0.2)',
                        fontSize: '1rem',
                        color: 'var(--color-text-dark)',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.2)'}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#666',
                      marginBottom: '0.5rem',
                    }}>
                      Назва бізнесу
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      placeholder="Чим займаєтесь?"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#fff',
                        border: '1px solid rgba(201, 169, 98, 0.2)',
                        fontSize: '1rem',
                        color: 'var(--color-text-dark)',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.2)'}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#666',
                      marginBottom: '0.5rem',
                    }}>
                      Телефон або Telegram
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+380 або @username"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#fff',
                        border: '1px solid rgba(201, 169, 98, 0.2)',
                        fontSize: '1rem',
                        color: 'var(--color-text-dark)',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.2)'}
                    />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#666',
                      marginBottom: '0.5rem',
                    }}>
                      Повідомлення (необов'язково)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Коротко опишіть вашу ситуацію..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#fff',
                        border: '1px solid rgba(201, 169, 98, 0.2)',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        color: 'var(--color-text-dark)',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'border-color 0.3s ease',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.2)'}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      width: '100%',
                      padding: '1rem 2rem',
                      background: 'var(--color-gold)',
                      color: 'var(--color-bg-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Надіслати заявку
                  </motion.button>

                  <p style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    textAlign: 'center',
                    marginTop: '1rem',
                  }}>
                    Натискаючи кнопку, ви перенаправляєтесь у Telegram для швидкого зв'язку
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section style={{
        background: 'var(--color-bg-primary)',
        padding: '6rem 0',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3rem',
                fontWeight: 300,
                color: 'var(--color-gold)',
                marginBottom: '0.5rem',
              }}>
                30 хв
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
              }}>
                Безкоштовна діагностика
              </p>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3rem',
                fontWeight: 300,
                color: 'var(--color-gold)',
                marginBottom: '0.5rem',
              }}>
                2 год
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
              }}>
                Середній час відповіді
              </p>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3rem',
                fontWeight: 300,
                color: 'var(--color-gold)',
                marginBottom: '0.5rem',
              }}>
                24/7
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
              }}>
                Працюємо з бізнесами по всій Україні
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
