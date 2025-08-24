import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNavigation from '../navigation/BottomNavigation'
import TopHeader from '../navigation/TopHeader'
import OfflineIndicator from '../common/OfflineIndicator'

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Header */}
      <TopHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Main Content */}
      <main className="flex-1 pb-16 overflow-hidden">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default AppLayout