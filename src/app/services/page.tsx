'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const services = [
  {
    id: 'audit',
    number: '01',
    title: 'Аудит втрат',
    subtitle: 'Діагностика цифрового маршруту',
    description: 'Картуємо customer journey від першого контакту з брендом до фінальної оплати. Знаходимо 4-7 критичних розривів, де трафік відсікається.',
    features: [
      'Аналіз поточної воронки',
      'Виявлення точок витоку',
      'Картування customer journey',
      'Звіт з рекомендаціями',
    ],
    deliverable: 'Детальний звіт з пріоритизацією проблем та оцінкою втрат',
    timeline: '3-5 робочих днів',
  },
  {
    id: 'architecture',
    number: '02',
    title: 'Архітектура воронки',
    subtitle: 'Проєктування цифрової системи',
    description: 'Проєктуємо єдину точку входу. Всі сервіси (меню, запис, доставка, івенти) збираються в один логічний маршрут під контролем бренду.',
    features: [
      'Проєктування UX-маршруту',
      'Дизайн конверсійних точок',
      'Інтеграція сервісів',
      'Побудова власного домену',
    ],
    deliverable: 'Прототип та технічне завдання для розробки',
    timeline: '7-14 робочих днів',
  },
  {
    id: 'automation',
    number: '03',
    title: 'Автоматизація',
    subtitle: 'Автономні рішення для воронки',
    description: 'Забираємо операторів з воронки там, де рішення можна прийняти автоматично. Боти, швидкі форми, автовідповіді, перехоплення негативу.',
    features: [
      'Налаштування Telegram-ботів',
      'Автоматизація відповідей',
      'Перехоплення негативних відгуків',
      'Автономне бронювання',
    ],
    deliverable: 'Працююча система автоматизації',
    timeline: '5-10 робочих днів',
  },
  {
    id: 'launch',
    number: '04',
    title: 'Запуск та підтримка',
    subtitle: 'Впровадження та супровід',
    description: 'Передаємо клієнту систему, яка працює автономно і не залежить від графіка адміністраторів. Супровід протягом першого місяця.',
    features: [
      'Тестування та запуск',
      'Навчання персоналу',
      'Моніторинг показників',
      '30 днів підтримки',
    ],
    deliverable: 'Працююча система + 30 днів супроводу',
    timeline: '3-5 робочих днів + 30 днів підтримки',
  },
]

const industries = [
  {
    name: 'Стоматології',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    services: ['Цифрова точка довіри', 'Автозапис на прийом', 'Перехоплення відгуків'],
  },
  {
    name: 'Мережі краси',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    services: ['Централізований запис', 'Аналітика по локаціях', 'Автоматизація нагадувань'],
  },
  {
    name: 'HoReCa',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
      </svg>
    ),
    services: ['Банкетне бронювання', 'Онлайн-меню', 'Управління репутацією'],
  },
]

export default function ServicesPage() {
  return (
    <div style={{ paddingTop: '100px' }}>
      {/* Hero */}
      <section style={{
        minHeight: '60vh',
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
            style={{ maxWidth: '900px' }}
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
                Послуги
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              color: 'var(--color-text-light)',
              marginBottom: '2rem',
            }}>
              Етапи роботи
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.8,
              color: 'var(--color-text-muted)',
              fontWeight: 300,
              maxWidth: '700px',
            }}>
              Ми не починаємо з малювання макетів. Ми починаємо з аудиту втрат — 
              знаходимо, де ваш бізнес щодня втрачає гроші.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section style={{
        background: 'var(--color-bg-white)',
        padding: '8rem 0',
      }}>
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                variants={fadeInUp}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '3rem',
                  padding: '4rem 0',
                  borderBottom: index < services.length - 1 ? '1px solid rgba(201, 169, 98, 0.15)' : 'none',
                  alignItems: 'start',
                }}
              >
                {/* Left - Number and Title */}
                <div>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '5rem',
                    fontWeight: 300,
                    color: 'rgba(201, 169, 98, 0.15)',
                    lineHeight: 1,
                    marginBottom: '1rem',
                  }}>
                    {service.number}
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2rem',
                    fontWeight: 400,
                    color: 'var(--color-text-dark)',
                    marginBottom: '0.5rem',
                  }}>
                    {service.title}
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    marginBottom: '1.5rem',
                  }}>
                    {service.subtitle}
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    color: '#666',
                    marginBottom: '2rem',
                  }}>
                    {service.description}
                  </p>
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(201, 169, 98, 0.05)',
                    borderLeft: '2px solid var(--color-gold)',
                  }}>
                    <p style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-gold)',
                      marginBottom: '0.5rem',
                    }}>
                      Результат
                    </p>
                    <p style={{
                      fontSize: '0.9375rem',
                      color: '#666',
                    }}>
                      {service.deliverable}
                    </p>
                  </div>
                </div>

                {/* Right - Features */}
                <div>
                  <div style={{
                    marginBottom: '2rem',
                  }}>
                    <p style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#999',
                      marginBottom: '1rem',
                    }}>
                      Що входить
                    </p>
                    <ul style={{ listStyle: 'none' }}>
                      {service.features.map((feature, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid rgba(201, 169, 98, 0.1)',
                            fontSize: '0.9375rem',
                            color: '#555',
                          }}
                        >
                          <span style={{
                            width: '6px',
                            height: '6px',
                            background: 'var(--color-gold)',
                            borderRadius: '50%',
                          }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--color-bg-primary)',
                    color: 'var(--color-gold)',
                    fontSize: '0.875rem',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    {service.timeline}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Industries */}
      <section style={{
        background: 'var(--color-bg-primary)',
        padding: '8rem 0',
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
              Для кого ми працюємо
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {industries.map((industry, i) => (
              <motion.div
                key={industry.name}
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
                <div style={{ color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
                  {industry.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: 'var(--color-text-light)',
                  marginBottom: '1rem',
                }}>
                  {industry.name}
                </h3>
                <ul style={{ listStyle: 'none' }}>
                  {industry.services.map((item, j) => (
                    <li
                      key={j}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <span style={{
                        width: '4px',
                        height: '4px',
                        background: 'var(--color-gold)',
                        borderRadius: '50%',
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        padding: '8rem 0',
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
              Як ми працюємо
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            {[
              { step: '01', title: 'Заявка', desc: 'Залишаєте заявку або пишете в Telegram' },
              { step: '02', title: 'Діагностика', desc: 'Безкоштовний 30-хвилинний аналіз вашої воронки' },
              { step: '03', title: 'Пропозиція', desc: 'Отримуєте комерційну пропозицію з цінами' },
              { step: '04', title: 'Робота', desc: 'Виконуємо роботу та передаємо результат' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '3rem',
                  fontWeight: 300,
                  color: 'rgba(201, 169, 98, 0.3)',
                  marginBottom: '1rem',
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  color: 'var(--color-text-light)',
                  marginBottom: '0.5rem',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--color-text-muted)',
                }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
        padding: '8rem 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              color: 'var(--color-text-light)',
              marginBottom: '1.5rem',
            }}>
              Готові почати?
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              marginBottom: '3rem',
              maxWidth: '500px',
              margin: '0 auto 3rem',
            }}>
              Запишіться на безкоштовну діагностику та дізнайтеся, 
              де ваш бізнес втрачає гроші.
            </p>
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
              }}
            >
              Записатися на діагностику
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
