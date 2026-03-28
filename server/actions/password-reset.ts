'use server'

import { prisma } from '@/shared/lib/prisma'
import { hashPassword } from '@/shared/lib/password'
import { sendPasswordResetEmail } from '@/shared/lib/email'
import { randomBytes } from 'crypto'

// ─── Request password reset ───────────────────────────────────────────────────

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Введите email' }

  // Always return success message (don't reveal if email exists)
  const successMsg = 'Если аккаунт с таким email существует, мы отправили ссылку для восстановления'

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { success: successMsg }

  // Generate secure token
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Invalidate previous tokens for this email
  await prisma.passwordResetToken.updateMany({
    where: { email, used: false },
    data: { used: true },
  })

  // Create new token
  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  })

  // Send email
  try {
    await sendPasswordResetEmail(email, token)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Failed to send reset email:', msg, err)
    return { error: `Ошибка отправки: ${msg}` }
  }

  return { success: successMsg }
}

// ─── Reset password with token ────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const token    = (formData.get('token')    as string)?.trim()
  const password = (formData.get('password') as string)
  const confirm  = (formData.get('confirm')  as string)

  if (!token)    return { error: 'Ссылка недействительна' }
  if (!password || password.length < 6) return { error: 'Пароль должен быть не менее 6 символов' }
  if (password !== confirm) return { error: 'Пароли не совпадают' }

  // Find valid token
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return { error: 'Ссылка истекла или уже использована. Запросите восстановление заново.' }
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email: resetToken.email } })
  if (!user) return { error: 'Пользователь не найден' }

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(password) },
  })

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  })

  return { success: 'Пароль успешно изменён. Теперь вы можете войти.' }
}
