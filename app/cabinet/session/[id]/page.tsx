export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getClientSession } from '@/server/actions/cabinet'
import { redirect, notFound } from 'next/navigation'
import { CabinetSessionClient } from './CabinetSessionClient'

export default async function CabinetSessionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session) redirect('/login')
  if (session.role !== 'CLIENT') redirect('/reader/dashboard')

  const data = await getClientSession(params.id)
  if (!data) notFound()

  return <CabinetSessionClient session={data} userName={session.name} />
}
