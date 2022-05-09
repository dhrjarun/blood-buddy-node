import { Arg, InputType, Mutation, Resolver, Field } from 'type-graphql'
import { IsEmail, Length } from 'class-validator'
import bcrypt from 'bcrypt'
import User from '../../entity/User'

@InputType()
class RegisterInput {
    @Length(1, 100)
    @Field()
    name: string

    @IsEmail()
    @Field(() => String)
    email: string

    @Length(8, 50)
    @Field()
    password: string
}

@Resolver()
export class RegisterResolver {
    @Mutation(() => User)
    async register(
        @Arg('data') { name, email, password }: RegisterInput
    ): Promise<User> {
        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password, salt)

        const user = await User.create({ name, email, password: hashed }).save()
        return user
    }
}
