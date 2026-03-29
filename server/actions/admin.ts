'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') throw new Error('Forbidden')
  return session
}

export async function getPendingReaders() {
  await requireAdmin()
  return prisma.tarotReader.findMany({
    where: { approvalStatus: 'PENDING' },
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllReaders() {
  await requireAdmin()
  return prisma.tarotReader.findMany({
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function approveReader(readerId: string) {
  await requireAdmin()
  const reader = await prisma.tarotReader.update({
    where: { id: readerId },
    data: { approvalStatus: 'APPROVED', isActive: true },
  })
  revalidatePath('/admin/dashboard')
  return reader
}

export async function rejectReader(readerId: string) {
  await requireAdmin()
  await prisma.tarotReader.update({
    where: { id: readerId },
    data: { approvalStatus: 'REJECTED', isActive: false },
  })
  revalidatePath('/admin/dashboard')
}

export async function grantAuthorRole(userId: string) {
  await requireAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'AUTHOR' },
  })
  revalidatePath('/admin/dashboard')
}

export async function revokeAuthorRole(userId: string) {
  await requireAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'READER' },
  })
  revalidatePath('/admin/dashboard')
}

export async function getAdminStats() {
  await requireAdmin()
  const [totalUsers, totalReaders, pendingCount, totalReadings] = await Promise.all([
    prisma.user.count(),
    prisma.tarotReader.count({ where: { approvalStatus: 'APPROVED' } }),
    prisma.tarotReader.count({ where: { approvalStatus: 'PENDING' } }),
    prisma.tarotReadingRecord.count(),
  ])
  return { totalUsers, totalReaders, pendingCount, totalReadings }
}
