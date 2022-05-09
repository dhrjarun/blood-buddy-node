import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import { HelloWorldResolver } from './modules/hello-world/resolver'
import { AppDataSource } from './data-source'
import { RegisterResolver } from './modules/user'

async function main() {
    const app = express()
    const schema = await buildSchema({
        resolvers: [HelloWorldResolver, RegisterResolver],
    })

    const apolloServer = new ApolloServer({
        schema,
    })

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
