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

export default function AboutPage() {
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
                Про нас
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
              Ми — оперативний штаб,
              <br />
              <span style={{ color: 'var(--color-gold)' }}>а не вебстудія</span>
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.8,
              color: 'var(--color-text-muted)',
              fontWeight: 300,
              maxWidth: '700px',
            }}>
              Antolosi Partners — це бізнес-партнери, які приходять до власника преміального бізнесу 
              не з пропозицією "зробити красивий сайт", а з хірургічною діагностикою того, 
              де його бізнес щодня втрачає гроші.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
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
            <motion.div variants={fadeInUp} style={{ maxWidth: '800px', marginBottom: '4rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 400,
                color: 'var(--color-text-dark)',
                marginBottom: '1.5rem',
              }}>
                Наша філософія
              </h2>
              <p style={{
                fontSize: '1.125rem',
                lineHeight: 1.8,
                color: '#666',
              }}>
                Ми не конкуруємо з фрілансерами та вебстудіями за ціну чи естетику. 
                Ми конкуруємо з втратами клієнта.
              </p>
            </motion.div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
            }}>
              {[
                {
                  title: 'Дизайн не продає. Продає маршрут.',
                  description: 'Естетика без працюючої воронки — це просто дорога візитка, яка не окупається. Кожен екран ми проєктуємо як гіпотезу з прорахованим ROI.',
                },
                {
                  title: 'Бренд має контролювати свою точку конверсії.',
                  description: 'Якщо клієнт з преміального Instagram переходить на сторонній безкоштовний сервіс (Linktree, ChoiceQR, Altegio) — бренд втрачає контроль, аналітику і статус.',
                },
                {
                  title: 'Ми забираємо ручну рутину.',
                  description: 'Адміністратор не має бути фільтром для високочекових лідів. Якщо клієнт може сам оформити заявку в один клік — це і є автономна цифрова архітектура.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  style={{
                    padding: '2.5rem',
                    background: '#fff',
                    border: '1px solid rgba(201, 169, 98, 0.2)',
                    borderLeft: '3px solid var(--color-gold)',
                  }}
                >
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.25rem',
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
          </motion.div>
        </div>
      </section>

      {/* Founder */}
      <section style={{
        background: 'var(--color-bg-primary)',
        padding: '8rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div style={{
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.2) 0%, rgba(201, 169, 98, 0.05) 100%)',
                border: '1px solid rgba(201, 169, 98, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                fontWeight: 400,
                color: 'var(--color-text-light)',
                marginBottom: '0.5rem',
              }}>
                Богдан Антонюк
              </h3>
              <p style={{
                fontSize: '0.875rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}>
                Засновник Antolosi Partners
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <blockquote style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.6,
                color: 'var(--color-text-light)',
                marginBottom: '2rem',
                paddingLeft: '1.5rem',
                borderLeft: '2px solid var(--color-gold)',
              }}>
                "Ми побудували систему, яка працює на стику операційного консалтингу, 
                CRO та технічної архітектури."
              </blockquote>
              <p style={{
                fontSize: '1rem',
                lineHeight: 1.8,
                color: 'var(--color-text-muted)',
              }}>
                Наша місія — повернути власникам преміального бізнесу контроль над їхньою 
                цифровою інфраструктурою. Ми не просто створюємо сайти — ми проєктуємо 
                автономні системи, які генерують прибуток без постійного ручного втручання.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
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
              Наші цінності
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto',
          }}>
            {[
              { title: 'Операційна ефективність', description: 'Кожне рішення має приносити вимірюваний результат' },
              { title: 'Преміальність', description: 'Працюємо тільки з бізнесами, де один клієнт = високий чек' },
              { title: 'Автономність', description: 'Системи, які працюють без постійного контролю' },
              { title: 'Чесність', description: 'Говоримо правду про втрати, навіть якщо це неприємно' },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 1.5rem',
                  border: '1px solid rgba(201, 169, 98, 0.3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    color: 'var(--color-gold)',
                  }}>0{i + 1}</span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  color: 'var(--color-text-light)',
                  marginBottom: '0.75rem',
                }}>
                  {value.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--color-text-muted)',
                }}>
                  {value.description}
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
              Працюємо разом?
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              marginBottom: '3rem',
              maxWidth: '500px',
              margin: '0 auto 3rem',
            }}>
              Запишіться на безкоштовну консультацію та дізнайтеся, 
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
                href="/services"
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
                Наші послуги
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
