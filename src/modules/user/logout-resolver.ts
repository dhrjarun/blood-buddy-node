import { Ctx, Mutation, Resolver } from 'type-graphql'
import { MyCtx } from './../../types'

@Resolver()
export class LogoutResolver {
    @Mutation(() => Boolean)
    logout(@Ctx() ctx: MyCtx): Promise<boolean> {
        return new Promise((resolve, reject) => {
            ctx.req.session.destroy((err) => {
                if (err) {
                    console.log(err)
                    reject(false)
                } else {
                    ctx.res.clearCookie('userId')
                    resolve(true)
                }
            })
        })
    }
}
