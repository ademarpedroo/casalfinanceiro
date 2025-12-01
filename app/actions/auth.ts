'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function signup(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const result = signupSchema.safeParse(data)

    if (!result.success) {
      const firstError = result.error.errors[0]
      return { success: false, error: firstError.message }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email },
    })

    if (existingUser) {
      return { success: false, error: 'Email já está em uso' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(result.data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        password: hashedPassword,
      },
    })

    return { success: true, message: 'Conta criada com sucesso! Faça login para continuar.' }
  } catch (error) {
    console.error('Error during signup:', error)
    return { success: false, error: 'Erro ao criar conta. Tente novamente.' }
  }
}
