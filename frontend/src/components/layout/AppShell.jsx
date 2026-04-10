import React from 'react'
import BottomNav from './BottomNav'
import Toast from '@/components/ui/Toast'

export default function AppShell({ children, showNav = true }) {
  return (
    <>
      <main className={showNav ? 'pb-28' : ''}>
        {children}
      </main>
      {showNav && <BottomNav />}
      <Toast />
    </>
  )
}
