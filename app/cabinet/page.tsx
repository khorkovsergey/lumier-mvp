export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getClientSessions } from '@/server/actions/cabinet'
import { CabinetClient } from './CabinetClient'
import { redirect } from 'next/navigation'

export default async function CabinetPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')
  if (session.role !== 'CLIENT') redirect('/reader/dashboard')

  const sessions = await getClientSessions()

  return <CabinetClient user={session} sessions={sessions} />
}
