import { AdminGuard } from '@/components/admin/AdminGuard'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  )
}
