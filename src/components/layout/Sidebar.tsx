import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Sprout,
  Droplets,
  CloudSun,
  TrendingUp,
  Bug,
  Bot,
  Map,
  BookOpen,
  Users,
  GraduationCap,
  Store,
  Wallet,
  Beef,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/crops', label: 'Crop Monitoring', icon: Sprout },
  { path: '/soil', label: 'Soil Analysis', icon: Droplets },
  { path: '/weather', label: 'Weather', icon: CloudSun },
  { path: '/market', label: 'Market Prices', icon: TrendingUp },
  { path: '/pests', label: 'Pest Detection', icon: Bug },
  { path: '/ai-chat', label: 'AI Assistant', icon: Bot },
  { path: '/map', label: 'Farm Map', icon: Map },
  { path: '/diary', label: 'Farm Diary', icon: BookOpen },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/learn', label: 'Learning Hub', icon: GraduationCap },
  { path: '/marketplace', label: 'Marketplace', icon: Store },
  { path: '/finance', label: 'Finance', icon: Wallet },
  { path: '/livestock', label: 'Livestock', icon: Beef },
  { path: '/settings', label: 'Settings', icon: Settings },
]

function NavList({ onNavClick, showLabels }: { onNavClick?: () => void; showLabels: boolean }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-1 px-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  !showLabels && 'justify-center px-2'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {showLabels && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useStore()
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname, setMobileSidebarOpen])

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileSidebarOpen, setMobileSidebarOpen])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileSidebarOpen])

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 hidden lg:block',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sprout className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-primary">OviGrow</span>
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
                <Sprout className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="ml-auto h-8 w-8"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
          <NavList showLabels={sidebarOpen} />
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 border-r bg-card transition-transform duration-300 lg:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile logo + close */}
          <div className="flex h-16 items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sprout className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-primary">OviGrow</span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavList showLabels onNavClick={() => setMobileSidebarOpen(false)} />
        </div>
      </aside>
    </>
  )
}
