import { ApolloServer } from 'apollo-server';

import {DateTimeMock, JSONMock} from "graphql-scalars";

import { environment } from './environment'
import  resolvers  from './gql/resolvers'
import  typeDefs  from './gql/type-defs'
import dataSources from './gql/datasources'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    introspection: environment.apollo.introspection,
    playground: environment.apollo.playground,
    mocks: { DateTime: DateTimeMock, JSON: JSONMock}, //TODO - Remove in prod
    mockEntireSchema: false, //TODO - Remove in prod
});

server.listen(environment.port)
    .then(({ url }) => console.log(`Server ready at ${url}. `));

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.stop());
}
