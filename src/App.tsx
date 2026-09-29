import { useEffect, useState } from 'react'

const WEDDING_DATE = new Date('2026-10-30T11:00:00+02:00')

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
  complete: boolean
}

function getCountdown(): Countdown {
  const remaining = Math.max(0, WEDDING_DATE.getTime() - Date.now())
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
    complete: remaining === 0,
  }
}

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [countdown, setCountdown] = useState(getCountdown)
  const calendarUrl = `${import.meta.env.BASE_URL}karin-niv-wedding.ics`

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    window.scrollTo({ top: 0, behavior: 'instant' })
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
      setIsReady(true)
    }, 3_500)

    return () => window.clearTimeout(timer)
  }, [isOpen])

  const openInvitation = () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setIsOpen(true)
  }

  return (
    <main className={[
      'invitation',
      isOpen ? 'is-open' : '',
      isReady ? 'is-ready' : '',
    ].filter(Boolean).join(' ')}>
      <div className="paper-grain" aria-hidden="true" />

      <article className="card">
        <img
          className="artwork"
          src={`${import.meta.env.BASE_URL}invitation.jpeg`}
          alt="הזמנה לחתונה של קרין וניב ביום שישי 30 באוקטובר 2026"
          width="752"
          height="1024"
        />

        <div className="card-details">
          <a className="calendar-button" href={calendarUrl}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 2v3M17 2v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
              <path d="m9 15 2 2 4-5" />
            </svg>
            הוספה ליומן
          </a>

          <section className="countdown" aria-label="ספירה לאחור לחתונה">
            {countdown.complete ? (
              <p className="today">היום חוגגים!</p>
            ) : (
              <>
                <p>עוד נפגש ונחגוג בעוד</p>
                <div className="countdown-grid">
                  <span><b>{countdown.days}</b><small>ימים</small></span>
                  <span><b>{String(countdown.hours).padStart(2, '0')}</b><small>שעות</small></span>
                  <span><b>{String(countdown.minutes).padStart(2, '0')}</b><small>דקות</small></span>
                  <span><b>{String(countdown.seconds).padStart(2, '0')}</b><small>שניות</small></span>
                </div>
              </>
            )}
          </section>
        </div>
      </article>

      <div
        className={isOpen ? 'envelope-cover is-open' : 'envelope-cover'}
        role="button"
        tabIndex={isOpen ? -1 : 0}
        aria-label="פתיחת ההזמנה"
        aria-hidden={isOpen}
        onClick={openInvitation}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openInvitation()
          }
        }}
      >
        <div className="envelope-panel panel-left" />
        <div className="envelope-panel panel-right" />
        <div className="envelope-seam" aria-hidden="true" />
        <div className="seal-action">
          <div className="wax-seal">
            <span>K</span><i>&</i><span>N</span>
          </div>
          <span className="seal-copy" dir="rtl">לחץ כאן לפתוח את ההזמנה</span>
        </div>
      </div>
    </main>
  )
}

export default App
