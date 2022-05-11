import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import { HelloWorldResolver } from './modules/hello-world/resolver'
import { AppDataSource } from './data-source'
import { RegisterResolver, LoginResolver, LogoutResolver } from './modules/user'
import connectRedis from 'connect-redis'
import { redis } from './redis'
import session from 'express-session'

const RedisStore = connectRedis(session)

redis.on('error', (err) => console.log('redis client error', err))
redis.on('connect', () => console.log('redis client started'))

async function main() {
    const app = express()
    const schema = await buildSchema({
        resolvers: [
            HelloWorldResolver,
            RegisterResolver,
            LoginResolver,
            LogoutResolver,
        ],
    })

    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }) => ({ req, res }),
    })

    app.set('trust proxy', process.env.NODE_ENV !== 'production') // because cookie is not getting stored in the browser

    app.use(
        session({
            store: new RedisStore({ client: redis }),
            name: 'userId',
            secret: 'asdfaskvmlkvmlsmv',
            resave: false,
            saveUninitialized: false,
            cookie: {
                sameSite: 'none',
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 365 * 7, // 7 years
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
    apolloServer.applyMiddleware({
        app,
        cors: {
            origin: ['https://studio.apollographql.com'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            exposedHeaders: ['set-cookies', 'connection'],
        },
    })

    app.listen({ port: 4000 }, () => console.log('listening on port 4000'))
}

main()
