import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import { HelloWorldResolver } from './modules/hello-world/resolver'
import { AppDataSource } from './data-source'
import { RegisterResolver } from './modules/user'
import connectRedis from 'connect-redis'
import { redis } from './redis'
import session from 'express-session'

const RedisStore = connectRedis(session)

redis.on('error', (err) => console.log('redis client error', err))
redis.on('connect', () => console.log('redis client started'))

async function main() {
    const app = express()
    const schema = await buildSchema({
        resolvers: [HelloWorldResolver, RegisterResolver],
    })

    const apolloServer = new ApolloServer({
        schema,
    })


    app.use(
        session({
            secret: 'I am secret',
            store: new RedisStore({ client: redis }),
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: true,
                maxAge: 189341556000, // 6 years
            },
        })
    )

    try {
        await AppDataSource.initialize()
        console.log('database initialization successfull')
    } catch (err) {
        console.log('some error occured while initializing the database', err)
    }

    await apolloServer.start()
    apolloServer.applyMiddleware({ app })
    app.listen({ port: 4000 }, () => console.log('listening on port 4000'))
}

main()
