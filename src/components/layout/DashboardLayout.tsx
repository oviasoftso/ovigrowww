import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const { sidebarOpen } = useStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          // Desktop: offset by sidebar width
          'lg:ml-16',
          sidebarOpen && 'lg:ml-64'
        )}
      >
        <Header />
        <main className="p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
