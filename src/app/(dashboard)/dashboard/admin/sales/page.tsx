"use client"

import { AdminLayout } from '@/components/layouts/AdminLayout'
import { SalesOverview } from '@/components/admin/SalesOverview'

export default function AdminSalesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Sales Overview</h1>
        <SalesOverview />
      </div>
    </AdminLayout>
  )
} 