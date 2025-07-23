// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Emailとパスワードは必須です' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'すでに登録されています' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      passwordHash: hashed,
      subscriptionPlan: 'free',
    },
  })

  return NextResponse.json({ success: true })
}
