export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getTarotReadingById } from '@/server/actions/tarot'
import { TarotHistoryDetail } from './TarotHistoryDetail'
import { redirect, notFound } from 'next/navigation'

export default async function TarotHistoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const reading = await getTarotReadingById(params.id)
  if (!reading) notFound()

  return <TarotHistoryDetail reading={reading} />
}
