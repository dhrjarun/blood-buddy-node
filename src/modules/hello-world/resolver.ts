import { Query, Resolver, Ctx } from 'type-graphql'
import User from '../../entity/User'
import { MyCtx } from './../../types'

@Resolver()
export class HelloWorldResolver {
    @Query(() => String)
    async hello(@Ctx() ctx: MyCtx): Promise<string> {
        const session = ctx.req.session as any
        if (session.userId) {
            const user = await User.findOne({ where: { id: session.userId } })
            if (user) {
                return `hello, ${user.name}`
            }
        }
        return 'hello world'
    }
}
