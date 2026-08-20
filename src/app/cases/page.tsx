'use client'

import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

const cases = [
  {
    id: 'panorama',
    client: 'Panorama Ternopil',
    industry: 'HoReCa — Ресторанний комплекс',
    tagline: 'Банкети та бронювання столиків',
    challenge: {
      title: 'Проблема',
      description: 'Відсутність перехоплення негативу. Гості мовчки йшли на Google Maps писати погані відгуки, замість того, щоб дати шанс ресторану виправити ситуацію.',
    },
    solution: {
      title: 'Рішення',
      description: 'Ми не чіпали ручний маршрут банкетних продажів. Ми впровадили автономний модуль — Telegram-бота з QR-кодами на столиках.',
    },
    result: {
      title: 'Результат',
      points: [
        'Бот перехоплює негатив (1-3 зірки) в закритий чат керівництва в режимі 24/7',
        'Дає шанс відреагувати особисто та виправити ситуацію',
        'Позитив (4-5 зірок) автоматично скеровується на Google Maps',
        '0 навантаження на адміністраторів',
        '100% контроль репутації',
      ],
      metric: {
        value: '100%',
        label: 'контроль репутації',
      },
    },
    quote: {
      text: 'Система працює автономно — ми дізнаємося про проблему раніше, ніж гість встигає написати публічний відгук.',
      author: 'Керівництво Panorama Ternopil',
    },
  },
]

const otherCases = [
  {
    title: 'Преміальна стоматологія',
    description: 'Автоматизація запису на прийом з превентивним перехопленням сумнівних відгуків.',
    metric: '+40% конверсії запису',
  },
  {
    title: 'Мережа салонів краси',
    description: 'Централізована система бронювання з аналітикою по кожній локації.',
    metric: '3+ локації, одна система',
  },
  {
    title: 'Fine dining ресторан',
    description: 'Цифрове меню + автономне бронювання столиків на власному домені.',
    metric: '0% використання сторонніх сервісів',
  },
]

export default function CasesPage() {
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
                Кейси
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
              Результати,
              <br />
              <span style={{ color: 'var(--color-gold)' }}>які говорять самі</span>
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.8,
              color: 'var(--color-text-muted)',
              fontWeight: 300,
              maxWidth: '700px',
            }}>
              Кожен кейс — це реальний бізнес з реальними метриками. 
              Ми не обіцяємо "збільшення продажів у 2 рази". 
              Ми повертаємо контроль над конверсією.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Case Study */}
      {cases.map((caseStudy) => (
        <section key={caseStudy.id} style={{
          background: 'var(--color-bg-white)',
          padding: '8rem 0',
        }}>
          <div className="container">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ marginBottom: '4rem' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  border: '1px solid rgba(201, 169, 98, 0.3)',
                }}>
                  Кейс
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#999',
                }}>
                  {caseStudy.industry}
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 400,
                color: 'var(--color-text-dark)',
                marginBottom: '0.5rem',
              }}>
                {caseStudy.client}
              </h2>
              <p style={{
                fontSize: '1.25rem',
                color: '#666',
                fontWeight: 300,
              }}>
                {caseStudy.tagline}
              </p>
            </motion.div>

            {/* Main Grid */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '3rem',
                marginBottom: '4rem',
              }}
            >
              {/* Challenge */}
              <motion.div variants={fadeInUp}>
                <div style={{
                  padding: '2rem',
                  background: 'rgba(201, 169, 98, 0.05)',
                  borderLeft: '3px solid var(--color-gold)',
                  height: '100%',
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    marginBottom: '1rem',
                  }}>
                    {caseStudy.challenge.title}
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    color: '#555',
                  }}>
                    {caseStudy.challenge.description}
                  </p>
                </div>
              </motion.div>

              {/* Solution */}
              <motion.div variants={fadeInUp}>
                <div style={{
                  padding: '2rem',
                  background: '#f9f9f9',
                  borderLeft: '3px solid #333',
                  height: '100%',
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#666',
                    marginBottom: '1rem',
                  }}>
                    {caseStudy.solution.title}
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    color: '#555',
                  }}>
                    {caseStudy.solution.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{
                padding: '3rem',
                background: 'linear-gradient(135deg, #fafafa 0%, #f5f0e8 100%)',
                border: '1px solid rgba(201, 169, 98, 0.2)',
                marginBottom: '3rem',
              }}
            >
              <p style={{
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '2rem',
              }}>
                {caseStudy.result.title}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
              }}>
                <div>
                  <ul style={{ listStyle: 'none' }}>
                    {caseStudy.result.points.map((point, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem 0',
                          borderBottom: '1px solid rgba(201, 169, 98, 0.1)',
                          fontSize: '0.9375rem',
                          color: '#555',
                          lineHeight: 1.6,
                        }}
                      >
                        <span style={{
                          width: '6px',
                          height: '6px',
                          background: 'var(--color-gold)',
                          borderRadius: '50%',
                          marginTop: '0.5rem',
                          flexShrink: 0,
                        }} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '5rem',
                      fontWeight: 300,
                      color: 'var(--color-gold)',
                      lineHeight: 1,
                    }}>
                      {caseStudy.result.metric.value}
                    </div>
                    <p style={{
                      fontSize: '0.875rem',
                      letterSpacing: '0.05em',
                      color: '#666',
                      marginTop: '0.5rem',
                    }}>
                      {caseStudy.result.metric.label}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{
                paddingLeft: '2rem',
                borderLeft: '2px solid var(--color-gold)',
                maxWidth: '700px',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.6,
                color: 'var(--color-text-dark)',
                marginBottom: '1rem',
              }}>
                "{caseStudy.quote.text}"
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#666',
              }}>
                — {caseStudy.quote.author}
              </p>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Other Cases */}
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
            style={{ marginBottom: '4rem' }}
          >
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: 'var(--color-text-light)',
            }}>
              Інші проєкти
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
          }}>
            {otherCases.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                style={{
                  padding: '2.5rem',
                  background: 'rgba(201, 169, 98, 0.02)',
                  border: '1px solid rgba(201, 169, 98, 0.15)',
                  transition: 'all 0.4s ease',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  color: 'var(--color-text-light)',
                  marginBottom: '1rem',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-muted)',
                  marginBottom: '1.5rem',
                }}>
                  {item.description}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  background: 'rgba(201, 169, 98, 0.1)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--color-gold)',
                }}>
                  {item.metric}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--color-bg-secondary)',
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
              Стати нашим наступним кейсом?
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              marginBottom: '3rem',
              maxWidth: '500px',
              margin: '0 auto 3rem',
            }}>
              Запишіться на безкоштовну діагностику та дізнайтеся, 
              як ми можемо допомогти вашому бізнесу.
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
                  padding: '1rem 2rem',
                  background: 'var(--color-gold)',
                  color: 'var(--color-bg-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Зв'язатися в Telegram
              </motion.a>
              <motion.a
                href="/contact"
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
                }}
              >
                Контакти
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
