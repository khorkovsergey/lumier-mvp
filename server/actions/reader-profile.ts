'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getReaderProfile() {
  const session = await getServerSession()
  if (!session) return null
  return prisma.tarotReader.findUnique({
    where: { userId: session.id },
    include: { user: { select: { name: true, email: true } } },
  })
}

export async function updateReaderProfile(formData: FormData) {
  const session = await getServerSession()
  if (!session) return { error: 'Необходима авторизация' }

  const reader = await prisma.tarotReader.findUnique({ where: { userId: session.id } })
  if (!reader) return { error: 'Профиль не найден' }

  const name           = (formData.get('name') as string)?.trim()
  const specialization = (formData.get('specialization') as string)?.trim()
  const experience     = (formData.get('experience') as string)?.trim()
  const methods        = (formData.get('methods') as string)?.trim()
  const bio            = (formData.get('bio') as string)?.trim()
  const about          = (formData.get('about') as string)?.trim()
  const phone          = (formData.get('phone') as string)?.trim()
  const price          = parseFloat(formData.get('price') as string)

  if (!name || name.length < 2) return { error: 'Имя — минимум 2 символа' }
  if (!bio || bio.length < 10) return { error: 'Описание — минимум 10 символов' }

  await prisma.tarotReader.update({
    where: { id: reader.id },
    data: { name, specialization, experience, methods, bio, about, phone, price: isNaN(price) ? reader.price : price },
  })

  // Also update user name
  await prisma.user.update({
    where: { id: session.id },
    data: { name },
  })

  revalidatePath('/reader/dashboard')
  revalidatePath('/reader/profile')
  return { success: 'Профиль обновлён' }
}
