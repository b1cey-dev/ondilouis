'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Users, 
  Settings,
  Tag
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Products',
    href: '/dashboard/admin/products',
    icon: Package
  },
  {
    title: 'Sales',
    href: '/dashboard/admin/sales',
    icon: DollarSign
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: Users
  },
  {
    title: 'Roles',
    href: '/dashboard/admin/roles',
    icon: Tag
  },
  {
    title: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
} 