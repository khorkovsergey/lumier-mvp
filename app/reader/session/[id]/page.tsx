export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getReaderSession } from '@/server/actions/reader'
import { ReaderSessionClient } from './ReaderSessionClient'
import { redirect, notFound } from 'next/navigation'

export default async function ReaderSessionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session) redirect('/reader/login')
  if (session.role !== 'READER') redirect('/cabinet')

  try {
    const data = await getReaderSession(params.id)
    return <ReaderSessionClient session={data} />
  } catch {
    notFound()
  }
}
