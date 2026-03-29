export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getPendingReaders, getAllReaders, getAdminStats } from '@/server/actions/admin'
import { AdminDashboardClient } from './AdminDashboardClient'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') redirect('/')

  const [pending, readers, stats] = await Promise.all([
    getPendingReaders(),
    getAllReaders(),
    getAdminStats(),
  ])

  return <AdminDashboardClient pending={pending} readers={readers} stats={stats} />
}
