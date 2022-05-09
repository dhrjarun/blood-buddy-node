import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

@ObjectType()
@Entity()
export default class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column('varchar')
    name: string

    @Field()
    @Column('varchar', { unique: true })
    email: string

    @Column('varchar')
    password: string
}
