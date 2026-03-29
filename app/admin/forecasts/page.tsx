export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getAllForecastsAdmin } from '@/server/actions/admin-forecasts'
import { AdminForecastsClient } from './AdminForecastsClient'
import { redirect } from 'next/navigation'

export default async function AdminForecastsPage() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') redirect('/')
  const data = await getAllForecastsAdmin()
  return <AdminForecastsClient data={data} />
}
