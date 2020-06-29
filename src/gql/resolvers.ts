
import {DateTimeResolver, JSONResolver} from 'graphql-scalars';

const resolvers = {
    DateTime: DateTimeResolver,
    JSON: JSONResolver,
     Query: {
         listTemplates: async (_source: any, _args: any, {dataSources}: any) =>
         {
             return dataSources.cdrAPI.listTemplates()
         },
         aqlResultSet: async (_source: any, {aql,ehrId} :any, {dataSources}: any) =>
         {
             return dataSources.cdrAPI.runAQL(aql,ehrId)
         },
         listEhrs: async (_source: any, _args: any, {dataSources}: any) =>
         {
             return dataSources.cdrAPI.listEhrs()
         },
         findEhr: async (_source: any, {ehrId} :any, {dataSources}: any) =>
         {
             return dataSources.cdrAPI.findEhr(ehrId)
         },
         findEhrBySubject: async (_source: any, {subjectId, subjectNamespace} :any, {dataSources}: any) =>
         {
             return dataSources.cdrAPI.findEhrBySubject(subjectId, subjectNamespace)
         },

        },
    Mutation: {
        createEhr: async (_source: any, {subjectId, subjectNamespace} :any, {dataSources}: any) =>
        {
            return dataSources.cdrAPI.createEHR(subjectId, subjectNamespace)
        },

    }
     }
export default resolvers