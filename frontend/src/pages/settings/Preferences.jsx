import React from 'react'
import { Moon, Sun, Globe } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import { useUIStore } from '@/store/uiStore'

const LANGUAGES = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin']

export default function Preferences() {
  const { darkMode, toggleDarkMode } = useUIStore()

  return (
    <div className="pb-10">
      <PageHeader title="Preferences" subtitle="Personalise your app experience" />
      <div className="px-5 flex flex-col gap-4">

        {/* Appearance */}
        <Section title="Appearance">
          <GlassCard className="p-4 flex items-center gap-4" hover={false}>
            <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center">
              {darkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
            </div>
            <div className="flex-1">
              <p className="font-outfit font-semibold text-sm text-secondary">Dark Mode</p>
              <p className="font-inter text-xs text-secondary/50">
                {darkMode ? 'Dark theme is on' : 'Switch to dark theme'}
              </p>
            </div>
            <Toggle checked={darkMode} onChange={toggleDarkMode} />
          </GlassCard>
        </Section>

        {/* Language */}
        <Section title="Language">
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center">
                <Globe size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-outfit font-semibold text-sm text-secondary">App Language</p>
                <p className="font-inter text-xs text-secondary/50">Currently: English</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-semibold transition-all ${
                    lang === 'English'
                      ? 'bg-primary text-white'
                      : 'bg-secondary/8 text-secondary/60 hover:bg-primary-light hover:text-primary'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="text-xs font-inter text-secondary/35 mt-2">
              Full localisation coming soon — English only for now.
            </p>
          </GlassCard>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-outfit font-semibold text-xs text-secondary/45 uppercase tracking-widest mb-2 px-1">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 flex-shrink-0 ${
        checked ? 'bg-primary' : 'bg-secondary/15'
      }`}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
        style={{ transform: checked ? 'translateX(23px)' : 'translateX(3px)' }}
      />
    </div>
  )
}
