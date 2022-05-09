import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import { HelloWorldResolver } from './modules/hello-world/resolver'
import { AppDataSource } from './data-source'
import { RegisterResolver } from './modules/user'
import connectRedis from 'connect-redis'
import { createClient } from 'redis'
import session from 'express-session'

const RedisStore = connectRedis(session)

const redisClient = createClient()

redisClient.on('error', (err) => console.log('redis client error', err))
redisClient.on('connect', () => console.log('redis client started'))

async function main() {
    const app = express()
    const schema = await buildSchema({
        resolvers: [HelloWorldResolver, RegisterResolver],
    })

    const apolloServer = new ApolloServer({
        schema,
    })

    await redisClient.connect()

    app.use(
        session({
            store: new RedisStore({ client: redisClient }),
            secret: 'I am secret',
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
