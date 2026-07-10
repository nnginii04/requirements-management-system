import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import type { User } from '../../src/types/domain.js'
import { StoreService } from '../core/store.service.js'
import { apiError } from '../core/http-error.js'
import { prisma } from '../db/prisma.js'

/** Shared password for all seeded demo accounts (dev/demo only). */
const DEMO_PASSWORD = process.env.AUTH_DEMO_PASSWORD ?? 'demo1234'

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger('Auth')

  constructor(
    private readonly jwt: JwtService,
    private readonly store: StoreService,
  ) {}

  /** Seed a bcrypt-hashed demo password for any account that lacks one. */
  async onModuleInit(): Promise<void> {
    const pending = await prisma.user.findMany({ where: { password: null } })
    if (pending.length === 0) return
    const hash = bcrypt.hashSync(DEMO_PASSWORD, 10)
    await Promise.all(
      pending.map((u) => prisma.user.update({ where: { id: u.id }, data: { password: hash } })),
    )
    this.logger.log(`Seeded demo password for ${pending.length} account(s)`)
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const record = await prisma.user.findFirst({ where: { email } })
    if (!record?.password || !bcrypt.compareSync(password, record.password)) {
      throw apiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    // Reflect the logged-in identity as the active session user.
    this.store.mutate((state) => {
      state.currentUserId = record.id
    })

    const token = this.jwt.sign({ sub: record.id, email: record.email })
    const { password: _password, ...user } = record
    return { token, user }
  }

  me(userId: string): User {
    const user = this.store.loadDb().users.find((u) => u.id === userId)
    if (!user) throw apiError(404, 'User not found')
    return user
  }
}
