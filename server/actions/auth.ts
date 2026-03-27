'use server'

import { prisma } from '@/shared/lib/prisma'
import { hashPassword, verifyPassword } from '@/shared/lib/password'
import { createSessionToken, setSessionCookie, clearSessionCookie } from '@/shared/lib/auth'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  dateOfBirth: z.string().optional(),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ─── Client registration ──────────────────────────────────────────────────────

export async function registerClient(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    dateOfBirth: formData.get('dateOfBirth') as string,
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Проверьте правильность заполнения полей' }
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return { error: 'Пользователь с таким email уже существует' }
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      role: 'CLIENT',
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
    },
  })

  const token = createSessionToken(user.id, user.role)
  setSessionCookie(token)

  redirect('/cabinet')
}

// ─── Client login ─────────────────────────────────────────────────────────────

export async function loginClient(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Введите email и пароль' }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (!user || !user.passwordHash) return { error: 'Неверный email или пароль' }
  if (!verifyPassword(parsed.data.password, user.passwordHash)) return { error: 'Неверный email или пароль' }
  if (user.role !== 'CLIENT') return { error: 'Используйте вход для консультантов' }

  const token = createSessionToken(user.id, user.role)
  setSessionCookie(token)

  redirect('/cabinet')
}

// ─── Reader login ─────────────────────────────────────────────────────────────

export async function loginReader(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Введите email и пароль' }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { readerProfile: true },
  })

  if (!user || !user.passwordHash) return { error: 'Неверный email или пароль' }
  if (!verifyPassword(parsed.data.password, user.passwordHash)) return { error: 'Неверный email или пароль' }
  if (user.role !== 'READER') return { error: 'Этот аккаунт не является аккаунтом консультанта' }

  const token = createSessionToken(user.id, user.role)
  setSessionCookie(token)

  redirect('/reader/dashboard')
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout() {
  clearSessionCookie()
  redirect('/')
}
