export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getReaderProfile } from '@/server/actions/reader-profile'
import { ProfileClient } from './ProfileClient'
import { redirect } from 'next/navigation'

export default async function ReaderProfilePage() {
  const session = await getServerSession()
  if (!session) redirect('/reader/login')
  if (session.role !== 'READER' && session.role !== 'AUTHOR') redirect('/cabinet')

  const profile = await getReaderProfile()
  if (!profile) redirect('/reader/login')

  return <ProfileClient profile={profile} />
}
