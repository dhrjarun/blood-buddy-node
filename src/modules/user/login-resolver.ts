import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'
import User from '../../entity/User'
import bcrypt from 'bcrypt'
import { MyCtx } from './../../types'

@Resolver()
export class LoginResolver {
    @Mutation(() => User)
    async login(
        @Ctx() ctx: MyCtx,
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {
        const user = await User.findOne({ where: { email } })
        if (!user) return null

        const valid = await bcrypt.compare(password, user.password)

        if (!valid) return null

        const session = ctx.req.session as any
        session.userId = user.id.toString()

        return user
    }
}
