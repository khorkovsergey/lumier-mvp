export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getReaderSessions } from '@/server/actions/reader'
import { DashboardClient } from './DashboardClient'
import { redirect } from 'next/navigation'

export default async function ReaderDashboardPage() {
  const session = await getServerSession()
  if (!session) redirect('/reader/login')
  if (session.role !== 'READER') redirect('/cabinet')

  const sessions = await getReaderSessions()

  return <DashboardClient user={session} sessions={sessions} />
}
