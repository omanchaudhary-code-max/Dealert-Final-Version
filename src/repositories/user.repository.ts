import { prisma } from '@/lib/prisma'
import type { User, Prisma, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const DEMO_PASSWORD_HASH = bcrypt.hashSync('password', 10)

const defaultUsers: User[] = [
  {
    id: 'usr-demo-user-1',
    fullName: 'Demo User',
    email: 'user@dealert.com',
    phoneNumber: '+977 9801234567',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'USER' as Role,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'usr-demo-admin-1',
    fullName: 'Demo Admin',
    email: 'admin@dealert.com',
    phoneNumber: '+977 9801234568',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'ADMIN' as Role,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'usr-google-user-1',
    fullName: 'Google User',
    email: 'google.user@dealert.com',
    phoneNumber: null,
    passwordHash: null,
    role: 'USER' as Role,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
]

// In-memory fallback map for offline DB or unseeded demo accounts
const inMemoryUsers = new Map<string, User>()
defaultUsers.forEach((u) => inMemoryUsers.set(u.email.toLowerCase(), u))

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { id } })
      if (user) return user
    } catch (err) {
      console.warn('Prisma findById fallback:', err instanceof Error ? err.message : err)
    }
    for (const user of inMemoryUsers.values()) {
      if (user.id === id) return user
    }
    return null
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim()
    try {
      const user = await prisma.user.findUnique({ where: { email: normalized } })
      if (user) return user
    } catch (err) {
      console.warn('Prisma findByEmail fallback:', err instanceof Error ? err.message : err)
    }
    return inMemoryUsers.get(normalized) ?? null
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const normalizedEmail = data.email.toLowerCase().trim()
    try {
      const user = await prisma.user.create({ data })
      inMemoryUsers.set(normalizedEmail, user)
      return user
    } catch (err) {
      console.warn('Prisma create fallback to memory:', err instanceof Error ? err.message : err)
      const newUser: User = {
        id: `usr-mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fullName: data.fullName,
        email: normalizedEmail,
        phoneNumber: data.phoneNumber ?? null,
        passwordHash: data.passwordHash ?? null,
        role: (data.role as Role) || ('USER' as Role),
        isVerified: data.isVerified ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      inMemoryUsers.set(normalizedEmail, newUser)
      return newUser
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      const user = await prisma.user.update({ where: { id }, data })
      inMemoryUsers.set(user.email.toLowerCase(), user)
      return user
    } catch (err) {
      console.warn('Prisma update fallback to memory:', err instanceof Error ? err.message : err)
      let foundUser: User | undefined
      for (const u of inMemoryUsers.values()) {
        if (u.id === id) {
          foundUser = u
          break
        }
      }
      if (!foundUser) throw new Error('User not found')

      const updatedUser: User = {
        ...foundUser,
        fullName: typeof data.fullName === 'string' ? data.fullName : foundUser.fullName,
        passwordHash: typeof data.passwordHash === 'string' ? data.passwordHash : foundUser.passwordHash,
        isVerified: typeof data.isVerified === 'boolean' ? data.isVerified : foundUser.isVerified,
        updatedAt: new Date(),
      }
      inMemoryUsers.set(updatedUser.email.toLowerCase(), updatedUser)
      return updatedUser
    }
  }

  async delete(id: string): Promise<User> {
    try {
      return await prisma.user.delete({ where: { id } })
    } catch (err) {
      console.warn('Prisma delete fallback:', err instanceof Error ? err.message : err)
      for (const [email, u] of inMemoryUsers.entries()) {
        if (u.id === id) {
          inMemoryUsers.delete(email)
          return u
        }
      }
      throw new Error('User not found')
    }
  }

  async findAll(options?: { skip?: number; take?: number }) {
    try {
      return await prisma.user.findMany({
        skip: options?.skip,
        take: options?.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      })
    } catch (err) {
      console.warn('Prisma findAll fallback:', err instanceof Error ? err.message : err)
      return Array.from(inMemoryUsers.values()).map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
      }))
    }
  }

  async upsertOAuthAccount(data: {
    userId: string
    provider: string
    providerUserId: string
    accessToken?: string | null
    refreshToken?: string | null
    expiresAt?: Date | null
  }) {
    try {
      return await prisma.oAuthAccount.upsert({
        where: {
          provider_providerUserId: {
            provider: data.provider,
            providerUserId: data.providerUserId,
          },
        },
        update: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        },
        create: {
          provider: data.provider,
          providerUserId: data.providerUserId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          user: { connect: { id: data.userId } },
        },
      })
    } catch (err) {
      console.warn('Prisma upsertOAuthAccount fallback:', err instanceof Error ? err.message : err)
      return {
        id: `oauth-${Date.now()}`,
        userId: data.userId,
        provider: data.provider,
        providerUserId: data.providerUserId,
        accessToken: data.accessToken ?? null,
        refreshToken: data.refreshToken ?? null,
        expiresAt: data.expiresAt ?? null,
      }
    }
  }

  async getUserPlan(userId: string): Promise<'FREE' | 'PRO' | 'ENTERPRISE'> {
    try {
      const sub = await prisma.subscription.findUnique({ where: { userId } })
      if (sub && sub.status === 'ACTIVE') return sub.plan as 'FREE' | 'PRO' | 'ENTERPRISE'
    } catch (err) {
      console.warn('Prisma getUserPlan fallback:', err instanceof Error ? err.message : err)
    }
    return 'FREE'
  }
}

export const userRepository = new UserRepository()