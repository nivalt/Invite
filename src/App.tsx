import { useEffect, useMemo, useRef, useState } from 'react'

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

function createCalendarUrl(): string {
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Karin and Niv//Wedding Invitation//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:karin-niv-20261030@wedding.local',
    'DTSTAMP:20260924T171000Z',
    'DTSTART:20261030T090000Z',
    'DTEND:20261030T140000Z',
    'SUMMARY:החתונה של קרין וניב',
    'LOCATION:5.91 מתחם אירועים על הים\\, נתניה',
    'DESCRIPTION:קבלת פנים 11:00 | חופה וקידושין 12:00',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(`\ufeff${calendar}\r\n`)}`
}

function ScratchReveal({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const isCompleting = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const moveCount = useRef(0)
  const [started, setStarted] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const ratio = window.devicePixelRatio || 1
    canvas.width = width * ratio
    canvas.height = height * ratio

    const context = canvas.getContext('2d')
    if (!context) return

    context.scale(ratio, ratio)
    const gradient = context.createRadialGradient(
      width * 0.35,
      height * 0.25,
      width * 0.05,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.75,
    )
    gradient.addColorStop(0, '#f8f4ea')
    gradient.addColorStop(0.72, '#e8dfcd')
    gradient.addColorStop(1, '#d4c7af')
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)

    context.fillStyle = '#6e6b61'
    context.font = '300 18px Assistant, Arial'
    context.textAlign = 'center'
    context.direction = 'rtl'
    context.fillText('גרדו כדי לגלות את ההזמנה', width / 2, height / 2 + 56)
  }, [])

  const revealWhenMostlyCleared = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    moveCount.current += 1
    if (moveCount.current % 8 !== 0) return

    const ratio = window.devicePixelRatio || 1
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    const step = Math.max(12, Math.round(14 * ratio))
    let cleared = 0
    let sampled = 0

    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        sampled += 1
        if (pixels[(y * canvas.width + x) * 4 + 3] < 40) cleared += 1
      }
    }

    if (cleared / sampled >= 0.46) {
      isDrawing.current = false
      if (!isCompleting.current) {
        isCompleting.current = true
        setIsFinishing(true)
        window.setTimeout(onReveal, 650)
      }
    }
  }

  const scratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const bounds = canvas.getBoundingClientRect()
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    const previous = lastPoint.current ?? point

    context.globalCompositeOperation = 'destination-out'
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = Math.max(68, bounds.width * 0.18)
    context.beginPath()
    context.moveTo(previous.x, previous.y)
    context.lineTo(point.x, point.y)
    context.stroke()

    lastPoint.current = point
    revealWhenMostlyCleared(canvas, context)
  }

  return (
    <div
      className={[
        'scratch-area',
        started ? 'has-started' : '',
        isFinishing ? 'is-finishing' : '',
      ].filter(Boolean).join(' ')}
    >
      <canvas
        ref={canvasRef}
        aria-label="גרדו על המסך כדי לחשוף את ההזמנה"
        onPointerDown={(event) => {
          isDrawing.current = true
          lastPoint.current = null
          setStarted(true)
          event.currentTarget.setPointerCapture(event.pointerId)
          scratch(event)
        }}
        onPointerMove={scratch}
        onPointerUp={() => {
          isDrawing.current = false
          lastPoint.current = null
        }}
        onPointerCancel={() => {
          isDrawing.current = false
          lastPoint.current = null
        }}
      />
      <span className="scratch-hint" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <path d="M13 27c-2.8-2.5-5.3-5.4-6.8-8.2-.7-1.3-.1-2.9 1.3-3.4.9-.3 1.9 0 2.5.8l1.3 1.8V6.5A2.5 2.5 0 0 1 13.8 4a2.5 2.5 0 0 1 2.5 2.5v7-3a2.3 2.3 0 0 1 4.6 0v3-1.7a2.3 2.3 0 0 1 4.6 0v5.5c0 5.8-3.7 10.7-9.5 10.7h-3Z" />
        </svg>
        העבירו אצבע
      </span>
    </div>
  )
}

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [countdown, setCountdown] = useState(getCountdown)
  const calendarUrl = useMemo(createCalendarUrl, [])

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <main className="invitation">
      <div className="paper-grain" aria-hidden="true" />

      <article className="card">
        <div className="artwork">
          <img
            src={`${import.meta.env.BASE_URL}invitation.jpeg`}
            alt="הזמנה לחתונה של קרין וניב ביום שישי 30 באוקטובר 2026"
            width="752"
            height="1024"
          />
          {isOpen && !isRevealed && <ScratchReveal onReveal={() => setIsRevealed(true)} />}
        </div>

        <div className="card-details">
          <a
            className="calendar-button"
            href={calendarUrl}
            download="karin-and-niv-wedding.ics"
          >
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
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsOpen(true)
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
          <svg className="seal-copy" viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <path id="seal-copy-path" d="M 36 184 A 122 122 0 0 0 264 184" />
            </defs>
            <text>
              <textPath href="#seal-copy-path" startOffset="50%" textAnchor="middle">
                לחצו כאן לפתיחת ההזמנה
              </textPath>
            </text>
          </svg>
        </div>
      </div>
    </main>
  )
}

export default App
