import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNavigation from '../navigation/BottomNavigation'
import TopHeader from '../navigation/TopHeader'
import MobileMenu from '../navigation/MobileMenu'
import OfflineIndicator from '../common/OfflineIndicator'
import ErrorBoundary from '../common/ErrorBoundary'

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleMenuClose = () => {
    setMobileMenuOpen(false)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Top Header */}
        <TopHeader onMenuClick={handleMenuToggle} />

        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={handleMenuClose} />

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Main Content */}
        <main className="flex-1 pb-16 overflow-hidden">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </ErrorBoundary>
  )
}

export default AppLayout