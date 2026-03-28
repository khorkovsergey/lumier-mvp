export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getClientSessions } from '@/server/actions/cabinet'
import { getUserTarotReadings } from '@/server/actions/tarot'
import { CabinetClient } from './CabinetClient'
import { redirect } from 'next/navigation'

export default async function CabinetPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')
  if (session.role !== 'CLIENT') redirect('/reader/dashboard')

  const [sessions, tarotHistory] = await Promise.all([
    getClientSessions(),
    getUserTarotReadings(),
  ])

  return <CabinetClient user={session} sessions={sessions} tarotHistory={tarotHistory} />
}
