import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Home, ChevronsRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const slides = [
  {
    img:      '/assets/img/math.svg',
    badge:    'For Everyone',
    title:    ['Discover', 'Knowledge'],
    body:     'Learn anything, from algebra to astrophysics — all in one place.',
    delay:    '0s',
  },
  {
    img:      '/assets/img/file-searching.svg',
    badge:    'AI-Powered',
    title:    ['The Perfect', 'Match'],
    body:     'Our AI finds tutors that fit your learning style, schedule, and budget.',
    delay:    '0.5s',
  },
  {
    img:      '/assets/img/message-sent.svg',
    badge:    'Instant',
    title:    ['Real-Time', 'Connection'],
    body:     'Seamless chat to clarify goals before you book your first session.',
    delay:    '1s',
  },
  {
    img:      '/assets/img/personal-information.svg',
    badge:    'Your Crib',
    title:    ['Ready to', 'Start?'],
    body:     'Tell us about your goals and we\'ll help you find your learning home.',
    delay:    '1.5s',
  },
]

export default function Welcome() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const touchStart = useRef(0)
  const total = slides.length

  const next = () => {
    if (current < total - 1) setCurrent(c => c + 1)
    else navigate('/role')
  }

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (diff > 50 && current < total - 1) setCurrent(c => c + 1)
    if (diff < -50 && current > 0) setCurrent(c => c - 1)
  }

  const { img, badge, title, body, delay } = slides[current]

  return (
    <div
      className="h-svh flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, hsl(175,60%,96%) 0%, white 40%, hsl(220,40%,97%) 100%)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          key={current}
          className="animate-float mb-8 w-72 h-64 flex items-center justify-center"
          style={{ animationDelay: delay }}
        >
          <img src={img} alt={title.join(' ')} className="w-full h-full object-contain" />
        </div>

        <Badge variant="primary" className="mb-3 text-xs uppercase tracking-widest">
          {badge}
        </Badge>

        <h1
          key={`title-${current}`}
          className="font-outfit font-bold text-[2.25rem] leading-tight mb-3 text-secondary animate-slide-up"
        >
          {title[0]}{' '}
          <span className="text-primary">{title[1]}</span>
        </h1>

        <p
          key={`body-${current}`}
          className="font-inter text-base leading-relaxed text-secondary/65 max-w-[280px] animate-slide-up"
        >
          {body}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-12 pt-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/role')} className="flex items-center gap-1">
          Skip <ChevronsRight size={14} />
        </Button>

        {/* Dots */}
        <div className="flex gap-2 items-center">
          {slides.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full cursor-pointer transition-all duration-300"
              style={{
                width:      i === current ? 10 : 8,
                height:     i === current ? 10 : 8,
                background: i === current ? 'var(--primary)' : '#D1D5DB',
              }}
            />
          ))}
        </div>

        <Button size="sm" onClick={next} className="flex items-center gap-1">
          {current === total - 1 ? (
            <><span>Get Started</span><Home size={14} /></>
          ) : (
            <><span>Next</span><ArrowRight size={14} /></>
          )}
        </Button>
      </div>
    </div>
  )
}
