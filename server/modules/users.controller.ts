import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { apiError } from '../core/http-error.js'

@Controller('users')
export class UsersController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() {
    return { data: this.store.loadDb().users }
  }

  @Get('me')
  me() {
    const state = this.store.loadDb()
    const user = state.users.find((u) => u.id === state.currentUserId) ?? state.users[0]
    if (!user) throw apiError(404, 'User not found')
    return { data: user }
  }

  @Patch('me')
  switchUser(@Body('userId') userId?: string) {
    if (!userId) throw apiError(400, 'userId required')

    const state = this.store.loadDb()
    if (!state.users.some((u) => u.id === userId)) {
      throw apiError(404, 'User not found')
    }

    this.store.mutate((s) => {
      s.currentUserId = userId
    })

    return { data: this.store.loadDb().users.find((u) => u.id === userId) }
  }
}
